import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/common/Button';
import {
    Plus, Box, Trash2, X, Upload,
    CheckSquare, Square, Edit2, Link as LinkIcon,
    Loader2, Search, Globe, Check, RefreshCw, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

// --- Types ---
interface Model {
    id: string;
    title: string;
    embed_url: string;
    category: string;
    thumbnail_url: string;
    author?: string;
    created_at: string;
}

interface Source {
    id: string;
    name: string;
    url: string;
    last_synced_at?: string;
    model_count: number;
    is_active: boolean;
}

interface BulkItem {
    url: string;
    title: string;
    thumbnail_url: string;
    selected: boolean;
    status: 'pending' | 'success' | 'error';
}

export const ModelsManager: React.FC = () => {
    // State
    const [models, setModels] = useState<Model[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modals
    const [isCollectionOpen, setIsCollectionOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

    // Forms
    const [editForm, setEditForm] = useState<Model | null>(null);
    const [newSource, setNewSource] = useState({ name: '', url: '' });

    // Bulk/Staging State
    const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
    const [collectionUrl, setCollectionUrl] = useState('');
    const [manualLinks, setManualLinks] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Used for both Fetching and Saving
    const [importCategory, setImportCategory] = useState('General');

    // Fetch Initial Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [modelsRes, sourcesRes] = await Promise.all([
                supabase.from('models').select('*').order('created_at', { ascending: false }),
                supabase.from('model_sources').select('*').order('created_at', { ascending: false })
            ]);

            if (modelsRes.error) throw modelsRes.error;
            if (sourcesRes.error) throw sourcesRes.error;

            setModels(modelsRes.data || []);

            // Auto-Seed Default Source if empty (Client-side fail-safe)
            if (!sourcesRes.data || sourcesRes.data.length === 0) {
                const defaultSource = {
                    name: 'مجموعة طب الأسنان (أساسي)',
                    url: 'https://sketchfab.com/Sultan.Aljumaily/collections/dental-and-medical-4b03959643004743b85e67fae10e00f4',
                    is_active: true
                };
                const { data: newSource } = await supabase.from('model_sources').insert(defaultSource).select().single();
                if (newSource) {
                    setSources([newSource]);
                } else {
                    setSources([]);
                }
            } else {
                setSources(sourcesRes.data);
            }

        } catch (e) {
            console.error(e);
            toast.error('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    // --- Source Actions ---

    // Helper to fetch recursively from Sketchfab API via proxy (Using corsproxy.io for better reliability)
    const fetchSketchfabCollection = async (collectionId: string) => {
        let allModels: BulkItem[] = [];
        let nextUrl = `https://api.sketchfab.com/v3/collections/${collectionId}/models?sort_by=-createdAt`;

        try {
            while (nextUrl) {
                // Using corsproxy.io as it is more reliable than allorigins for this API
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(nextUrl)}`;
                const res = await fetch(proxyUrl);

                if (!res.ok) {
                    console.error('Proxy Response Status:', res.status);
                    throw new Error(`API request failed with status ${res.status}`);
                }

                const data = await res.json();

                if (!data.results) break;

                const pageItems: BulkItem[] = data.results.map((item: any) => {
                    const thumb = item.thumbnails.images.sort((a: any, b: any) => b.width - a.width)[0]?.url
                        || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400';
                    return {
                        url: `https://sketchfab.com/models/${item.uid}/embed`,
                        title: item.name,
                        thumbnail_url: thumb,
                        selected: true,
                        status: 'success'
                    };
                });

                allModels = [...allModels, ...pageItems];
                nextUrl = data.next;
                if (allModels.length > 600) break; // Safety limit
                toast.loading(`تم جلب ${allModels.length} نموذج...`);
            }
            return allModels;
        } catch (e) {
            console.error('API Fetch Error', e);
            throw e;
        }
    };

    const handleSyncSource = async (source: Source) => {
        const idMatch = source.url.match(/([a-f0-9]{32})/i);
        const collectionId = idMatch ? idMatch[1] : null;

        if (!collectionId) return toast.error('رابط المجموعة غير صحيح');

        setIsProcessing(true);
        toast.loading(`جاري مزامنة: ${source.name}...`);

        try {
            // 1. Fetch from Sketchfab
            const fetchedModels = await fetchSketchfabCollection(collectionId);

            if (fetchedModels.length === 0) {
                toast.dismiss();
                return toast.error('لم يتم العثور على نماذج في المصدر');
            }

            // 2. Insert into DB (Upsert is cleaner but lets stick to insert-if-not-exists logic to act as cache)
            // We need to check duplicates first to avoid massive inserts
            // Get all current embed_urls
            const { data: existing } = await supabase.from('models').select('embed_url');
            const existingUrls = new Set(existing?.map(m => m.embed_url));

            const newItems = fetchedModels.filter(m => !existingUrls.has(m.url));

            if (newItems.length > 0) {
                const { error } = await supabase.from('models').insert(newItems.map(item => ({
                    title: item.title,
                    embed_url: item.url,
                    category: 'General', // Default category for synced items
                    thumbnail_url: item.thumbnail_url
                })));

                if (error) throw error;
            }

            // 3. Update Source Stats
            await supabase.from('model_sources').update({
                last_synced_at: new Date().toISOString(),
                model_count: fetchedModels.length // Total count in collection
            }).eq('id', source.id);

            // 4. Refresh UI
            await fetchData();
            toast.dismiss();
            toast.success(`تمت المزامنة: ${newItems.length} نموذج جديد`);

        } catch (e: any) {
            toast.dismiss();
            toast.error(`فشل المزامنة: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddSource = async () => {
        if (!newSource.name || !newSource.url) return toast.error('يرجى ملء جميع الحقول');

        try {
            const { data: resData, error } = await supabase.from('model_sources').insert({
                name: newSource.name,
                url: newSource.url
            }).select();

            if (error) throw error;

            const data = resData ? resData[0] : null;
            if (!data) throw new Error('No data returned');

            setSources([data, ...sources]);
            setNewSource({ name: '', url: '' });
            setIsSourceModalOpen(false);
            toast.success('تم إضافة المصدر');

            // Auto Sync
            handleSyncSource(data);
        } catch (e) {
            toast.error('فشل إضافة المصدر');
        }
    };

    const handleDeleteSource = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('حذف هذا المصدر؟')) return;

        const { error } = await supabase.from('model_sources').delete().eq('id', id);
        if (!error) {
            setSources(sources.filter(s => s.id !== id));
            toast.success('تم الحذف');
        }
    };

    // --- Model Actions ---

    const handleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === models.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(models.map(m => m.id));
        }
    };

    const handleDeleteSelected = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} نموذج؟`)) return;

        try {
            const { error } = await supabase.from('models').delete().in('id', selectedIds);
            if (error) throw error;

            setModels(models.filter(m => !selectedIds.includes(m.id)));
            setSelectedIds([]);
            toast.success('تم الحذف بنجاح');
        } catch (e) {
            toast.error('فشل الحذف');
        }
    };

    const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('حذف هذا النموذج؟')) return;
        try {
            const { error } = await supabase.from('models').delete().eq('id', id);
            if (error) throw error;
            setModels(models.filter(m => m.id !== id));
            toast.success('تم الحذف');
        } catch (e) {
            toast.error('فشل الحذف');
        }
    };

    // --- Bulk Add Logic (Reuse existing but simplify since we have Sources now) ---
    // Keeping this for "Manual Import"
    const handleFetchCollection = async () => {
        // Reuse logic from handleSyncSource but purely for local state
        // ... (Simplified for this view since we focused on Sources now)
        if (!collectionUrl) return toast.error('يرجى إدخال رابط المجموعة');
        const idMatch = collectionUrl.match(/([a-f0-9]{32})/i);
        const collectionId = idMatch ? idMatch[1] : null;

        if (!collectionId) return toast.error('الرابط غير صالح');
        setIsProcessing(true);
        toast.loading('جاري الجلب...');
        try {
            const items = await fetchSketchfabCollection(collectionId);
            const currentUrls = new Set(bulkItems.map(i => i.url));
            const uniqueNew = items.filter(i => !currentUrls.has(i.url));
            setBulkItems(prev => [...prev, ...uniqueNew]);
            setCollectionUrl('');
            toast.dismiss();
            toast.success(`تم جلب ${uniqueNew.length} نموذج`);
        } catch (e: any) {
            toast.dismiss();
            toast.error(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper to fetch oEmbed metadata for a list of URLs
    const enrichAndAddUrls = async (urls: string[]) => {
        setIsProcessing(true);
        toast.loading(`جاري معالجة ${urls.length} رابط...`);

        const newItems: BulkItem[] = [];
        const chunk = 5;
        for (let i = 0; i < urls.length; i += chunk) {
            const batch = urls.slice(i, i + chunk);
            await Promise.all(batch.map(async (url) => {
                if (bulkItems.some(item => item.url === url)) return;
                let title = 'New Model';
                let thumb = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400';
                try {
                    const res = await fetch(`https://sketchfab.com/oembed?url=${encodeURIComponent(url)}&format=json`);
                    if (res.ok) {
                        const json = await res.json();
                        title = json.title;
                        thumb = json.thumbnail_url;
                    }
                } catch (e) { }
                newItems.push({ url, title, thumbnail_url: thumb, selected: true, status: 'pending' });
            }));
        }

        setBulkItems(prev => [...prev, ...newItems]);
        setIsProcessing(false);
        toast.dismiss();
        if (newItems.length > 0) toast.success(`تم إضافة ${newItems.length} نموذج للقائمة`);
    };

    const handleAddManualLinks = async () => {
        const urls = manualLinks.split(/[\n, ]+/).map(u => u.trim()).filter(u => u.startsWith('http'));
        if (urls.length === 0) return toast.error('لا توجد روابط صالحة');
        await enrichAndAddUrls(urls);
        setManualLinks('');
    };

    const handleSaveBulk = async () => {
        const toAdd = bulkItems.filter(i => i.selected);
        if (toAdd.length === 0) return toast.error('لم يتم تحديد أي نماذج للإضافة');

        setIsProcessing(true);
        toast.loading(`جاري حفظ ${toAdd.length} نموذج...`);

        let addedCount = 0;
        let failCount = 0;

        for (const item of toAdd) {
            try {
                const { error } = await supabase.from('models').insert({
                    title: item.title,
                    embed_url: item.url,
                    category: importCategory,
                    thumbnail_url: item.thumbnail_url
                });

                if (!error) addedCount++;
                else failCount++;
            } catch (e) {
                failCount++;
            }
        }

        setIsProcessing(false);
        toast.dismiss();

        if (addedCount > 0) {
            toast.success(`تم حفظ ${addedCount} نموذج بنجاح!`);
            fetchData();
            setIsCollectionOpen(false);
            setBulkItems([]);
        }
        if (failCount > 0) toast.error(`فشل حفظ ${failCount} نموذج`);
    };

    const handleUpdate = async () => {
        if (!editForm) return;
        try {
            const { error } = await supabase.from('models').update({
                title: editForm.title,
                category: editForm.category
            }).eq('id', editForm.id);

            if (error) throw error;
            setModels(models.map(m => m.id === editForm.id ? editForm : m));
            setIsEditOpen(false);
            setEditForm(null);
            toast.success('تم التحديث');
        } catch (e) {
            toast.error('فشل التحديث');
        }
    };

    return (
        <div className="space-y-8">
            {/* 1. SOURCES MANAGEMENT SECTION */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Layers className="w-6 h-6 text-indigo-600" />
                            مصادر النماذج (المجموعات)
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">يتم جلب النماذج تلقائياً من هذه المجموعات وعرضها في المجتمع</p>
                    </div>
                    <Button onClick={() => setIsSourceModalOpen(true)} className="bg-indigo-600 text-white shadow-md hover:bg-indigo-700">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة مصدر
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sources.map(source => (
                        <div key={source.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all bg-gray-50/50">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-800 line-clamp-1">{source.name}</h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleSyncSource(source)}
                                        disabled={isProcessing}
                                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="تحديث المزامنة"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button onClick={(e) => handleDeleteSource(source.id, e)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 bg-white p-2 rounded-lg border border-gray-100 truncate dir-ltr font-mono">
                                {source.url}
                            </div>
                            <div className="flex justify-between items-center text-xs mt-auto pt-2 border-t border-gray-200">
                                <span className={`px-2 py-0.5 rounded-full ${source.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {source.is_active ? 'نشط' : 'متوقف'}
                                </span>
                                <span className="text-gray-400">
                                    {source.last_synced_at ? `حدثت: ${new Date(source.last_synced_at).toLocaleDateString()}` : 'لم تتم المزامنة'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {sources.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            لا توجد مصادر مضافة حالياً
                        </div>
                    )}
                </div>
            </div>

            {/* 2. MODELS HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Box className="w-8 h-8 text-indigo-600" />
                        مكتبة النماذج ({models.length})
                    </h2>
                    <p className="text-gray-500 mt-1">عرض وإدارة جميع النماذج المخزنة في النظام</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleSelectAll}
                        className="text-gray-600 hover:bg-gray-100 border border-gray-200"
                    >
                        <CheckSquare className="w-4 h-4 ml-2" />
                        {selectedIds.length === models.length && models.length > 0 ? 'إلغاء الكل' : 'تحديد الكل'}
                    </Button>
                    <Button
                        onClick={() => setIsCollectionOpen(true)}
                        className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200"
                    >
                        <Upload className="w-4 h-4 ml-2" />
                        استيراد يدوي
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex justify-between items-center animate-in fade-in">
                    <span className="font-bold text-indigo-900">تم تحديد {selectedIds.length} نموذج</span>
                    <div className="flex gap-2">
                        <Button variant="danger" size="sm" onClick={handleDeleteSelected} className="bg-red-500 text-white">حذف المحدد</Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>إلغاء</Button>
                    </div>
                </div>
            )}

            {/* Models Grid */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {models.map(model => (
                        <div key={model.id} className={`group relative bg-white rounded-2xl overflow-hidden border transition-all hover:shadow-xl ${selectedIds.includes(model.id) ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200'}`}>
                            <div className="absolute top-3 left-3 z-20">
                                <button
                                    onClick={() => handleSelect(model.id)}
                                    className={`p-1 rounded-lg backdrop-blur-md transition-all ${selectedIds.includes(model.id) ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-400 hover:bg-white'}`}
                                >
                                    {selectedIds.includes(model.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <img src={model.thumbnail_url} alt={model.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button onClick={(e) => handleDeleteSingle(model.id, e)} className="p-2 bg-white/90 text-red-500 rounded-lg shadow-sm hover:bg-red-500 hover:text-white transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 line-clamp-1" title={model.title}>{model.title}</h3>
                                    <button onClick={() => { setEditForm(model); setIsEditOpen(true); }} className="text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                </div>
                                <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">{model.category || 'General'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD SOURCE MODAL */}
            {isSourceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">إضافة مصدر جديد</h3>
                            <button onClick={() => setIsSourceModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المجموعة</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                    placeholder="مثال: مجموعة القلب"
                                    value={newSource.name}
                                    onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رابط Sketchfab Collection</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dir-ltr"
                                    placeholder="https://sketchfab.com/..."
                                    value={newSource.url}
                                    onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                                />
                            </div>
                            <Button className="w-full bg-indigo-600 text-white mt-4" onClick={handleAddSource}>
                                حفظ ومزامنة
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* MANUAL IMPORT MODAL (Existing) */}
            {isCollectionOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-6xl p-6 shadow-2xl h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b pb-4 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-purple-600" />
                                    إضافة نماذج 3D (يدوي)
                                </h3>
                                <p className="text-sm text-gray-500">استيراد من مجموعة لمرة واحدة أو روابط مباشرة</p>
                            </div>
                            <button onClick={() => setIsCollectionOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="flex gap-6 flex-1 min-h-0">
                            {/* Left: Input Sources */}
                            <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 border-l pl-4">
                                {/* Collection Source */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                        <Globe className="w-4 h-4" />
                                        <span>جلب من مجموعة</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm dir-ltr focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Paste Collection URL..."
                                        value={collectionUrl}
                                        onChange={e => setCollectionUrl(e.target.value)}
                                    />
                                    <Button
                                        size="sm"
                                        className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                                        onClick={handleFetchCollection}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 ml-2" />}
                                        {isProcessing ? 'جاري الجلب...' : 'جلب النماذج'}
                                    </Button>
                                    <div
                                        className="text-xs text-gray-400 mt-2 cursor-pointer hover:text-indigo-600 transition-colors break-all"
                                        onClick={() => setCollectionUrl('https://sketchfab.com/Sultan.Aljumaily/collections/dental-and-medical-4b03959643004743b85e67fae10e00f4')}
                                    >
                                        <span className="font-bold">مثال (انقر للتعبئة):</span>
                                        <br />
                                        https://sketchfab.com/Sultan.Aljumaily/collections/dental-and-medical-4b03959643004743b85e67fae10e00f4
                                    </div>
                                </div>

                                <div className="border-t border-gray-100"></div>

                                {/* Manual Source */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                        <LinkIcon className="w-4 h-4" />
                                        <span>روابط يدوية</span>
                                    </div>
                                    <textarea
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm dir-ltr font-mono h-32 focus:ring-2 focus:ring-purple-500"
                                        placeholder="https://sketchfab.com/..."
                                        value={manualLinks}
                                        onChange={e => setManualLinks(e.target.value)}
                                    />
                                    <Button
                                        size="sm"
                                        className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                        onClick={handleAddManualLinks}
                                        disabled={isProcessing}
                                    >
                                        <Plus className="w-4 h-4 ml-2" />
                                        إضافة للقائمة
                                    </Button>
                                </div>
                            </div>

                            {/* Right: Staging List (Preview) */}
                            <div className="flex-1 flex flex-col h-full bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative">
                                <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center shrink-0 z-10">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Box className="w-4 h-4 text-purple-600" />
                                        النماذج المكتشفة ({bulkItems.length})
                                    </h4>
                                    {bulkItems.length > 0 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setBulkItems(bulkItems.map(i => ({ ...i, selected: true })))}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                تحديد الكل
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={() => setBulkItems([])}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                مسح الكل
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Scrollable List Area */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
                                    {bulkItems.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                                            <Upload className="w-12 h-12 mb-3 opacity-20" />
                                            <p>قم بجلب النماذج من القائمة الجانبية لتظهر هنا للمعاينة</p>
                                        </div>
                                    ) : (
                                        bulkItems.map((item, idx) => (
                                            <div key={idx} className={`flex gap-3 p-2 bg-white rounded-lg border shadow-sm transition-all ${item.selected ? 'border-purple-500 ring-1 ring-purple-500/20' : 'border-gray-200 opacity-60'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.selected}
                                                    onChange={() => {
                                                        const newItems = [...bulkItems];
                                                        newItems[idx].selected = !newItems[idx].selected;
                                                        setBulkItems(newItems);
                                                    }}
                                                    className="mt-2 w-4 h-4 text-purple-600 rounded"
                                                />
                                                <img src={item.thumbnail_url} className="w-16 h-16 object-cover rounded bg-gray-100" />
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        value={item.title}
                                                        onChange={(e) => {
                                                            const newItems = [...bulkItems];
                                                            newItems[idx].title = e.target.value;
                                                            setBulkItems(newItems);
                                                        }}
                                                        className="font-bold text-gray-800 text-sm w-full bg-transparent border-none focus:ring-0 p-0"
                                                    />
                                                    <a href={item.url} target="_blank" className="text-xs text-blue-500 hover:underline truncate block" dir="ltr">{item.url}</a>
                                                </div>
                                                <button
                                                    onClick={() => setBulkItems(bulkItems.filter((_, i) => i !== idx))}
                                                    className="text-gray-400 hover:text-red-500 self-start"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Persistent Sticky Footer */}
                                <div className="p-4 bg-white border-t border-gray-200 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-4 items-center">
                                    <div className="w-1/3">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">تعيين الفئة لجميع النماذج</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                                            value={importCategory}
                                            onChange={e => setImportCategory(e.target.value)}
                                        >
                                            <option>General</option>
                                            <option>Anatomy</option>
                                            <option>Implants</option>
                                            <option>Orthodontics</option>
                                            <option>Surgical</option>
                                            <option>Lab</option>
                                        </select>
                                    </div>
                                    <Button
                                        className={`flex-1 text-white py-2 h-auto text-lg shadow-lg transition-all ${isProcessing
                                            ? 'bg-purple-400 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
                                        onClick={handleSaveBulk}
                                        disabled={bulkItems.filter(i => i.selected).length === 0 || isProcessing}
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Check className="w-5 h-5" />
                                                حفظ النماذج المحددة ({bulkItems.filter(i => i.selected).length})
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL (Reuse Existing) */}
            {isEditOpen && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">تعديل النموذج</h3>
                            <button onClick={() => setIsEditOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                    value={editForm.category}
                                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                >
                                    <option>Anatomy</option>
                                    <option>Implants</option>
                                    <option>Orthodontics</option>
                                    <option>Surgical</option>
                                    <option>Lab</option>
                                    <option>General</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button className="flex-1 bg-indigo-600 text-white" onClick={handleUpdate}>حفظ التغييرات</Button>
                                <Button variant="ghost" className="flex-1" onClick={() => setIsEditOpen(false)}>إلغاء</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

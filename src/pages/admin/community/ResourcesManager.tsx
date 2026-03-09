import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Plus, Search, FileText, Download, Link, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export const ResourcesManager: React.FC = () => {
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResources = async () => {
        try {
            const { data, error } = await supabase
                .from('scientific_resources')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSources(data || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
            // toast.error('فشل تحميل المصادر');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleAddResource = async () => {
        // Quick functionality for now
        const name = prompt('اسم المصدر الجديد:');
        if (!name) return;
        const url = prompt('رابط المصدر:');
        if (!url) return;
        const type = prompt('النوع (journal, website, blog):', 'website');

        try {
            const { error } = await supabase.from('scientific_resources').insert({
                title: name,
                url: url,
                type: type || 'website',
                source: name,
                description: 'تمت إضافته بواسطة المدير',
                logo: name.substring(0, 2).toUpperCase(),
                created_at: new Date().toISOString()
            });

            if (error) throw error;
            toast.success('تمت إضافة المصدر بنجاح');
            fetchResources();
        } catch (error) {
            toast.error('فشل إضافة المصدر');
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المصدر؟')) return;

        try {
            const { error } = await supabase
                .from('scientific_resources')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('تم حذف المصدر');
            setSources(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error(error);
            toast.error('فشل الحذف');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">مصادر المعرفة</h2>
                    <p className="text-gray-500">إدارة المصادر العلمية والمجلات والمواقع المعتمدة</p>
                </div>
                <Button
                    onClick={handleAddResource}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white"
                >
                    <Plus className="w-4 h-4" />
                    إضافة مصدر جديد
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-10">جاري التحميل...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sources.map((source) => (
                        <Card key={source.id} className="p-4 hover:shadow-lg transition-all border border-gray-100 flex flex-col">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {source.logo && source.logo.length < 5 ? source.logo : <FileText className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{source.title || source.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                            {source.type === 'journal' ? 'مجلة علمية' : source.type === 'website' ? 'موقع إلكتروني' : 'مدونة'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{source.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
                                <Button size="sm" variant="ghost" className="flex-1 text-xs justify-center hover:bg-blue-50 text-blue-700">
                                    <Link className="w-3 h-3 ml-2" />
                                    <a href={source.url} target="_blank" rel="noreferrer">زيارة الموقع</a>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleDeleteResource(source.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

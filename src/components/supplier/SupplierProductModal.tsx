
import React, { useState, useEffect } from 'react';
import { Search, Upload, X, Check, Save, Megaphone, Calendar, Percent, MessageSquare } from 'lucide-react';
import { BrandCreationModal } from '../brands/BrandCreationModal';
import { Button } from '../common/Button';
import { CATEGORIES } from '../../data/categories';
import { formatCurrency } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useBrands } from '../../hooks/useBrands';

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    subCategory?: string;
    childCategory?: string;
    stock: number;
    image: string;
    images: string[]; // NEW: Multi-image support
    brandId?: string; // NEW
    // Requests
    isNewRequest: boolean;
    isFeaturedRequest: boolean;
    isOfferRequest: boolean;
    offerDiscount: number;
    target_audience: string[];
    // Promotion Bundle
    promotionStartDate?: string;
    promotionEndDate?: string;
    promotionNotes?: string;
}

interface SupplierProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProductFormData) => Promise<void>;
    initialData?: any;
    title: string;
}

export const SupplierProductModal: React.FC<SupplierProductModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    title
}) => {
    const { brands, createBrand } = useBrands(); // Use Hook
    const [brandSearch, setBrandSearch] = useState('');
    const [isBrandListOpen, setIsBrandListOpen] = useState(false);
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

    const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));

    // Removed old handleCreateBrand

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: 0,
        category: '',
        subCategory: '',
        childCategory: '',
        stock: 0,
        image: '',
        images: [],
        brandId: '', // Default
        isNewRequest: false,
        isFeaturedRequest: false,
        isOfferRequest: false,
        offerDiscount: 0,
        promotionStartDate: new Date().toISOString().split('T')[0],
        promotionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        promotionNotes: '',
        target_audience: ['clinic', 'lab']
    });

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price || 0,
                category: initialData.category || '',
                subCategory: initialData.subCategory || initialData.sub_category || '',
                childCategory: initialData.childCategory || initialData.child_category || '',
                stock: initialData.stock || 0,
                image: initialData.image || '',
                images: initialData.images || (initialData.image ? [initialData.image] : []),
                brandId: initialData.brandId || '',
                isNewRequest: initialData.is_new_request || initialData.isNew || false,
                isFeaturedRequest: initialData.is_featured_request || initialData.featured || false,
                isOfferRequest: (initialData.offer_request_percentage || 0) > 0,
                offerDiscount: initialData.offer_request_percentage || initialData.discount || 0,
                target_audience: initialData.target_audience || ['clinic', 'lab']
            });
            // Set brand search text if editing
            if (initialData.brandId) {
                const found = brands.find(b => b.id === initialData.brandId);
                if (found) setBrandSearch(found.name);
            }
        } else {
            // Reset for "Add" mode

            setFormData({
                name: '',
                description: '',
                price: 0,
                category: '',
                subCategory: '',
                childCategory: '',
                stock: 0,
                image: '',
                images: [],
                brandId: '',
                isNewRequest: true,
                isFeaturedRequest: false,
                isOfferRequest: false,
                offerDiscount: 0,
                promotionStartDate: new Date().toISOString().split('T')[0],
                promotionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                promotionNotes: '',
                target_audience: ['clinic', 'lab']
            });
            setBrandSearch(''); // Reset Search
        }
    }, [initialData, isOpen, brands]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // map brandId to brand_id for DB
            const submissionData = {
                ...formData,
                brand_id: formData.brandId || null // Ensure we send null if empty
            };
            // Clean up frontend-only field
            delete (submissionData as any).brandId;

            await onSave(submissionData);
            onClose();
        } catch (error) {
            console.error('Failed to save product:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setUploading(true);
            const newImages: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                newImages.push(publicUrl);
            }

            setFormData(prev => {
                const updatedImages = [...prev.images, ...newImages];
                return {
                    ...prev,
                    images: updatedImages,
                    image: updatedImages.length > 0 ? updatedImages[0] : '' // Ensure main image is set
                };
            });
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => {
            const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
            return {
                ...prev,
                images: updatedImages,
                image: updatedImages.length > 0 ? updatedImages[0] : ''
            };
        });
    };

    // Derived Lists for Cascading Dropdowns
    const subCategories = CATEGORIES.find(c => c.name === formData.category)?.subCategories || [];
    const childCategories = subCategories.find(s => s.name === formData.subCategory)?.childCategories || [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Multi-Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">صور المنتج</label>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                    <img src={img} alt={`Product ${index + 1} `} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-1">
                                            الرئيسية
                                        </div>
                                    )}
                                </div>
                            ))}

                            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500">
                                    {uploading ? 'جاري...' : 'إضافة صور'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    disabled={uploading}
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">يمكنك رفع صور متعددة. الصورة الأولى ستكون الصورة الرئيسية.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                placeholder="مثال: حشوة ضوئية 3M"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                                placeholder="وصف تفصيلي للمنتج..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">السعر (د.ع)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">المخزون</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            />
                        </div>

                        {/* BRAND SELECTION */}
                        <div className="col-span-2 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">العلامة التجارية (Brand)</label>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="ابحث عن علامة تجارية..."
                                        value={brandSearch}
                                        onChange={(e) => {
                                            setBrandSearch(e.target.value);
                                            setIsBrandListOpen(true);
                                            setFormData({ ...formData, brandId: '' });
                                        }}
                                        onFocus={() => setIsBrandListOpen(true)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none pl-10"
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />

                                    {/* Selected Brand Badge */}
                                    {formData.brandId && (
                                        <div className="absolute top-2 right-2 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                            {brands.find(b => b.id === formData.brandId)?.name}
                                            <button onClick={() => {
                                                setFormData({ ...formData, brandId: '' });
                                                setBrandSearch('');
                                            }} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                        </div>
                                    )}

                                    {/* Dropdown */}
                                    {isBrandListOpen && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {filteredBrands.map(brand => (
                                                <div
                                                    key={brand.id}
                                                    onClick={() => {
                                                        setFormData({ ...formData, brandId: brand.id });
                                                        setBrandSearch(brand.name);
                                                        setIsBrandListOpen(false);
                                                    }}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                                >
                                                    <span className="font-medium text-gray-800">{brand.name}</span>
                                                    {brand.verified && <span className="text-blue-500"><Check className="w-3 h-3" /></span>}
                                                </div>
                                            ))}

                                            {filteredBrands.length === 0 && (
                                                <div className="p-4 text-center">
                                                    <p className="text-sm text-gray-500 mb-2">لم يتم العثور على "{brandSearch}"</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsBrandModalOpen(true)}
                                                        className="text-sm text-blue-600 font-bold hover:underline"
                                                    >
                                                        + إضافة علامة تجارية جديدة
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => setIsBrandModalOpen(true)}
                                    className="px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        {/* CATEGORY SECTION */}
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة الرئيسية</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            category: e.target.value,
                                            subCategory: '',
                                            childCategory: ''
                                        });
                                    }}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-white"
                                >
                                    <option value="">اختر الفئة الرئيسية</option>
                                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة الفرعية</label>
                                <select
                                    required={subCategories.length > 0}
                                    disabled={!formData.category}
                                    value={formData.subCategory || ''}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            subCategory: e.target.value,
                                            childCategory: ''
                                        });
                                    }}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="">اختر الفئة الفرعية</option>
                                    {subCategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">نوع المنتج (اختياري)</label>
                                <select
                                    disabled={!formData.subCategory || childCategories.length === 0}
                                    value={formData.childCategory || ''}
                                    onChange={(e) => setFormData({ ...formData, childCategory: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="">اختر النوع المحدد</option>
                                    {childCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* PROMOTION REQUESTS SECTION */}
                        <div className="col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-purple-600" />
                                خيارات العرض والترويج (طلب من الإدارة)
                            </h4>

                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors" onClick={() => setFormData(prev => ({ ...prev, isNewRequest: !prev.isNewRequest }))}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isNewRequest ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                            {formData.isNewRequest && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 user-select-none">طلب شارة "منتج جديد"</span>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-yellow-400 transition-colors" onClick={() => setFormData(prev => ({ ...prev, isFeaturedRequest: !prev.isFeaturedRequest }))}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isFeaturedRequest ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-300'}`}>
                                            {formData.isFeaturedRequest && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 user-select-none">طلب منتج مميز (Exclusive)</span>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-red-400 transition-colors" onClick={() => setFormData(prev => ({ ...prev, isOfferRequest: !prev.isOfferRequest }))}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isOfferRequest ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                                            {formData.isOfferRequest && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 user-select-none">تفعيل عرض خصم</span>
                                    </div>
                                </div>

                                {formData.isOfferRequest && (
                                    <div className="animate-in slide-in-from-top-2 duration-200 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">نسبة الخصم المقترحة (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    required={formData.isOfferRequest}
                                                    value={formData.offerDiscount}
                                                    onChange={(e) => setFormData({ ...formData, offerDiscount: Number(e.target.value) })}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                                <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                            <span className="text-sm text-gray-500 mt-1 block">سيظهر السعر الجديد: {formatCurrency(formData.price * (1 - formData.offerDiscount / 100))}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        required={formData.isOfferRequest}
                                                        value={formData.promotionStartDate}
                                                        onChange={(e) => setFormData({ ...formData, promotionStartDate: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                                    />
                                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        required={formData.isOfferRequest}
                                                        value={formData.promotionEndDate}
                                                        onChange={(e) => setFormData({ ...formData, promotionEndDate: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                                    />
                                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات للمسؤول (اختياري)</label>
                                            <div className="relative">
                                                <textarea
                                                    rows={3}
                                                    value={formData.promotionNotes}
                                                    onChange={(e) => setFormData({ ...formData, promotionNotes: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                                    placeholder="أي تفاصيل إضافية حول العرض..."
                                                />
                                                <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                            </div>
                                        </div>
                                    </div>

                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-purple-100 italic">
                                * ملاحظة: تفعيل هذه الخيارات سيرسل طلبًا إلى إدارة المنصة للمراجعة والموافقة.
                            </p>

                        </div>

                        {/* TARGET AUDIENCE SECTION */}
                        <div className="col-span-2 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <label className="block text-sm font-bold text-gray-800 mb-3">الجمهور المستهدف (من يرى هذا المنتج؟)</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.target_audience.includes('clinic')}
                                        onChange={(e) => {
                                            const newAudience = e.target.checked
                                                ? [...formData.target_audience, 'clinic']
                                                : formData.target_audience.filter(a => a !== 'clinic');
                                            setFormData({ ...formData, target_audience: newAudience });
                                        }}
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">العيادات والأطباء</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.target_audience.includes('lab')}
                                        onChange={(e) => {
                                            const newAudience = e.target.checked
                                                ? [...formData.target_audience, 'lab']
                                                : formData.target_audience.filter(a => a !== 'lab');
                                            setFormData({ ...formData, target_audience: newAudience });
                                        }}
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">مختبرات الأسنان</span>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {formData.target_audience.length === 0
                                    ? '⚠️ يرجى اختيار جمهور واحد على الأقل'
                                    : formData.target_audience.length === 2
                                        ? 'سيظهر المنتج للجميع (عيادات ومختبرات)'
                                        : formData.target_audience.includes('clinic')
                                            ? 'سيظهر المنتج فقط للأطباء والعيادات'
                                            : 'سيظهر المنتج فقط للمختبرات'}
                            </p>
                        </div>
                    </div>


                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button type="submit" variant="primary" disabled={saving} className="min-w-[120px]">
                            <Save className="w-4 h-4 ml-2" />
                            {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
                        </Button>
                    </div>
                </form >
            </div >
            <BrandCreationModal
                isOpen={isBrandModalOpen}
                onClose={() => setIsBrandModalOpen(false)}
                onSuccess={(brand) => {
                    setFormData({ ...formData, brandId: brand.id });
                    setBrandSearch(brand.name);
                    setIsBrandModalOpen(false);
                }}
                initialName={brandSearch}
            />
        </div>
    );
};

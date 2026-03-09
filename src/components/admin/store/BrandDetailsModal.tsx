import React, { useState, useEffect } from 'react';
import { X, Globe, MapPin, Package, Users, ShieldCheck, ShieldAlert, Check, Ban } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../common/Button';
import { AdminTable } from '../AdminTable';
import { toast } from 'sonner';

interface BrandDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandId: string;
}

export const BrandDetailsModal: React.FC<BrandDetailsModalProps> = ({
    isOpen,
    onClose,
    brandId
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'suppliers'>('overview');
    const [brand, setBrand] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatorName, setCreatorName] = useState<string>('');

    useEffect(() => {
        if (isOpen && brandId) {
            fetchBrandDetails();
        }
    }, [isOpen, brandId]);

    const fetchBrandDetails = async () => {
        try {
            setLoading(true);

            // 1. Fetch Brand Details
            const { data: brandData, error: brandError } = await supabase
                .from('brands')
                .select('*')
                .eq('id', brandId)
                .single();

            if (brandError) throw brandError;
            setBrand(brandData);

            // Fetch Creator Name if exists
            if (brandData.created_by) {
                const { data: userData } = await supabase
                    .from('suppliers') // Check if supplier
                    .select('name')
                    .eq('user_id', brandData.created_by)
                    .maybeSingle();

                if (userData) {
                    setCreatorName(userData.name);
                } else {
                    // Try getting profile email if not a supplier (e.g. admin)
                    setCreatorName('مستخدم/مسؤول');
                }
            } else {
                setCreatorName('النظام (Admin)');
            }

            // 2. Fetch Products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*, supplier:suppliers(name)')
                .eq('brand_id', brandId)
                .order('created_at', { ascending: false });

            if (!productsError) {
                setProducts(productsData || []);

                // 3. Extract Unique Suppliers from products
                // Or fetch suppliers who have products with this brand
                const uniqueSupplierIds = Array.from(new Set(productsData?.map((p: any) => p.supplier_id) || []));

                if (uniqueSupplierIds.length > 0) {
                    const { data: suppliersData } = await supabase
                        .from('suppliers')
                        .select('*')
                        .in('id', uniqueSupplierIds);
                    setSuppliers(suppliersData || []);
                } else {
                    setSuppliers([]);
                }
            }

        } catch (error) {
            console.error('Error fetching brand details:', error);
            toast.error('فشل تحميل تفاصيل العلامة التجارية');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (status: boolean) => {
        try {
            const { error } = await supabase
                .from('brands')
                .update({ is_verified: status })
                .eq('id', brandId);

            if (error) throw error;

            setBrand({ ...brand, is_verified: status });
            toast.success(status ? 'تم توثيق العلامة بنجاح' : 'تم إلغاء التوثيق');
        } catch (error) {
            toast.error('حدث خطأ أثناء التحديث');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center p-2">
                            {brand?.logo ? (
                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-xl font-bold text-gray-400">{brand?.name?.slice(0, 2)}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900">{brand?.name}</h2>
                                {brand?.is_verified ? (
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> موثقة
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3" /> غير موثقة
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">تم الإنشاء بواسطة: {creatorName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-100 px-6 flex gap-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        نظرة عامة
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'products' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        المنتجات ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('suppliers')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'suppliers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        الموردين ({suppliers.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">تفاصيل العلامة التجارية</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-500 mb-1">الوصف</label>
                                        <p className="text-gray-700 leading-relaxed">{brand?.description || 'لا يوجد وصف متاح'}</p>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">تاريخ الإنشاء</label>
                                            <p className="text-gray-900 font-medium">
                                                {new Date(brand?.created_at).toLocaleDateString('ar-IQ', { dateStyle: 'long' })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">عدد المنتجات المرتبطة</label>
                                            <p className="text-gray-900 font-medium">{products.length} منتج</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">إجراءات الإدارة</h3>
                                <div className="flex gap-3">
                                    {!brand?.is_verified ? (
                                        <Button onClick={() => handleVerify(true)} className="bg-green-600 hover:bg-green-700 text-white">
                                            <Check className="w-4 h-4 ml-2" />
                                            توثيق العلامة
                                        </Button>
                                    ) : (
                                        <Button onClick={() => handleVerify(false)} variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                                            <Ban className="w-4 h-4 ml-2" />
                                            إلغاء التوثيق
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <AdminTable
                                columns={[
                                    {
                                        key: 'name',
                                        title: 'المنتج',
                                        render: (val, record) => (
                                            <div className="flex items-center gap-3">
                                                <img src={record.image_url || 'https://via.placeholder.com/40'} alt={val} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                                                <span className="font-medium text-gray-900">{val}</span>
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'price',
                                        title: 'السعر',
                                        render: (val) => `${val.toLocaleString()} د.ع`
                                    },
                                    {
                                        key: 'supplier',
                                        title: 'المورد',
                                        render: (_, record) => record.supplier?.name || '-'
                                    },
                                    {
                                        key: 'stock',
                                        title: 'المخزون',
                                        render: (val) => (
                                            <span className={`px-2 py-1 rounded-full text-xs ${val > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {val}
                                            </span>
                                        )
                                    }
                                ]}
                                data={products}
                            />
                        </div>
                    )}

                    {activeTab === 'suppliers' && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <AdminTable
                                columns={[
                                    {
                                        key: 'name',
                                        title: 'المورد',
                                        render: (val, record) => (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {val.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{val}</div>
                                                    <div className="text-xs text-gray-500">{record.email}</div>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'location',
                                        title: 'الموقع',
                                        render: (val) => val || '-'
                                    },
                                    {
                                        key: 'phone',
                                        title: 'الهاتف',
                                        render: (val) => val || '-'
                                    }
                                ]}
                                data={suppliers}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

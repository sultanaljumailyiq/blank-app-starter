import React, { useState, useEffect } from 'react';
import { AdminTable, Column } from '../../../components/admin/AdminTable';
import { Package, Star, Search, Filter, Tag, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/common/Button';
import { toast } from 'sonner';
import { AdminModal } from '../../../components/admin/AdminModal';

interface AdminProduct {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    supplier_id: string;
    supplier: {
        name: string;
    };
    is_featured: boolean;
    discount: number;
    image_url: string;
}

interface StoreProductsSectionProps {
    supplierId?: string;
}

export const StoreProductsSection: React.FC<StoreProductsSectionProps> = ({ supplierId }) => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'featured' | 'deals'>('all');

    // Deal Modal State
    const [showDealModal, setShowDealModal] = useState(false);
    const [selectedProductForDeal, setSelectedProductForDeal] = useState<AdminProduct | null>(null);
    const [dealConfig, setDealConfig] = useState({
        discount_percentage: 10,
        deal_badge: 'عرض خاص',
        deal_start: new Date().toISOString().split('T')[0],
        deal_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('*, supplier:suppliers(name)')
                .order('created_at', { ascending: false });

            if (supplierId) {
                query = query.eq('supplier_id', supplierId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('فشل تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [supplierId]);

    const toggleFeatured = async (product: AdminProduct) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_featured: !product.is_featured })
                .eq('id', product.id);

            if (error) throw error;
            toast.success(product.is_featured ? 'تم إزالة التميز' : 'تم تمييز المنتج');
            fetchProducts();
        } catch (error) {
            toast.error('فشل تحديث الحالة');
        }
    };

    const deleteProduct = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم حذف المنتج');
            fetchProducts();
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    const handleCreateDeal = async () => {
        if (!selectedProductForDeal) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    is_featured: true,
                    discount: dealConfig.discount_percentage, // Use existing 'discount' column
                    // deal_badge doesn't exist in DB, skip it
                })
                .eq('id', selectedProductForDeal.id);

            if (error) throw error;

            toast.success('تم تفعيل العرض بنجاح');
            setShowDealModal(false);
            setSelectedProductForDeal(null);
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error('فشل إنشاء العرض');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filterStatus === 'featured') return p.is_featured;
        if (filterStatus === 'deals') return (p.discount || 0) > 0;
        return true;
    });

    const columns: Column[] = [
        {
            key: 'name',
            title: 'اسم المنتج',
            sortable: true,
            render: (value, record: AdminProduct) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {record.image_url ? (
                            <img src={record.image_url} alt={value} className="w-full h-full object-cover" />
                        ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{value}</div>
                        <div className="text-xs text-gray-500">{record.category}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'supplier',
            title: 'المورد',
            sortable: true,
            render: (_, record: AdminProduct) => (
                <span className="text-sm font-medium text-gray-700">
                    {record.supplier?.name || 'غير معروف'}
                </span>
            )
        },
        {
            key: 'price',
            title: 'السعر',
            sortable: true,
            render: (value) => <span className="font-bold text-blue-600">{value.toLocaleString()} د.ع</span>
        },
        {
            key: 'status',
            title: 'الحالة',
            render: (_, record: AdminProduct) => (
                <div className="flex flex-wrap gap-1">
                    {record.is_featured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500" /> مميز
                        </span>
                    )}
                    {/* Inferred Deal from discount */}
                    {(record.discount || 0) > 0 && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <Tag className="w-3 h-3" /> خصم {record.discount}%
                        </span>
                    )}
                    {!record.is_featured && !(record.discount > 0) && (
                        <span className="text-xs text-gray-400">-</span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            title: 'الإجراءات',
            render: (_, record: AdminProduct) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleFeatured(record)}
                        className={`p-1.5 rounded-lg border transition-colors ${record.is_featured
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                            : 'bg-white text-gray-400 border-gray-200 hover:text-yellow-500'
                            }`}
                        title="تحديد كمميز"
                    >
                        <Star className={`w-4 h-4 ${record.is_featured ? 'fill-current' : ''}`} />
                    </button>

                    <button
                        onClick={() => {
                            setSelectedProductForDeal(record);
                            setDealConfig({
                                discount_percentage: record.discount || 0,
                                deal_badge: 'عرض خاص',
                                deal_start: new Date().toISOString().split('T')[0],
                                deal_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                            });
                            setShowDealModal(true);
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${(record.discount || 0) > 0
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : 'bg-white text-gray-400 border-gray-200 hover:text-purple-500'
                            }`}
                        title="إضافة لعرض"
                    >
                        <Tag className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => deleteProduct(record.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="حذف المنتج"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div >
            )
        }
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل المنتجات...</div>;

    return (
        <div className="space-y-6">
            {!supplierId && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-6 h-6 text-purple-600" />
                            إدارة المنتجات
                        </h2>
                        <p className="text-gray-500 mt-1">تصفح جميع المنتجات وتحديد العروض والمميزة</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Filter Tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                الكل
                            </button>
                            <button
                                onClick={() => setFilterStatus('featured')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'featured' ? 'bg-white shadow text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                المميزة
                            </button>
                            <button
                                onClick={() => setFilterStatus('deals')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'deals' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                العروض
                            </button>
                        </div>

                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>
            )}

            <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${supplierId ? 'shadow-none border-0' : ''}`}>
                <AdminTable
                    columns={columns}
                    data={filteredProducts}
                />
            </div>

            {/* Deal Config Modal */}
            <AdminModal
                isOpen={showDealModal}
                onClose={() => setShowDealModal(false)}
                title="إعداد العرض"
            >
                {selectedProductForDeal && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                            <img src={selectedProductForDeal.image_url} className="w-16 h-16 rounded-lg object-cover" />
                            <div>
                                <h4 className="font-bold text-gray-900">{selectedProductForDeal.name}</h4>
                                <p className="text-purple-600 font-bold">{selectedProductForDeal.price.toLocaleString()} د.ع</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">نسبة الخصم (%)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2"
                                    value={dealConfig.discount_percentage}
                                    onChange={e => setDealConfig({ ...dealConfig, discount_percentage: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">نص الشارة</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    value={dealConfig.deal_badge}
                                    onChange={e => setDealConfig({ ...dealConfig, deal_badge: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">تاريخ البداية</label>
                                <input
                                    type="date"
                                    className="w-full border rounded p-2"
                                    value={dealConfig.deal_start}
                                    onChange={e => setDealConfig({ ...dealConfig, deal_start: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">تاريخ النهاية</label>
                                <input
                                    type="date"
                                    className="w-full border rounded p-2"
                                    value={dealConfig.deal_end}
                                    onChange={e => setDealConfig({ ...dealConfig, deal_end: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                                السعر بعد الخصم: <span className="font-bold text-lg">{(selectedProductForDeal.price * (1 - dealConfig.discount_percentage / 100)).toLocaleString()} د.ع</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button variant="ghost" onClick={() => setShowDealModal(false)}>إلغاء</Button>
                            <Button onClick={handleCreateDeal}>تفعيل العرض</Button>
                        </div>
                    </div>
                )}
            </AdminModal>
        </div>
    );
};

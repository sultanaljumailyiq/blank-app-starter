import React, { useState, useEffect } from 'react';
import { AdminTable, Column } from '../AdminTable';
import { Button } from '../../common/Button';
import { Plus, Search, Tag, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { AdminModal } from '../AdminModal';

interface DealProduct {
    id: string;
    name: string;
    price: number;
    discount_percentage: number;
    deal_start: string;
    deal_end: string;
    deal_badge: string;
    image: string;
    supplier: { name: string };
}

export const DealsManager: React.FC = () => {
    const [deals, setDeals] = useState<DealProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Add Deal State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [dealConfig, setDealConfig] = useState({
        discount_percentage: 10,
        deal_badge: 'عرض خاص',
        deal_start: new Date().toISOString().split('T')[0],
        deal_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const fetchDeals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*, supplier:suppliers(name)')
            .eq('is_deal', true)
            .order('created_at', { ascending: false });

        if (data) setDeals(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const searchProducts = async () => {
        if (!searchTerm) return;
        const { data } = await supabase
            .from('products')
            .select('id, name, price, image, supplier:suppliers(name)')
            .ilike('name', `%${searchTerm}%`)
            .eq('is_deal', false) // Only fetch non-deals
            .limit(5);

        if (data) setSearchResults(data);
    };

    const handleCreateDeal = async () => {
        if (!selectedProduct) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    is_deal: true,
                    discount_percentage: dealConfig.discount_percentage,
                    deal_badge: dealConfig.deal_badge,
                    deal_start: dealConfig.deal_start,
                    deal_end: dealConfig.deal_end
                })
                .eq('id', selectedProduct.id);

            if (error) throw error;
            toast.success('تم إنشاء العرض بنجاح');
            setIsAddModalOpen(false);
            setSelectedProduct(null);
            setDealConfig({
                discount_percentage: 10,
                deal_badge: 'عرض خاص',
                deal_start: new Date().toISOString().split('T')[0],
                deal_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            fetchDeals();
        } catch (error) {
            toast.error('فشل إنشاء العرض');
        }
    };

    const handleEndDeal = async (id: string) => {
        if (!confirm('هل أنت متأكد من إنهاء هذا العرض؟')) return;
        const { error } = await supabase
            .from('products')
            .update({ is_deal: false })
            .eq('id', id);

        if (!error) {
            toast.success('تم إنهاء العرض');
            fetchDeals();
        }
    };

    const columns: Column[] = [
        {
            key: 'name',
            title: 'المنتج',
            sortable: true,
            render: (value, record) => (
                <div className="flex items-center gap-3">
                    <img src={record.image} alt={value} className="w-10 h-10 rounded object-cover" />
                    <div>
                        <div className="font-bold text-sm">{value}</div>
                        <div className="text-xs text-gray-500">{record.supplier?.name}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'discount',
            title: 'الخصم',
            render: (_, record) => (
                <div>
                    <span className="font-bold text-red-600">%{record.discount_percentage}</span>
                    <div className="text-xs text-gray-400 line-through">{record.price.toLocaleString()}</div>
                    <div className="text-xs font-bold text-green-600">
                        {Math.round(record.price * (1 - record.discount_percentage / 100)).toLocaleString()}
                    </div>
                </div>
            )
        },
        {
            key: 'badge',
            title: 'شارة العرض',
            render: (_, record) => (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                    {record.deal_badge}
                </span>
            )
        },
        {
            key: 'duration',
            title: 'المدة',
            render: (_, record) => (
                <div className="text-xs">
                    <div>{record.deal_start}</div>
                    <div className="text-gray-400">إلى</div>
                    <div>{record.deal_end}</div>
                </div>
            )
        },
        {
            key: 'actions',
            title: '',
            render: (_, record) => (
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleEndDeal(record.id)}>
                    إنهاء
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">العروض النشطة</h3>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة عرض جديد
                </Button>
            </div>

            <AdminTable columns={columns} data={deals} />

            <AdminModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="إضافة عرض جديد"
            >
                <div className="space-y-6">
                    {/* Step 1: Search */}
                    {!selectedProduct ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ابحث عن منتج</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 border rounded-lg px-3 py-2"
                                        placeholder="اسم المنتج..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && searchProducts()}
                                    />
                                    <Button onClick={searchProducts}><Search className="w-4 h-4" /></Button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {searchResults.map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedProduct(p)}>
                                        <img src={p.image} className="w-10 h-10 rounded object-cover" />
                                        <div className="flex-1">
                                            <div className="font-bold text-sm">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.price.toLocaleString()} د.ع | {p.supplier?.name}</div>
                                        </div>
                                        <Plus className="w-4 h-4 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-3 rounded flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={selectedProduct.image} className="w-12 h-12 rounded object-cover" />
                                    <div>
                                        <div className="font-bold">{selectedProduct.name}</div>
                                        <div className="text-sm text-gray-500">{selectedProduct.price.toLocaleString()} د.ع</div>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => setSelectedProduct(null)}>تغيير</Button>
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

                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 flex gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                    السعر الجديد سيكون: <span className="font-bold">{(selectedProduct.price * (1 - dealConfig.discount_percentage / 100)).toLocaleString()} د.ع</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                                <Button onClick={handleCreateDeal}>تأكيد العرض</Button>
                            </div>
                        </div>
                    )}
                </div>
            </AdminModal>
        </div>
    );
};

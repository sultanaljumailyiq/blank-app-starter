import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { CheckCircle, XCircle, Clock, Store, Package } from 'lucide-react';
import { Button } from '../../common/Button';

interface DealRequest {
    id: string;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
    discount_percentage: number;
    duration_days: number;
    admin_notes?: string;
    product: {
        id: string;
        name: string;
        image: string;
        price: number;
    };
    supplier: {
        name: string;
    };
}

export const DealRequestsTable: React.FC = () => {
    const [requests, setRequests] = useState<DealRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('deal_requests')
                .select(`
          *,
          product:products(id, name, images, price),
          supplier:suppliers(name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map data to match interface (handle images array vs string)
            const mappedData = (data || []).map((item: any) => ({
                ...item,
                product: {
                    ...item.product,
                    image: item.product.images?.[0] || 'https://via.placeholder.com/100'
                }
            }));

            setRequests(mappedData);
        } catch (err) {
            console.error('Error fetching deal requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            // 1. Update Request Status
            const { error } = await supabase
                .from('deal_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // 2. If Approved, Update Product
            if (newStatus === 'approved') {
                const request = requests.find(r => r.id === id);
                if (request) {
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setDate(startDate.getDate() + (request.duration_days || 7));

                    await supabase
                        .from('products')
                        .update({
                            is_deal: true,
                            discount_percentage: request.discount_percentage,
                            deal_start: startDate.toISOString(),
                            deal_end: endDate.toISOString()
                        })
                        .eq('id', request.product.id);
                }
            }

            // Refresh
            fetchRequests();

        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error updating status');
        }
    };

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">طلبات العروض من الموردين</h3>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {requests.filter(r => r.status === 'pending').length} طلب معلق
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">المنتج</th>
                            <th className="px-6 py-4">المورد</th>
                            <th className="px-6 py-4">الخصم المقترح</th>
                            <th className="px-6 py-4">المدة</th>
                            <th className="px-6 py-4">التاريخ</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-500">لا توجد طلبات حالياً</td>
                            </tr>
                        ) : (
                            requests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={request.product.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                            <div>
                                                <p className="font-medium text-slate-900 line-clamp-1">{request.product.name}</p>
                                                <p className="text-xs text-slate-500">{request.product.price.toLocaleString()} د.ع</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Store className="w-4 h-4 text-slate-400" />
                                            {request.supplier?.name || 'Supp-' + request.id.slice(0, 4)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-bold">
                                            {request.discount_percentage}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {request.duration_days} يوم
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {new Date(request.created_at).toLocaleDateString('ar-IQ')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {request.status === 'pending' && (
                                            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                                <Clock className="w-3 h-3" /> قيد المراجعة
                                            </span>
                                        )}
                                        {request.status === 'approved' && (
                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" /> مقبول
                                            </span>
                                        )}
                                        {request.status === 'rejected' && (
                                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                                <XCircle className="w-3 h-3" /> مرفوض
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {request.status === 'pending' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(request.id, 'approved')}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="قبول"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="رفض"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import {
    Search, Filter, Eye, CheckCircle, XCircle, Clock, Truck,
    MoreVertical, FileText, Printer, Calendar, Phone, MapPin, Package
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { formatCurrency } from '../../../lib/utils';
import { toast } from 'sonner';

interface StoreOrdersSectionProps {
    supplierId?: string;
}

export const StoreOrdersSection: React.FC<StoreOrdersSectionProps> = ({ supplierId }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [supplierId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('store_orders')
                .select(`
                    *,
                    items:store_order_items (
                        id,
                        product_id,
                        quantity,
                        price_at_purchase,
                        item_status,
                        return_requested,
                        return_reason,
                        product:products(name, image_url)
                    )
                `)
                .order('created_at', { ascending: false });

            if (supplierId) {
                if (supplierId.includes(',')) {
                    query = query.or(supplierId.split(',').map(id => `supplier_id.eq.${id}`).join(','));
                } else {
                    query = query.eq('supplier_id', supplierId);
                }
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data || []);
        } catch (err: any) {
            toast.error('فشل تحميل الطلبات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase.from('store_orders').update({ status }).eq('id', id);
            if (error) throw error;
            toast.success('تم تحديث حالة الطلب');
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
        } catch (err) {
            toast.error('فشل تحديث الحالة');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'قيد الانتظار';
            case 'processing': return 'قيد التجهيز';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التسليم';
            case 'cancelled': return 'ملغي';
            default: return status;
        }
    };

    const filteredOrders = orders.filter(order => {
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;
        if (searchQuery) {
            return order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    if (loading) return <div className="text-center p-8">جاري التحميل...</div>;

    return (
        <div className="space-y-6">
            {!supplierId && (
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">طلبات المتجر</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchOrders}><Clock className="w-4 h-4 ml-2" /> تجديد</Button>
                    </div>
                </div>
            )}

            {/* Filters - Only show if not in supplier context or simplified */}
            <Card>
                <div className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث برقم الطلب أو اسم العميل"
                            className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'processing', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'الكل' : getStatusLabel(status)}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                    <Card key={order.id} className="overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                {/* Header */}
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg text-gray-900">{order.order_number}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                المورد: {order.supplier?.name}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.shipping_address?.city}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        {order.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'processing')} className="bg-blue-600 hover:bg-blue-700 text-white">قبول</Button>
                                                <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'cancelled')} className="text-red-600 hover:bg-red-50 border-red-200">رفض</Button>
                                            </>
                                        )}
                                        {order.status === 'processing' && (
                                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-indigo-600 text-white">شحن</Button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-green-600 text-white">تسليم</Button>
                                        )}
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex-1 bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-bold text-sm text-gray-900 mb-3">المنتجات ({order.items?.length || 0})</h4>
                                    <div className="space-y-3">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-white rounded border overflow-hidden">
                                                        <img src={item.product?.images?.[0] || 'https://via.placeholder.com/50'} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span>{item.product?.name}</span>
                                                    <span className="text-gray-500">x{item.quantity}</span>
                                                </div>
                                                <span className="font-bold text-blue-600">{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
                                        <span>الإجمالي</span>
                                        <span className="text-lg text-blue-700">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )) : (
                    <div className="text-center py-12 text-gray-500">لا توجد طلبات</div>
                )}
            </div>
        </div>
    );
};

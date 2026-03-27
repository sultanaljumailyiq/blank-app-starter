import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle2, Clock, MapPin, CreditCard, ShoppingBag,
    Package, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useStoreOrders } from '../../hooks/useStoreOrders';
import { useStoreCart } from '../../hooks/useStoreCart';
import { toast } from 'sonner';
import { ReturnRequestModal } from '../../components/store/ReturnRequestModal';
import { UnavailableItemsModal } from '../../components/store/UnavailableItemsModal';

const steps = [
    { id: 'placed', label: 'تم الطلب' },
    { id: 'pending', label: 'معلق' },
    { id: 'processing', label: 'قيد التجهيز' },
    { id: 'shipped', label: 'تم الشحن' },
    { id: 'delivered', label: 'تم التسليم' }
];

export default function StoreOrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { returnOrder } = useStoreOrders();
    const { addToCart } = useStoreCart();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
    const [unavailableItems, setUnavailableItems] = useState<any[]>([]);
    const [validItemsToReorder, setValidItemsToReorder] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                const { data, error } = await supabase
                    .from('store_orders')
                    .select(`
                        *,
                        supplier:suppliers(name),
                        items:store_order_items(
                            *,
                            supplier:suppliers(name),
                            product:products(name, image_url, stock, price)
                        )
                    `)
                    .eq('id', orderId)
                    .single();

                if (error) throw error;

                // Map to UI friendly structure
                const mappedOrder = {
                    ...data,
                    supplierName: data.supplier?.name || data.items?.[0]?.supplier?.name,
                    supplierId: data.supplier_id || data.items?.[0]?.supplier_id,
                    creatorName: data.ordered_by || data.user_name?.split(' - ')[0],
                    items: data.items.map((i: any) => ({
                        id: i.product_id,
                        name: i.product?.name || i.product_name || 'منتج',
                        image: i.product?.image_url || 'https://via.placeholder.com/150',
                        quantity: i.quantity,
                        price: i.price_at_purchase || i.price || 0,
                        category: '',
                        currentStock: i.product?.stock || 0,
                        currentPrice: i.product?.price || i.price_at_purchase || 0,
                        status: i.item_status || 'pending'
                    }))
                };

                setOrder(mappedOrder);
            } catch (err) {
                console.error('Error fetching order:', err);
                toast.error('لم يتم العثور على الطلب');
                navigate('/store/orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleReorderClick = () => {
        if (!order) return;

        const unavailable: any[] = [];
        const valid: any[] = [];

        order.items.forEach((item: any) => {
            if ((item.currentStock || 0) < item.quantity) {
                unavailable.push(item);
            } else {
                valid.push(item);
            }
        });

        if (unavailable.length > 0) {
            setUnavailableItems(unavailable);
            setValidItemsToReorder(valid);
            setIsUnavailableModalOpen(true);
        } else {
            // All good, add all
            order.items.forEach((item: any) => {
                addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.currentPrice,
                    image: item.image,
                    stock: item.currentStock,
                    supplierId: order.supplier_id,
                    supplierName: 'Supplier',
                    category: '', description: ''
                } as any, item.quantity);
            });
            toast.success('تمت إضافة المنتجات للسلة');
            navigate('/store/cart');
        }
    };

    const handleProceedReorder = () => {
        validItemsToReorder.forEach((item: any) => {
            addToCart({
                id: item.id,
                name: item.name,
                price: item.currentPrice,
                image: item.image,
                stock: item.currentStock,
                supplierId: order.supplier_id,
                supplierName: 'Supplier',
                category: '', description: ''
            } as any, item.quantity);
        });
        setIsUnavailableModalOpen(false);
        toast.success('تمت إضافة المنتجات المتوفرة للسلة');
        navigate('/store/cart');
    };

    const handleSubmitReturn = async (reason: string, selectedItems: string[]) => {
        try {
            await returnOrder(order.id, reason);
            toast.success('تم إرسال طلب الإرجاع بنجاح');
            setOrder((prev: any) => ({ ...prev, status: 'return_requested' }));
        } catch (e) {
            toast.error('حدث خطأ أثناء طلب الإرجاع');
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
    if (!order) return null;

    const stepStatusMap: Record<string, number> = {
        'pending': 1, // Pending (معلق)
        'processing': 2,
        'received': 2,
        'shipped': 3,
        'delivered': 4,
        'return_requested': 4,
        'returned': 4,
        'cancelled': -1
    };

    const currentStepIndex = stepStatusMap[order.status] ?? 0;
    const isCancelled = order.status === 'cancelled';

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'معلق' };
            case 'received': return { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'تم الاستلام' };
            case 'processing': return { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'قيد التجهيز' };
            case 'shipped': return { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'تم الشحن' };
            case 'delivered': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'تم التسليم' };
            case 'cancelled': return { color: 'bg-rose-50 text-rose-700 border-rose-200', label: 'ملغي' };
            case 'returned': return { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'مرتجع' };
            case 'return_requested': return { color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'طلب إرجاع' };
            default: return { color: 'bg-slate-50 text-slate-700 border-slate-200', label: status };
        }
    };

    const statusConfig = getStatusConfig(order.status);

    return (
        <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
                        <ArrowRight className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800">تفاصيل الطلب #{order.order_number || order.id?.slice(0, 8)}</h1>
                        {order.supplierName && (
                            <div className="flex items-center gap-1 mt-1 text-sm font-bold">
                                <div 
                                    className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                                    onClick={() => {
                                        if (order.supplierId) navigate(`/store/supplier/${order.supplierId}`);
                                    }}
                                >
                                    <span>{order.supplierName}</span>
                                </div>
                                {order.creatorName && (
                                    <span className="text-slate-500 font-medium">بواسطة ({order.creatorName})</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className={`mr-auto px-3 py-1 rounded-full text-sm font-bold border ${statusConfig.color}`}>
                        {statusConfig.label}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* Progress Stepper (Bento Card) */}
                {!isCancelled && (
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-x-auto">
                        <div className="flex items-center justify-between min-w-[600px] relative">
                            {/* Background Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>

                            {/* Active Line */}
                            <div
                                className="absolute top-1/2 right-0 h-1 bg-blue-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-1000"
                                style={{
                                    width: `${Math.max(0, Math.min(100, (currentStepIndex / (steps.length - 1)) * 100))}%`
                                }}
                            ></div>

                            {steps.map((step, idx) => {
                                const isCompleted = idx < currentStepIndex || (idx === currentStepIndex && idx === steps.length - 1);
                                const isCurrent = idx === currentStepIndex && !isCompleted;
                                
                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2 relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 ${
                                            isCompleted
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                : isCurrent && step.id === 'pending' 
                                                    ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-200'
                                                    : isCurrent
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                        : 'bg-white border-slate-200 text-slate-300'
                                        }`}>
                                            {(isCompleted || isCurrent) && step.id !== 'pending' ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : isCurrent && step.id === 'pending' ? (
                                                <div className="w-3 h-3 rounded-full bg-white" />
                                            ) : (
                                                <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-blue-200' : 'bg-slate-200'}`} />
                                            )}
                                        </div>
                                        <div className="text-center absolute top-14 w-32">
                                            <p className={`text-sm font-bold transition-colors ${
                                                isCompleted || isCurrent 
                                                    ? step.id === 'pending' && isCurrent 
                                                        ? 'text-yellow-600' 
                                                        : 'text-slate-900' 
                                                    : 'text-slate-400'
                                            }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="h-12"></div>
                    </div>
                )}

                {/* Return Request Status Banner */}
                {order.status === 'return_requested' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-orange-800">طلب إرجاع قيد المراجعة</h4>
                            <p className="text-sm text-orange-600">تم تقديم طلب الإرجاع بنجاح. سيتم مراجعته من قبل المورد والرد خلال 24 ساعة.</p>
                        </div>
                    </div>
                )}

                {order.status === 'returned' && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-green-800">تمت الموافقة على الإرجاع</h4>
                            <p className="text-sm text-green-600">تم قبول طلب الإرجاع. سيتم استرداد المبلغ وفقاً لسياسة الإرجاع.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-slate-400" />
                                المنتجات ({order.items.length})
                            </h3>
                            <div className="space-y-4">
                                {order.items.map((item: any, i: number) => (
                                    <div key={i} className={`flex items-center gap-4 py-4 border-b last:border-0 border-slate-50 ${item.status === 'unavailable' ? 'bg-red-50 rounded-xl px-3 opacity-75' : ''}`}>
                                        <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden relative">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            {item.status === 'unavailable' && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold text-slate-800 line-clamp-1 ${item.status === 'unavailable' ? 'line-through text-slate-500' : ''}`}>{item.name}</h4>
                                            <div className="flex items-center gap-4 text-sm font-medium mt-1 flex-wrap">
                                                <span className="bg-slate-100 px-2 py-1 rounded-lg text-slate-600">الكمية: {item.quantity}</span>
                                                {item.status === 'unavailable' ? (
                                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg">غير متوفر</span>
                                                ) : (
                                                    <span className="text-blue-600">{formatCurrency(item.price * item.quantity)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    عنوان التوصيل
                                </h3>
                                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl text-sm">
                                    {typeof order.shipping_address === 'object' && order.shipping_address !== null ? (
                                        <>
                                            {order.shipping_address.recipientName && <span className="block font-bold mb-1">{order.shipping_address.recipientName}</span>}
                                            {order.shipping_address.address}
                                            {order.shipping_address.governorate && `، ${order.shipping_address.governorate}`}
                                            {order.shipping_address.city && ` - ${order.shipping_address.city}`}
                                            {order.shipping_address.phone && <span className="block mt-1 dir-ltr text-xs">Phone: {order.shipping_address.phone}</span>}
                                            {order.shipping_address.backupPhone && <span className="block dir-ltr text-xs text-slate-500">Backup: {order.shipping_address.backupPhone}</span>}
                                        </>
                                    ) : (
                                        order.shipping_address || '---'
                                    )}
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-slate-400" />
                                    طريقة الدفع
                                </h3>
                                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-sm font-medium text-slate-700">{order.payment_method === 'cash' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-6 text-slate-900">ملخص الطلب</h3>

                            <div className="space-y-3 mb-6">
                                <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-lg text-slate-900">
                                    <span>الإجمالي</span>
                                    <span className="text-blue-600">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Re-order Button */}
                                <Button
                                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                    onClick={handleReorderClick}
                                >
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    إعادة الطلب
                                </Button>

                                {order.status === 'delivered' && (
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-xl border-slate-200 hover:bg-slate-50 text-red-600 hover:text-red-700 hover:border-red-100"
                                        onClick={() => setIsReturnModalOpen(true)}
                                    >
                                        <AlertCircle className="w-4 h-4 ml-2" />
                                        طلب إرجاع
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReturnRequestModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                onSubmit={handleSubmitReturn}
                items={order.items.filter((item: any) => item.status !== 'unavailable')}
            />

            <UnavailableItemsModal
                isOpen={isUnavailableModalOpen}
                onClose={() => setIsUnavailableModalOpen(false)}
                onProceed={handleProceedReorder}
                unavailableItems={unavailableItems}
            />

        </div >
    );
}

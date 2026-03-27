import React, { useState } from 'react';
import { toast } from 'sonner';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft, ArrowRight, Filter, Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { supabase } from '../../lib/supabase';
import { useStoreOrders } from '../../hooks/useStoreOrders';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/common/Button';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { useNavigate } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, returnOrder } = useStoreOrders(); // Assuming hook returns all orders
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'shipped' | 'completed' | 'returned' | 'cancelled'>('all');

  const tabs = [
    { id: 'all', label: 'الكل' },
    { id: 'active', label: 'الجارية' }, // processing, shipped
    { id: 'shipped', label: 'تم الشحن' },
    { id: 'completed', label: 'المكتملة' },
    { id: 'returned', label: 'المرتجعة' },
    { id: 'cancelled', label: 'الملغية' }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock, label: 'معلق' };
      case 'received': return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle, label: 'تم الاستلام' };
      case 'processing': return { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, label: 'قيد التجهيز' };
      case 'shipped': return { color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck, label: 'تم الشحن' };
      case 'delivered': return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle, label: 'تم التسليم' };
      case 'cancelled': return { color: 'text-rose-600 bg-rose-50 border-rose-200', icon: XCircle, label: 'ملغي' };
      case 'returned': return { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Package, label: 'مرتجع' };
      case 'return_requested': return { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Clock, label: 'طلب إرجاع' };
      default: return { color: 'text-slate-600 bg-slate-50 border-slate-100', icon: Package, label: status };
    }
  };

  // Mock filtering logic locally since hook might just return all
  const filteredOrders = orders.filter(order => {
    const status = order.status as string;
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'processing', 'return_requested'].includes(status); // Show requested in Active? Or returned? User said "Return Request" flow. Maybe distinct tab?
    // User requested: "Active", "Shipped", "Completed", "Returned", "Cancelled".
    // "Return Requested" usually goes under "Returned" (as pending return) or "Active" (as action pending).
    // Given the flow, I'll put it in 'returned' so user sees it there as "Requested".
    if (activeTab === 'shipped') return status === 'shipped';
    if (activeTab === 'completed') return status === 'delivered';
    if (activeTab === 'returned') return ['returned', 'return_requested'].includes(status);
    if (activeTab === 'cancelled') return status === 'cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">


      {/* Header & Tabs */}
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">طلباتي</h1>
              <p className="text-sm text-slate-500 mt-1">تتبع حالة طلبات الشراء الخاصة بك</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400">جاري تحميل الطلبات...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 mt-4">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">لا توجد طلبات في هذه القائمة</h3>
            <p className="text-slate-500 mt-2">لم تقم بإجراء أي طلبات بهذا التصنيف بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredOrders.map(order => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/store/orders/${order.id}`)}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-slate-900">#{order.order_number}</span>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {order.supplierName && (
                          <div className="flex items-center gap-1 mt-1 text-xs font-bold">
                            <div 
                              className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (order.supplierId) navigate(`/store/supplier/${order.supplierId}`);
                              }}
                            >
                              <span>{order.supplierName}</span>
                            </div>
                            {order.creatorName && (
                              <span className="text-slate-400 font-medium">بواسطة ({order.creatorName})</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 font-medium">{order.date || order.createdAt}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-180 transition-transform duration-500" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-slate-50 rounded-2xl p-4">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-blue-600 font-medium padding-right-4">+ {order.items.length - 2} منتجات أخرى</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-1">إجمالي الطلب</p>
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(order.total)}</p>
                    </div>
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
                            try {
                              const { error } = await supabase
                                .from('store_orders')
                                .update({ status: 'cancelled' })
                                .eq('id', order.id);

                              if (error) throw error;
                              toast.success('تم إلغاء الطلب بنجاح');
                              window.location.reload();
                            } catch (err) {
                              toast.error('فشل إلغاء الطلب');
                            }
                          }}
                        >
                          إلغاء الطلب
                        </Button>
                      </div>
                    )}

                    {order.status === 'delivered' && (
                      <div className="flex gap-2">
                        <div className="flex gap-2">
                          {/* Re-order */}
                          <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success('تمت إضافة المنتجات للسلة (محاكاة)');
                            }}
                          >
                            إعادة الطلب
                          </Button>

                          {/* Return Request */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const reason = window.prompt('يرجى ذكر سبب الإرجاع:');
                              if (reason) {
                                try {
                                  await returnOrder(order.id, reason);
                                  toast.success('تم تقديم طلب الإرجاع بنجاح');
                                } catch (err) {
                                  toast.error('فشل تقديم طلب الإرجاع');
                                }
                              }
                            }}
                          >
                            طلب إرجاع
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Delete/Archive for Cancelled/Returned/Delivered */}
                    {['cancelled', 'returned', 'delivered'].includes(order.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm('هل تريد حذف هذا الطلب من السجل؟')) return;
                          try {
                            /* Soft Delete for Customer */
                            const { error } = await supabase.from('store_orders').update({ deleted_by_customer: true }).eq('id', order.id);
                            if (error) throw error;
                            toast.success('تم حذف الطلب من السجل');
                            // Manually filter out or trigger reload. 
                            // Since useStoreOrders doesn't expose a specific remove method, we might need to rely on auto-refresh or specific implementation.
                            // Ideally call a refresh function passed from parent or hook.
                            // useStoreOrders returns { orders, ... }. If we want immediate update, we might need a refresh capability.
                            // Assume useStoreOrders has a refresh or we just reload window for now or simpler:
                            window.location.reload();
                          } catch (err) {
                            toast.error('حدث خطأ أثناء الحذف');
                          }
                        }}
                      >
                        <span className="sr-only">حذف</span>
                        <XCircle className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
};

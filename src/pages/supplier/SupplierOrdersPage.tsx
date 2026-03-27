import React, { useState } from 'react';
import {
  Search, Filter, Eye, CheckCircle, XCircle, Clock, Truck, Trash2,
  MoreVertical, FileText, Printer, ChevronDown, Calendar, Phone, MapPin, Package, MessageCircle, User,
  TrendingUp, Building, Undo2, Send
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/utils';
import { useSupplierOrders } from '../../hooks/useSupplierOrders';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const SupplierOrdersPage: React.FC = () => {
  const { orders, loading, updateOrderStatus, refresh, analytics, platformStats, updateItemStatus } = useSupplierOrders();

  // Expose to window for the hack above, or preferably I should revert the hack and use proper closure.
  // Actually, I can't put closure in the map cleanly without it being messy in the replacement.
  // I will just attach it to window for this specific interaction since I already wrote it that way in the chunk?
  // No, that's bad practice. I should have written the handler in the replacement content properly.
  // Since I can't go back, I will implement the window handler here for now, or just use `updateItemStatus` directly if I update the replacement in the next turn. 
  // Wait, I am in the same turn.
  // I will update the destructuring here. And I will rely on the fact that I can't easily change the previous tool call arguments. 
  // Wait, I can't define (window as any).handle... inside the component cleanly without useEffect.
  // I should probably have used `onClick={() => updateItemStatus(order.id, item.id, ...)}` in the previous replacement. 
  // Can I edit the previous replacement? No.
  // I must assume the previous replacement is what it is.
  // 'onClick={() => (window as any).handleItemStatusUpdate(...)}'

  // So I will add:
  React.useEffect(() => {
    (window as any).handleItemStatusUpdate = (orderId: string, itemId: string, status: any) => {
      updateItemStatus(orderId, itemId, status);
    };
  }, [updateItemStatus]);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Message Modal State
  const [messageModal, setMessageModal] = useState<{ open: boolean; orderId: string; customerId: string; customerName: string; itemName: string } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Return Reason Modal State
  const [returnReasonModal, setReturnReasonModal] = useState<{ open: boolean; reason: string; itemName: string } | null>(null);

  // Update return status (approve/reject)
  const updateReturnStatus = async (orderId: string, itemId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('store_order_items')
        .update({
          return_requested: !approved, // If approved, clear the request
          item_status: approved ? 'return_approved' : 'return_rejected'
        })
        .eq('id', itemId);

      if (error) throw error;
      toast.success(approved ? 'تم قبول طلب الإرجاع' : 'تم رفض طلب الإرجاع');
      refresh();
    } catch (err) {
      console.error('Error updating return status:', err);
      toast.error('فشل تحديث حالة الإرجاع');
    }
  };

  const sendMessage = async () => {
    if (!messageModal || !messageText.trim()) return;
    setSendingMessage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('messages').insert({
        sender_id: user?.id,
        recipient_id: messageModal.customerId,
        content: `بخصوص المنتج: ${messageModal.itemName}\n\n${messageText}`,
        order_id: messageModal.orderId,
        created_at: new Date().toISOString(),
        read: false
      });
      if (error) throw error;
      toast.success('تم إرسال الرسالة بنجاح');
      setMessageModal(null);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('فشل إرسال الرسالة');
    } finally {
      setSendingMessage(false);
    }
  };

    // Derived filters
    const filteredOrders = orders.filter(order => {
        // Filter by tab
        if (activeTab === 'pending' && order.status !== 'pending') return false;
        if (activeTab === 'processing' && !['processing', 'received'].includes(order.status)) return false;
        if (activeTab === 'shipped' && order.status !== 'shipped') return false;
        if (activeTab === 'completed' && order.status !== 'delivered') return false;
        if (activeTab === 'returned' && !['returned', 'return_requested'].includes(order.status)) return false;
        if (activeTab === 'cancelled' && order.status !== 'cancelled') return false;

        // Filter by search (mock checking customer name or ID)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return order.id.includes(q) ||
        (order as any).customer?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'received': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'returned': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'بانتظار الموافقة';
      case 'received': return 'تم الاستلام';
      case 'processing': return 'جاري التحضير';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      case 'returned': return 'مرتجع';
      default: return status;
    }
  };

  if (loading && orders.length === 0) return <div className="p-8 text-center text-gray-500">جاري تحميل الطلبات...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الطلبات</h1>
          <p className="text-gray-600 mt-1">
            لديك {orders.filter(o => o.status === 'pending').length} طلبات جديدة بانتظار الموافقة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            تصفية
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            طباعة القائمة
          </Button>
        </div>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg text-white"><FileText className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-gray-500 font-bold">إجمالي الطلبات</p>
              <h3 className="text-xl font-bold text-gray-900">{orders.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg text-white"><User className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-gray-500 font-bold">إجمالي العملاء</p>
              <h3 className="text-xl font-bold text-gray-900">{platformStats?.totalCustomers || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg text-white"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-gray-500 font-bold">الطلبات المكتملة</p>
              <h3 className="text-xl font-bold text-gray-900">{orders.filter(o => ['delivered', 'تم التسليم', 'مكتمل'].includes(o.status)).length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-white"><TrendingUp className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-gray-500 font-bold">المبيعات الشهرية</p>
              <h3 className="text-xl font-bold text-gray-900">{orders.filter(o => o.status !== 'cancelled').length} طلب</h3>
            </div>
          </div>
        </Card>
      </div>



      {/* Order Analytics (Top Products & Clinics) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Products Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">المنتجات الأكثر طلباً</h3>
            </div>
            <div className="space-y-3">
              {analytics?.topProducts.length > 0 ? analytics.topProducts.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold">{idx + 1}</span>
                    <span className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{product.count} قطع</span>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">لا توجد بيانات كافية</p>
              )}
            </div>
          </div>
        </Card>

        {/* Top Clinics Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg shadow-lg shadow-purple-500/20 text-white">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">المستخدمين الأكثر طلباً</h3>
            </div>
            <div className="space-y-3">
              {analytics?.topClinics.length > 0 ? analytics.topClinics.map((clinic: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-xs font-bold">{idx + 1}</span>
                    <span className="text-sm font-medium text-gray-800 line-clamp-1">{clinic.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{clinic.count} طلبات</span>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">لا توجد بيانات كافية</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Stats */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-2 bg-gray-50/50">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              جميع الطلبات
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'pending' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              معلقة
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full mr-2">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'processing' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              جاري التجهيز
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full mr-2">
                {orders.filter(o => ['processing', 'received'].includes(o.status)).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('shipped')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'shipped' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              تم الشحن
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              مكتملة
            </button>
            <button
              onClick={() => setActiveTab('returned')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'returned' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              مرتجعة
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'cancelled' ? 'border-gray-500 text-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              ملغية
            </button>
          </div>
        </div>
        
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث برقم الطلب أو اسم العميل..."
              className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-4 text-sm text-gray-500">
            <span>إجمالي الطلبات: <strong className="text-gray-900">{filteredOrders.length}</strong></span>
            <span>المبلغ الكلي: <strong className="text-gray-900">{formatCurrency(filteredOrders.reduce((acc, o) => acc + (o.total || 0), 0))}</strong></span>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
          <div key={order.id} className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            {/* Decorative Side Accent */}
            <div className={`absolute top-0 right-0 w-1.5 h-full ${['pending', 'معلقة'].includes(order.status) ? 'bg-yellow-400' : ['delivered', 'تم التسليم', 'مكتمل'].includes(order.status) ? 'bg-green-500' : 'bg-blue-500'}`} />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">

              {/* Order Header & Customer Info */}
              <div className="flex-1 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-xl text-gray-900">طلب ({order.orderNumber})</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {new Date((order as any).orderDate || order.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        {new Date((order as any).orderDate || order.createdAt).toLocaleTimeString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-gray-50/80 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 border border-gray-100">
                  <div className="sm:col-span-2 flex items-center gap-2 pb-2 border-b border-gray-200/60">
                    <Building className="w-4 h-4 text-blue-600" />
                    <p className="font-bold text-gray-900 text-lg">{order.customer?.clinicName || 'عيادة غير محددة'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> الشخص المستلم</p>
                    <p className="font-bold text-gray-900">{order.customer?.name || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> أرقام الهاتف</p>
                    <div className="flex flex-col">
                      <p className="font-bold text-gray-900 dir-ltr font-mono">{order.customer?.phone || '-'}</p>
                      {order.customer?.backupPhone && <p className="text-xs text-gray-500 dir-ltr font-mono">{order.customer.backupPhone}</p>}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> العنوان</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-gray-900 leading-relaxed">
                        {order.customer?.governorate
                          ? `${order.customer.governorate}${order.customer.city ? `، ${order.customer.city}` : ''} - ${order.customer.address}`
                          : (order.customer?.address || 'العنوان غير متوفر')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical Divider (Desktop) */}
              <div className="hidden lg:block w-px bg-gray-100 self-stretch my-2"></div>

              {/* Order Items & Summary */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    المنتجات المطلوبة
                  </h4>
                  <div className="space-y-3 mb-6">
                    {order.items.map((item: any) => (
                      <div key={item.id || Math.random()} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border shadow-sm transition-all ${item.status === 'unavailable' ? 'bg-red-50 border-red-100 opacity-75' : 'bg-white border-gray-100 hover:border-blue-200'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg border flex items-center justify-center text-xl overflow-hidden shrink-0 relative">
                            {item.returnRequested && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center z-10" title="طلب إرجاع">
                                <Undo2 className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                            {item.status === 'unavailable' && (
                              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                              </div>
                            )}
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                          <div>
                            <p className={`font-bold text-sm line-clamp-1 ${item.status === 'unavailable' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">الكمية: <span className="font-bold text-gray-900">{item.quantity}</span></p>
                              {item.status === 'unavailable' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">غير متوفر</span>}
                              {item.returnRequested && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded flex items-center gap-1"><Undo2 className="w-2.5 h-2.5" />طلب إرجاع</span>}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-0 flex items-center gap-3 justify-between sm:justify-end min-w-[140px]">
                          <div className="text-left shrink-0">
                            <p className={`font-bold dir-ltr text-sm font-mono ${item.status === 'unavailable' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>

                          {/* Item Status Toggle Buttons - Always visible if order is pending/received/processing */}
                          {['pending', 'received', 'processing'].includes(order.status) && (
                            <div className="flex items-center gap-1">
                              {/* Available Toggle */}
                              <button
                                className={`p-2 rounded-lg transition-all ${item.status === 'accepted'
                                  ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'}`}
                                onClick={() => updateItemStatus(order.id, item.id, item.status === 'accepted' ? 'pending' : 'accepted')}
                                title="متوفر"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>

                              {/* Unavailable Toggle */}
                              <button
                                className={`p-2 rounded-lg transition-all ${item.status === 'unavailable'
                                  ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'}`}
                                onClick={() => updateItemStatus(order.id, item.id, item.status === 'unavailable' ? 'pending' : 'unavailable')}
                                title="غير متوفر"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>

                              {/* Message Icon - Only show when item is unavailable */}
                              {item.status === 'unavailable' && (
                                <button
                                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                                  onClick={() => setMessageModal({
                                    open: true,
                                    orderId: order.id,
                                    customerId: (order as any).customer?.userId || order.id,
                                    customerName: order.customer?.name || 'العميل',
                                    itemName: item.name || 'المنتج'
                                  })}
                                  title="مراسلة العميل بخصوص هذا المنتج"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Return Request Actions - Show if item has return request */}
                          {item.returnRequested && (
                            <div className="flex items-center gap-1">
                              {/* View Return Reason */}
                              <button
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                                onClick={() => setReturnReasonModal({
                                  open: true,
                                  reason: item.returnReason || 'لم يتم تحديد سبب',
                                  itemName: item.name || 'المنتج'
                                })}
                                title="عرض سبب الإرجاع"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              {/* Approve Return */}
                              <button
                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all"
                                onClick={() => updateReturnStatus(order.id, item.id, true)}
                                title="قبول طلب الإرجاع"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>

                              {/* Reject Return */}
                              <button
                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                                onClick={() => {
                                  updateReturnStatus(order.id, item.id, false);
                                  setMessageModal({
                                    open: true,
                                    orderId: order.id,
                                    customerId: (order as any).customer?.userId || order.id,
                                    customerName: order.customer?.name || 'العميل',
                                    itemName: item.name || 'المنتج'
                                  });
                                }}
                                title="رفض طلب الإرجاع ومراسلة العميل"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">الإجمالي الكلي</span>
                    <span className="font-black text-2xl text-blue-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {/* Action Buttons - Strict Workflow */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* PENDING -> RECEIVED */}
                  {order.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={() => updateOrderStatus(order.id, 'received')}
                      >
                        <CheckCircle className="w-4 h-4 ml-2" />
                        استلام الطلب
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white text-red-600 hover:bg-red-50 border-gray-200"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      >
                        <XCircle className="w-4 h-4 ml-2" />
                        رفض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                        onClick={() => setMessageModal({
                          open: true,
                          orderId: order.id,
                          customerId: (order as any).customer?.userId || order.id,
                          customerName: order.customer?.name || 'العميل',
                          itemName: 'الطلب بشكل عام'
                        })}
                      >
                        <MessageCircle className="w-4 h-4 ml-2" />
                        مراسلة العميل
                      </Button>
                    </>
                  )}

                  {/* RECEIVED -> PROCESSING */}
                  {order.status === 'received' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200"
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                    >
                      <Package className="w-4 h-4 ml-2" />
                      بدء التحضير
                    </Button>
                  )}

                  {/* PROCESSING -> SHIPPED */}
                  {order.status === 'processing' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                    >
                      <Truck className="w-4 h-4 ml-2" />
                      إرسال الطلب (شحن)
                    </Button>
                  )}

                  {/* SHIPPED -> DELIVERED */}
                  {order.status === 'shipped' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تأكيد التسليم
                    </Button>
                  )}

                  {/* DELIVERED -> Allow Return? Typically handled by Doctor request first */}
                  {['delivered', 'تم التسليم', 'مكتمل'].includes(order.status) && (
                    <div className="w-full text-center text-sm font-bold text-green-600 bg-green-50 py-2 rounded-lg border border-green-100">
                      تم تسليم الطلب بنجاح
                    </div>
                  )}

                  {/* RETURN REQUESTED -> Approve Return */}
                  {order.status === 'return_requested' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200"
                      onClick={() => updateOrderStatus(order.id, 'returned')}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      الموافقة على الإرجاع
                    </Button>
                  )}

                  {/* RETURNED */}
                  {order.status === 'returned' && (
                    <div className="w-full text-center text-sm font-bold text-red-600 bg-red-50 py-2 rounded-lg border border-red-100">
                      طلب مرتجع (مكتمل)
                    </div>
                  )}

                  {/* DELETE ORDER (Only if Cancelled or Returned) */}
                  {['cancelled', 'returned'].includes(order.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={async () => {
                        if (confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
                          try {
                            // Soft Delete
                            const { error } = await supabase
                              .from('store_orders')
                              .update({ deleted_by_supplier: true })
                              .eq('id', order.id); // Use order.id here

                            if (error) throw error;

                            toast.success('تم حذف الطلب بنجاح');
                            refresh();
                          } catch (err) {
                            console.error('Error deleting order:', err);
                            toast.error('حدث خطأ أثناء حذف الطلب');
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف الطلب نهائياً
                    </Button>
                  )}
                </div>

              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500">جرب تغيير حالة التصفية أو مصطلحات البحث العثور على ما تبحث عنه</p>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {messageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                مراسلة العميل
              </h3>
              <p className="text-sm text-gray-500 mt-1">إرسال رسالة إلى {messageModal.customerName} بخصوص المنتج</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <span className="font-bold text-gray-800">المنتج:</span> {messageModal.itemName}
              </div>
              <textarea
                placeholder="اكتب رسالتك هنا... مثال: المنتج غير متوفر حالياً، هل تود الانتظار أو استبداله؟"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setMessageModal(null); setMessageText(''); }}
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                onClick={sendMessage}
                disabled={sendingMessage || !messageText.trim()}
              >
                {sendingMessage ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الإرسال...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    إرسال الرسالة
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return Reason Modal */}
      {returnReasonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                سبب طلب الإرجاع
              </h3>
              <p className="text-sm text-gray-500 mt-1">المنتج: {returnReasonModal.itemName}</p>
            </div>
            <div className="p-5">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-orange-800">
                {returnReasonModal.reason}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setReturnReasonModal(null)}
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
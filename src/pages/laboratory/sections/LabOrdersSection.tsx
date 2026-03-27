import React, { useState } from 'react';
import {
  Package, Clock, Eye, Search, Plus, MoreVertical, AlertTriangle, DollarSign,
  User, Building, Edit, MessageSquare, CheckCircle, XCircle, ArrowRight, Truck, RefreshCw, FlipVertical, Phone
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { useLabOrders, LabOrder } from '../../../hooks/useLabOrders';
import { formatNumericDate } from '../../../lib/date';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

export const LabOrdersSection: React.FC = () => {
  const { user } = useAuth();
  const { orders, loading, updateOrderStatus } = useLabOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Delegate Modal State
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateAction, setDelegateAction] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedDelegate, setSelectedDelegate] = useState<string>('');

  // Delegates State
  const [delegates, setDelegates] = useState<{ id: string; name: string; phone: string }[]>([]);

  // Fetch Delegates
  React.useEffect(() => {
    const fetchDelegates = async () => {
      if (!user) return;
      try {
        // Get Lab ID from User ID first
        const { data: labData } = await supabase
          .from('dental_laboratories')
          .select('id')
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
          .maybeSingle();

        const labId = labData?.id || user.id;

        const { data, error } = await supabase
          .from('dental_lab_representatives')
          .select('id, full_name, phone, status')
          .eq('laboratory_id', labId);

        if (error) {
          console.error('Supabase error fetching delegates in LabOrdersSection:', error);
        }

        if (data) {
          setDelegates(data.map((d: any) => ({
            id: d.id,
            name: d.full_name || 'مندوب',
            phone: d.phone || ''
          })));
        }
      } catch (e) {
        console.error('Error fetching delegates', e);
      }
    };
    fetchDelegates();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: 'في انتظار الموافقة', color: 'bg-amber-100 text-amber-800' },
      waiting_for_representative: { label: 'بانتظار المندوب', color: 'bg-orange-100 text-orange-800' },
      representative_dispatched: { label: 'تم إرسال المندوب', color: 'bg-purple-100 text-purple-800' },
      in_progress: { label: 'قيد العمل', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'مكتمل', color: 'bg-green-100 text-green-800' },
      out_for_delivery: { label: 'جارِ التوصيل', color: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-800' },
      returned: { label: 'مسترجع', color: 'bg-rose-100 text-rose-800' },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'ملغي', color: 'bg-gray-100 text-gray-800' },
      modification_requested: { label: 'طلب تعديل', color: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        {status === 'out_for_delivery' && <Truck className="w-3 h-3" />}
        {status === 'waiting_for_representative' && <User className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: any = {
      'عاجلة': { color: 'bg-red-100 text-red-800' },
      'عالية': { color: 'bg-orange-100 text-orange-800' },
      'عادية': { color: 'bg-blue-100 text-blue-800' },
      'منخفضة': { color: 'bg-gray-100 text-gray-800' }
    };

    const config = priorityConfig[priority] || priorityConfig['عادية'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {priority}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' د.ع';
  };

  const filteredOrders = orders.filter(order => {
    const searchString = `${order.order_number} ${order.clinic_name || ''} ${order.patient_name} ${order.service_name}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPriority = !priorityFilter || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewOrder = (order: LabOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDelegation = () => {
    if (!selectedOrder || !selectedDelegate) return;

    const delegate = delegates.find(d => d.id === selectedDelegate);
    let updates: any = {};

    if (delegateAction === 'pickup') {
      updates = {
        pickup_delegate_id: selectedDelegate,
        pickup_delegate_name: delegate?.name,
        // Fallback for generic usages
        delegate_id: selectedDelegate,
        delegate_name: delegate?.name
      };
      updateOrderStatus(selectedOrder.id, 'representative_dispatched', updates);
      toast.success(`تم إرسال المندوب لاستلام الطلب`);
    } else {
      updates = {
        delivery_delegate_id: selectedDelegate,
        delivery_delegate_name: delegate?.name,
        // Fallback for generic usages
        delegate_id: selectedDelegate,
        delegate_name: delegate?.name
      };
      updateOrderStatus(selectedOrder.id, 'out_for_delivery', updates);
      toast.success(`تم إرسال الطلب مع المندوب`);
    }

    setShowDelegateModal(false);
    setShowOrderDetails(false);
  };

  const openDelegateModal = (type: 'pickup' | 'delivery') => {
    setDelegateAction(type);
    setSelectedDelegate('');
    setShowDelegateModal(true);
  };

  const calculateOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending' || o.status === 'waiting_for_representative').length,
      inProgress: orders.filter(o => o.status === 'in_progress' || o.status === 'representative_dispatched').length,
      completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered' || o.status === 'out_for_delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      revenue: orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.final_amount || 0), 0)
    };
  };

  const stats = calculateOrderStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة طلبات العمل</h1>
            <p className="text-blue-100">
              إدارة ومتابعة جميع طلبات العمل والدورة المستندية الكاملة
            </p>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-blue-200 text-sm">إجمالي الطلبات</div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row (Bento Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="relative overflow-hidden rounded-[2rem] p-5 border border-yellow-100 bg-gradient-to-br from-yellow-50 to-yellow-100/50 hover:shadow-lg transition-all group">
          <Clock className="absolute -bottom-4 -left-4 w-24 h-24 text-yellow-500/10 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
            <div className="text-sm font-medium text-yellow-700">في الانتظار</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="relative overflow-hidden rounded-[2rem] p-5 border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all group">
          <Clock className="absolute -bottom-4 -left-4 w-24 h-24 text-blue-500/10 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.inProgress}</div>
            <div className="text-sm font-medium text-blue-700">قيد العمل</div>
          </div>
        </div>

        {/* Completed */}
        <div className="relative overflow-hidden rounded-[2rem] p-5 border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-lg transition-all group">
          <CheckCircle className="absolute -bottom-4 -left-4 w-24 h-24 text-green-500/10 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.completed}</div>
            <div className="text-sm font-medium text-green-700">مكتمل</div>
          </div>
        </div>

        {/* Revenue */}
        <div className="relative overflow-hidden rounded-[2rem] p-5 border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all group">
          <DollarSign className="absolute -bottom-4 -left-4 w-24 h-24 text-purple-500/10 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 text-center">
            <div className="text-xl font-bold text-purple-600 mb-1 truncate" dir="ltr">{formatCurrency(stats.revenue)}</div>
            <div className="text-sm font-medium text-purple-700">الإيرادات</div>
          </div>
        </div>
      </div>

      {/* Filters (Bento Container) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* ... Search and Filter Inputs ... */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث برقم الطلب، العيادة، المريض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-md transition-all active:scale-95 w-full lg:w-auto justify-center">
            <Plus className="w-5 h-5" />
            <span>طلب جديد</span>
          </button>
        </div>
      </div>

      {/* Orders Table (Bento Container) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
              <Package className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900">قائمة الطلبات</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="text-right py-4 px-6 font-medium text-gray-500 text-sm">رقم الطلب</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 text-sm">العيادة والمريض</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 text-sm">نوع العمل</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 text-sm">التاريخ</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 text-sm">التكلفة</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 text-sm">الحالة</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500 text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-gray-500 text-sm">لا توجد طلبات تطابق المعايير المحددة</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">{order.order_number}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-900 font-medium">{order.clinic_name || 'عيادة'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">{order.patient_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 flex flex-col gap-1 items-start">
                      <span className="text-sm text-gray-700 font-medium">{order.service_name}</span>
                      {(() => {
                        const toothNums = order.tooth_numbers && order.tooth_numbers.length > 0 ? order.tooth_numbers : (order.tooth_number !== undefined ? [order.tooth_number] : []);
                        if (toothNums.length === 0 || (toothNums.length === 1 && toothNums[0] === 0)) return <span className="text-[11px] text-gray-500 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200">علاج عام</span>;
                        if (toothNums.length === 1) return <span className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-medium">سن رقم: {toothNums[0]}</span>;
                        return <span className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-medium">سن رقم: {toothNums.join(', ')}</span>;
                      })()}
                      {order.is_return_cycle && (
                        <span className="mt-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200">استرجاع</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-500 text-xs font-mono" dir="ltr">{formatNumericDate(new Date(order.order_date))}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-gray-700">{formatCurrency(order.final_amount)}</span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Order Details Modal */}
      <Modal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        title={selectedOrder ? `تفاصيل الطلب - ${selectedOrder.order_number}` : 'تفاصيل الطلب'}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3 text-blue-700">
                  <Building className="w-5 h-5" />
                  <h4 className="font-bold">معلومات العيادة</h4>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">{selectedOrder.clinic_name || 'غير متوفر'}</p>
                <p className="text-xs text-gray-500">رقم العيادة: #{selectedOrder.clinic_id || '--'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3 text-purple-700">
                  <User className="w-5 h-5" />
                  <h4 className="font-bold">معلومات المريض</h4>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">{selectedOrder.patient_name}</p>
                <p className="text-xs text-gray-500">العمر: -- سنة</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                تفاصيل الحالة
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedOrder.status)}
                  {/* عرض مندوب الاستلام والمندوب الموصل */}
                  {(selectedOrder.pickup_delegate_name || selectedOrder.delivery_delegate_name || selectedOrder.delegate_name) && (
                    <div className="flex flex-col gap-2">
                      {(selectedOrder.pickup_delegate_name || selectedOrder.delegate_name) && (
                        <div className="flex items-center gap-1 text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                          <Truck className="w-3.5 h-3.5" />
                          <span>مندوب الاستلام: {selectedOrder.pickup_delegate_name || selectedOrder.delegate_name}</span>
                          {(() => {
                            const phone = selectedOrder.pickup_delegate_phone || delegates.find(d => d.id === selectedOrder.pickup_delegate_id || d.id === selectedOrder.delegate_id)?.phone;
                            return phone ? (
                              <a
                                href={`tel:${phone}`}
                                className="mr-2 inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded-md text-xs font-medium transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="w-3 h-3" />
                                اتصال
                              </a>
                            ) : null;
                          })()}
                        </div>
                      )}
                      {selectedOrder.delivery_delegate_name && (
                        <div className="flex items-center gap-1 text-sm text-cyan-600 bg-cyan-50 px-2 py-1 rounded-md border border-cyan-100">
                          <Truck className="w-3.5 h-3.5" />
                          <span>مندوب التوصيل: {selectedOrder.delivery_delegate_name}</span>
                          {(() => {
                            const phone = selectedOrder.delivery_delegate_phone || delegates.find(d => d.id === selectedOrder.delivery_delegate_id)?.phone;
                            return phone ? (
                              <a
                                href={`tel:${phone}`}
                                className="mr-2 inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded-md text-xs font-medium transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="w-3 h-3" />
                                اتصال
                              </a>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedOrder.is_return_cycle && (
                    <div className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded">
                      سبب الإرجاع: {selectedOrder.return_reason || '-'}
                    </div>
                  )}
                  {selectedOrder.status === 'modification_requested' && (
                    <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                      ملاحظة التعديل: {selectedOrder.return_reason || '-'}
                    </div>
                  )}
                </div>
                {getPriorityBadge(selectedOrder.priority)}
              </div>
            </div>

            {/* Smart Actions for Lab */}
            <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-3">
              {/* Flow 1: Pending -> Waiting Representative (Approve) */}
              {selectedOrder.status === 'pending' && (
                <>
                  <button
                    onClick={() => { updateOrderStatus(selectedOrder.id, 'waiting_for_representative'); setShowOrderDetails(false); }}
                    className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-xl hover:bg-green-700 font-bold transition-colors shadow-sm"
                  >
                    قبول والطلب
                  </button>
                  <button
                    onClick={() => { updateOrderStatus(selectedOrder.id, 'rejected'); setShowOrderDetails(false); }}
                    className="flex-1 bg-red-50 text-red-600 py-2.5 px-4 rounded-xl hover:bg-red-100 font-bold transition-colors shadow-sm"
                  >
                    رفض
                  </button>
                </>
              )}

              {/* Flow 2: Waiting Rep -> Send Rep (Select Delegate) */}
              {selectedOrder.status === 'waiting_for_representative' && (
                <button
                  onClick={() => openDelegateModal('pickup')}
                  className="flex-1 bg-purple-600 text-white py-2.5 px-4 rounded-xl hover:bg-purple-700 font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  إرسال المندوب للاستلام
                </button>
              )}

              {/* Flow 3: Rep Dispatched -> In Progress (Confirmed Arrival) */}
              {selectedOrder.status === 'representative_dispatched' && (
                <button
                  onClick={() => { updateOrderStatus(selectedOrder.id, 'in_progress'); setShowOrderDetails(false); }}
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  تأكيد استلام العمل (بدء العمل)
                </button>
              )}

              {/* Flow 4: In Progress -> Completed */}
              {selectedOrder.status === 'in_progress' && (
                <button
                  onClick={() => { updateOrderStatus(selectedOrder.id, 'completed'); setShowOrderDetails(false); }}
                  className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-xl hover:bg-green-700 font-bold transition-colors shadow-sm"
                >
                  إكمال العمل
                </button>
              )}

              {/* Flow 5: Completed -> Out For Delivery (Select Delegate) */}
              {selectedOrder.status === 'completed' && (
                <button
                  onClick={() => openDelegateModal('delivery')}
                  className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  إرسال الحالة مع المندوب
                </button>
              )}

              {/* Flow 6: Returned -> Waiting Rep (Restart Cycle) */}
              {selectedOrder.status === 'returned' && (
                <button
                  onClick={() => { updateOrderStatus(selectedOrder.id, 'waiting_for_representative'); setShowOrderDetails(false); }}
                  className="flex-1 bg-orange-600 text-white py-2.5 px-4 rounded-xl hover:bg-orange-700 font-bold transition-colors shadow-sm"
                >
                  إعادة معالجة (طلب مندوب)
                </button>
              )}

              {/* Flow 7: Modification Requested -> In Progress (Restart Work) */}
              {selectedOrder.status === 'modification_requested' && (
                <button
                  onClick={() => { updateOrderStatus(selectedOrder.id, 'in_progress'); setShowOrderDetails(false); }}
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  بدء التعديل (قيد العمل)
                </button>
              )}

              {/* Payment Approval Flow */}
              {selectedOrder.paymentStatus === 'waiting_approval' && (
                <button
                  onClick={async () => {
                    // 1. Update Order Status
                    await updateOrderStatus(selectedOrder.id, selectedOrder.status, { paymentStatus: 'paid' });

                    // 2. Record Transaction
                    if (user?.id) {
                      try {
                        await supabase.from('financial_transactions').insert({
                          clinic_id: null, // Clinic ID is optional or stored differently if needed, but this is Lab Income
                          lab_id: user.id,
                          amount: selectedOrder.final_amount || 0,
                          type: 'income',
                          category: 'lab_order_payment',
                          description: `دفعة طلب رقم #${selectedOrder.order_number} - ${selectedOrder.patient_name}`,
                          transaction_date: new Date().toISOString().split('T')[0],
                          status: 'completed',
                          payment_method: 'transfer'
                        });
                        toast.success('تم تسوية الدفعة وتسجيل الإيراد بنجاح');
                      } catch (e) {
                        console.error('Error recording transaction', e);
                        toast.error('تم تحديث الحالة ولكن فشل تسجيل الإيراد');
                      }
                    }

                    setShowOrderDetails(false);
                  }}
                  className="flex-1 bg-emerald-600 text-white py-2.5 px-4 rounded-xl hover:bg-emerald-700 font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  تأكيد استلام الدفعة
                </button>
              )}

              <button
                onClick={() => setShowOrderDetails(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delegate Selection Modal */}
      <Modal
        isOpen={showDelegateModal}
        onClose={() => setShowDelegateModal(false)}
        title={delegateAction === 'pickup' ? "إرسال مندوب للاستلام" : "إرسال الحالة للتوصيل"}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900"> اختر المندوب</h4>
              <p className="text-sm text-gray-600">سيتم إشعار المندوب بالمهمة فوراً</p>
            </div>
          </div>

          <div className="grid gap-3">
            {delegates.length === 0 ? (
              <div className="text-center p-4 text-gray-500 border border-dashed rounded-lg">
                لا يوجد مناديب مسجلين لهذا المختبر
              </div>
            ) : delegates.map(del => (
              <button
                key={del.id}
                onClick={() => setSelectedDelegate(del.id)}
                className={`p-4 rounded-xl border text-right transition-all flex items-center justify-between group ${selectedDelegate === del.id
                  ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-100'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
              >
                <div>
                  <div className="font-bold text-gray-900">{del.name}</div>
                  <div className="text-sm text-gray-500">{del.phone}</div>
                </div>
                {selectedDelegate === del.id && <CheckCircle className="w-5 h-5 text-purple-600" />}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDelegation}
              disabled={!selectedDelegate}
              className="flex-1 bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
              تأكيد وإرسال
            </button>
            <button
              onClick={() => setShowDelegateModal(false)}
              className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
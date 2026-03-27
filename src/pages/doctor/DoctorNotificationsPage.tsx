import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, Package, MessageCircle, AlertTriangle, CheckCircle2, Clock, X, Building2, RefreshCw, Shield, Zap, Info } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { NotificationContent } from '../../components/common/NotificationContent';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import { useDoctorContext } from '../../contexts/DoctorContext';
import { clinicsData } from '../../data/mock/clinics';
import { useAppointments } from '../../hooks/useAppointments';
import { useLabOrders } from '../../hooks/useLabOrders';
import { useStoreOrders } from '../../hooks/useStoreOrders';

// Define the display categories
type FilterCategory = 'all' | 'unread' | 'general' | 'update' | 'system' | 'appointment' | 'inventory' | 'order';

interface DisplayNotification extends Notification {
  displayCategory: FilterCategory;
  displayIcon: React.ReactNode;
  displayColor: string;
  metadata?: any;
}

const formatTime12h = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'مساءً' : 'صباحاً';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const getLabStatusConfig = (s: string) => {
    const map: any = {
        pending: { label: 'طلب جديد', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        waiting_for_representative: { label: 'بانتظار المندوب', color: 'bg-orange-50 text-orange-700 border-orange-200' },
        representative_dispatched: { label: 'تم إرسال المندوب', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        in_progress: { label: 'قيد العمل', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        completed: { label: 'مكتمل', color: 'bg-green-50 text-green-700 border-green-200' },
        out_for_delivery: { label: 'جار التوصيل', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
        delivered: { label: 'تم التسليم', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        returned: { label: 'مسترجع', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        rejected: { label: 'مرفوض', color: 'bg-red-50 text-red-700 border-red-200' },
        cancelled: { label: 'ملغي', color: 'bg-rose-50 text-rose-700 border-rose-200' },
        modification_requested: { label: 'طلب تعديل', color: 'bg-orange-50 text-orange-700 border-orange-200' }
    };
    return map[s] || { label: s, color: 'bg-gray-50 text-gray-600 border-gray-200' };
};

const getStoreStatusConfig = (s: string) => {
    const map: any = {
        pending: { label: 'معلق', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        processing: { label: 'قيد التجهيز', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        shipped: { label: 'تم الشحن', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        delivered: { label: 'تم التسليم', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        cancelled: { label: 'ملغي', color: 'bg-rose-50 text-rose-700 border-rose-200' },
        returned: { label: 'مسترجع', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        return_requested: { label: 'طلب إرجاع', color: 'bg-orange-50 text-orange-700 border-orange-200' }
    };
    return map[s] || { label: s, color: 'bg-gray-50 text-gray-600 border-gray-200' };
};

export const DoctorNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMultiClinicOwner, user } = useAuth();
  const { notifications, updates, markAsRead, deleteNotification, loading } = useNotifications();
  const { selectedClinicId } = useDoctorContext();
  const { appointments } = useAppointments(selectedClinicId);
  const { orders: labOrders } = useLabOrders({ clinicId: selectedClinicId });
  const { orders: storeOrders } = useStoreOrders();
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');

  // Helper to get clinic name lookup
  const getClinicName = (clinicId?: string) => {
    if (!clinicId) return '';
    const clinic = clinicsData.find(c => c.id === clinicId);
    return clinic?.name || '';
  };

  // Logic to categorize notifications
  const categorizedNotifications = useMemo(() => {
    // Map regular notifications - Filter out task and reminder
    const mappedNotifications = notifications
      .filter(n => !['task', 'reminder', 'order_update'].includes(n.type) && !n.title.includes('طلبك') && !n.title.includes('تحديث حالة الطلب'))
      .map(n => {
        let category: FilterCategory = 'general';
        let icon = <Info className="w-6 h-6" />;
        let color = 'bg-gray-100 text-gray-600';

        // 1. Appointments
        if (n.type === 'appointment' || n.title.includes('موعد') || n.title.includes('Appointment')) {
          category = 'appointment';
          icon = <Calendar className="w-6 h-6" />;
          color = 'bg-blue-100 text-blue-600';
        }
        // 2. Inventory (Skip adding any to inventory type filter as we filter below, adding structure logic fallback)
        else if ((n.type === 'alert' && (n.title.includes('مخزون') || n.description?.includes('stock'))) || n.title.includes('Inventory')) {
          category = 'inventory';
          icon = <Package className="w-6 h-6" />;
          color = 'bg-orange-100 text-orange-600';
        }
        // 3. System (Subscription/Renewal)
        else if (n.title.includes('اشتراك') || n.title.includes('Subscription') || n.title.includes('تجديد') || n.type === 'payment') {
          category = 'system';
          icon = <Shield className="w-6 h-6" />;
          color = 'bg-red-100 text-red-600';
        }
        // 4. Updates (Platform Updates from Notification Table)
        else if (n.title.includes('تحديث') || n.title.includes('Update') || n.title.includes('نسخة')) {
          category = 'update';
          icon = <RefreshCw className="w-6 h-6" />;
          color = 'bg-purple-100 text-purple-600';
        }
        // 5. General (Platform Admin Messages)
        else {
          category = 'general';
          icon = <Bell className="w-6 h-6" />;
          color = 'bg-gray-100 text-gray-700';
        }

        return {
          ...n,
          displayCategory: category,
          displayIcon: icon,
          displayColor: color,
          clinicName: n.clinicName || (n.clinicId ? getClinicName(n.clinicId) : undefined)
        } as DisplayNotification;
      });

    // Option B: Map Actual Appointments directly
    const mappedAppointments = (appointments || []).map(a => {
      const isOnline = (a.type as any) === 'كشف عام (أونلاين)' || a.title === 'كشف عام (أونلاين)' || a.doctorName === 'غير محدد' || !a.doctorName;

      const description = isOnline
        ? `موعد اونلاين للمريض: ${a.patientName}\nفي التاريخ ${a.date} الساعة ${formatTime12h(a.time)}`
        : `موعد للمريض: ${a.patientName}\nمع الطبيب: ${a.doctorName}\nفي التاريخ ${a.date} الساعة ${formatTime12h(a.time)}`;

      return {
        id: `apt-${a.id}`,
        userId: user?.id,
        clinicId: a.clinicId,
        type: 'appointment',
        title: isOnline ? 'موعد جديد (أونلاين)' : 'موعد جديد',
        description: description,
        metadata: {
            patientName: a.patientName,
            doctorName: a.doctorName && a.doctorName !== 'غير محدد' ? a.doctorName : undefined,
            date: a.date,
            time: formatTime12h(a.time),
        },
        time: a.createdAt || new Date().toISOString(),
        priority: a.priority || 'normal',
        isRead: a.status !== 'pending', // Pending is treated as unread
        createdAt: a.createdAt || new Date().toISOString(),
        displayCategory: 'appointment' as FilterCategory,
        displayIcon: <Calendar className="w-6 h-6" />,
        displayColor: 'bg-blue-100 text-blue-600',
        clinicName: getClinicName(a.clinicId)
      } as DisplayNotification;
    });

    // Map System Updates
    const mappedUpdates = updates.map((u: any) => ({
      id: u.id,
      userId: user?.id,
      clinicId: undefined,
      type: 'system',
      title: u.title,
      description: u.content,
      time: new Date(u.release_date).toLocaleDateString('ar-EG'),
      priority: 'normal',
      isRead: true,
      createdAt: u.release_date,
      displayCategory: 'update' as FilterCategory,
      displayIcon: <RefreshCw className="w-6 h-6" />,
      displayColor: 'bg-purple-100 text-purple-600',
      clinicName: 'النظام'
    } as DisplayNotification));

    // Map Lab Orders
    const mappedLabOrders = (labOrders || []).map(o => ({
      id: `lab-order-${o.id}`,
      userId: user?.id,
      clinicId: o.clinic_id,
      type: 'order' as any,
      title: 'طلب مختبر',
      description: '', 
      metadata: {
        orderType: 'lab',
        targetName: o.lab_name || o.custom_lab_name || 'مختبر خارجي',
        staffName: o.doctor_name || user?.name || 'طاقم العيادة',
        patientName: o.patient_name || 'غير محدد',
        doctorName: o.doctor_name,
        statusInfo: getLabStatusConfig(o.status)
      },
      time: o.order_date || new Date().toISOString(),
      priority: o.priority || 'normal',
      isRead: o.status === 'completed' || o.status === 'delivered',
      createdAt: o.order_date || new Date().toISOString(),
      displayCategory: 'order' as FilterCategory,
      displayIcon: <Package className="w-6 h-6" />,
      displayColor: 'bg-green-100 text-green-600',
      clinicName: getClinicName(o.clinic_id)
    } as DisplayNotification));

    // Map Store Orders
    const mappedStoreOrders = (storeOrders || []).map(o => ({
      id: `store-order-${o.id}`,
      userId: user?.id,
      clinicId: undefined,
      type: 'order' as any,
      title: 'طلب متجر',
      description: '',
      metadata: {
        orderType: 'store',
        targetName: o.supplierName || 'المتجر الإلكتروني',
        staffName: user?.name || 'طاقم العيادة',
        orderNumber: o.order_number,
        statusInfo: getStoreStatusConfig(o.status)
      },
      time: o.createdAt || new Date().toISOString(),
      priority: 'normal',
      isRead: o.status === 'delivered', 
      createdAt: o.createdAt || new Date().toISOString(),
      displayCategory: 'order' as FilterCategory,
      displayIcon: <Package className="w-6 h-6" />,
      displayColor: 'bg-yellow-100 text-yellow-600',
      clinicName: 'العيادة'
    } as DisplayNotification));

    // Combine and Sort by Date Descending
    return [...mappedNotifications, ...mappedAppointments, ...mappedLabOrders, ...mappedStoreOrders, ...mappedUpdates]
      .filter(n => n.displayCategory !== 'inventory') // Strictly Remove inventory items
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

  }, [notifications, updates, appointments, labOrders, storeOrders, user]);

  // Filtering Logic
  const filteredList = useMemo(() => {
    return categorizedNotifications.filter(n => {
      // 1. Tab Filter
      if (activeTab === 'unread') {
        if (n.isRead) return false;
      } else if (activeTab !== 'all') {
        if (n.displayCategory !== activeTab) return false;
      }

      // 2. Clinic Context Filter (Optional: Only if clinic selected)
      // User requirement: "Appointments/Inventory must show Clinic Name" implies they want to see them all but identified.
      // But if user is in context of specific clinic dashboard, usually we filter.
      // However, this page is `/doctor/notifications` which is global.
      // So we generally show all, but we can respect `selectedClinicId` if needed.
      // Current behavior in previous code respected `selectedClinicId`.
      // Let's Keep showing ALL but respecting if filter is strictly for one clinic?
      // Actually, standard practice for centralized notification center is to show ALL.
      // The Sidebar context might filter, but this page is global.
      // I will Show ALL by default unless strongly required otherwise.
      // But user mentioned "Show clinic name", implies seeing multiple clinics' data.
      return true;
    });
  }, [categorizedNotifications, activeTab]);

  const unreadCount = filteredList.filter(n => !n.isRead).length;

  const handleNotificationClick = (n: DisplayNotification) => {
    // Mark as read immediately on click? Or just navigate?
    if (!n.isRead) markAsRead(n.id);

    const targetClinicId = n.clinicId || '1';

    switch (n.displayCategory) {
      case 'appointment':
        navigate(`/doctor/clinic/${targetClinicId}?tab=appointments`);
        break;
      case 'inventory':
        navigate(`/doctor/clinic/${targetClinicId}?tab=inventory`);
        break;
      case 'update':
        navigate('/doctor/updates');
        break;
      case 'order':
        // Navigate to clinic labs/orders page if lab, or store orders if store
        if (n.metadata?.orderType === 'lab') {
           navigate(`/doctor/clinic/${targetClinicId}?tab=labs`);
        } else {
           navigate('/store/orders');
        }
        break;
      case 'system':
        // Subscription reminder -> Upgrade/Settings
        navigate('/doctor/subscription/upgrade');
        break;
      case 'general':
        // User Request: "No navigation to page like congratulations"
        // Stay on page. Maybe toggle expand if we had expandable content.
        // For now, do nothing.
        break;
      default:
        break;
    }
  };

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return '';
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    } else {
      return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
    }
  };

  const tabs = [
    { id: 'all', label: 'الكل', icon: Bell },
    { id: 'unread', label: 'غير مقروء', icon: Bell },
    { id: 'general', label: 'عام', icon: Info },
    { id: 'order', label: 'الطلبات', icon: Package },
    { id: 'update', label: 'تحديثات', icon: RefreshCw },
    { id: 'system', label: 'النظام', icon: Shield },
    { id: 'appointment', label: 'المواعيد', icon: Calendar }
  ];

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مركز الإشعارات</h1>
          <p className="text-gray-500 text-sm mt-1">تتبع جميع التنبيهات والتحديثات في مكان واحد</p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={() => markAsRead('all')}>
            <CheckCircle2 className="w-4 h-4 ml-2" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterCategory)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative
                  ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
                {/* Count Badge (Optional) */}
                {tab.id === 'unread' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">لا توجد إشعارات</h3>
            <p className="text-gray-500 text-sm">لا توجد إشعارات في هذا التصنيف حالياً</p>
          </div>
        ) : (
          filteredList.map((notification) => (
            <Card
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`
                group transition-all duration-200 hover:shadow-md cursor-pointer border
                ${!notification.isRead ? 'bg-blue-50/40 border-blue-100' : 'bg-white border-transparent hover:border-gray-200'}
              `}
            >
              <div className="p-4 flex gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.displayColor}`}>
                  {notification.displayIcon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {/* Inline Data for orders/appointments */}
                        {notification.displayCategory === 'appointment' && notification.metadata && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/70 px-1.5 py-0.5 rounded border border-gray-100/50">
                            <span>📅 {notification.metadata.date}</span>
                            <span className="text-gray-300">•</span>
                            <span dir="ltr">{notification.metadata.time}</span>
                          </div>
                        )}
                        {notification.displayCategory === 'order' && notification.metadata?.statusInfo && (
                           <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${notification.metadata.statusInfo.color}`}>
                             <span>{notification.metadata.statusInfo.label}</span>
                           </div>
                        )}
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                        {notification.displayCategory === 'appointment' && notification.metadata ? (
                        <div className="text-sm text-gray-600 mt-1 w-full">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-gray-500 text-xs flex-shrink-0">👤 المريض:</span>
                            <span className="font-semibold text-gray-800 bg-white/80 px-1.5 py-0.5 rounded border border-gray-100/30">
                              {notification.metadata.patientName}
                            </span>
                            
                            {notification.metadata.doctorName && (
                              <>
                                <span className="text-gray-300 text-xs">|</span>
                                <span className="text-gray-500 text-[10px] flex-shrink-0">👨‍⚕️ مع:</span>
                                <span className="bg-blue-50/80 text-blue-800 px-1.5 py-0.5 rounded border border-blue-100/20 text-[10px] font-semibold" dir="ltr">
                                  {notification.metadata.doctorName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : notification.displayCategory === 'order' && notification.metadata ? (
                        <div className="text-sm text-gray-600 mt-1 w-full">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-gray-500 text-[10px] flex-shrink-0">
                                {notification.metadata.orderType === 'lab' ? 'المختبر:' : 'المورد:'}
                            </span>
                            <span className="font-semibold text-gray-800 bg-white/80 px-1.5 py-0.5 rounded border border-gray-100/30">
                              {notification.metadata.targetName}
                            </span>
                            
                            {notification.metadata.staffName && (
                              <>
                                <span className="text-gray-300 text-xs">|</span>
                                <span className="text-gray-500 text-[10px] flex-shrink-0">بواسطة:</span>
                                <span className="font-medium text-gray-800 bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">
                                  {notification.metadata.staffName}
                                </span>
                              </>
                            )}
                            
                            {/* For Lab Orders Show Patient Info */}
                            {notification.metadata.orderType === 'lab' && notification.metadata.patientName && (
                              <>
                                <span className="text-gray-300 text-xs">|</span>
                                <span className="text-gray-500 text-[10px] flex-shrink-0">للمريض:</span>
                                <span className="font-medium text-gray-800 bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">
                                  {notification.metadata.patientName}
                                </span>
                              </>
                            )}

                            {/* Show Order Number for Stores */}
                            {notification.metadata.orderType === 'store' && notification.metadata.orderNumber && (
                              <>
                                <span className="text-gray-300 text-xs">|</span>
                                <span className="text-gray-500 text-[10px] flex-shrink-0">رقم الطلب:</span>
                                <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[10px]">
                                  {notification.metadata.orderNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {notification.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Footer (Time & Context) */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(notification.createdAt)}
                    </span>

                    {/* Clinic Name (Show for Inventory/Appointments or if available) */}
                    {notification.clinicName && (notification.displayCategory === 'appointment' || notification.displayCategory === 'inventory' || notification.clinicId) && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                        <Building2 className="w-3 h-3" />
                        {notification.clinicName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

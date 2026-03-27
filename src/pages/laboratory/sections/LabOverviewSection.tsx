import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Clock, CheckCircle, TrendingUp,
  Star, Award, Activity, DollarSign, Users, Calendar,
  Bell, AlertTriangle, Zap, Eye, ArrowUpRight, ArrowDownRight, FlaskConical,
  ChevronRight, Circle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLabOrders } from '../../../hooks/useLabOrders';
import { formatNumericDate } from '../../../lib/date';

interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
  activeRepresentatives: number;
  completionRate: number;
  responseTime: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  clinicName: string;
  patientName: string;
  workType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  priority: 'عاجلة' | 'عالية' | 'عادية' | 'منخفضة';
  totalCost: number;
  createdAt: string;
  expectedTime: string;
}

interface Notification {
  id: string;
  type: 'order' | 'message' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isNew: boolean;
}

export const LabOverviewSection: React.FC = () => {
  const { orders, loading: ordersLoading } = useLabOrders();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageRating: 4.8,
    totalReviews: 12,
    activeRepresentatives: 2,
    completionRate: 0,
    responseTime: '2.0 ساعة'
  });

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'مرحباً بك',
      message: 'تم تفعيل حساب المختبر الخاص بك',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isNew: true
    }
  ]);

  // Derive Stats from Orders
  useEffect(() => {
    if (orders.length > 0) {
      const completed = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
      const pending = orders.filter(o => o.status === 'pending').length;
      const inProgress = orders.filter(o => o.status === 'in_progress' || (o.status as string) === 'accepted').length;
      const revenue = orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.final_amount || 0), 0);

      setStats(prev => ({
        ...prev,
        totalOrders: orders.length,
        completedOrders: completed,
        pendingOrders: pending,
        inProgressOrders: inProgress,
        totalRevenue: revenue,
        monthlyRevenue: revenue, // Logic for monthly can be added later
        completionRate: orders.length > 0 ? Math.round((completed / orders.length) * 100) : 0,
      }));
    }
  }, [orders]);

  // Map Orders to Recent Orders
  const recentOrders: RecentOrder[] = orders.slice(0, 5).map(o => ({
    id: o.id,
    orderNumber: o.order_number,
    clinicName: o.clinic_name || 'عيادة غير محددة',
    patientName: o.patient_name,
    workType: o.service_name,
    status: ((o.status as string) === 'accepted' ? 'in_progress' : o.status) as any, // Map accepted to in_progress for display if needed, or keep type loose
    priority: o.priority as any,
    totalCost: o.final_amount || 0,
    createdAt: formatNumericDate(o.order_date),
    expectedTime: '-' // Not currently in LabOrder interface
  }));


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'مكتمل', color: 'bg-green-100 text-green-800' },
      in_progress: { label: 'قيد العمل', color: 'bg-blue-100 text-blue-800' },
      pending: { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' },
      delivered: { label: 'تم التسليم', color: 'bg-purple-100 text-purple-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'عاجلة': 'text-red-600',
      'عالية': 'text-orange-600',
      'عادية': 'text-blue-600',
      'منخفضة': 'text-gray-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'message':
        return <Bell className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Zap className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' د.ع';
  };

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* 1. Stats Row (Bento Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Orders (Blue) */}
        <div
          style={{ animationDelay: '100ms' }}
          className="relative overflow-hidden rounded-[2rem] p-6 border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 hover:border-transparent animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
        >
          <Package className="absolute -bottom-4 -left-4 w-32 h-32 text-blue-500/10 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-blue-500 text-white group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/50 shadow-sm">
                <ArrowUpRight className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">12.5%</span>
              </div>
            </div>
            <div>
              <p className="text-blue-600/80 font-medium text-sm mb-1">إجمالي الطلبات</p>
              <h3 className="text-3xl font-bold text-blue-900 mb-4">{stats.totalOrders}</h3>
              <div className="w-full h-1.5 bg-blue-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue (Green) */}
        <div
          style={{ animationDelay: '200ms' }}
          className="relative overflow-hidden rounded-[2rem] p-6 border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 hover:border-transparent animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
        >
          <DollarSign className="absolute -bottom-4 -left-4 w-32 h-32 text-green-500/10 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-green-500 text-white group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/50 shadow-sm">
                <ArrowUpRight className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">8.3%</span>
              </div>
            </div>
            <div>
              <p className="text-green-600/80 font-medium text-sm mb-1">الإيرادات الشهرية</p>
              <h3 className="text-3xl font-bold text-green-900 mb-4">{formatCurrency(stats.monthlyRevenue)}</h3>
              <div className="w-full h-1.5 bg-green-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-3/4 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate (Purple) */}
        <div
          style={{ animationDelay: '300ms' }}
          className="relative overflow-hidden rounded-[2rem] p-6 border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 hover:border-transparent animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
        >
          <CheckCircle className="absolute -bottom-4 -left-4 w-32 h-32 text-purple-500/10 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-purple-500 text-white group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-purple-600/80 font-medium text-sm mb-1">معدل الإنجاز</p>
              <h3 className="text-3xl font-bold text-purple-900 mb-4">{stats.completionRate}%</h3>
              <div className="w-full h-1.5 bg-purple-200/50 rounded-full overflow-hidden">
                <div style={{ width: `${stats.completionRate}%` }} className="h-full bg-purple-500 rounded-full"></div>
              </div>
              <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                متوسط: {stats.responseTime}
              </p>
            </div>
          </div>
        </div>

        {/* Rating (Amber) */}
        <div
          style={{ animationDelay: '400ms' }}
          className="relative overflow-hidden rounded-[2rem] p-6 border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 hover:border-transparent animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
        >
          <Star className="absolute -bottom-4 -left-4 w-32 h-32 text-amber-500/10 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-amber-500 text-white group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-amber-600/80 font-medium text-sm mb-1">التقييم</p>
              <h3 className="text-3xl font-bold text-amber-900 mb-4 leading-none flex items-center gap-2">
                {stats.averageRating}
                <Star className="w-6 h-6 text-amber-500 fill-current" />
              </h3>
              <div className="w-full h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                <div style={{ width: `${(stats.averageRating / 5) * 100}%` }} className="h-full bg-amber-500 rounded-full"></div>
              </div>
              <p className="text-xs text-amber-600 mt-2">
                بناءً على {stats.totalReviews} تقييم
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders (Bento Style) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">آخر الطلبات</h3>
                  <p className="text-xs text-gray-600">أحدث الأعمال المستلمة</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium bg-white/50 px-3 py-1 rounded-full shadow-sm">
                عرض الكل
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-blue-200 group-hover:shadow-sm transition-all">
                        <FlaskConical className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">{order.orderNumber}</h4>
                          <span className="text-[10px] text-gray-400">• {order.createdAt}</span>
                        </div>
                        <p className="text-xs text-gray-600">{order.clinicName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.workType}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      {getStatusBadge(order.status)}
                      <p className={`text-xs mt-1 font-medium ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>لا يوجد طلبات حديثة</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications (Bento Style) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">الإشعارات والتنبيهات</h3>
                  <p className="text-xs text-gray-600">آخر المستجدات</p>
                </div>
              </div>
              <span className="bg-purple-200 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
                جديد
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${notification.isNew ? 'bg-purple-50/50 hover:bg-purple-50 border border-purple-100' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.type === 'order' ? 'bg-blue-100 text-blue-600' :
                    notification.type === 'message' ? 'bg-green-100 text-green-600' :
                      notification.type === 'warning' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                    }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-gray-900 text-sm">{notification.title}</h4>
                      <span className="text-[10px] text-gray-400">{notification.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                  </div>
                  {notification.isNew && <Circle className="w-2 h-2 text-purple-600 fill-current mt-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (Bento Grid) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إجراءات سريعة</h3>
              <p className="text-xs text-gray-600">اختصارات لأكثر المهام شيوعاً</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:to-blue-100 rounded-xl transition-all border border-blue-100 hover:shadow-md group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">طلب جديد</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100/50 hover:to-green-100 rounded-xl transition-all border border-green-100 hover:shadow-md group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-green-700">عرض الطلبات</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:to-purple-100 rounded-xl transition-all border border-purple-100 hover:shadow-md group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-purple-700">إدارة المندوبين</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:to-orange-100 rounded-xl transition-all border border-orange-100 hover:shadow-md group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-orange-700">التقارير</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import {
  CheckCircle, Clock, XCircle, TrendingUp, DollarSign, Star,
  Users, Activity, Calendar, FileText, Truck, UserCheck, MapPin,
  Bell, MessageSquare, AlertTriangle, Zap, Award, Timer, Package
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { formatDate } from '../../lib/utils';
import { useLabOverview } from '../../hooks/useLabOverview';

import { BentoStatCard } from '../../components/dashboard/BentoStatCard';
import { useDemoLabData } from '../../hooks/useDemoLabData';
import { Button } from '../../components/common/Button';

export const LaboratoryOverview: React.FC = () => {
  const { stats, notifications, recentOrders, ratingDist, loading, refresh } = useLabOverview();
  const { generateDemoUnidata, seeding } = useDemoLabData();

  // Representative Info
  const representativeInfo = {
    status: stats.activeReps > 0 ? 'available' : 'unavailable',
    name: 'مندوب المعمل',
    currentLocation: stats.activeReps > 0 ? 'في المعمل' : 'غير متوفر',
    lastUpdate: 'منذ 5 دقائق',
    activeJobs: stats.inProgressOrders,
    completedToday: stats.completedToday
  };

  const getStatusColor = (status: string) => {
    // ... existing colors
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      busy: 'bg-orange-500',
      'on-the-way': 'bg-blue-500',
      unavailable: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    // ... existing text
    const texts: Record<string, string> = {
      available: 'متوفر',
      busy: 'مشغول',
      'on-the-way': 'في الطريق',
      unavailable: 'غير متوفر'
    };
    return texts[status] || status;
  };

  // Helper for badges
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      completed: { label: 'مكتمل', color: 'bg-green-100 text-green-800' },
      in_progress: { label: 'قيد التصنيع', color: 'bg-blue-100 text-blue-800' },
      pending: { label: 'في الانتظار', color: 'bg-gray-100 text-gray-800' },
      delayed: { label: 'متأخر', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityColor = (priority: string) => {
    // ... existing priority colors
    const colors: Record<string, string> = {
      'urgent': 'text-red-600',
      'high': 'text-orange-600',
      'normal': 'text-blue-600',
      'low': 'text-gray-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const getPriorityLabel = (priority: string) => {
    // ... existing priority labels
    const labels: Record<string, string> = {
      'urgent': 'عاجلة',
      'high': 'عالية',
      'normal': 'عادية',
      'low': 'منخفضة'
    };
    return labels[priority] || priority;
  }

  if (loading && stats.totalOrders === 0) { // Only show full loader if NO data
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Section & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">مرحباً بك في معمل الأسنان</h1>
            <p className="text-purple-100">
              إدارة شاملة لأعمال المختبر، متابعة الإنتاج، وتلبية طلبات العيادات
            </p>
          </div>
          <div className="hidden md:block opacity-20">
            <Activity className="w-16 h-16" />
          </div>
        </div>

        {/* Quick Actions / Demo Button */}
        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-start min-w-[200px]">
          <p className="text-sm text-gray-500 mb-2">إجراءات النظام</p>
          <Button
            variant="outline"
            onClick={generateDemoUnidata}
            disabled={seeding}
            className="w-full justify-center border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            {seeding ? 'جاري التوليد...' : '🛠️ بيانات تجريبية'}
          </Button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="طلبات واردة"
          value={stats.totalOrders.toString()}
          icon={FileText}
          color="blue"
          trend="up"
          trendValue={`${stats.pendingOrders} انتظار`}
          delay={0}
        />
        <BentoStatCard
          title="مكتملة اليوم"
          value={stats.completedToday.toString()}
          icon={CheckCircle}
          color="green"
          trend="up"
          trendValue="أداء ممتاز"
          delay={100}
        />
        <BentoStatCard
          title="متوسط الإنجاز"
          value={`${stats.avgCompletionTime}h`}
          icon={Timer}
          color="purple"
          trend={stats.avgCompletionTime > 24 ? 'down' : 'up'}
          trendValue="ساعة"
          delay={200}
        />
        <BentoStatCard
          title="تقييم العملاء"
          value={stats.avgRating.toFixed(1)}
          icon={Star}
          color="orange"
          trend="neutral"
          trendValue="نجوم"
          delay={300}
        />
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            حالة فريق التسليم والتوصيل
          </h2>
          <span className="text-sm text-gray-500">آخر تحديث: {representativeInfo.lastUpdate}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Status */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 ${getStatusColor(representativeInfo.status)} rounded-full flex items-center justify-center`}>
              {representativeInfo.status === 'available' && <UserCheck className="w-8 h-8 text-white" />}
              {representativeInfo.status === 'busy' && <Clock className="w-8 h-8 text-white" />}
              {representativeInfo.status === 'on-the-way' && <Truck className="w-8 h-8 text-white" />}
              {representativeInfo.status === 'unavailable' && <XCircle className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{representativeInfo.name}</h3>
              <p className="text-sm text-gray-600">{getStatusText(representativeInfo.status)}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {representativeInfo.currentLocation}
              </p>
            </div>
          </div>

          {/* Daily Stats */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">مهام التوصيل النشطة</span>
              <span className="font-semibold">{representativeInfo.activeJobs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">تسليمات اليوم</span>
              <span className="font-semibold text-green-600">{representativeInfo.completedToday}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              تحديث الحالة
            </button>
            <button className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              تتبع الموقع
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            الإشعارات والتنبيهات
          </h2>
          <span className="text-sm text-gray-500">جديد</span>
        </div>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start gap-3 p-3 ${notification.type === 'order' ? 'bg-blue-50 border border-blue-200' :
                notification.type === 'message' ? 'bg-green-50 border border-green-200' :
                  notification.type === 'warning' ? 'bg-red-50 border border-red-200' :
                    'bg-yellow-50 border border-yellow-200'
                } rounded-lg`}>
                <div className={`w-8 h-8 ${notification.type === 'order' ? 'bg-blue-100' :
                  notification.type === 'message' ? 'bg-green-100' :
                    notification.type === 'warning' ? 'bg-red-100' :
                      'bg-yellow-100'
                  } rounded-full flex items-center justify-center flex-shrink-0`}>
                  {notification.type === 'order' && <FileText className="w-4 h-4 text-blue-600" />}
                  {notification.type === 'message' && <MessageSquare className="w-4 h-4 text-green-600" />}
                  {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  {notification.type === 'info' && <Zap className="w-4 h-4 text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${notification.type === 'order' ? 'text-blue-900' :
                    notification.type === 'message' ? 'text-green-900' :
                      notification.type === 'warning' ? 'text-red-900' :
                        'text-yellow-900'
                    }`}>
                    {notification.title}
                  </h4>
                  <p className={`text-sm ${notification.type === 'order' ? 'text-blue-700' :
                    notification.type === 'message' ? 'text-green-700' :
                      notification.type === 'warning' ? 'text-red-700' :
                        'text-yellow-700'
                    }`}>
                    {notification.content}
                  </p>
                  <p className={`text-xs mt-1 ${notification.type === 'order' ? 'text-blue-600' :
                    notification.type === 'message' ? 'text-green-600' :
                      notification.type === 'warning' ? 'text-red-600' :
                        'text-yellow-600'
                    }`}>
                    {formatDate(notification.timestamp)}
                  </p>
                </div>
                {notification.isNew && (
                  <span className={`text-xs px-2 py-1 rounded-full ${notification.type === 'order' ? 'bg-blue-200 text-blue-800' :
                    notification.type === 'message' ? 'bg-green-200 text-green-800' :
                      notification.type === 'warning' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                    }`}>
                    جديد
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">لا توجد إشعارات جديدة</div>
          )}
        </div>
      </Card>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              تقييم جودة المختبر
            </h3>
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
          </div>

          <div className="flex items-center mb-4">
            <div className="text-3xl font-bold text-gray-900 ml-3">{stats.avgRating}</div>
            <div>
              <div className="flex items-center mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= stats.avgRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{stats.totalOrders} تقييم من العيادات</p>
            </div>
          </div>

          <div className="space-y-2">
            {ratingDist.map((item) => (
              <div key={item.stars} className="flex items-center">
                <span className="text-sm text-gray-600 w-8">{item.stars}★</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            إجراءات سريعة للمختبر
          </h3>

          <div className="grid grid-cols-2 gap-3">

            <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Award className="w-5 h-5 text-green-600 ml-2" />
              <span className="text-sm font-medium text-green-700">تقرير الأداء</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-purple-600 ml-2" />
              <span className="text-sm font-medium text-purple-700">إدارة العيادات</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <Calendar className="w-5 h-5 text-orange-600 ml-2" />
              <span className="text-sm font-medium text-orange-700">جدولة التصنيع</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              <XCircle className="w-5 h-5 text-red-600 ml-2" />
              <span className="text-sm font-medium text-red-700">حالات الطوارئ</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <Activity className="w-5 h-5 text-indigo-600 ml-2" />
              <span className="text-sm font-medium text-indigo-700">متابعة الإنتاج</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            آخر طلبات العمل في المختبر
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={refresh}>
            تحديث
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-medium text-gray-600">رقم العمل</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">اسم المريض</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">العيادة المرسلة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">نوع العمل</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الأولوية</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الوقت المتوقع</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((request) => (
                <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-blue-600">{request.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{request.patientName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{request.clinicName}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{request.workType}</td>
                  <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                  <td className={`py-3 px-4 text-sm font-medium ${getPriorityColor(request.priority)}`}>
                    {getPriorityLabel(request.priority)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {request.expectedTime}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(request.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

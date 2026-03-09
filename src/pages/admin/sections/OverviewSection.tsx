import React, { useState, useEffect } from 'react';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import {
  Users,
  Building2,
  Package,
  DollarSign,
  Briefcase,
  TrendingUp,
  UserCheck,
  Clock,
  Activity,
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  FileText,
  Stethoscope
} from 'lucide-react';
import { useAdminData } from '../../../hooks/useAdminData';
import { supabase } from '../../../lib/supabase';

interface OverviewSectionProps {
  onNavigate: (section: string, subTab?: string) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ onNavigate }) => {
  const { stats, loading: statsLoading } = useAdminData();
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Realtime subscription
    const channel = supabase
      .channel('overview_activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          setActivities((prev) => [payload.new, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'user_register': return UserCheck;
      case 'order_complete': return CheckCircle;
      case 'payment_received': return ShoppingCart;
      case 'system_alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'user_register': return 'green';
      case 'order_complete': return 'blue';
      case 'payment_received': return 'purple';
      case 'system_alert': return 'red';
      default: return 'gray';
    }
  };

  if (statsLoading) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل البيانات...</div>;
  }

  // Calculate time ago helper
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    return date.toLocaleDateString('ar-IQ');
  };

  return (
    <div className="space-y-8">
      {/* العنوان */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">نظرة عامة على المنصة</h2>
        <p className="text-gray-600">الإحصائيات الرئيسية والأداء العام للمنصة</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoStatCard
          title="مالكي العيادات"
          value={stats.doctorsCount}
          icon={Stethoscope}
          color="blue"
          trend="up"
          trendValue="12%"
          delay={0}
        />

        <BentoStatCard
          title="إجمالي الموردين"
          value={stats.suppliersCount}
          icon={Users}
          color="green"
          trend="up"
          trendValue="8%"
          delay={100}
        />

        <BentoStatCard
          title="إجمالي المختبرات"
          value={stats.labsCount}
          icon={Package}
          color="purple"
          trend="up"
          trendValue="15%"
          delay={200}
        />

        <BentoStatCard
          title="إجمالي الإيرادات"
          value={`${(stats.monthlyRevenue / 1000000).toFixed(1)}م`}
          icon={DollarSign}
          color="orange"
          trend="up"
          trendValue={`${stats.growth}%`}
          delay={300}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoStatCard
          title="إجمالي المرضى"
          value={stats.patientsCount}
          icon={Briefcase}
          color="blue"
          trend="neutral"
          trendValue="المسجلين"
          delay={400}
        />

        <BentoStatCard
          title="المستخدمين النشطين"
          value={stats.doctorsCount + stats.suppliersCount}
          icon={UserCheck}
          color="green"
          trend="neutral"
          trendValue="هذا الشهر"
          delay={500}
        />

        <BentoStatCard
          title="الطلبات المعلقة"
          value={stats.pendingRequests}
          icon={Clock}
          color="orange"
          trend="neutral"
          trendValue="في الانتظار"
          delay={600}
        />

        <BentoStatCard
          title="المختبرات المعلقة"
          value={0}
          icon={UserCheck}
          color="purple"
          trend="neutral"
          trendValue="طلبات اشتراك"
          delay={700}
        />
      </div>

      {/* Monthly Growth */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">النمو الشهري</h3>
            <p className="text-gray-600">معدل النمو مقارنة بالشهر السابق</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-[2rem] p-8 border border-green-100">
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600 mb-3 font-mono tracking-tight">
              +{stats.growth}%
            </div>
            <p className="text-green-700 font-bold text-lg">نمو إيجابي مستمر</p>
            <p className="text-sm text-gray-600 mt-2">
              زيادة في جميع المؤشرات الرئيسية للمنصة
            </p>
          </div>
        </div>
      </div>

      {/* Quick Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">الطلبات المعلقة</h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">{stats.pendingRequests} جديد</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm shadow-orange-200"></div>
                <span className="text-gray-700 font-medium">طلبات اشتراك جديدة</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{stats.pendingRequests}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-sm shadow-purple-200"></div>
                <span className="text-gray-700 font-medium">طلبات توثيق حسابات</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">-</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => onNavigate('platform', 'pending_requests')}
              className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              مراجعة الطلبات
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">الأنشطة الحديثة</h3>

          <div className="space-y-6">
            {loadingActivities ? (
              <div className="text-center py-4 text-gray-500">جاري تحميل الأنشطة...</div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = getIcon(activity.type);
                const color = getColor(activity.type);

                return (
                  <div key={activity.id} className="flex items-start gap-4 group">
                    <div className={`w-10 h-10 bg-${color}-50 rounded-2xl flex items-center justify-center group-hover:bg-${color}-100 transition-colors`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-900 font-medium text-sm">{activity.details || activity.user_name || 'نشاط جديد'}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">{getTimeAgo(activity.created_at)}</p>
                        <span className="text-xs font-bold text-gray-400">{activity.user_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">لا توجد أنشطة حديثة</div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => onNavigate('platform', 'activities')}
              className="w-full text-purple-600 hover:bg-purple-50 py-3.5 rounded-2xl font-bold transition-colors"
            >
              عرض جميع الأنشطة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
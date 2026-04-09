import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/types';
import { formatNumericDate } from '@/lib/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Users,
  MessageCircle,
  Package,
  TrendingUp,
  DollarSign,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  List,
  AlertTriangle,
  Wallet,
  ChevronDown,
  Home,
  LogOut,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BentoStatCard } from '../dashboard/BentoStatCard';

// استيراد المكونات الجديدة
import LabConversations from './LabConversations';
import RepresentativesManagement from './RepresentativesManagement';
import EnhancedOrderManagement from './EnhancedOrderManagement';

type DashboardStats = {
  total_orders: number;
  pending_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  returned_orders: number;
  cancelled_orders: number;
  active_representatives: number;
  total_representatives: number;
  total_revenue: number;
  monthly_revenue: number;
  total_commission: number;
  net_revenue: number;
};

import { LabFinanceSection } from '../../pages/laboratory/sections/LabFinanceSection';
import { LabProfileSection } from '../../pages/laboratory/sections/LabProfileSection';

export const NewEnhancedLabDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const supabaseClient = supabase;
  const [activeTab, setActiveTab] = useState('overview');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationCount] = useState(5);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionChecked, setSuspensionChecked] = useState(false);

  // Check suspension status on mount
  useEffect(() => {
    const checkSuspension = async () => {
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('banned')
        .eq('id', user.id)
        .single();
      setIsSuspended(profile?.banned === true);
      setSuspensionChecked(true);
    };
    checkSuspension();
  }, [user?.id]);

  // جلب إحصائيات لوحة التحكم
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // 1. Get Lab ID from User ID
      const { data: labData, error: labError } = await supabaseClient
        .from('dental_laboratories')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (labError || !labData) {
        console.error('Lab not found for user:', user.id);
        return;
      }

      const realLabId = labData.id;

      // جلب إحصائيات الطلبات
      const { data: orderStats, error: orderError } = await supabaseClient.rpc('get_lab_dashboard_stats', {
        p_lab_id: realLabId
      });

      if (orderError) throw orderError;

      // جلب إحصائيات مالية
      const { data: financialStats, error: financialError } = await supabaseClient.rpc('get_lab_financial_stats', {
        p_lab_id: realLabId
      });

      if (financialError) throw financialError;

      // دمج الإحصائيات
      if (orderStats && orderStats.length > 0 && financialStats && financialStats.length > 0) {
        const orderInfo = orderStats[0];
        const financialInfo = financialStats[0];

        setStats({
          total_orders: orderInfo.total_orders || 0,
          pending_orders: orderInfo.pending_orders || 0,
          in_progress_orders: orderInfo.in_progress_orders || 0,
          completed_orders: orderInfo.completed_orders || 0,
          returned_orders: orderInfo.returned_orders || 0,
          cancelled_orders: orderInfo.cancelled_orders || 0,
          active_representatives: orderInfo.active_representatives || 0,
          total_representatives: orderInfo.total_representatives || 0,
          total_revenue: financialInfo.total_revenue || 0,
          monthly_revenue: financialInfo.monthly_revenue || 0,
          total_commission: financialInfo.total_commission || 0,
          net_revenue: financialInfo.net_revenue || 0
        });
      }

      // جلب الأنشطة الحديثة
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('lab_activity_logs')
        .select(`
          id,
          activity_type,
          description,
          created_at,
          order_id,
          dental_lab_orders(order_number, patient_name)
        `)
        .eq('lab_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;
      setRecentActivities(activitiesData || []);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  // عناصر التنقل
  const navigationItems = [
    {
      id: 'overview',
      label: 'النظرة العامة',
      icon: BarChart3,
      count: null
    },
    {
      id: 'orders',
      label: 'إدارة الطلبات',
      icon: Package,
      count: stats?.pending_orders || 0
    },
    {
      id: 'conversations',
      label: 'المحادثات',
      icon: MessageCircle,
      count: 3
    },
    {
      id: 'representatives',
      label: 'المندوبين',
      icon: Users,
      count: stats?.active_representatives || 0
    },
    {
      id: 'financial',
      label: 'المالية',
      icon: DollarSign,
      count: null
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
      count: null
    }
  ];

  // التعامل مع تغيير التبويب
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // التعامل مع البحث
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  // التعامل مع الإشعارات
  const handleNotificationClick = () => {

  };

  // التعامل مع الإجراءات السريعة
  const handleQuickAction = (actionId: string) => {

  };

  // عرض محتوى التبويب
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* الإحصائيات الرئيسية */}
            {/* الإحصائيات الرئيسية - تصميم Bento UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <BentoStatCard
                title="إجمالي الطلبات"
                value={stats?.total_orders || 0}
                icon={Package}
                color="blue"
                trend="up"
                trendValue="12%"
                delay={0}
              />

              <BentoStatCard
                title="الطلبات المعلقة"
                value={stats?.pending_orders || 0}
                icon={Bell}
                color="amber"
                trend="neutral"
                trendValue="يتطلب انتباه"
                delay={100}
              />

              <BentoStatCard
                title="المندوبين النشطين"
                value={`${stats?.active_representatives || 0}/${stats?.total_representatives || 0}`}
                icon={Users}
                color="purple"
                trend="up"
                trendValue="نشاط جيد"
                delay={200}
              />

              <BentoStatCard
                title="الإيرادات الشهرية"
                value={`${stats?.monthly_revenue?.toLocaleString() || 0} د.ع`}
                icon={DollarSign}
                color="green"
                trend="up"
                trendValue="8%"
                delay={300}
              />
            </div>

            {/* الصف الثاني: توزيع المختبرات والطلبات الأخيرة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Lab Distribution (Mock for now as backend support needed) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <List className="w-5 h-5 text-purple-600" />
                      </div>
                      توزيع الطلبات حسب العيادة
                    </span>
                    <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">أعلى 5</span>
                  </h3>
                </div>
                <div className="p-6 h-48 flex items-center justify-center text-gray-400 text-sm">
                  سيتم تفعيل المخطط البياني قريباً
                </div>
              </div>

              {/* Right: Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    حالة الطلبيات الأخيرة
                  </h3>
                </div>

                <div className="p-6 space-y-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                  {recentActivities.slice(0, 5).map((activity, idx) => (
                    <div
                      key={activity.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-800 text-sm">{activity.dental_lab_orders?.patient_name || 'غير معروف'}</p>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{activity.description}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                          <span>{activity.dental_lab_orders?.order_number}</span>
                        </p>
                      </div>

                      <div className="text-left">
                        <span className="text-xs text-gray-400">
                          {formatNumericDate(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <p className="text-center text-gray-400 py-4 text-sm">لا توجد نشاطات حديثة</p>
                  )}
                </div>
              </div>
            </div>

            {/* الصف الثالث: الحالات المتأخرة والغير مدفوعة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Late Cases (Placeholder until backend support) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    الحالات المتأخرة
                  </h3>
                </div>
                <div className="p-6 space-y-1">
                  <p className="text-center text-gray-400 py-4 text-sm">لا توجد حالات متأخرة حالياً</p>
                </div>
              </div>

              {/* Unpaid Cases (Placeholder until backend support) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-50 to-rose-100 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-rose-600" />
                    </div>
                    حالات غير مسددة
                  </h3>
                </div>
                <div className="p-6 space-y-1">
                  <p className="text-center text-gray-400 py-4 text-sm">جميع الحالات مسددة</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return <EnhancedOrderManagement />;

      case 'conversations':
        return <LabConversations />;

      case 'representatives':
        return <RepresentativesManagement />;

      case 'financial':
        return <LabFinanceSection />;

      case 'settings':
        // Reuse LabProfileSection which includes settings
        return <LabProfileSection />;

      default:
        return null;
    }
  };

  // Show suspension notice if account is suspended
  if (suspensionChecked && isSuspended) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-2 border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-3">حسابك معلق</h1>
          <p className="text-gray-600 mb-2">تم تعليق حساب مختبرك من قِبل إدارة المنصة.</p>
          <p className="text-gray-500 text-sm mb-6">
            لن يظهر حسابك في قائمة معامل الأسنان للعيادات أو في المجتمع الطبي حتى يتم رفع التعليق.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 text-right space-y-1 mb-6">
            <p><span className="font-bold">للاستفسار:</span> تواصل مع الدعم الفني</p>
            <p><span className="font-bold">البريد:</span> support@smartdental.com</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full py-3 px-6 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* شريط التنقل العلوي */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                مركز معامل الاسنان
              </h1>
            </div>

            {/* User Menu - Aligned with Doctor Center */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/60 hover:bg-white transition-all ring-1 ring-transparent hover:ring-gray-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{(user as any)?.name || 'مستخدم'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{(user as any)?.name || 'مستخدم'}</p>
                          <p className="text-xs text-gray-500">مدير المختبر</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate('/');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        <span>الرئيسية</span>
                      </button>
                      <button
                        onClick={() => {
                          // Settings logic if any
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>الإعدادات</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* التبويبات الرئيسية */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="grid w-full grid-cols-6 gap-1 bg-muted p-1 rounded-lg">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all
                  ${activeTab === item.id
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                `}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );

}

export default NewEnhancedLabDashboard;
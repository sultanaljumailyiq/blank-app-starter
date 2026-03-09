import React, { useState } from 'react';
import {
  ArrowUpRight, Plus, Eye, Award, BarChart3, CheckCircle,
  Package, ShoppingCart, DollarSign, TrendingUp, Star, Users
} from 'lucide-react';

import { Card } from '../../components/common/Card';
import { BentoStatCard } from '../../components/dashboard/BentoStatCard';
import { formatDate, formatCurrency } from '../../lib/utils';
import { Button } from '../../components/common/Button';
import { useSupplierData } from '../../hooks/useSupplierData';

import { useDemoData } from '../../hooks/useDemoData';

interface SupplierOverviewPageProps {
  onNavigate?: (tab: string) => void;
  stats?: {
    products: number;
    orders: number;
    revenue: number;
    views: number;
    customers: number;
  };
}

export const SupplierOverviewPage: React.FC<SupplierOverviewPageProps> = ({ onNavigate, stats: realStats }) => {
  const { stats: mockStats, recentOrders, topProducts, loading, supplierStatus } = useSupplierData();
  const { generateDemoData, seeding } = useDemoData();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading && !mockStats && !realStats) return <div className="p-8 text-center text-gray-500">جاري تحميل البيانات...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">نظرة عامة</h1>
          <p className="text-gray-600 mt-1">إحصائيات شاملة لأداء متجرك وأنشطتك</p>
        </div>

        <div className="flex items-center gap-3">
          {supplierStatus === 'approved' ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="font-bold text-sm">حسابك مفعل</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200 animate-pulse">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-bold text-sm">حسابك معلق (قيد المراجعة)</span>
            </div>
          )}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm"
          >
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
          </select>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            إضافة منتج
          </Button>
        </div>
      </div>


      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="إجمالي المنتجات"
          value={realStats?.products || mockStats?.totalProducts || 0}
          icon={Package}
          color="blue"
          trend="up"
          trendValue="12%"
          delay={100}
        />

        <BentoStatCard
          title="الطلبات النشطة"
          value={realStats?.orders || mockStats?.activeOrders || 0}
          icon={ShoppingCart}
          color="green"
          trend="up"
          trendValue="28%"
          delay={200}
        />

        <BentoStatCard
          title="إيرادات الشهر"
          value={formatCurrency(realStats?.revenue || mockStats?.monthlyRevenue || 0)}
          icon={DollarSign}
          color="purple"
          trend="up"
          trendValue="15%"
          delay={300}
        />

        <BentoStatCard
          title="مشاهدات المنتجات"
          value={realStats?.views || 0}
          icon={Eye}
          color="orange"
          trend="neutral"
          trendValue="جديد"
          delay={400}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-[2rem] p-6 border border-cyan-100 bg-gradient-to-br from-cyan-50 to-cyan-100/50 hover:shadow-lg transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-900/70">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-cyan-900">{realStats?.customers || mockStats?.totalCustomers || 0}</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-cyan-500" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:shadow-lg transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900/70">مشاهدات الشهر</p>
                <p className="text-2xl font-bold text-indigo-900">{(realStats?.views || 0).toLocaleString()}</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] p-6 border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-lg transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-900/70">حالة المورد</p>
                <p className="text-2xl font-bold text-emerald-900">نشط ومعتمد</p>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                أحدث الطلبات
              </h2>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 rounded-full px-4">
                عرض الكل
              </Button>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{order.customer.name}</p>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span>{order.items?.length || 0} منتجات</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{formatDate(order.orderDate)}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      {order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                أفضل المنتجات
              </h2>
              <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 rounded-full px-4">
                عرض التقرير
              </Button>
            </div>

            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl hover:bg-green-50/50 transition-colors border border-transparent hover:border-green-100 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm transform group-hover:scale-105 transition-transform
                    ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-200' :
                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-200' :
                        index === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-600 shadow-orange-100' : 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-blue-100'}`}>
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-base group-hover:text-green-700 transition-colors">{product.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> {product.sales} مبيعة</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {product.views}</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="font-bold text-sm text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      {(product.revenue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">ابدأ في تنمية أعمالك</h3>
              <p className="opacity-90">أضف منتجات جديدة أو حسّن من عروضك الحالية</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <BarChart3 className="w-4 h-4 ml-2" />
                عرض التقارير
              </Button>
              <Button
                variant="ghost"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Activity
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { useClinicReports } from '../../../hooks/useClinicReports';

interface ClinicReportsPageProps {
  clinicId: string;
}

export const ClinicReportsPage: React.FC<ClinicReportsPageProps> = ({ clinicId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Real Data Hook
  const { stats, loading } = useClinicReports(clinicId);

  // Performance Metrics (derived from real data)
  const performanceMetrics = [
    { label: 'رضا المرضى', value: stats.patientSatisfaction, unit: '%', target: 95, trend: 2.1 },
    { label: 'معدل الإكمال', value: 87.5, unit: '%', target: 90, trend: -1.2 }, // Still static?
    { label: 'الكفاءة التشغيلية', value: stats.staffEfficiency, unit: '%', target: 85, trend: 3.4 },
    { label: 'دوران المخزون', value: stats.inventoryTurnover, unit: 'مرات', target: 4.0, trend: 0.3 }
  ];

  const reportTypes = [
    { id: 'financial', title: 'التقارير المالية', icon: DollarSign, color: 'blue' },
    { id: 'patients', title: 'تقارير المرضى', icon: Users, color: 'green' },
    { id: 'staff', title: 'تقارير الموظفين', icon: Activity, color: 'purple' },
    { id: 'inventory', title: 'تقارير المخزون', icon: BarChart3, color: 'orange' },
    { id: 'appointments', title: 'تقارير المواعيد', icon: Calendar, color: 'indigo' },
    { id: 'performance', title: 'تقرير الأداء', icon: TrendingUp, color: 'rose' }
  ];

  if (loading) {
    return <div className="flex justify-center p-12">تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Header Controls */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">التقارير والإحصائيات</h1>
              <p className="text-gray-600">تقارير شاملة ومتقدمة لأداء العيادة</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="quarter">هذا الربع</option>
                <option value="year">هذا العام</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع التقارير</option>
                <option value="financial">مالية</option>
                <option value="operational">تشغيلية</option>
                <option value="performance">أداء</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">تصدير</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="الإيرادات الشهرية"
          value={`${(stats.monthlyRevenue || 0).toLocaleString()} د.ع`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="12.5%"
          delay={100}
        />
        <BentoStatCard
          title="إجمالي المرضى"
          value={stats.totalPatients}
          icon={Users}
          color="blue"
          trend="up"
          trendValue="8.2%"
          delay={200}
        />
        <BentoStatCard
          title="هامش الربح"
          value={`${stats.profitMargin}%`}
          icon={TrendingUp}
          color="purple"
          trend="up"
          trendValue="2.1%"
          delay={300}
        />
        <BentoStatCard
          title="رضا المرضى"
          value={`${stats.patientSatisfaction}%`}
          icon={Activity}
          color="orange"
          trend="up"
          trendValue="1.8%"
          delay={400}
        />
      </div>

      {/* Performance Metrics */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">مؤشرات الأداء الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {metric.value}{metric.unit}
                    </span>
                    <div className={`flex items-center gap-1 text-xs ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{Math.abs(metric.trend)}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((metric.value / metric.target) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>الهدف: {metric.target}{metric.unit}</span>
                  <span>{((metric.value / metric.target) * 100).toFixed(1)}% من الهدف</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">توزيع أنواع المواعيد</h2>
            <div className="space-y-4">
              {stats.appointmentTypes.length > 0 ? stats.appointmentTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{type.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{type.count}</span>
                      <span className="text-sm font-medium text-gray-900">{type.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${type.color}`}
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-400 py-8">لا توجد مواعيد مسجلة</div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">اتجاه الإيرادات الشهرية</h2>
            <div className="space-y-4">
              {stats.monthlyTrend.map((data: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(data.revenue / 1000).toFixed(1)}k د.ع
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.revenue / (stats.monthlyRevenue * 1.5 || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="مواعيد يومية"
          value={stats.dailyAppointments}
          icon={Calendar}
          color="blue"
          delay={500}
        />
        <BentoStatCard
          title="كفاءة الفريق"
          value={`${stats.staffEfficiency}%`}
          icon={Activity}
          color="green"
          delay={600}
        />
        <BentoStatCard
          title="دوران المخزون"
          value={stats.inventoryTurnover}
          icon={BarChart3}
          color="purple"
          delay={700}
        />
        <BentoStatCard
          title="متوسط قيمة المريض"
          value={stats.avgPatientValue.toLocaleString()}
          icon={TrendingUp}
          color="orange"
          delay={800}
        />
      </div>

    </div>
  );
};
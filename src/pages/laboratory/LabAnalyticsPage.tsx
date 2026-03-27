import React from 'react';
import { useLabAnalytics } from '../../hooks/useLabAnalytics';
import { LoadingState } from '../../components/common/LoadingState';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../../components/common/Card';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Activity, Users, FileText,
    Calendar, ArrowUpRight, ArrowDownRight, Printer
} from 'lucide-react';

export const LabAnalyticsPage: React.FC = () => {
    const { data, loading, error } = useLabAnalytics();

    if (loading) return <LoadingState />;
    if (error || !data) return <div className="p-8 text-center text-red-500">حدث خطأ في تحميل البيانات: {error}</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-8 h-8 text-blue-600" />
                        تحليلات الأداء المتقدمة
                    </h1>
                    <p className="text-gray-500 mt-1">نظرة شاملة على أداء المختبر، الإيرادات، والعملاء</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center gap-2 shadow-sm font-medium">
                        <Calendar className="w-4 h-4" />
                        آخر 6 أشهر
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 font-bold transition-transform active:scale-95">
                        <Printer className="w-4 h-4" />
                        تصدير التقرير
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="إجمالي الإيرادات"
                    value={formatCurrency(data.totalRevenue)}
                    subtitle="منذ بدأ النظام"
                    icon={DollarSign}
                    color="green"
                    trend="+12%"
                    trendUp={true}
                />
                <KPICard
                    title="إجمالي الطلبات"
                    value={data.totalOrders}
                    subtitle="طلب كلي"
                    icon={FileText}
                    color="blue"
                    trend="+5%"
                    trendUp={true}
                />
                <KPICard
                    title="نسبة الإنجاز"
                    value={`${data.totalOrders > 0 ? Math.round((data.completedOrders / data.totalOrders) * 100) : 0}%`}
                    subtitle={`${data.completedOrders} مكتملة`}
                    icon={TrendingUp}
                    color="purple"
                    trend="+2%"
                    trendUp={true}
                />
                <KPICard
                    title="قيد الانتظار"
                    value={data.pendingOrders}
                    subtitle="طلب جاري"
                    icon={Activity}
                    color="orange"
                    trend="-3%"
                    trendUp={false} // Meaning less pending is good? Or usually down trend is red. Let's keep generic.
                />
            </div>

            {/* Charts Section 1: Revenue & Orders Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        نمو الإيرادات الشهرية
                    </h3>
                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.monthlyRevenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Services Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        الخدمات الأكثر طلباً
                    </h3>
                    <div className="h-[300px] w-full relative" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.topServices}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {data.topServices.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Clinics Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        أفضل العيادات تعاملاً
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="text-right py-4 px-6 font-medium">العيادة</th>
                                <th className="text-center py-4 px-6 font-medium">عدد الطلبات</th>
                                <th className="text-left py-4 px-6 font-medium">إجمالي الإيرادات</th>
                                <th className="text-center py-4 px-6 font-medium">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.topClinics.map((clinic, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="py-4 px-6 font-bold text-gray-900">{clinic.name}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">
                                            {clinic.orders} طلب
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-left font-bold text-green-600" dir="ltr">
                                        {formatCurrency(clinic.revenue)}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="text-green-500 text-xs font-bold">نشط</span>
                                    </td>
                                </tr>
                            ))}
                            {data.topClinics.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-400">لا توجد بيانات كافية</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

// Helper Component for KPI Cards
const KPICard = ({ title, value, subtitle, icon: Icon, color, trend, trendUp }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            )}
        </div>
        <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
    </div>
);

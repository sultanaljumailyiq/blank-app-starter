import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, Download,
  CreditCard, Wallet, RefreshCcw, Receipt, BarChart3,
  PieChart, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { BentoStatCard } from '../../components/dashboard/BentoStatCard';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../lib/utils';
import { useSupplierFinance } from '../../hooks/useSupplierFinance';

export const SupplierFinancePage: React.FC = () => {
  const { stats: financialStats, revenueData, expenses, transactions: recentTransactions, loading } = useSupplierFinance();

  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'expenses' | 'returns' | 'fees'>('overview');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'revenue', label: 'الإيرادات', icon: TrendingUp },
    { id: 'expenses', label: 'المصروفات', icon: TrendingDown },
    { id: 'returns', label: 'المرجعات', icon: RefreshCcw },
    { id: 'fees', label: 'رسوم المنصة', icon: CreditCard }
  ];

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'إيراد': return 'text-green-600';
      case 'تسوية': return 'text-green-600';
      case 'رسوم': return 'text-purple-600';
      case 'مرجعات': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل': return 'bg-green-100 text-green-700 border-green-200';
      case 'معلق': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'مخصوم': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'مُعاد': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل البيانات المالية...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">المالية</h1>
          <p className="text-gray-600 mt-1">إدارة شاملة للأمور المالية والإيرادات</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm"
          >
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="quarter">هذا الربع</option>
            <option value="year">هذا العام</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards - Bento Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="إيرادات الشهر"
          value={`${(financialStats.monthlyRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue={`+${financialStats.growth}%`}
          delay={100}
        />

        <BentoStatCard
          title="صافي الربح"
          value={`${(financialStats.netProfit / 1000000).toFixed(1)}M`}
          icon={Wallet}
          color="blue"
          trend="neutral"
          trendValue="صافي"
          delay={200}
        />

        <BentoStatCard
          title="مدفوعات معلقة"
          value={`${(financialStats.pendingPayments / 1000).toFixed(0)}K`}
          icon={Receipt}
          color="orange"
          trend="neutral"
          trendValue="متعلقة"
          delay={300}
        />

        <BentoStatCard
          title="رسوم المنصة"
          value={`${(financialStats.platformFees / 1000).toFixed(0)}K`}
          icon={CreditCard}
          color="purple"
          trend="neutral"
          trendValue="شهرياً"
          delay={400}
        />
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Revenue Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاه الإيرادات</h3>
                  <div className="space-y-3">
                    {revenueData.slice(-4).map((item, index) => (
                      <div key={item.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{item.month}</p>
                          <p className="text-sm text-gray-600">{item.orders} طلب</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {(item.amount / 1000000).toFixed(1)}M د.ع
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expenses Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">تفصيل المصروفات</h3>
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div key={expense.category} className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${expense.color}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {expense.category}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {(expense.amount / 1000).toFixed(0)}K د.ع
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${expense.color}`}
                              style={{ width: `${expense.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(financialStats.totalRevenue / 1000000).toFixed(1)}M د.ع
                    </p>
                  </div>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-600">متوسط شهري</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(financialStats.monthlyRevenue / 1000000).toFixed(1)}M د.ع
                    </p>
                  </div>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-600">نمو الإيرادات</p>
                    <p className="text-2xl font-bold text-purple-600">+{financialStats.growth}%</p>
                  </div>
                </Card>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">تفصيل الإيرادات الشهرية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {revenueData.map((item) => (
                    <div key={item.month} className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.month}</span>
                        <span className="text-sm text-gray-600">{item.orders} طلب</span>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        {(item.amount / 1000000).toFixed(1)}M د.ع
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content */}
          {/* Other tabs content */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المصروفات</h3>
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div key={expense.category} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${expense.color}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{expense.category}</span>
                            <span className="font-bold text-gray-900">{(expense.amount / 1000).toFixed(0)}K د.ع</span>
                          </div>
                          <div className="text-xs text-gray-500">{expense.percentage}% من الإجمالي</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                  <h3 className="text-lg font-bold text-red-900 mb-2">إجمالي المصروفات</h3>
                  <p className="text-3xl font-bold text-red-600 mb-4">{(financialStats.totalExpenses / 1000000).toFixed(2)}M د.ع</p>
                  <p className="text-sm text-red-800">تشمل تكاليف التشغيل، الشحن، ورسوم المنصة.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-orange-50 p-4 rounded-xl border border-orange-200">
                <div>
                  <h3 className="font-bold text-orange-900">إجمالي المرجعات</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{(financialStats.returns / 1000).toFixed(0)}K د.ع</p>
                </div>
                <RefreshCcw className="w-10 h-10 text-orange-400 opacity-50" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">رقم الطلب</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">العميل</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">السبب</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">المبلغ</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">السبب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTransactions.filter(t => t.type === 'مرجعات').map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{t.description}</td>
                        <td className="px-4 py-3 text-gray-600">{t.customer}</td>
                        <td className="px-4 py-3 text-gray-500">عيوب تصنيع</td>
                        <td className="px-4 py-3 font-bold text-red-600">{Math.abs(t.amount).toLocaleString()} د.ع</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">مكتمل</span>
                        </td>
                      </tr>
                    ))}
                    {recentTransactions.filter(t => t.type === 'مرجعات').length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">لا توجد مرجعات حديثة</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-purple-50 border-purple-200">
                  <h3 className="text-purple-900 font-bold mb-2">إجمالي رسوم المنصة</h3>
                  <p className="text-3xl font-bold text-purple-600">{(financialStats.platformFees / 1000).toFixed(0)}K د.ع</p>
                  <p className="text-xs text-purple-700 mt-2">نسبة 2.5% من إجمالي المبيعات</p>
                </Card>
                <Card className="p-6 bg-green-50 border-green-200">
                  <h3 className="text-green-900 font-bold mb-2">المسددة (التسويات)</h3>
                  <p className="text-3xl font-bold text-green-600">{(financialStats.totalSettled / 1000).toFixed(0)}K د.ع</p>
                  <p className="text-xs text-green-700 mt-2">المبالغ التي تم تسويتها</p>
                </Card>
                <Card className="p-6 bg-red-50 border-red-200">
                  <h3 className="text-red-900 font-bold mb-2">الغير مدفوعة (المعلقة)</h3>
                  <p className="text-3xl font-bold text-red-600">{(financialStats.pendingFees / 1000).toFixed(0)}K د.ع</p>
                  <p className="text-xs text-red-700 mt-2">تراكمي غير مسدد</p>
                </Card>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4">سجل التسويات والرسوم</h3>
                <div className="bg-white border rounded-xl overflow-hidden">
                  {recentTransactions.filter(t => t.type === 'رسوم' || t.type === 'تسوية').map(t => (
                    <div key={t.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'تسوية' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
                        </div>
                      </div>
                      <span className={`font-bold flex items-center gap-1 ${t.type === 'تسوية' ? 'text-green-600' : 'text-red-600'
                        }`} dir="ltr">
                        {Math.abs(t.amount).toLocaleString()} IQD
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Settlements Section (Renamed from Recent Transactions) */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-500" />
              التسويات وأحدث المعاملات
            </h2>
            <Button variant="ghost" size="sm" className="text-green-600">
              عرض الكل
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-right p-3 font-semibold text-gray-700">المعاملة</th>
                  <th className="text-right p-3 font-semibold text-gray-700">العميل / المنصة</th>
                  <th className="text-right p-3 font-semibold text-gray-700">المبلغ</th>
                  <th className="text-right p-3 font-semibold text-gray-700">التاريخ</th>
                  <th className="text-center p-3 font-semibold text-gray-700">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-gray-900">{transaction.description}</p>
                        <p className={`text-xs font-medium ${getTransactionColor(transaction.type)}`}>
                          {transaction.type}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-sm text-gray-700">{transaction.customer}</p>
                    </td>
                    <td className="p-3">
                      <p className={`font-bold ${transaction.type === 'تسوية' ? 'text-green-600' : transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString()} د.ع
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.date)}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
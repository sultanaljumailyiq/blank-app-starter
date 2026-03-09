import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Settings as SettingsIcon,
  Plus,
  PieChart as PieIcon,
  BarChart2,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  Filter,
  CreditCard,
  UserCheck,
  Box,
  Calculator
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { useFinance } from '../../../hooks/useFinance';
import { useInventory } from '../../../hooks/useInventory';
import { useLabOrders } from '../../../hooks/useLabOrders';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { ComprehensiveTransactionModal } from '../../../components/finance/ComprehensiveTransactionModal';
import { useAssets, Asset } from '../../../hooks/useAssets';

interface DoctorFinancePageProps {
  clinicId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const ClinicFinancePage: React.FC<DoctorFinancePageProps> = ({ clinicId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'settings'>('overview');

  // Data Contexts
  const { transactions, stats, addTransaction, updateTransaction, deleteTransaction, refresh } = useFinance(clinicId || '0');
  const { inventory, updateItem, addItem } = useInventory(clinicId || '0');
  const { updateOrderStatus } = useLabOrders({ clinicId: clinicId || '0' });
  const { assets, addAsset } = useAssets(clinicId || '0');

  // URL Params for linking from Patient File
  const location = useLocation();

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [preselectedPatientId, setPreselectedPatientId] = useState<string | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const handleEdit = (transaction: any) => {
    // Format data to match what modal expects
    const editData = {
      ...transaction,
      // Ensure IDs are strings if needed
      patientId: transaction.patientId,
      doctorId: transaction.doctorId,
      labRequestId: transaction.labRequestId,
      recordedById: transaction.recordedById || transaction.recorderId // handle potential naming diffs
    };
    setSelectedTransaction(editData);
    setModalType(transaction.type);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      await deleteTransaction(id);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientIdParam = params.get('patientId');
    const modalParam = params.get('modal'); // 'income' or 'expense'

    if (patientIdParam && modalParam) {
      setModalType(modalParam as 'income' | 'expense');
      setPreselectedPatientId(patientIdParam);
      setShowModal(true);
    }
  }, [location.search]);

  // --- Chart Data Preparation ---
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      label: d.toLocaleString('default', { month: 'short' }),
      key: d.toISOString().slice(0, 7) // YYYY-MM
    };
  }).reverse();

  const barData = last6Months.map(month => {
    const monthTransactions = transactions.filter(t => t.date && t.date.startsWith(month.key));
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: month.label,
      income,
      expenses
    };
  });

  // Calculate Category Distribution for Pie Chart
  const expenseDistribution = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expenseDistribution).map(cat => ({
    name: cat === 'lab' ? 'مختبر' : cat === 'salary' ? 'رواتب' : cat === 'inventory' ? 'مخزون' : cat === 'rent' ? 'إيجار' : cat === 'bills' ? 'فواتير' : cat,
    value: expenseDistribution[cat]
  }));

  const SafePieData = pieData.length > 0 ? pieData : [
    { name: 'رواتب', value: 400 },
    { name: 'مختبر', value: 300 },
    { name: 'مخزون', value: 200 },
    { name: 'أخرى', value: 100 }
  ];

  // --- Category Management (State) ---
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'رواتب', type: 'locked', description: 'رواتب الموظفين والكادر الطبي' },
    { id: 'cat-2', name: 'مختبر', type: 'locked', description: 'تكاليف طلبات معمل الأسنان' },
    { id: 'cat-3', name: 'مخزون', type: 'locked', description: 'شراء مواد ومستلزمات طبية' },
    { id: 'cat-4', name: 'إيجار', type: 'editable', description: 'إيجار العيادة الشهري' },
    { id: 'cat-5', name: 'كهرباء', type: 'editable', description: 'فواتير الطاقة والمولد' },
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, {
        id: `cat-${Date.now()}`,
        name: newCategoryName,
        type: 'editable',
        description: 'تصنيف مخصص'
      }]);
      setNewCategoryName('');
    }
  };


  // --- Render Functions ---

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoStatCard
          title="صافي الدخل"
          value={`${stats.income.toLocaleString()} د.ع`}
          icon={TrendingUp}
          color="emerald"
          trend={stats.growth >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(stats.growth).toFixed(1)}%`}
          delay={100}
        />
        <BentoStatCard
          title="المصروفات"
          value={`${stats.expenses.toLocaleString()} د.ع`}
          icon={TrendingDown}
          color="red"
          trend="down"
          trendValue="إجمالي"
          delay={200}
        />
        <BentoStatCard
          title="الأرباح الصافية"
          value={`${stats.net.toLocaleString()} د.ع`}
          icon={DollarSign}
          color="blue"
          trend="up"
          trendValue="الصافي"
          delay={300}
        />
        <BentoStatCard
          title="إجمالي المعاملات"
          value={transactions.length}
          icon={Wallet}
          color="purple"
          trend="neutral"
          trendValue="عملية"
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-gray-400" />
                التحليل المالي
              </h3>
              <p className="text-sm text-gray-500">مقارنة الإيرادات والمصروفات للأشهر الستة الماضية</p>
            </div>
          </div>
          <div className="h-[350px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontFamily: 'inherit'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} د.ع`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name="إيرادات" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                <Bar dataKey="expenses" name="مصروفات" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-gray-400" />
                توزيع المصروفات
              </h3>
              <p className="text-sm text-gray-500">تحليل فئات الإنفاق</p>
            </div>
          </div>
          <div className="h-[350px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SafePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {SafePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} د.ع`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-700">{transactions.filter(t => t.type === 'expense').length}</span>
              <span className="text-xs text-gray-400 font-medium">عملية صرف</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-900">أحدث المعاملات</h3>
            <p className="text-sm text-gray-500">آخر النشاطات المالية المسجلة</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('income')} className="text-gray-600 hover:text-blue-600 border-gray-200">
            عرض السجل الكامل
          </Button>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto custom-scrollbar">
          {transactions.slice(0, 10).map(t => (
            <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'}`}>
                  {t.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-0.5">{t.description}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{t.category}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{t.date.split('T')[0]}</span>
                    {t.relatedPerson && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-blue-600 font-medium">{t.relatedPerson}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <span className={`font-bold text-lg block mb-0.5 ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                  <span className="text-xs text-gray-400 font-normal mr-1">د.ع</span>
                </span>
                <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg inline-block">{t.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIncomeTab = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              سجل الإيرادات المتكامل
            </h2>
            <p className="text-sm text-gray-500 mt-1">تتبع جميع الإيرادات اليدوية والآلية</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refresh()}>
              <RefreshCw className="w-4 h-4 ml-2" /> تحديث
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20" onClick={() => {
              setModalType('income');
              setPreselectedPatientId(undefined);
              setSelectedTransaction(null);
              setShowModal(true);
            }}>
              <Plus className="w-4 h-4 ml-2" /> إيراد يدوي
            </Button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4 overflow-x-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="بحث في السجلات..." className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-500/20" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm font-medium border-b">
              <tr>
                <th className="px-6 py-4 rounded-tr-lg">المعرف</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">المريض / المصدر</th>
                <th className="px-6 py-4">التفاصيل</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">طريقة الدفع</th>
                <th className="px-6 py-4">المستلم (الموظف)</th>
                <th className="px-6 py-4 rounded-tl-lg">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.filter(t => t.type === 'income').length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="w-12 h-12 stroke-1 opacity-20" />
                      <p>لا توجد إيرادات مسجلة حتى الآن</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.filter(t => t.type === 'income').map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      <span className="bg-gray-100 px-2 py-1 rounded">#{t.id.slice(-6)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-bold text-gray-900">{t.date.split('T')[0]}</div>
                      <div className="text-xs text-gray-400">{t.date.split('T')[1]?.slice(0, 5)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {t.relatedPerson ? (
                        <>
                          <span className="block font-bold text-gray-900">{t.relatedPerson}</span>
                          <span className="text-xs text-gray-500">
                            {t.category === 'other' ? (t.description || 'إيراد آخر') : 'ملف المريض'}
                          </span>
                        </>
                      ) : (
                        t.category === 'other' ? (
                          <span className="text-gray-900 font-medium">{t.description || 'إيراد متنوع'}</span>
                        ) : (
                          <span className="text-gray-500 italic">عام</span>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{t.description || '-'}</span>
                        <div className="flex gap-1 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                            {t.category === 'treatment' ? 'علاج' : t.category === 'consultation' ? 'كشفية' : t.category}
                          </span>
                          {t.doctorName && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              د. {t.doctorName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600 text-lg">
                      +{t.amount.toLocaleString()}
                      <span className="text-xs text-gray-400 mr-1 font-normal">د.ع</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${t.paymentMethod === 'cash'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : t.paymentMethod === 'card' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <CreditCard className="w-3 h-3" />
                        {t.paymentMethod === 'cash' ? 'نقدي' : t.paymentMethod === 'card' ? 'بطاقة' : 'آجل'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.recorderName ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700">{t.recorderName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {t.id.startsWith('apt-') ? (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 italic bg-gray-50 px-2 py-0.5 rounded border border-gray-100">نظام (آلي)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="عرض وتعديل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderExpensesTab = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              سجل المصروفات المتكامل
            </h2>
            <p className="text-sm text-gray-500 mt-1">تتبع الرواتب، المشتريات، والمصاريف التشغيلية</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refresh()}>
              <RefreshCw className="w-4 h-4 ml-2" /> تحديث
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20" onClick={() => {
              setModalType('expense');
              setPreselectedPatientId(undefined);
              setSelectedTransaction(null);
              setShowModal(true);
            }}>
              <Plus className="w-4 h-4 ml-2" /> مصروف يدوي
            </Button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4 overflow-x-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="بحث في المصروفات..." className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500/20" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm font-medium border-b">
              <tr>
                <th className="px-6 py-4 rounded-tr-lg">المعرف</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">البيان / الجهة</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">المسؤول (المسجل)</th>
                <th className="px-6 py-4 rounded-tl-lg">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.filter(t => t.type === 'expense').length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="w-12 h-12 stroke-1 opacity-20" />
                      <p>لا توجد مصروفات مسجلة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.filter(t => t.type === 'expense').map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      <span className="bg-gray-100 px-2 py-1 rounded">#{t.id.slice(-6)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-bold text-gray-900">{t.date.split('T')[0]}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{t.description || '-'}</span>
                        {t.relatedPerson && (
                          <span className="text-xs text-gray-500 mt-0.5">المستفيد: {t.relatedPerson}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        {t.category === 'salary' ? 'رواتب' : t.category === 'inventory' ? 'مخزون' : t.category === 'rent' ? 'إيجار' : t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600 text-lg">
                      -{t.amount.toLocaleString()}
                      <span className="text-xs text-gray-400 mr-1 font-normal">د.ع</span>
                    </td>
                    <td className="px-6 py-4">
                      {t.recorderName ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700">{t.recorderName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض وتعديل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );



  const renderSettingsTab = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
            إعدادات المالية
          </h2>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">تصنيفات المصروفات</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم تصنيف جديد..."
                className="px-4 py-2 border rounded-lg text-right"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                <Plus className="w-4 h-4 ml-2" /> إضافة
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className={`p-4 rounded-xl border ${cat.type === 'locked' ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${cat.type === 'locked' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                    {cat.type === 'locked' ? 'نظام' : 'مخصص'}
                  </span>
                  {cat.type === 'editable' && (
                    <button className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{cat.name}</h4>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              المالية والحسابات
              <button onClick={() => refresh()} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="تحديث البيانات">
                <RefreshCw className="w-5 h-5" />
              </button>
            </h1>
            <p className="text-gray-500">نظرة عامة على الإيرادات والمصروفات والأرباح</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>نظرة عامة</button>
          <button onClick={() => setActiveTab('income')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'income' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>الإيرادات</button>
          <button onClick={() => setActiveTab('expenses')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'expenses' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>المصروفات</button>

          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>الإعدادات</button>
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'income' && renderIncomeTab()}
      {activeTab === 'expenses' && renderExpensesTab()}

      {activeTab === 'settings' && renderSettingsTab()}

      {/* Extracted Transaction Modal */}
      <ComprehensiveTransactionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTransaction(null); // Reset
        }}
        type={modalType}
        clinicId={clinicId}
        preselectedPatientId={preselectedPatientId}
        initialData={selectedTransaction}
        onSave={async (data: any) => {
          try {
            if (selectedTransaction) {
              await updateTransaction(selectedTransaction.id, data);
              alert('تم تعديل المعاملة بنجاح');
            } else {
              await addTransaction(data);

              // Inventory Sync Logic
              if (data.category === 'inventory' && data.quantity && data.quantity > 0) {
                if (data.inventoryItemId) {
                  // Update existing item
                  const item = inventory.find(i => i.id === data.inventoryItemId);
                  if (item) {
                    await updateItem(item.id, { quantity: Number(item.quantity) + Number(data.quantity) });
                  }
                } else if (data.itemName) {
                  // Add new item (Simplified)
                  await addItem({
                    name: data.itemName,
                    category: 'materials', // default
                    quantity: Number(data.quantity),
                    unitPrice: data.amount / data.quantity, // derived unit price
                    minStock: 5,
                    unit: 'pcs',
                    supplier: 'راء مباشر',
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() // Default 1 year expiry
                  });
                  alert('تمت إضافة المادة إلى المخزون بنجاح');
                }
              }

              // Lab Order Auto-Update
              if (data.category === 'lab' && data.labRequestId) {
                await updateOrderStatus(data.labRequestId, 'completed', { paymentStatus: 'paid' });
                alert('تم تحديث حالة طلب المختبر إلى مكتمل ومدفوع');
              }

              // 3. Asset Creation (New)
              if (data.category === 'asset_purchase' && data.itemName) {
                await addAsset({
                  name: data.itemName,
                  category: 'equipment',
                  purchaseDate: data.date || new Date().toISOString(),
                  purchaseCost: Number(data.amount),
                  usefulLifeYears: Number(data.assetLifeYears) || 5,
                  salvageValue: Number(data.assetSalvageValue) || 0,
                  status: 'active',
                  currency: 'IQD',
                  description: data.description || 'Added via Expenses',
                  clinicId: clinicId || '0'
                });
                alert('تم إضافة الأصل الثابت إلى سجل الأصول بنجاح');
              }

              alert('تم حفظ المعاملة بنجاح');
            }
            setShowModal(false);
            setPreselectedPatientId(undefined);
            setSelectedTransaction(null);
          } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء الحفظ');
          }
        }}
      />
    </div>
  );
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('ar-IQ');
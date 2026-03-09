import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, PieChart,
  BarChart3, CreditCard, Wallet, ArrowUpRight, ArrowDownRight,
  Eye, Download, Filter, RefreshCw, AlertCircle, CheckCircle, Clock,
  Plus, Edit, Trash2, Save, X, Search, Settings, Tag
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { supabase } from '../../../lib/supabase';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { formatNumericDate } from '../../../lib/date';
import { useLabFinance } from '../../../hooks/useLabFinance';
import { useLabServices, LabService } from '../../../hooks/useLabServices';

// Mapping LabService to PriceItem interface used in this component
interface PriceItem extends LabService { }

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number; // Not fully trackable without Order Integration but can sum pending transactions if any
  completedAmount: number;
  platformCommission: number;
  netIncome: number;
  paidAmount: number;
  overdueAmount: number;
  orderCount: number; // Need to get from useLabWorks actually, but maybe we ignore or pass props?
  averageOrderValue: number;
  growthRate: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  commission: number;
}

interface CommissionData {
  orderId: string;
  orderNumber: string;
  clinicName: string;
  totalAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  platformShare: number;
  status: 'pending' | 'processed' | 'paid';
  dueDate: string;
  paidDate?: string;
}

export const LabFinanceSection: React.FC = () => {
  // Using stats from hook directly
  const { transactions, stats, loading: financeLoading } = useLabFinance();
  const { services, loading: servicesLoading, addService, updateService, deleteService } = useLabServices();

  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedView, setSelectedView] = useState('overview');

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPriceItem, setEditingPriceItem] = useState<PriceItem | null>(null);
  const [priceSearchTerm, setPriceSearchTerm] = useState('');
  const [selectedPriceCategory, setSelectedPriceCategory] = useState('all');
  const [txFilter, setTxFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // New Service Form State
  const [newService, setNewService] = useState<Partial<LabService>>({
    name: '', category: 'عام', basePrice: 0, description: '', estimatedTime: '', isActive: true
  });

  // Categories from services
  const categories = Array.from(new Set(services.map(s => s.category)));


  const getCommissionStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'معلق', color: 'bg-yellow-100 text-yellow-800' },
      processed: { label: 'تم المعالجة', color: 'bg-blue-100 text-blue-800' },
      paid: { label: 'تم الدفع', color: 'bg-green-100 text-green-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const getCommissionStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Price Management Handlers
  const handleAddPriceItem = () => {
    setEditingPriceItem(null);
    setNewService({ name: '', category: 'عام', basePrice: 0, description: '', estimatedTime: '', isActive: true });
    setShowPriceModal(true);
  };

  const handleEditPriceItem = (item: PriceItem) => {
    setEditingPriceItem(item);
    setNewService(item);
    setShowPriceModal(true);
  };

  const handleDeletePriceItem = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      await deleteService(id);
    }
  };

  const handleSavePriceItem = async () => {
    try {
      if (editingPriceItem) {
        await updateService(editingPriceItem.id, newService);
      } else {
        if (!newService.name || !newService.basePrice) return;
        await addService(newService as any);
      }
      setShowPriceModal(false);
    } catch (err) {
      alert('Failed to save service');
    }
  };

  const filteredPriceItems = services.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(priceSearchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(priceSearchTerm.toLowerCase());
    const matchesCategory = selectedPriceCategory === 'all' || item.category === selectedPriceCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTx = transactions.filter(t => {
    if (t.type === 'settlement') return txFilter === 'all';
    if (txFilter === 'all') return true;
    if (txFilter === 'paid') return t.payment_status === 'paid';
    return t.payment_status !== 'paid';
  });

  if (financeLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">المالية والإيرادات</h1>
            <p className="text-green-100">
              تتبع الإيرادات، العمولات، والمدفوعات الخاصة بمعمل الأسنان
            </p>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <div className="text-3xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="text-green-200 text-sm">الإيرادات الشهرية</div>
          </div>
        </div>
      </div>

      {/* View Selector (Bento Container) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'commissions', label: 'رسوم المنصة', icon: PieChart },
              { id: 'prices', label: 'إدارة الأسعار', icon: Tag }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedView === view.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <view.icon className={`w-4 h-4 ${selectedView === view.id ? 'text-purple-600' : 'text-gray-400'}`} />
                {view.label}
              </button>
            ))}
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-100">
            <Download className="w-4 h-4" />
            تصدير تقرير
          </button>
        </div>
      </div>

      {selectedView === 'overview' && (
        <>
          {/* Main Stats (Bento Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="relative overflow-hidden rounded-[2rem] p-6 border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-lg transition-all group">
              <DollarSign className="absolute -bottom-4 -left-4 w-32 h-32 text-green-500/10 rotate-12 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <div className="relative z-10">
                <p className="text-green-600/80 font-medium text-sm mb-1">إجمالي الإيرادات</p>
                <h3 className="text-3xl font-bold text-green-900 mb-2 truncate" dir="ltr">{formatCurrency(stats.totalRevenue)}</h3>
                <div className="flex items-center gap-1 text-xs text-green-700">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+15% نمو</span>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="relative overflow-hidden rounded-[2rem] p-6 border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all group">
              <Wallet className="absolute -bottom-4 -left-4 w-32 h-32 text-blue-500/10 rotate-12 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <div className="relative z-10">
                <p className="text-blue-600/80 font-medium text-sm mb-1">صافي الدخل</p>
                <h3 className="text-3xl font-bold text-blue-900 mb-2 truncate" dir="ltr">{formatCurrency(stats.netIncome)}</h3>
                <p className="text-xs text-blue-600">بعد خصم العمولات</p>
              </div>
            </div>

            {/* Orders Count */}
            <div className="relative overflow-hidden rounded-[2rem] p-6 border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all group">
              <BarChart3 className="absolute -bottom-4 -left-4 w-32 h-32 text-purple-500/10 rotate-12 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <div className="relative z-10">
                <p className="text-purple-600/80 font-medium text-sm mb-1">عدد الطلبات</p>
                <h3 className="text-3xl font-bold text-purple-900 mb-2">{stats.orderCount}</h3>
                <p className="text-xs text-purple-600">طلب ناجح</p>
              </div>
            </div>

            {/* Unpaid Orders Stats */}
            <div className="relative overflow-hidden rounded-[2rem] p-6 border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-lg transition-all group">
              <AlertCircle className="absolute -bottom-4 -left-4 w-32 h-32 text-amber-500/10 rotate-12 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <div className="relative z-10">
                <p className="text-amber-600/80 font-medium text-sm mb-1">الطلبات الغير مسددة</p>
                <h3 className="text-3xl font-bold text-amber-900 mb-2 truncate" dir="ltr">{formatCurrency(stats.unpaidValue)}</h3>
                <p className="text-xs text-amber-600 font-bold">عدد الطلبات: {stats.unpaidCount}</p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-gray-700" />
                  </div>
                  <h3 className="font-bold text-gray-900">آخر العمليات</h3>
                </div>
                <select
                  value={txFilter}
                  onChange={(e) => setTxFilter(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">جميع الطلبات</option>
                  <option value="paid">المسددة</option>
                  <option value="unpaid">الغير مسددة</option>
                </select>
              </div>
              <div className="p-6">
                {filteredTx.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTx.slice(0, 10).map(t => (
                      <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : t.type === 'settlement' ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                            {t.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : t.type === 'settlement' ? <CheckCircle className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{t.description || t.category}</p>
                            <p className="text-xs text-gray-500">{formatNumericDate(new Date(t.transactionDate))}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : t.type === 'settlement' ? 'text-purple-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : t.type === 'settlement' ? '-' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">لا توجد عمليات مسجلة</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedView === 'commissions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                <PieChart className="w-4 h-4 text-purple-700" />
              </div>
              <h3 className="font-bold text-gray-900">رسوم المنصة والتسويات</h3>
            </div>
          </div>

          {/* Summary Cards for Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-100">
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <p className="text-sm text-purple-600 mb-1 font-bold">إجمالي رسوم المنصة</p>
              <h3 className="text-xl font-bold text-purple-700">{formatCurrency(stats.platformFees)}</h3>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-sm text-green-600 mb-1 font-bold">المسددة (التسويات)</p>
              <h3 className="text-xl font-bold text-green-700">{formatCurrency(stats.totalSettled)}</h3>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <p className="text-sm text-orange-600 mb-1 font-bold">الغير مدفوعة (المعلقة)</p>
              <h3 className="text-xl font-bold text-orange-700">{formatCurrency(stats.pendingFees)}</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm">نوع العملية</th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm">المبلغ</th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm">التاريخ</th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Filter to show only Settlements or relevant fee transactions */}
                {transactions.filter(t => t.type === 'settlement').length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-500">لا توجد تسويات مسجلة</td></tr>
                ) : (
                  transactions.filter(t => t.type === 'settlement').map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors bg-green-50/30">
                      <td className="py-4 px-6 font-medium text-green-700">تسوية مالية</td>
                      <td className="py-4 px-6 text-green-700 font-bold">{formatCurrency(t.amount)}</td>
                      <td className="py-4 px-6 text-gray-500 text-sm">{formatNumericDate(new Date(t.transactionDate))}</td>
                      <td className="py-4 px-6 text-gray-600 text-sm">{t.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedView === 'prices' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-lg font-bold text-gray-900">قائمة الخدمات والأسعار</h3>
              <button onClick={handleAddPriceItem} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-sm text-sm font-bold">
                <Plus className="w-4 h-4" /> إضافة خدمة
              </button>
            </div>

            <div className="p-6">
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث في الخدمات..."
                    value={priceSearchTerm}
                    onChange={e => setPriceSearchTerm(e.target.value)}
                    className="w-full pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <select
                  value={selectedPriceCategory}
                  onChange={e => setSelectedPriceCategory(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-gray-700"
                >
                  <option value="all">كل الأقسام</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Table View */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-right p-4 font-bold text-gray-600">الخدمة</th>
                      <th className="text-right p-4 font-bold text-gray-600">الفئة</th>
                      <th className="text-right p-4 font-bold text-gray-600">السعر</th>
                      <th className="text-right p-4 font-bold text-gray-600">الوقت المتوقع</th>
                      <th className="text-right p-4 font-bold text-gray-600">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPriceItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">لا توجد خدمات مطابقة للبحث</td>
                      </tr>
                    ) : (
                      filteredPriceItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-4">
                            <div className="font-bold text-gray-900 text-base">{item.name}</div>
                            {item.description && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</div>}
                          </td>
                          <td className="p-4">
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-green-600 text-base bg-green-50 px-3 py-1 rounded-lg">
                              {formatCurrency(item.basePrice)}
                            </span>
                          </td>
                          <td className="p-4">
                            {item.estimatedTime ? (
                              <span className="text-gray-500 flex items-center gap-1.5 text-xs">
                                <Clock className="w-3.5 h-3.5" /> {item.estimatedTime}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditPriceItem(item)}
                                className="text-blue-600 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePriceItem(item.id)}
                                className="text-red-600 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
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
            </div>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4">
              {editingPriceItem ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخدمة</label>
                <input
                  className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="مثال: طقم أسنان كامل"
                  value={newService.name}
                  onChange={e => setNewService({ ...newService, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                <input
                  className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="مثال: تركيبات"
                  value={newService.category}
                  onChange={e => setNewService({ ...newService, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                  <input
                    className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    type="number"
                    placeholder="0.00"
                    value={newService.basePrice}
                    onChange={e => setNewService({ ...newService, basePrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوقت المتوقع</label>
                  <input
                    className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    placeholder="مثال: 3 أيام"
                    value={newService.estimatedTime}
                    onChange={e => setNewService({ ...newService, estimatedTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleSavePriceItem} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-md">حفظ</button>
              <button onClick={() => setShowPriceModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
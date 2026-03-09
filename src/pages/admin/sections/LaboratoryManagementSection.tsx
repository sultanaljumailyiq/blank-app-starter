import React, { useState, useEffect } from 'react';
import {
  TestTube,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Search,
  Eye,
  List,
  Grid3X3,
  Building2,
  X,
  XCircle,
  ShieldCheck,
  AlertOctagon,
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';

import { Card } from '../../../components/common/Card';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { Button } from '../../../components/common/Button';
import { useAdminLabs, Laboratory } from '../../../hooks/useAdminLabs';
import { AdminModal } from '../../../components/admin/AdminModal';
import { LabDetailsModal } from '../components/LabDetailsModal';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

const LabOrdersTab = () => {
  const { fetchLabOrders } = useAdminLabs();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchLabOrders();
        setOrders(data || []);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-bold flex items-center gap-2">
        <List className="w-5 h-5 text-purple-600" />
        أحدث الطلبات
      </h3>
      <div className="overflow-hidden bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">المريض</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">الخدمة</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">الحالة</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="text-center p-8">جاري التحميل...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-8 text-gray-500">لا توجد طلبات</td></tr>
            ) : orders.map(order => (
              <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-6 font-medium text-gray-900">{order.patient_name}</td>
                <td className="p-6 text-sm text-gray-600">{order.service_name}</td>
                <td className="p-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'
                    }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-6 text-sm text-gray-400">
                  {new Date(order.created_at).toLocaleDateString('ar-IQ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const LaboratoryManagementSection: React.FC = () => {
  const { labs, disputes, loading, updateCommissionRate, updateLabStatus, verifyLab, fetchLabs, fetchDisputes, resolveDispute, clearCommission } = useAdminLabs();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals Data
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  // Form States
  const [suspensionReason, setSuspensionReason] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState<number>(0);

  // Mock Requests (Placeholder)
  const requests = [
    {
      id: 'ADV-001',
      patientName: 'أحمد محمد علي',
      clinicName: 'عيادة د. سارة أحمد',
      labName: 'مختبر الأضواء المتقدم',
      labType: 'cooperative',
      testType: 'تاج خزفي',
      status: 'completed',
      price: 250000
    },
    {
      id: 'ADV-002',
      patientName: 'فاطمة حسن',
      clinicName: 'عيادة د. محمد',
      labName: 'مختبر النخبة',
      labType: 'manual',
      testType: 'زرعة فردية',
      status: 'in_progress',
      price: 350000
    }
  ];

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: labs.length,
    pending: labs.filter(l => l.status === 'pending').length,
    active: labs.filter(l => l.status === 'active').length,
    suspended: labs.filter(l => l.status === 'suspended').length,
    totalRevenue: labs.reduce((sum, lab) => sum + lab.totalRevenue, 0),
    pendingCommissions: labs.reduce((sum, lab) => sum + lab.pendingCommission, 0)
  };

  const handleDeactivateLab = async (labId: string) => {
    try {
      const { error } = await supabase.rpc('toggle_lab_activation', {
        p_lab_id: labId,
        p_action: 'deactivate',
        p_admin_id: null
      });
      if (error) throw error;
      toast.success('تم إلغاء تفعيل المختبر');
      fetchLabs();
    } catch (err) {
      console.error('Error deactivating lab:', err);
      toast.error('حدث خطأ أثناء إلغاء التفعيل');
    }
  };

  const handleUpdateCommission = async () => {
    if (selectedLab) {
      await updateCommissionRate(selectedLab.id, newCommissionRate);
      setShowCommissionModal(false);
      setSelectedLab(null);
    }
  };

  const handleSuspendLab = async () => {
    if (selectedLab) {
      await updateLabStatus(selectedLab.id, 'suspended', suspensionReason);
      setShowSuspensionModal(false);
      setSelectedLab(null);
      setSuspensionReason('');
    }
  };

  const handleActivateLab = async (lab: Laboratory) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Activate AND verify via RPC
      const { error } = await supabase.rpc('toggle_lab_activation', {
        p_lab_id: lab.id,
        p_action: 'activate',
        p_admin_id: user?.id
      });

      if (error) throw error;

      toast.success(`تم تفعيل وتوثيق مختبر "${lab.name}" بنجاح`);
      fetchLabs(); // Refresh the list
    } catch (err) {
      console.error('Error activating lab:', err);
      toast.error('حدث خطأ أثناء تفعيل المختبر');
    }
  };

  const handleAccreditLab = async (lab: Laboratory) => {
    try {
      const action = lab.isAccredited ? 'unaccredit' : 'accredit';
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.rpc('toggle_lab_activation', {
        p_lab_id: lab.id,
        p_action: action,
        p_admin_id: user?.id
      });

      if (error) throw error;

      toast.success(action === 'accredit'
        ? `تم اعتماد مختبر "${lab.name}" بنجاح`
        : `تم إلغاء اعتماد مختبر "${lab.name}"`
      );
      fetchLabs(); // Refresh the list
    } catch (err) {
      console.error('Error accrediting lab:', err);
      toast.error('حدث خطأ أثناء تحديث حالة الاعتماد');
    }
  };

  const openCommissionModal = (lab: Laboratory) => {
    setSelectedLab(lab);
    setNewCommissionRate(lab.commissionPercentage);
    setShowCommissionModal(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل بيانات المختبرات...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
          <TestTube className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة المختبرات المتقدمة</h2>
          <p className="text-gray-600">نظام إدارة شامل للمختبرات ونسبة الأرباح (العمولة)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoStatCard
          title="إجمالي المختبرات"
          value={stats.total}
          icon={Building2}
          color="blue"
          trend="neutral"
          trendValue={`نشط: ${stats.active}`}
          delay={100}
        />

        <BentoStatCard
          title="طلبات التسجيل"
          value={stats.pending}
          icon={Users}
          color="orange"
          trend="up"
          trendValue="يحتاج مراجعة"
          delay={200}
        />

        <BentoStatCard
          title="إجمالي الإيرادات"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          color="green"
          trend="up"
          trendValue="دينار عراقي"
          delay={300}
        />

        <BentoStatCard
          title="العمولات المستحقة"
          value={`${(stats.pendingCommissions / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          color="purple"
          trend="neutral"
          trendValue="صافي الربح"
          delay={400}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex w-fit">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: Grid3X3 },
          { id: 'financial', label: 'التقارير المالية والعمولات', icon: DollarSign },
          { id: 'requests', label: 'سجل الطلبات', icon: List },
          { id: 'disputes', label: 'النزاعات', icon: AlertOctagon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'disputes') {
                fetchDisputes();
              }
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="بحث في المختبرات..."
                    className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['all', 'active', 'suspended'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${statusFilter === filter
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                      {filter === 'all' ? 'الكل' : filter === 'active' ? 'نشط' : 'معلق'}
                    </button>
                  ))}
                </div>

                <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
              </div>

              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredLabs.map(lab => (
                  <div key={lab.id} className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow relative ${lab.status === 'suspended' ? 'border-red-200 bg-red-50/10' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden shadow-sm">
                          {lab.logo ? (
                            <img src={lab.logo} alt={lab.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 line-clamp-1">{lab.name}</h3>
                          <p className="text-sm text-gray-500">{lab.ownerName}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${lab.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        lab.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                        {lab.status === 'active' ? 'نشط' : lab.status === 'suspended' ? 'معلق' : 'في الانتظار'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {lab.governorate}
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {lab.rating} ({lab.reviewCount})
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-4 h-4 ${lab.isVerified ? 'text-blue-500' : 'text-gray-300'}`} />
                        <span className={lab.isVerified ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                          {lab.isVerified ? 'تم التحقق' : 'غير موثق'}
                        </span>
                      </div>
                      {lab.isAccredited && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-500" />
                          <span className="text-purple-600 font-medium">معتمد رسمياً</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit">
                        <DollarSign className="w-3 h-3" />
                        نسبة المنصة: {lab.commissionPercentage}%
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedLab(lab); setShowLabModal(true); }}>
                        <Eye className="w-4 h-4 ml-1" /> التفاصيل
                      </Button>

                      {lab.status === 'active' ? (
                        <Button size="sm" onClick={() => handleDeactivateLab(lab.id)} className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                          <XCircle className="w-4 h-4 ml-1" /> إلغاء التفعيل
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleActivateLab(lab)} className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200">
                          <CheckCircle className="w-4 h-4 ml-1" /> تفعيل
                        </Button>
                      )}

                      {/* Accredit Button - Only show after lab is activated */}
                      {lab.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleAccreditLab(lab)}
                          className={lab.isAccredited
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300"
                            : "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200"
                          }
                          title={lab.isAccredited ? "إلغاء الاعتماد" : "اعتماد المختبر"}
                        >
                          <Star className={`w-4 h-4 ${lab.isAccredited ? 'fill-purple-500' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div>
                  <h3 className="font-bold text-purple-900">إدارة العمولات المالية</h3>
                  <p className="text-sm text-purple-700">تحديد نسبة الربح للمنصة من كل مختبر ومتابعة المستحقات</p>
                </div>
              </div>

              <div className="overflow-hidden bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">المختبر</th>
                      <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">إجمالي الإيرادات</th>
                      <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">نسبة العمولة الحالية</th>
                      <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">مستحقات المنصة</th>
                      <th className="p-6 text-center text-sm font-bold text-gray-600 bg-gray-50/30">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLabs.map(lab => (
                      <tr key={lab.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-bold overflow-hidden border border-purple-100">
                              {lab.logo ? (
                                <img src={lab.logo} alt={lab.name} className="w-full h-full object-cover" />
                              ) : (
                                lab.name.charAt(0)
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{lab.name}</span>
                          </div>
                        </td>
                        <td className="p-6">{lab.totalRevenue.toLocaleString()} د.ع</td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                            {lab.commissionPercentage}%
                          </span>
                        </td>
                        <td className="p-6 font-bold text-green-600">
                          {((lab.totalRevenue * lab.commissionPercentage) / 100).toLocaleString()} د.ع
                        </td>
                        <td className="p-6 text-center">
                          <Button size="sm" variant="outline" onClick={() => openCommissionModal(lab)}>
                            تعديل النسبة
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {activeTab === 'requests' && (
            <LabOrdersTab />
          )}
        </div>
      </div>

      {/* Commission Modal */}
      <AdminModal
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        title="تعديل نسبة عمولة المنصة"
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg flex gap-3">
            <AlertOctagon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700">تغيير نسبة العمولة سيطبق على الطلبات الجديدة فقط. الطلبات السابقة ستبقى على النسبة القديمة.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نسبة العمولة (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full p-2 border rounded-lg"
              value={newCommissionRate}
              onChange={(e) => setNewCommissionRate(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowCommissionModal(false)}>إلغاء</Button>
            <Button onClick={handleUpdateCommission}>حفظ التغييرات</Button>
          </div>
        </div>
      </AdminModal>

      {/* Suspension Modal */}
      <AdminModal
        isOpen={showSuspensionModal}
        onClose={() => setShowSuspensionModal(false)}
        title="تأكيد تعليق المختبر"
      >
        <div className="space-y-4">
          <p className="text-gray-600">هل أنت متأكد من تعليق حساب المختبر <strong>{selectedLab?.name}</strong>؟</p>
          <textarea
            className="w-full border rounded-lg p-3 h-32"
            placeholder="يرجى كتابة سبب التعليق..."
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowSuspensionModal(false)}>إلغاء</Button>
            <Button className="bg-red-600 text-white" onClick={handleSuspendLab}>تأكيد التعليق</Button>
          </div>
        </div>
      </AdminModal>

      {/* Lab Details Modal - Enhanced */}
      <LabDetailsModal
        lab={selectedLab}
        isOpen={showLabModal}
        onClose={() => setShowLabModal(false)}
        onUpdateStatus={async (id, status, reason) => {
          if (status === 'active') handleActivateLab({ id } as any);
          else if (status === 'pending' || status === 'suspended') {
            handleDeactivateLab(id);
          }
          setShowLabModal(false);
        }}
        onClearCommission={async (labId) => {
          if (selectedLab) {
            const success = await clearCommission(labId);
            if (success) {
              toast.success('تم تصفية العمولة بنجاح');
              // Don't close modal so user can see the updated "Settlements" tab
            } else {
              toast.error('فشل تصفية العمولة أو لا يوجد رصيد');
            }
          }
        }}
      />

    </div>
  );
};
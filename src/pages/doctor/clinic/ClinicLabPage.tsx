import React, { useState, useMemo, useEffect } from 'react';
import {
  Trash2, Plus, FileText, Phone, MapPin, Star, Clock, CheckCircle, Activity, Users, Send, Paperclip, Stethoscope, Search, Filter,
  Eye, Grid3X3, List, RefreshCw, Truck, X, MessageCircle, AlertTriangle, LayoutDashboard, Calendar, Shield
} from 'lucide-react';
import { DoctorLabChat } from '@/components/lab/DoctorLabChat';
import { useNavigate } from 'react-router-dom';

// Import Components
import {
  LabMainCard,
  LabRequestsTable
} from '../../../components/lab';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { AddManualLabModal } from './sections/components/AddManualLabModal';
import { CreateOrderModal } from './sections/components/CreateOrderModal';
import { useClinicLabs } from '../../../hooks/useClinicLabs';

import { LabCaseDetails } from '../../../components/lab/LabCaseDetails';

import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';

// Keep DentalLabRequest for table compatibility if needed, or import from types
import {
  type DentalLabRequest
} from '../../../data/mock/assets';
import { type ClinicLab } from '../../../hooks/useClinicLabs';
import { toast } from 'sonner';

// Hook
import { useLabOrders, LabOrder } from '../../../hooks/useLabOrders';
import { useClinics } from '../../../hooks/useClinics';
import { useLabs } from '../../../hooks/useLabs';
import { useFinance } from '../../../hooks/useFinance';
import { supabase } from '../../../lib/supabase';
import { formatLocation } from '../../../utils/location';

interface ClinicLabPageProps {
  clinicId?: string;
}

export default function ClinicLabPage({ clinicId }: ClinicLabPageProps) {
  const navigate = useNavigate();
  // State
  const [activeSubTab, setActiveSubTab] = useState('case-management');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddCustomLabModal, setShowAddCustomLabModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');

  // New State for Lab Case Details Modal
  const [showCaseManagementModal, setShowCaseManagementModal] = useState(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<DentalLabRequest | null>(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [selectedLabForOrder, setSelectedLabForOrder] = useState<any>(null); // Lab to order from

  // Lab Profile State
  const [selectedLabForProfile, setSelectedLabForProfile] = useState<ClinicLab | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Data Loading from Hook
  const { orders, loading, refresh, updateOrderStatus, fetchOrders, deleteOrder } = useLabOrders({ clinicId });
  const { labs: allLabs, loading: labsLoading, refresh: refreshLabs, toggleFavorite } = useClinicLabs(clinicId || '');

  // Split Labs
  const platformLabs = useMemo(() => {
    return allLabs.filter(l => !l.isCustom && (
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.address.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [allLabs, searchQuery]);

  const savedLabsDisplay = useMemo(() => {
    return allLabs.filter(l => (l.isCustom || l.isFavorite) && (
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [allLabs, searchQuery]);

  // Clinic Context
  const { clinics } = useClinics();
  const currentClinic = clinics.find(c => c.id === clinicId);
  const clinicName = currentClinic?.name || 'عيادتي';

  const handleSaveLabToFavorites = async (lab: ClinicLab) => {
    await toggleFavorite(lab.id);
    if (lab.isFavorite) {
      toast.success(`تم إزالة "${lab.name}" من المفضلة`);
    } else {
      toast.success(`تم حفظ مختبر "${lab.name}" إلى قائمة مختبراتك المفضلة بنجاح`);
    }
  };

  // Refresh Handler
  const handleRefresh = async () => {
    refresh();
    refreshLabs();
  };

  const handleDeleteLab = (labId: string) => {
    toast('هل أنت متأكد من حذف هذا المختبر؟', {
      action: {
        label: 'حذف',
        onClick: async () => {
          try {
            const { error } = await supabase
              .from('clinic_custom_labs')
              .delete()
              .eq('id', labId);

            if (error) throw error;

            toast.success('تم حذف المختبر بنجاح');
            setSelectedLabForProfile(null);
            refreshLabs();
          } catch (err) {
            console.error('Error deleting lab:', err);
            toast.error('حدث خطأ أثناء حذف المختبر');
          }
        }
      },
      cancel: {
        label: 'إلغاء',
        onClick: () => { }
      }
    });
  };

  // Map LabOrder to DentalLabRequest for UI compatibility
  const requests = useMemo(() => {
    const mappedOrders = orders.map(order => {
      const isCustom = !order.laboratory_id;
      // Use real lab name from joined data, fallback to custom lab name
      const finalLabName = order.lab_name || (isCustom ? (order.custom_lab_name || 'مختبر خاص') : 'مختبر منصة');

      return {
        id: order.id,
        patientName: order.patient_name,
        patientId: order.patient_id || 'P-000',
        doctorName: order.doctor_name || 'غير محدد',
        testType: order.service_name,
        priority: order.priority as any,
        status: order.status as any,
        labName: finalLabName,
        expectedDate: order.expected_delivery_date || new Date(order.order_date).toISOString().split('T')[0],
        createdAt: new Date(order.order_date).toISOString().split('T')[0],
        sentDate: new Date(order.order_date).toISOString().split('T')[0],
        price: order.final_amount,
        notes: order.notes,
        paymentStatus: ((order.final_amount > 0 && (order.paid_amount || 0) >= order.final_amount) ? 'paid' : 'unpaid') as 'paid' | 'unpaid' | 'partial',
        paymentAmount: order.paid_amount || 0,
        clinicName: order.clinic_name || 'عيادتي',
        delegate_id: order.delegate_id,
        delegate_name: order.delegate_name,
        pickup_delegate_id: order.pickup_delegate_id,
        pickup_delegate_name: order.pickup_delegate_name,
        pickup_delegate_phone: order.pickup_delegate_phone,
        delivery_delegate_id: order.delivery_delegate_id,
        delivery_delegate_name: order.delivery_delegate_name,
        delivery_delegate_phone: order.delivery_delegate_phone,
        return_reason: order.return_reason,
        is_return_cycle: order.is_return_cycle,
        isCustomLab: isCustom,
        laboratoryId: order.laboratory_id,
        rating: order.rating,
        review_note: order.review_note,
        // Satisfy LabRequest interface for Table
        expectedDelivery: order.expected_delivery_date || '',
        sampleCollected: false,
      };
    });

    return [...mappedOrders];
  }, [orders, allLabs]);

  // Filter Logic
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch =
        req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.testType.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [requests, searchQuery]);

  // Handlers
  const handleViewRequestDetails = (request: DentalLabRequest) => {
    setSelectedRequestForDetails(request);
    setShowCaseManagementModal(true);
  };

  const handleUpdateRequestStatus = (id: string, newStatus: string, updates?: any) => {
    // Convert camelCase to snake_case for DB
    const dbUpdates: any = {};
    if (updates?.paymentAmount !== undefined) dbUpdates.paid_amount = updates.paymentAmount;
    if (updates?.expectedDate !== undefined) dbUpdates.expected_delivery_date = updates.expectedDate;
    if (updates?.return_reason !== undefined) dbUpdates.return_reason = updates.return_reason;
    if (updates?.is_return_cycle !== undefined) dbUpdates.is_return_cycle = updates.is_return_cycle;
    if (updates?.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates?.review_note !== undefined) dbUpdates.review_note = updates.review_note;
    if (updates?.modification_note !== undefined) dbUpdates.modification_note = updates.modification_note;

    updateOrderStatus(id, newStatus, dbUpdates);

    // Optimistically update local state if needed, or let the hook handle it (hook updates 'orders')
    // We also need to update 'selectedRequestForDetails' so the modal updates immediately
    if (selectedRequestForDetails && selectedRequestForDetails.id === id) {
      setSelectedRequestForDetails({
        ...selectedRequestForDetails,
        status: newStatus as any,
        ...updates,
        // Map back for local view
        paymentAmount: updates?.paymentAmount !== undefined ? updates.paymentAmount : selectedRequestForDetails.paymentAmount,
        expectedDate: updates?.expectedDate !== undefined ? updates.expectedDate : selectedRequestForDetails.expectedDate
      });
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.')) {
      if (deleteOrder) {
        await deleteOrder(id);
      }
    }
  };

  const handleAddRequest = () => {
    setShowAddOrderModal(true);
  };

  // ========== NEW HANDLERS ==========
  // Handle Payment Status Change
  const handlePaymentStatusChange = async (orderId: string, status: 'paid' | 'unpaid' | 'partial') => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const paidAmount = status === 'paid' ? order.final_amount : 0;

      const { error } = await supabase
        .from('dental_lab_orders')
        .update({
          paid_amount: paidAmount,
          payment_status: status
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(status === 'paid' ? 'تم تأكيد التسديد' : 'تم تحديث حالة الدفع');
      refresh();
    } catch (err) {
      console.error('Error updating payment:', err);
      toast.error('حدث خطأ أثناء تحديث حالة الدفع');
    }
  };

  // Handle Rating
  const handleRating = async (orderId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('dental_lab_orders')
        .update({
          rating: rating,
          status: 'completed'
        })
        .eq('id', orderId);

      if (error) throw error;

      // Also update lab average rating if we have lab_id
      const order = orders.find(o => o.id === orderId);
      if (order?.laboratory_id) {
        // Get current lab ratings and update average
        const { data: labData } = await supabase
          .from('dental_laboratories')
          .select('rating, total_ratings')
          .eq('id', order.laboratory_id)
          .single();

        if (labData) {
          const totalRatings = (labData.total_ratings || 0) + 1;
          const newAverage = ((labData.rating || 0) * (totalRatings - 1) + rating) / totalRatings;

          await supabase
            .from('dental_laboratories')
            .update({
              rating: Math.round(newAverage * 10) / 10,
              total_ratings: totalRatings
            })
            .eq('id', order.laboratory_id);
        }
      }

      toast.success(`تم التقييم بنجاح!(${rating} / 5)`);
      refresh();
    } catch (err) {
      console.error('Error rating order:', err);
      toast.error('حدث خطأ أثناء حفظ التقييم');
    }
  };

  // Handle Add Expense - Opens finance page with pre-filled data
  const handleAddExpense = (request: any) => {
    // Navigate to finance page with expense pre-fill data in state
    navigate('/clinic/finance', {
      state: {
        openExpenseModal: true,
        prefillData: {
          category: 'دفعات مختبر (طلب)',
          amount: request.price || 0,
          description: `دفعة لطلب مختبر: ${request.testType} - ${request.patientName} `,
          orderId: request.id,
          labName: request.labName,
          patientName: request.patientName,
          doctorName: request.doctorName
        }
      }
    });
  };
  // ========== END NEW HANDLERS ==========

  // Stats Calculation
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => ['pending', 'waiting_for_representative'].includes(r.status)).length;
    const inProgress = requests.filter(r => ['in_progress', 'representative_dispatched', 'in-progress'].includes(r.status)).length;
    const ready = requests.filter(r => ['completed', 'out_for_delivery'].includes(r.status)).length;
    const completed = requests.filter(r => r.status === 'delivered').length;
    const returned = requests.filter(r => r.status === 'returned' || r.status === 'modification_requested').length;
    const cancelled = requests.filter(r => ['cancelled', 'rejected'].includes(r.status)).length;

    const today = new Date().toISOString().split('T')[0];
    const overdue = requests.filter(r => {
      const isTerminal = ['delivered', 'cancelled', 'rejected', 'returned', 'completed'].includes(r.status);
      return !isTerminal && r.expectedDelivery && r.expectedDelivery < today;
    }).length;

    return { total, pending, inProgress, ready, completed, returned, cancelled, overdue };
  }, [requests]);

  const renderCaseManagementTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">طلبات معامل الاسنان</h2>
          <p className="text-gray-500">متابعة جميع الحالات المرسلة لمعامل الاسنان</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className={`w - 4 h - 4 ${loading ? 'animate-spin' : ''} `} />
            تحديث
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAddCustomLabModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة معمل
          </Button>
          <Button
            onClick={handleAddRequest}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            طلب معامل
          </Button>
        </div>
      </div>

      {/* Stats Cards - Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BentoStatCard
          title="إجمالي الطلبات"
          value={stats.total}
          icon={FileText}
          color="blue"
          delay={0}
        />
        <BentoStatCard
          title="في الانتظار"
          value={stats.pending}
          icon={Clock}
          color="amber"
          delay={100}
        />
        <BentoStatCard
          title="جاري العمل"
          value={stats.inProgress}
          icon={Activity}
          color="indigo"
          delay={200}
        />
        <BentoStatCard
          title="جاهز للاستلام"
          value={stats.ready}
          icon={Truck}
          color="purple"
          delay={300}
        />
        <BentoStatCard
          title="مكتمل"
          value={stats.completed}
          icon={CheckCircle}
          color="emerald"
          delay={400}
        />
        <BentoStatCard
          title="مرتجع / تعديل"
          value={stats.returned}
          icon={AlertTriangle}
          color="orange"
          delay={500}
        />
        <BentoStatCard
          title="ملغي"
          value={stats.cancelled}
          icon={X}
          color="slate"
          delay={600}
        />
        <BentoStatCard
          title="متأخر"
          value={stats.overdue}
          icon={Clock}
          color="red"
          delay={700}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <LabRequestsTable
          requests={filteredRequests}
          onViewDetails={(id) => {
            const req = requests.find(r => r.id === id);
            if (req) handleViewRequestDetails(req);
          }}
          onUpdateStatus={handleUpdateRequestStatus}
          onDelete={handleDeleteRequest}
          onPaymentStatusChange={handlePaymentStatusChange}
          onRating={handleRating}
          onAddExpense={handleAddExpense}
        />
      </div>
    </div>
  );

  const renderSavedLabsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">معامل الاسنان المحفوظة</h2>
          <p className="text-gray-600 mt-1">قائمة المعامل المفضلة والمخصصة</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddCustomLabModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة معمل
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : ''}
          >
            <Grid3X3 className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-purple-100 text-purple-600' : ''}
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <LabMainCard
        title=""
        search={{
          show: true,
          placeholder: 'البحث في المعامل...',
          onSearch: setSearchQuery
        }}
        actions={[
          { type: 'refresh', onClick: handleRefresh },
          { type: 'settings', onClick: () => { } }
        ]}
      >
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {savedLabsDisplay.map((lab) => (
            <div key={lab.id} className="group relative bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col">
              {/* Card Header Background - Distinct for Custom */}
              <div className={`absolute top - 0 left - 0 w - full h - 24 opacity - 50 group - hover: opacity - 100 transition - opacity ${lab.isCustom
                ? 'bg-gradient-to-br from-gray-50 to-gray-100'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50/50'
                } `}
              />

              <div className="p-5 relative z-10 flex-1 flex flex-col">
                {/* Image & Badge Column */}
                <div className="flex flex-col gap-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden ${lab.isCustom
                    ? 'bg-gray-100 border border-gray-200 text-gray-500'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-600 text-white shadow-blue-200'
                    }`}>
                    {lab.logo ? (
                      <img src={lab.logo} alt={lab.name} className="w-full h-full object-cover" />
                    ) : (
                      lab.name.charAt(0)
                    )}
                  </div>

                  {/* Verified + Rating badges in one row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!lab.isCustom && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">
                        <CheckCircle className="w-3 h-3" />
                        موثوق
                      </span>
                    )}
                    {lab.isCustom && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                        يدوي
                      </span>
                    )}
                    {!lab.isCustom && (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span className="text-[10px] font-bold text-amber-700">{lab.rating || 4.5}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold text-lg text-gray-900 flex items-center gap-1.5 mb-1 group-hover:text-blue-600 transition-colors">
                    {lab.name}
                    {!lab.isCustom && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {lab.address}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {lab.specialties.slice(0, 3).map(s => (
                    <span key={s} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-medium rounded-md border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors">
                      {s}
                    </span>
                  ))}
                </div>

                {!lab.isCustom && (
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-auto bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {lab.responseTime || '24h'}</span>
                    <div className="h-3 w-[1px] bg-gray-300" />
                    <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-gray-400" /> توصيل</span>
                  </div>
                )}
              </div>

              <div className="p-4 pt-0 mt-auto flex gap-2 relative z-10">
                <Button
                  className="flex-1 hover:border-blue-200 hover:bg-blue-50 text-gray-700"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLabForProfile(lab)}
                >
                  <Eye className="w-4 h-4 ml-1.5" />
                  التفاصيل
                </Button>
                <Button
                  className="flex-1 bg-gray-900 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all"
                  size="sm"
                  onClick={() => {
                    setSelectedLabForOrder(lab);
                    setShowAddOrderModal(true);
                  }}
                >
                  طلب
                </Button>
              </div>
            </div>
          ))}
        </div>
      </LabMainCard >
    </div >
  );

  const renderPlatformLabsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">معامل المنصة</h2>
          <p className="text-gray-600 mt-1">تصفح واعتماد أفضل المعامل الموثوقة في المنصة</p>
        </div>
        <div className="flex gap-2">
          {/* Governorate Filter */}
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="pl-4 pr-9 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none h-10 text-sm"
            >
              <option value="all">كل المحافظات</option>
              <option value="بغداد">بغداد</option>
              <option value="البصرة">البصرة</option>
              <option value="النجف">النجف</option>
              <option value="أربيل">أربيل</option>
              <option value="كربلاء">كربلاء</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : ''}
          >
            <Grid3X3 className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-purple-100 text-purple-600' : ''}
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <LabMainCard
        title=""
        search={{
          show: true,
          placeholder: 'البحث في معامل المنصة...',
          onSearch: setSearchQuery
        }}
        actions={[
          { type: 'refresh', onClick: handleRefresh }
        ]}
      >
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {labsLoading ? (
            <div className="col-span-full py-12 text-center text-gray-500">جاري التحميل...</div>
          ) : platformLabs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">لا توجد معامل متاحة</div>
          ) : (
            platformLabs
              .filter(l => selectedGovernorate === 'all' || l.governorate === selectedGovernorate)
              .map((lab) => (
                <div key={lab.id} className="group relative bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-50 to-indigo-50/50 opacity-50 group-hover:opacity-100 transition-opacity" />

                  {/* Removed Top-Right Badge */}

                  <div className="p-5 relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                          {lab.logo ? (
                            <img src={lab.logo} alt={lab.name} className="w-full h-full object-cover" />
                          ) : (
                            lab.name.charAt(0)
                          )}
                        </div>

                        {/* Verified Badge Below Image */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          موثوق
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-amber-100 shadow-sm">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                        <span className="text-xs font-bold text-gray-700">{lab.rating || 4.8}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold text-lg text-gray-900 flex items-center gap-1.5 mb-1 group-hover:text-blue-600 transition-colors">
                        {lab.name}
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {formatLocation(lab.governorate, lab.address) || 'لم يُحدد الموقع'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {lab.specialties.slice(0, 3).map(s => (
                        <span key={s} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-medium rounded-md border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mt-auto bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> استجابة: سريع</span>
                      <div className="h-3 w-[1px] bg-gray-300" />
                      <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-gray-400" /> توصيل مجاني</span>
                    </div>
                  </div>

                  <div className="p-4 pt-0 mt-auto flex gap-2 relative z-10">
                    <Button
                      className="flex-1 hover:border-blue-200 hover:bg-blue-50 text-gray-700"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLabForProfile(lab)}
                    >
                      <Eye className="w-4 h-4 ml-1.5" />
                      الملف
                    </Button>
                    <Button
                      className={`flex - 1 shadow - md transition - all duration - 200 ${lab.isFavorite
                        ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        : 'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:shadow-green-200'
                        } `}
                      size="sm"
                      onClick={() => handleSaveLabToFavorites(lab)}
                    >
                      {lab.isFavorite ? 'تم الإدراج' : 'حفظ'}
                      {lab.isFavorite ? <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                    </Button>
                    <Button className="flex-1 bg-gray-900 hover:bg-blue-600 transition-colors shadow-md" size="sm" onClick={() => { setSelectedLabForOrder(lab); setShowAddOrderModal(true); }}>طلب</Button>
                  </div>
                </div>
              )))}
        </div>
      </LabMainCard>
    </div>
  );

  // Finance Hook
  const { addTransaction } = useFinance(clinicId);

  const handleAddToExpenses = async (caseData: any) => {
    // Determine expense category name based on lab type
    const expenseType = caseData.isCustomLab ? 'مختبر خارجي' : 'مختبر منصة';

    try {
      await addTransaction({
        amount: caseData.price || 0,
        type: 'expense',
        category: 'lab', // Must match category in useFinance/DB
        description: `طلبات مختبر(${expenseType}): ${caseData.testType} - المريض: ${caseData.patientName} `,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash' // Default
      });

      toast.success(`تم إضافة المصروف بنجاح: \nالقيمة: ${caseData.price?.toLocaleString()} د.ع`);
    } catch (err) {
      console.error('Failed to add expense:', err);
      toast.error('حدث خطأ أثناء إضافة المصروف');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8" dir="rtl">
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

        {/* Main Navigation Tabs */}
        <div className="flex gap-6 border-b border-gray-100">
          <button
            onClick={() => setActiveSubTab('case-management')}
            className={`pb - 4 px - 2 font - medium transition - colors relative ${activeSubTab === 'case-management' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
          >
            طلبات معامل الاسنان
            {activeSubTab === 'case-management' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveSubTab('saved-labs')}
            className={`pb - 4 px - 2 font - medium transition - colors relative ${activeSubTab === 'saved-labs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
          >
            معامل الاسنان المحفوظة
            {activeSubTab === 'saved-labs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveSubTab('platform-labs')}
            className={`pb - 4 px - 2 font - medium transition - colors relative ${activeSubTab === 'platform-labs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
          >
            معامل المنصة
            {activeSubTab === 'platform-labs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeSubTab === 'case-management' && renderCaseManagementTab()}
        {activeSubTab === 'saved-labs' && renderSavedLabsTab()}
        {activeSubTab === 'platform-labs' && renderPlatformLabsTab()}
      </div>

      {/* Modals */}
      {showCaseManagementModal && selectedRequestForDetails && (
        <LabCaseDetails
          caseId={selectedRequestForDetails.id}
          isOpen={showCaseManagementModal}
          onClose={() => setShowCaseManagementModal(false)}
          onUpdateStatus={handleUpdateRequestStatus}
          isManualManagement={(selectedRequestForDetails as any).isCustomLab}
          onAddToExpenses={handleAddToExpenses}
          caseData={{
            ...selectedRequestForDetails,
            // Enhance with actual lab details if it matches a custom lab
            ...(() => {
              const isCustom = (selectedRequestForDetails as any).isCustomLab;
              if (isCustom) {
                // Try to find the custom lab object to get address/phone
                const matchedLab = allLabs.find(l => l.isCustom && l.name === selectedRequestForDetails.labName);
                if (matchedLab) {
                  return {
                    labAddress: formatLocation(matchedLab.governorate, matchedLab.address),
                    labContact: matchedLab.phone
                  };
                }
              }
              return {
                labAddress: 'لم يُحدد العنوان',
                labContact: 'لم يُحدد الهاتف'
              };
            })(),
            remainingAmount: (selectedRequestForDetails.price || 0) - (selectedRequestForDetails.paymentAmount || 0),
            costBreakdown: { material: (selectedRequestForDetails.price || 0) * 0.4, labor: (selectedRequestForDetails.price || 0) * 0.6 }
          }}
        />
      )}

      {/* Add Custom Lab Modal */}
      <AddManualLabModal
        isOpen={showAddCustomLabModal}
        onClose={() => setShowAddCustomLabModal(false)}
        clinicId={clinicId || ''}
        onSuccess={() => {
          refreshLabs();
          setShowAddCustomLabModal(false);
        }}
      />
      {/* Lab Profile Modal */}
      {selectedLabForProfile && (
        <Modal
          isOpen={!!selectedLabForProfile}
          onClose={() => setSelectedLabForProfile(null)}
          title={`ملف المختبر: ${selectedLabForProfile.name} `}
          size="lg"
        >
          <LabProfileContent
            lab={selectedLabForProfile}
            clinicName={clinicName}
            clinicId={clinicId || ''}
            onClose={() => setSelectedLabForProfile(null)}
            onRequest={() => {
              setSelectedLabForOrder(selectedLabForProfile);
              setShowAddOrderModal(true);
            }}
            onDelete={() => handleDeleteLab(selectedLabForProfile.id)}
            requests={requests}
            onViewDetails={handleViewRequestDetails}
            onUpdateStatus={handleUpdateRequestStatus}
            onDeleteRequest={handleDeleteRequest}
            onAddOrder={() => {
              setSelectedLabForOrder(selectedLabForProfile);
              setShowAddOrderModal(true);
            }}
          />
        </Modal>
      )}

      {/* Add Order Modal linked to selected lab */}
      {(showAddOrderModal) && (
        <CreateOrderModal
          isOpen={showAddOrderModal}
          onClose={() => {
            setShowAddOrderModal(false);
            setSelectedLabForOrder(null);
          }}
          clinicId={clinicId || ''}
          lab={selectedLabForOrder || null}
        />
      )}

    </div>
  );
};

// Extracted Component for Lab Profile Content to handle Tabs State
const LabProfileContent: React.FC<{
  lab: ClinicLab;
  clinicName: string;
  clinicId: string;
  onClose: () => void;
  onRequest: () => void;
  onDelete: () => void;
  requests: DentalLabRequest[];
  onViewDetails: (req: DentalLabRequest) => void;
  onUpdateStatus: (id: string, status: string, updates?: any) => void;
  onDeleteRequest: (id: string) => void;
  onAddOrder: () => void; // Added onAddOrder prop
}> = ({ lab, clinicName, clinicId, onClose, onRequest, onDelete, requests, onViewDetails, onUpdateStatus, onDeleteRequest, onAddOrder }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'financial' | 'contact'>('overview');

  // Filter orders for this specific lab for the 'orders' tab
  const filteredLabRequests = useMemo(() => {
    return requests.filter(req => {
      if (lab.isCustom) {
        return req.isCustomLab;
      } else {
        return !req.isCustomLab && req.laboratoryId === lab.id;
      }
    }).map(req => ({
      id: req.id,
      patientName: req.patientName,
      patientId: req.patientId || 'N/A',
      doctorName: req.doctorName,
      testType: req.testType,
      priority: req.priority as any,
      status: req.status as any,
      createdAt: req.createdAt,
      expectedDelivery: req.expectedDate || '',
      sampleCollected: true,
      price: req.price,
      paymentAmount: req.paymentAmount,
      paymentStatus: req.paymentStatus as any,
      labName: req.labName,
      delegateName: req.delegate_name
    }));
  }, [requests, lab]);

  // Financial Stats Calculation (Top Level - Unconditional)
  const { totalPaid, totalDue } = useMemo(() => {
    const paid = filteredLabRequests.reduce((sum, req) => sum + (req.paymentAmount || 0), 0);
    const cost = filteredLabRequests.reduce((sum, req) => sum + (req.price || 0), 0);
    return { totalPaid: paid, totalDue: cost - paid };
  }, [filteredLabRequests]);

  // Fetch Real Lab Details (Delegates & Services)
  const [delegates, setDelegates] = useState<any[]>([]);
  const [labServices, setLabServices] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (lab.isCustom) return; // Skip for custom labs for now as they might not have linked delegates

      try {
        setLoadingDetails(true);
        // 1. Fetch Delegates
        const { data: delegatesData } = await supabase
          .from('dental_lab_representatives')
          .select('*')
          .eq('lab_id', lab.id);

        if (delegatesData) setDelegates(delegatesData);

        // 2. Fetch Services from dynamic table
        const { data: servicesData } = await supabase
          .from('lab_services')
          .select('*')
          .eq('lab_id', lab.id)
          .eq('is_active', true)
          .order('name');

        if (servicesData) {
          // Map dynamic services to the format expected by the UI
          const mappedServices = servicesData.map(s => ({
            name: s.name,
            price: s.base_price,
            time_estimate: s.estimated_time || '24'
          }));
          setLabServices(mappedServices);
        }

      } catch (err) {
        console.error('Error fetching lab details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [lab.id, lab.isCustom]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-3xl overflow-hidden">
          {lab.logo ? (
            <img src={lab.logo} alt={lab.name} className="w-full h-full object-cover" />
          ) : (
            lab.name.charAt(0)
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-gray-900">{lab.name}</h3>
            {lab.isAccredited && <CheckCircle className="w-6 h-6 text-blue-500 fill-white" />}
          </div>
          <div className="flex items-center gap-6 mt-2">
            <p className="text-gray-500 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {formatLocation(lab.governorate, lab.address) || 'لم يُحدد الموقع'}
            </p>
            {lab.phone && (
              <p className="text-gray-500 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span dir="ltr" className="font-semibold">{lab.phone}</span>
              </p>
            )}
          </div>
          {!lab.isCustom && (
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-bold text-yellow-800">{lab.rating}</span>
                <span className="text-xs text-yellow-600">({lab.reviewCount} تقييم)</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-gray-600 text-sm font-medium">
                <Clock className="w-4 h-4" />
                وقت الاستجابة: {lab.responseTime}
              </div>
              {lab.establishmentYear && (
                <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full text-purple-700 text-sm font-medium border border-purple-100">
                  <Calendar className="w-4 h-4" />
                  تأسس: {lab.establishmentYear}
                </div>
              )}
              {lab.licenseNumber && (
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium border border-blue-100">
                  <Shield className="w-4 h-4" />
                  الترخيص: {lab.licenseNumber}
                </div>
              )}
              {lab.isVerified && (
                <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-700 text-sm font-bold border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  معتمد
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb - 3 px - 2 font - medium transition - colors relative ${activeTab === 'overview' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
        >
          نظرة عامة
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
        </button>

        {/* Orders Tab: Show if Saved (Platform) OR Manual */}
        {(lab.isFavorite || lab.isCustom) && (
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb - 3 px - 2 font - medium transition - colors relative ${activeTab === 'orders' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
          >
            الطلبات
            {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        )}

        {/* Finance Tab: Show if Saved (Platform) OR Manual */}
        {(lab.isFavorite || lab.isCustom) && (
          <button
            onClick={() => setActiveTab('financial')}
            className={`pb - 3 px - 2 font - medium transition - colors relative ${activeTab === 'financial' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
          >
            المالية
            {activeTab === 'financial' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        )}

        {/* Contact Tab: Show ONLY if Platform AND Saved */}
        {(!lab.isCustom && lab.isFavorite) && (
          <button
            onClick={() => setActiveTab('contact')}
            className={`pb - 3 px - 2 font - medium transition - colors relative ${activeTab === 'contact' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} `}
          >
            التواصل
            {activeTab === 'contact' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  خدمات وتخصصات
                </h4>
                <div className="flex flex-wrap gap-2">
                  {lab.specialties.map(spec => (
                    <span key={spec} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {!lab.isCustom ? (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    ساعات العمل
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700">
                    {lab.workingHours}
                  </div>
                </div>
              ) : (
                // Contact Info for Manual Labs
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    معلومات التواصل
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span dir="ltr">{lab.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{lab.address}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!lab.isCustom && (
              <>
                {/* Delegates Section - Real Data */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      المندوبين
                    </h4>
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {delegates.length} مندوب
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {loadingDetails ? (
                      <div className="p-4 text-center text-gray-400 text-sm">جارِ تحميل المندوبين...</div>
                    ) : delegates.length > 0 ? (
                      delegates.map(delegate => (
                        <div key={delegate.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{delegate.name}</p>
                              <p className="text-xs text-gray-500" dir="ltr">{delegate.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline - flex items - center gap - 1.5 px - 2 py - 0.5 rounded - full text - xs font - medium ${delegate.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              } `}>
                              <span className={`w - 1.5 h - 1.5 rounded - full ${delegate.status === 'active' ? 'bg-green-500' : 'bg-gray-400'} `} />
                              {delegate.status === 'active' ? 'نشط' : 'غير متاح'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        لا يوجد مندوبين مسجلين حالياً
                      </div>
                    )}
                  </div>
                </div>

                {/* Price List Preview */}
                <div className="border rounded-xl overflow-hidden mt-4">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-gray-700 flex justify-between items-center">
                    <span>قائمة الأسعار والخدمات</span>
                    <span className="text-xs font-normal text-gray-500 bg-white border px-2 py-1 rounded-md">
                      {labServices.length} خدمة
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    {loadingDetails ? (
                      <div className="p-4 text-center text-gray-400 text-sm">جارِ تحميل قائمة الأسعار...</div>
                    ) : labServices.length > 0 ? (
                      labServices.map((service, idx) => (
                        <div key={idx} className="flex justify-between p-3 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.time_estimate || 24} ساعة
                            </p>
                          </div>
                          <span className="font-bold text-blue-600">{Number(service.price).toLocaleString()} د.ع</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        لا توجد خدمات مسجلة
                      </div>
                    )}
                  </div>
                </div>

                {/* Working Hours Section - Below Price List */}
                <div className="border rounded-xl overflow-hidden mt-4">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100 font-bold text-gray-700 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span>ساعات العمل</span>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-gray-700">{lab.workingHours || '8:00 ص - 6:00 م (السبت - الخميس)'}</p>
                  </div>
                </div>
              </>
            )}
            {/* Removed the empty 'Additional info' block since we now show phone */}
          </div>
        )}

        {activeTab === 'orders' && (lab.isFavorite || lab.isCustom) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-900">سجل الطلبات</h4>
              <Button size="sm" onClick={onAddOrder} className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="w-4 h-4 ml-1" />
                طلب جديد
              </Button>
            </div>

            {filteredLabRequests && filteredLabRequests.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <LabRequestsTable
                  requests={filteredLabRequests}
                  onViewDetails={(id) => {
                    const req = requests.find(r => r.id === id);
                    if (req) onViewDetails(req);
                  }}
                  onUpdateStatus={onUpdateStatus as any}
                  onDelete={onDeleteRequest}
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">لا توجد طلبات سابقة</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                  لم يتم تسجيل أي طلبات لهذا المختبر حتى الآن. يمكنك إنشاء طلب جديد الآن.
                </p>
                <Button onClick={onAddOrder} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة طلب جديد
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-sm text-green-600 mb-1">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-green-700">{totalPaid.toLocaleString()} د.ع</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-sm text-red-600 mb-1">المستحقات المتبقية</p>
                <p className="text-2xl font-bold text-red-700">{totalDue.toLocaleString()} د.ع</p>
              </div>
            </div>
            {filteredLabRequests.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                لا توجد حركات مالية مسجلة
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 h-[500px] flex flex-col bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <DoctorLabChat labId={lab.id} labName={lab.name} labLogo={lab.logo} clinicId={clinicId} />
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 pt-6 border-t flex-wrap sm:flex-nowrap">
        {lab.isCustom && (
          <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" onClick={onDelete}>
            <Trash2 className="w-4 h-4 ml-2" />
            حذف
          </Button>
        )}
        <Button variant="outline" className="flex-1" onClick={onClose}>
          إغلاق
        </Button>
        {lab.phone && (
          <a
            href={`tel:${lab.phone}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 transition-colors border rounded-md shadow-sm text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
          >
            <Phone className="w-4 h-4 ml-1" />
            اتصال
          </a>
        )}
        <Button className="flex-1" onClick={onRequest}>
          طلب من هذا المختبر
        </Button>
      </div>
    </div>
  );
};
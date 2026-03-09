import React, { useState } from 'react';
import { AdminTable, Column } from '../../../components/admin/AdminTable';
import { AdminModal, FormModal, ConfirmDeleteModal } from '../../../components/admin/AdminModal';
import { StatsCard } from '../../../components/admin/StatsCard';
import {
  CreditCard,
  Package,
  Users,
  DollarSign,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin,
  Download,
  Phone,
  MessageCircle,
  Ticket,
  Trash2,
  Wallet,
  Banknote,
  QrCode
} from 'lucide-react';
import { useAdminSubscriptions } from '../../../hooks/useAdminSubscriptions';
import { SubscriptionReviewModal } from '../components/SubscriptionReviewModal';
import { OwnerDetailsModal } from '../components/OwnerDetailsModal';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export const SubscriptionsSection: React.FC = () => {
  const { plans, requests, coupons, loading, addPlan, updatePlan, deletePlan, approveRequest, rejectRequest, addCoupon, deleteCoupon } = useAdminSubscriptions();

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('requests');

  // Owner Details State
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

  // أعمدة جدول خطط الاشتراك
  const planColumns: Column[] = [
    {
      key: 'name',
      title: 'اسم الباقة',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-semibold">{value}</div>
          <div className="text-sm text-gray-500">{record.nameEn}</div>
        </div>
      )
    },
    {
      key: 'price',
      title: 'السعر',
      sortable: true,
      render: (value, record) => (
        <div className="font-semibold text-green-600">
          {(typeof value === 'object' ? value.monthly : value)?.toLocaleString()} دينار / {record.duration === 'monthly' ? 'شهر' : 'سنة'}
        </div>
      )
    },
    {
      key: 'duration',
      title: 'المدة',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {value === 'monthly' ? 'شهرية' : 'سنوية'}
        </span>
      )
    }
  ];

  // أعمدة جدول طلبات الاشتراك
  const requestColumns: Column[] = [
    {
      key: 'doctorName',
      title: 'اسم الطبيب',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
            {record.avatar_url ? (
              <img src={record.avatar_url} alt={value || ''} className="w-full h-full object-cover" />
            ) : (
              value ? value.charAt(0) : '?'
            )}
          </div>
          <div>
            <div className="font-semibold">{value}</div>
            <div className="text-sm text-gray-500">{record.phone}</div>
          </div>
        </div>
      )
    },
    {
      key: 'requestedPlan',
      title: 'الباقة',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
          {value}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      title: 'طريقة الدفع',
      render: (value) => {
        if (value === 'zain') return <span className="text-pink-600 font-bold">ZainCash</span>;
        if (value === 'rafidain') return <span className="text-yellow-600 font-bold">QiCard</span>;
        if (value === 'agent') return <span className="text-blue-600 font-bold">وكيل</span>;
        return <span className="text-gray-500">{value}</span>;
      }
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'معلق' },
          approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'مقبول' },
          rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'مرفوض' }
        };
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending;
        return (
          <span className={`px-2 py-1 ${config.bg} ${config.text} rounded-full text-sm`}>
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'requestDate',
      title: 'تاريخ الطلب',
      sortable: true
    }
  ];

  const planFormFields = [
    { name: 'name', label: 'اسم الباقة (عربي)', type: 'text' as const, required: true },
    { name: 'price', label: 'السعر (بالدينار)', type: 'number' as const, required: true },
    { name: 'features', label: 'المميزات (واحدة في كل سطر)', type: 'textarea' as const, required: true }
  ];

  const handleApproveRequest = async (request: any) => {
    await approveRequest(request.id);
    alert(`تم تأكيد اشتراك ${request.doctorName}`);
    setSelectedRequest(null);
  };

  const handleRejectRequest = async (request: any) => {
    await rejectRequest(request.id);
    alert(`تم رفض الطلب`);
    setSelectedRequest(null);
  };

  const handlePlanSubmit = async (formData: any) => {
    // Parse features from string to array if needed, assuming TextArea input
    // If AdminTable returns raw data, maybe formData.features is string
    if (selectedPlan) {
      await updatePlan(selectedPlan.id, formData);
    } else {
      await addPlan(formData);
    }
    setShowPlanModal(false);
    setSelectedPlan(null);
  };

  const openEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  // Stats
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">إدارة الاشتراكات والمدفوعات</h2>
        <p className="text-gray-600">مراجعة طلبات الترقية وتأكيد الحوالات المالية</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="طلبات معلقة" value={pendingRequests} description="بانتظار التأكيد" icon={Clock} color="orange" />
        <StatsCard title="اشتراكات نشطة" value={requests.filter(r => r.status === 'approved').length} description="أطباء مشتركون" icon={CheckCircle} color="green" />
        <StatsCard title="إجمالي الإيرادات" value="45.5M" description="د.ع لهذا الشهر" icon={DollarSign} color="purple" />
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex flex-wrap gap-1">
        {['requests', 'plans', 'coupons'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            {tab === 'requests' && 'طلبات الاشتراك'}
            {tab === 'plans' && 'إدارة الباقات'}
            {tab === 'coupons' && 'كوبونات الخصم'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'requests' && (
        <AdminTable
          columns={requestColumns}
          data={requests}
          actions={{
            view: (req) => setSelectedRequest(req)
          }}
        />
      )}

      {activeTab === 'plans' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setSelectedPlan(null); setShowPlanModal(true); }} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> إضافة باقة
            </button>
          </div>
          <AdminTable columns={planColumns} data={plans} actions={{ edit: openEditPlan }} />
        </div>
      )}

      {activeTab === 'coupons' && (
        <CouponsManager coupons={coupons} onAdd={addCoupon} onDelete={deleteCoupon} />
      )}

      {/* Request Details Modal */}
      <SubscriptionReviewModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        onViewDoctor={async (req) => {
          let ownerId = req.user_id || req.doctor_id;

          if (!ownerId && (req.email || req.phone)) {
            try {
              // Try finding by email first
              if (req.email) {
                const { data } = await supabase.from('users').select('id').eq('email', req.email);
                if (data && data.length > 0) ownerId = data[0].id;
              }
              // If not found, try phone
              if (!ownerId && req.phone) {
                const { data } = await supabase.from('users').select('id').eq('phone_number', req.phone);
                if (data && data.length > 0) ownerId = data[0].id;
              }
            } catch (err) {
              console.error("Error looking up user:", err);
            }
          }

          if (ownerId) {
            setSelectedOwnerId(ownerId);
            setShowOwnerDetails(true);
          } else {
            toast.error("لم يتم العثور على حساب المستخدم المرتبط");
          }
        }}
      />

      {/* Owner Details Modal */}
      {selectedOwnerId && (
        <OwnerDetailsModal
          ownerId={selectedOwnerId}
          isOpen={showOwnerDetails}
          onClose={() => setShowOwnerDetails(false)}
        />
      )}

      <AdminModal
        isOpen={showPlanModal}
        onClose={() => { setShowPlanModal(false); setSelectedPlan(null); }}
        title={selectedPlan ? "تعديل الباقة" : "إضافة باقة جديدة"}
        size="lg"
      >
        <PlanForm
          initialValues={selectedPlan}
          onSubmit={handlePlanSubmit}
          onCancel={() => { setShowPlanModal(false); setSelectedPlan(null); }}
        />
      </AdminModal>
    </div>
  );
};

// Custom Form Component for handling complex logic
const PlanForm: React.FC<{ initialValues?: any, onSubmit: (data: any) => void, onCancel: () => void }> = ({ initialValues, onSubmit, onCancel }) => {
  // Initialize state
  const [activeTab, setActiveTab] = React.useState<'general' | 'limits' | 'features'>('general');
  const [formData, setFormData] = React.useState({
    name: initialValues?.name || '',
    nameEn: initialValues?.nameEn || '',
    price: initialValues?.price?.monthly || 0,
    yearlyPrice: initialValues?.price?.yearly || 0,

    // Configs
    maxClinics: initialValues?.maxClinics ?? 1,
    maxPatients: initialValues?.maxPatients ?? 500,
    maxServices: initialValues?.maxServices ?? 10,
    mapVisibility: initialValues?.mapVisibility ?? false,
    isFeatured: initialValues?.isFeatured ?? false,
    articleSuggestion: initialValues?.articleSuggestion ?? false,
    digitalBooking: initialValues?.digitalBooking ?? false,
    aiRequestLimit: initialValues?.aiRequestLimit ?? 0, // 0=None, -1=Unlimited, >0=Limit

    // Custom features text
    customFeatures: ''
  });

  const [aiMode, setAiMode] = React.useState<'none' | 'limited' | 'unlimited'>(
    (initialValues?.aiRequestLimit === -1) ? 'unlimited' :
      (initialValues?.aiRequestLimit > 0) ? 'limited' : 'none'
  );

  React.useEffect(() => {
    if (initialValues?.features) {
      const standardFeatures = [
        'دعم تعدد العيادات', 'الظهور على الخريطة التفاعلية', 'عيادة مميزة',
        'اقتراح العيادة أسفل المقالات', 'حجز رقمي', 'استخدام ذكاء اصطناعي',
        'إدارة حتى', 'حد أقصى للخدمات'
      ];
      const extras = initialValues.features.filter((f: string) => !standardFeatures.some(sf => f.includes(sf.split(' ')[0])));
      setFormData(prev => ({ ...prev, customFeatures: extras.join('\n') }));
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine AI Limit Value
    let finalAiLimit = 0;
    if (aiMode === 'unlimited') finalAiLimit = -1;
    else if (aiMode === 'limited') finalAiLimit = formData.aiRequestLimit > 0 ? formData.aiRequestLimit : 50;
    else finalAiLimit = 0;

    // Generate Features Array
    const features = [];

    // Clinics
    if (formData.maxClinics > 1) features.push(`دعم تعدد العيادات (حتى ${formData.maxClinics === 999 ? 'غير محدود' : formData.maxClinics})`);
    else features.push('إدارة عيادة واحدة');

    // Patients
    if (formData.maxPatients >= 999999) features.push('إدارة ملفات المرضى (غير محدود)');
    else features.push(`إدارة حتى ${formData.maxPatients} مريض`);

    // Services
    features.push(`حد أقصى للخدمات الطبية (${formData.maxServices})`);

    // AI
    if (finalAiLimit === -1) features.push('استخدام ذكاء اصطناعي (غير محدود)');
    else if (finalAiLimit > 0) features.push(`استخدام ذكاء اصطناعي (${finalAiLimit} طلب/يوم)`);
    // Note: If 0, we don't push a feature line usually, or push "Non-supported" if user wants explicit "No AI" listed? Usually we just omit positive features.

    // Toggles
    if (formData.mapVisibility) features.push('الظهور على الخريطة التفاعلية');
    if (formData.isFeatured) features.push('عيادة مميزة في القوائم');
    if (formData.articleSuggestion) features.push('اقتراح العيادة أسفل المقالات');
    if (formData.digitalBooking) features.push('نظام الحجز الرقمي');

    // Custom
    if (formData.customFeatures) {
      features.push(...formData.customFeatures.split('\n').filter(l => l.trim()));
    }

    const submissionData = {
      name: formData.name,
      nameEn: formData.nameEn || formData.name,
      price: { monthly: Number(formData.price), yearly: Number(formData.yearlyPrice), currency: "د.ع" },
      features: features,

      // Config entries
      maxClinics: Number(formData.maxClinics),
      maxPatients: Number(formData.maxPatients),
      maxServices: Number(formData.maxServices),
      mapVisibility: formData.mapVisibility,
      isFeatured: formData.isFeatured,
      articleSuggestion: formData.articleSuggestion,
      digitalBooking: formData.digitalBooking,
      aiRequestLimit: finalAiLimit,

      isPopular: false
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[500px]">

      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 mb-6">
        <button type="button" onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          معلومات الباقة
        </button>
        <button type="button" onClick={() => setActiveTab('limits')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'limits' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          الحدود والصلاحيات
        </button>
        <button type="button" onClick={() => setActiveTab('features')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'features' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          المميزات الإضافية
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-1 space-y-6">

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الباقة (عربي)</label>
                <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الباقة (إنجليزي)</label>
                <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} />
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <h4 className="flex items-center gap-2 font-bold text-green-800 mb-3">
                <DollarSign className="w-4 h-4" />
                التسعير
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر شهري (د.ع)</label>
                  <input type="number" required className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                  <p className="text-xs text-green-600 mt-1">ضع 0 لجعل الباقة مجانية</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر سنوي (د.ع)</label>
                  <input type="number" className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.yearlyPrice} onChange={e => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Limits Tab */}
        {activeTab === 'limits' && (
          <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
            {/* Core Limits */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                حدود الاستخدام الأساسية
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="block font-medium text-gray-900">عدد العيادات</span>
                    <span className="text-xs text-gray-500">أقصى عدد للعيادات المسموح بإنشائها</span>
                  </div>
                  <select className="p-2 border rounded-lg text-sm bg-white w-40"
                    value={formData.maxClinics} onChange={e => setFormData({ ...formData, maxClinics: Number(e.target.value) })}>
                    <option value={1}>1 (فردية)</option>
                    <option value={2}>2 عيادات</option>
                    <option value={3}>3 عيادات</option>
                    <option value={5}>5 عيادات</option>
                    <option value={10}>10 عيادات</option>
                    <option value={999}>غير محدود</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="block font-medium text-gray-900">عدد المرضى</span>
                    <span className="text-xs text-gray-500">إجمالي ملفات المرضى في جميع العيادات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" className="p-2 border rounded-lg text-sm w-32 text-center"
                      value={formData.maxPatients} onChange={e => setFormData({ ...formData, maxPatients: Number(e.target.value) })}
                      placeholder="500" />
                    <span className="text-xs text-gray-500">مريض</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="block font-medium text-gray-900">الخدمات الطبية</span>
                    <span className="text-xs text-gray-500">عدد الخدمات في قائمة الأسعار</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" className="p-2 border rounded-lg text-sm w-32 text-center"
                      value={formData.maxServices} onChange={e => setFormData({ ...formData, maxServices: Number(e.target.value) })}
                      placeholder="10" />
                    <span className="text-xs text-gray-500">خدمة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Limits */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100">
              <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                حدود الذكاء الاصطناعي (AI)
              </h4>

              <div className="flex flex-col gap-4">
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-purple-100 shadow-sm">
                  <button type="button" onClick={() => setAiMode('none')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${aiMode === 'none' ? 'bg-gray-100 text-gray-600 shadow-inner' : 'text-gray-500 hover:bg-gray-50'}`}>
                    غير مدعوم
                  </button>
                  <button type="button" onClick={() => setAiMode('limited')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${aiMode === 'limited' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                    محدود يومياً
                  </button>
                  <button type="button" onClick={() => setAiMode('unlimited')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${aiMode === 'unlimited' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                    غير محدود
                  </button>
                </div>

                {aiMode === 'limited' && (
                  <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-white rounded-lg border border-purple-100 flex items-center justify-between">
                    <label className="text-sm font-medium text-purple-900">الحد اليومي للطلبات</label>
                    <div className="flex items-center gap-2">
                      <input type="number" className="w-24 p-2 border border-purple-200 rounded-lg text-center font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.aiRequestLimit <= 0 ? 50 : formData.aiRequestLimit}
                        onChange={e => setFormData({ ...formData, aiRequestLimit: Number(e.target.value) })} />
                      <span className="text-xs text-gray-500">طلب / يوم</span>
                    </div>
                  </div>
                )}

                {aiMode === 'unlimited' && (
                  <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    يمكن للمشترك استخدام الذكاء الاصطناعي بدون قيود يومية.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.mapVisibility ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                <input type="checkbox" checked={formData.mapVisibility}
                  onChange={e => setFormData({ ...formData, mapVisibility: e.target.checked })} className="w-5 h-5 rounded text-purple-600 accent-purple-600" />
                <div>
                  <span className="block font-bold text-sm text-gray-900">خرائط تفاعلية</span>
                  <span className="text-xs text-gray-500">الظهور على خريطة التطبيق العامة</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.isFeatured ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-200'}`}>
                <input type="checkbox" checked={formData.isFeatured}
                  onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-5 h-5 rounded text-yellow-600 accent-yellow-600" />
                <div>
                  <span className="block font-bold text-sm text-gray-900">عيادة مميزة</span>
                  <span className="text-xs text-gray-500">شارة "مميز" وأولوية في البحث</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.digitalBooking ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                <input type="checkbox" checked={formData.digitalBooking}
                  onChange={e => setFormData({ ...formData, digitalBooking: e.target.checked })} className="w-5 h-5 rounded text-blue-600 accent-blue-600" />
                <div>
                  <span className="block font-bold text-sm text-gray-900">حجز رقمي</span>
                  <span className="text-xs text-gray-500">استقبال حجوزات الأونلاين</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.articleSuggestion ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
                <input type="checkbox" checked={formData.articleSuggestion}
                  onChange={e => setFormData({ ...formData, articleSuggestion: e.target.checked })} className="w-5 h-5 rounded text-pink-600 accent-pink-600" />
                <div>
                  <span className="block font-bold text-sm text-gray-900">اقتراحات المقالات</span>
                  <span className="text-xs text-gray-500">الظهور أسفل المقالات الطبية</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مميزات نصية إضافية</label>
              <textarea className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm" rows={4}
                value={formData.customFeatures} onChange={e => setFormData({ ...formData, customFeatures: e.target.value })}
                placeholder="أدخل كل ميزة في سطر جديد...&#10;مثال:&#10;دعم فني 24/7&#10;نسخ احتياطي يومي"
              />
            </div>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {activeTab === 'general' && 'الخطوة 1 من 3'}
          {activeTab === 'limits' && 'الخطوة 2 من 3'}
          {activeTab === 'features' && 'الخطوة 3 من 3'}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm">إلغاء</button>
          <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-colors font-bold text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>
      </div>
    </form>
  );
};

const CouponsManager: React.FC<{
  coupons: any[],
  onAdd: (c: any) => void,
  onDelete: (id: string) => void
}> = ({ coupons, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: 0,
    usageLimit: 0, // 0 = unlimited
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newCoupon,
      usageLimit: newCoupon.usageLimit > 0 ? newCoupon.usageLimit : null,
      endDate: newCoupon.endDate || null
    });
    setNewCoupon({
      name: '',
      code: '',
      type: 'percentage',
      value: 0,
      usageLimit: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">كوبونات الخصم</h3>
          <p className="text-sm text-gray-500">إدارة العروض والخصومات الترويجية</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          كوبون جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
            <tr>
              <th className="px-6 py-4">الكوبون</th>
              <th className="px-6 py-4">الخصم</th>
              <th className="px-6 py-4">الاستخدام</th>
              <th className="px-6 py-4">الصلاحية</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">لا توجد كوبونات حالياً</td></tr>
            ) : coupons.map((coupon) => {
              const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();
              const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
              let status = { text: 'نشط', color: 'bg-green-100 text-green-700' };
              if (!coupon.isActive) status = { text: 'معطل', color: 'bg-gray-100 text-gray-600' };
              else if (isExpired) status = { text: 'منتهي', color: 'bg-red-100 text-red-700' };
              else if (isLimitReached) status = { text: 'نفدت الكمية', color: 'bg-orange-100 text-orange-700' };

              return (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{coupon.name || 'بدون اسم'}</div>
                    <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1 tracking-wider uppercase">
                      {coupon.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-purple-600">
                    {coupon.value} {coupon.type === 'percentage' ? '%' : 'د.ع'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">{coupon.usedCount}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-500">{coupon.usageLimit || '∞'}</span>
                    </div>
                    {coupon.usageLimit && (
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {coupon.endDate ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">ينتهي في</span>
                        <span>{new Date(coupon.endDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    ) : (
                      <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">دائم الصلاحية</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button
                      onClick={() => onDelete(coupon.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف الكوبون"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Coupon Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="إضافة كوبون جديد"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحملة / الكوبون</label>
            <input
              type="text" required
              className="input-field w-full"
              placeholder="مثال: خصم اليوم الوطني"
              value={newCoupon.name}
              onChange={e => setNewCoupon({ ...newCoupon, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رمز الكوبون (Code)</label>
              <div className="relative">
                <Ticket className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text" required
                  className="input-field w-full pr-10 uppercase font-mono"
                  placeholder="SUMMER24"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم</label>
              <div className="flex gap-2">
                <input
                  type="number" required min="1"
                  className="input-field w-20 text-center font-bold"
                  value={newCoupon.value}
                  onChange={e => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                />
                <select
                  className="input-field flex-1 text-sm bg-gray-50"
                  value={newCoupon.type}
                  onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (د.ع)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-900 mb-2">قيود الاستخدام</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">عدد مرات الاستخدام الأقصى</span>
                <input
                  type="number" min="0"
                  className="input-field w-full text-sm"
                  placeholder="0 = غير محدود"
                  value={newCoupon.usageLimit}
                  onChange={e => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                />
                <p className="text-[10px] text-gray-400 mt-1">اتركه 0 لجعله غير محدود</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">تاريخ الانتهاء (اختياري)</span>
                <input
                  type="date"
                  className="input-field w-full text-sm"
                  value={newCoupon.endDate}
                  onChange={e => setNewCoupon({ ...newCoupon, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">إلغاء</button>
            <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow font-bold">حفظ الكوبون</button>
          </div>

        </form>
      </AdminModal>
    </div>
  );
};

// --- New Manager Components ---

const AgentsManager: React.FC<{
  agents: any[],
  onAdd: (a: any) => Promise<boolean>,
  onUpdate: (id: string, a: any) => Promise<boolean>,
  onDelete: (id: string) => Promise<boolean>
}> = ({ agents, onAdd, onUpdate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    governorate: 'بغداد',
    address: '',
    email: '',
    commissionRate: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent) {
      await onUpdate(editingAgent.id, formData);
    } else {
      await onAdd(formData);
    }
    setShowModal(false);
    setEditingAgent(null);
    setFormData({ name: '', phone: '', governorate: 'بغداد', address: '', email: '', commissionRate: 0 });
  };

  const openEdit = (agent: any) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      phone: agent.phone,
      governorate: agent.governorate,
      address: agent.address || '',
      email: agent.email || '',
      commissionRate: agent.commissionRate || 0
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">إدارة الوكلاء</h3>
          <p className="text-sm text-gray-500">إدارة شبكة الوكلاء ونقاط البيع المعتمدة</p>
        </div>
        <button
          onClick={() => { setEditingAgent(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all font-bold"
        >
          <Plus className="w-4 h-4" />
          إضافة وكيل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{agent.name}</h4>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {agent.governorate}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(agent)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm('هل أنت متأكد من حذف هذا الوكيل؟')) onDelete(agent.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500">كود الوكيل</span>
                <span className="font-mono font-bold text-purple-700 bg-white px-2 py-0.5 rounded border">{agent.code}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {agent.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                {agent.clinicsCount || 0} عيادة مسجلة
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-center text-xs">
              <span className={`px-2 py-1 rounded-full font-bold ${agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {agent.status === 'active' ? 'نشط' : 'متوقف'}
              </span>
              <span className="text-gray-400">{agent.joinDate}</span>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAgent ? "تعديل بيانات الوكيل" : "إضافة وكيل جديد"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <input type="text" required className="input-field w-full" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
              <input type="text" required className="input-field w-full" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المحافظة</label>
              <select className="input-field w-full" value={formData.governorate} onChange={e => setFormData({ ...formData, governorate: e.target.value })}>
                {['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك', 'بابل', 'ديالى', 'الأنبار', 'ذي قار', 'الديوانية', 'صلاح الدين', 'المثنى', 'ميسان', 'واسط', 'دهوك', 'السليمانية'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نسية العمولة (%)</label>
              <input type="number" className="input-field w-full" value={formData.commissionRate} onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العنوان التفصيلي</label>
            <input type="text" className="input-field w-full" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني (اختياري)</label>
            <input type="email" className="input-field w-full" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">إلغاء</button>
            <button type="submit" className="btn-primary flex-1">حفظ</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

const PaymentMethodsManager: React.FC<{
  methods: any[],
  onUpdate: (id: string, data: any) => Promise<boolean>
}> = ({ methods, onUpdate }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h3 className="text-lg font-bold text-gray-900">طرق الدفع</h3>
        <p className="text-sm text-gray-500">التحكم في بوابات الدفع والحسابات البنكية الظاهرة للأطباء</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {methods.map((method) => (
          <div key={method.id} className={`bg-white p-6 rounded-2xl border-2 transition-all flex items-center gap-6 ${method.isActive ? 'border-purple-100 shadow-sm' : 'border-gray-100 opacity-75 grayscale'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${method.isActive ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {method.type === 'zain' || method.name.includes('Zain') ? <Phone className="w-8 h-8" /> :
                method.type === 'card' || method.name.includes('Qi') ? <CreditCard className="w-8 h-8" /> :
                  <Wallet className="w-8 h-8" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-lg text-gray-900">{method.name}</h4>
                {method.isActive ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">فعال</span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">معطل</span>
                )}
              </div>
              <div className="text-gray-500 font-mono text-sm mb-2">{method.number}</div>
              {method.recipientName && <div className="text-xs text-gray-400">المستلم: {method.recipientName}</div>}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-12 h-7 rounded-full p-1 transition-colors ${method.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${method.isActive ? 'translate-x-0' : '-translate-x-5'}`} />
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={method.isActive}
                  onChange={(e) => onUpdate(method.id, { isActive: e.target.checked })}
                />
              </label>

              {/* Edit Button could go here */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
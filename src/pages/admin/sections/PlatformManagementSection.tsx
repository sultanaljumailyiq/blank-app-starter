import React, { useState } from 'react';
import {
  Settings,
  Users,
  CreditCard,
  Globe,
  Database,
  PenTool,
  Plus,
  Eye,
  Trash2,
  Building2,
  TestTube,
  DollarSign,
  QrCode,
  Clock,
  Activity,
  User
} from 'lucide-react';
import { useAdminData, Agent } from '../../../hooks/useAdminData';
import { supabase } from '../../../lib/supabase';
import { AdminTable, Column } from '../../../components/admin/AdminTable';
import { AdminModal, FormModal } from '../../../components/admin/AdminModal';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { UsersManager } from './community/UsersManager';
import { ClinicDetailsModal } from '../components/ClinicDetailsModal';
import { AgentDetailsModal } from '../components/AgentDetailsModal'; // Import new modal
import { PendingRequestsManager } from './platform/PendingRequestsManager';
import { RecentActivitiesManager } from './platform/RecentActivitiesManager';

interface PlatformManagementSectionProps {
  initialTab?: 'settings' | 'agents' | 'payment' | 'users' | 'pending_requests' | 'activities';
}

export const PlatformManagementSection: React.FC<PlatformManagementSectionProps> = ({ initialTab = 'users' }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'agents' | 'payment' | 'users' | 'pending_requests' | 'activities'>(initialTab);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Clinic Details State
  const [showClinicDetailsModal, setShowClinicDetailsModal] = useState(false);
  const [selectedClinicDetails, setSelectedClinicDetails] = useState<any>(null);

  // Agent Details State
  const [showAgentDetailsModal, setShowAgentDetailsModal] = useState(false);
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<any>(null);

  const fetchClinicDetails = async (clinic: any) => {
    // Basic info from the record
    let details = {
      ...clinic,
      patientsCount: 0,
      staffCount: 0,
      ownerName: clinic.owner?.full_name || 'جاري التحميل...',
      ownerPhone: clinic.owner?.phone || ''
    };
    setSelectedClinicDetails(details);
    setShowClinicDetailsModal(true);

    try {
      // 1. Fetch Owner Info (if owner_id exists and not already loaded)
      if (!clinic.owner && clinic.owner_id) {
        const { data: owner } = await supabase.from('profiles').select('full_name, phone').eq('id', clinic.owner_id).single();
        if (owner) {
          details.ownerName = owner.full_name;
          details.ownerPhone = owner.phone;
        }
      }

      // 2. Fetch Counts
      const { count: patients } = await supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', clinic.id);
      const { count: staff } = await supabase.from('clinic_staff').select('*', { count: 'exact', head: true }).eq('clinic_id', clinic.id);

      details.patientsCount = patients || 0;
      details.staffCount = staff || 0;

      setSelectedClinicDetails({ ...details });
    } catch (e) {
      console.error("Error details", e);
    }
  };

  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});


  const {
    settings,
    updateSettings,
    agents,
    paymentMethods,
    updatePaymentMethod,
    addAgent,
    updateAgent,
    deleteAgent,
    clinics,
    approveClinic,
    loading,
    stats
  } = useAdminData();

  // --- Clinics Logic ---
  const clinicColumns: Column[] = [
    {
      key: 'name',
      title: 'اسم العيادة',
      sortable: true,
      render: (value, record: any) => (
        <div>
          <div className="font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{record.name_en || record.id}</div>
        </div>
      )
    },
    {
      key: 'owner',
      title: 'مالك العيادة',
      render: (_, record: any) => (
        <div>
          <div className="font-medium text-gray-900">{record.owner?.full_name || 'غير محدد'}</div>
          <div className="text-xs text-gray-500" dir="ltr">{record.owner?.phone || ''}</div>
        </div>
      )
    },
    {
      key: 'address',
      title: 'الموقع',
      sortable: true,
      render: (value, record: any) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'specialties',
      title: 'التخصصات',
      render: (value: any[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs">{s}</span>
          ))}
          {value?.length > 2 && <span className="text-xs text-gray-400">+{value.length - 2}</span>}
        </div>
      )
    },
    {
      key: 'is_verified',
      title: 'الحالة',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {value ? 'نشط' : 'قيد المراجعة'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (_, record: any) => (
        <div className="flex items-center gap-2">

          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => fetchClinicDetails(record)}
          >
            التفاصيل
          </Button>
        </div>
      )
    }
  ];

  // --- Agents Logic ---
  const agentColumns: Column[] = [
    {
      key: 'name',
      title: 'اسم الوكيل',
      sortable: true,
      render: (value, record: Agent) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {value.charAt(0)}
          </div>
          <div>
            <div className="font-semibold">{value}</div>
            <div className="text-sm text-gray-500">{record.phone}</div>
          </div>
        </div>
      )
    },
    {
      key: 'governorate',
      title: 'المحافظة',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      render: (value) => (
        <span className={`
          px-2 py-1 rounded-full text-sm font-medium
          ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        `}>
          {value === 'active' ? 'نشط' : 'معطل'}
        </span>
      )
    },
    {
      key: 'clinicsCount',
      title: 'عيادات مسجلة',
      sortable: true
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (_, record: Agent) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50 px-2"
            onClick={() => {
              setSelectedAgentDetails(record);
              setShowAgentDetailsModal(true);
            }}
            title="عرض التفاصيل والتسويات"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-gray-600 border-gray-200 hover:bg-gray-50 px-2"
            onClick={() => { setSelectedAgent(record); setShowAgentModal(true); }}
            title="تعديل"
          >
            <PenTool className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 px-2"
            onClick={() => {
              if (confirm('هل أنت متأكد من حذف هذا الوكيل؟')) deleteAgent(record.id);
            }}
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const agentFormFields = [
    { name: 'name', label: 'اسم الوكيل', type: 'text' as const, required: true },
    { name: 'phone', label: 'رقم الهاتف', type: 'text' as const, required: true },
    {
      name: 'governorate',
      label: 'المحافظة',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'بغداد', label: 'بغداد' },
        { value: 'البصرة', label: 'البصرة' },
        { value: 'نينوى', label: 'نينوى' },
        { value: 'أربيل', label: 'أربيل' },
        { value: 'السليمانية', label: 'السليمانية' },
        { value: 'دهوك', label: 'دهوك' },
        { value: 'كركوك', label: 'كركوك' },
        { value: 'صلاح الدين', label: 'صلاح الدين' },
        { value: 'ديالى', label: 'ديالى' },
        { value: 'واسط', label: 'واسط' },
        { value: 'ميسان', label: 'ميسان' },
        { value: 'ذي قار', label: 'ذي قار' },
        { value: 'المثنى', label: 'المثنى' },
        { value: 'القادسية', label: 'القادسية' },
        { value: 'بابل', label: 'بابل' },
        { value: 'كربلاء', label: 'كربلاء' },
        { value: 'النجف', label: 'النجف' },
        { value: 'الأنبار', label: 'الأنبار' }
      ]
    },
    { name: 'address', label: 'العنوان التفصيلي', type: 'textarea' as const }
  ];

  const handleSubmitAgent = (formData: any) => {
    if (selectedAgent) {
      updateAgent(selectedAgent.id, formData);
    } else {
      addAgent(formData);
    }
    setShowAgentModal(false);
    setSelectedAgent(null);
  };

  // --- Render Functions ---



  const renderSettingsTab = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">الإعدادات العامة</h3>
            <p className="text-gray-500 text-sm mt-1">تكوين إعدادات المنصة الأساسية ومعلومات التواصل</p>
          </div>
        </div>

        {/* Platform Logo */}
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-4">شعار المنصة (Logo)</label>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Platform Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">S</span>
                )}
                {uploadingStates['platform_logo'] && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-sm transition-transform hover:scale-110">
                <PenTool className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      setUploadingStates(prev => ({ ...prev, 'platform_logo': true }));
                      const fileName = `platform-logo-${Date.now()}.png`;

                      // Upload to platform-assets bucket
                      const { data, error } = await supabase.storage
                        .from('platform-assets')
                        .upload(`branding/${fileName}`, file);

                      if (error) throw error;

                      const { data: { publicUrl } } = supabase.storage
                        .from('platform-assets')
                        .getPublicUrl(`branding/${fileName}`);

                      // Update Settings
                      await updateSettings({ logo_url: publicUrl });
                      alert('تم تحديث شعار المنصة بنجاح!');

                    } catch (err) {
                      console.error('Logo upload error:', err);
                      alert('فشل رفع الشعار');
                    } finally {
                      setUploadingStates(prev => ({ ...prev, 'platform_logo': false }));
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">شعار المنصة الرسمي</p>
              <p className="text-xs text-gray-500 mt-1">يظهر في الهيدر، صفحة الدخول، والتقارير الرسمية.</p>
              <p className="text-xs text-blue-600 mt-2">يفضل استخدام صورة مربعة بخلفية شفافة (PNG).</p>
            </div>
          </div>
        </div>

        {/* Branding Text Settings */}
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">نصوص الهوية البصرية</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنصة (عربي)</label>
              <input
                type="text"
                defaultValue={settings.platform_title_ar || ''}
                onBlur={(e) => updateSettings({ platform_title_ar: e.target.value })}
                placeholder="منصة عيادة الأسنان الذكية"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">يظهر في الصفحة الرئيسية والعناوين الرئيسية.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العلامة التجارية (إنجليزي)</label>
              <input
                type="text"
                defaultValue={settings.platform_name_en || ''}
                onBlur={(e) => updateSettings({ platform_name_en: e.target.value })}
                placeholder="SMART"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">يظهر في صفحة الدخول والشعارات المختصرة.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">نص الحقوق (Footer)</label>
              <input
                type="text"
                defaultValue={settings.footer_text || ''}
                onBlur={(e) => updateSettings({ footer_text: e.target.value })}
                placeholder="© 2025 SMART system. جميع الحقوق محفوظة."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم المنصة</label>
              <div className="relative group">
                <input
                  type="text"
                  defaultValue="Smart Dental"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 font-medium focus:outline-none"
                  disabled
                  readOnly
                />
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <Globe className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني للدعم</label>
              <div className="relative">
                <input
                  type="email"
                  defaultValue={settings?.contact_email}
                  onBlur={(e) => updateSettings({ contact_email: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-300"
                  placeholder="support@example.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">هاتف الدعم الموحد</label>
              <input
                type="text"
                defaultValue={settings?.support_phone}
                onBlur={(e) => updateSettings({ support_phone: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نسبة عمولة المنصة (%)</label>
              <div className="relative">
                <input
                  type="number"
                  defaultValue={settings?.platform_fee_percentage}
                  onBlur={(e) => updateSettings({ platform_fee_percentage: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-bold text-lg"
                />
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100 hover:bg-green-100 transition-colors">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">النسخ الاحتياطي</h3>
          </div>

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            آخر نسخة احتياطية تم إنشاؤها: <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">منذ 3 أيام</span>
          </p>

          <button className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-green-600 hover:text-white hover:border-transparent transition-all">
            إنشاء نسخة جديدة
          </button>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 hover:bg-purple-100 transition-colors">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">إدارة النطاقات</h3>
          </div>

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            المجال الأساسي النشط: <span className="font-bold text-purple-600 font-mono tracking-wide" dir="ltr">smart-dental.com</span>
          </p>

          <button className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-purple-600 hover:text-white hover:border-transparent transition-all">
            إعدادات DNS
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {paymentMethods.map(method => {
        const isZain = method.name.toLowerCase().includes('zain');
        const themeColor = isZain ? 'rose' : 'amber';
        const bgClass = isZain ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100';

        return (
          <div key={method.id} className="relative group">
            <div className="h-full bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className={`w-18 h-18 rounded-2xl flex items-center justify-center text-3xl font-bold border-2 ${bgClass} p-5`}>
                      {isZain ? 'Z' : 'Q'}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{method.name}</h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${method.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {method.isActive ? 'نشط حالياً' : 'معطل'}
                      </div>
                    </div>
                  </div>

                  <button className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                    <PenTool className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">رقم المحفظة / الحساب</label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue={method.number}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-mono text-xl tracking-wider text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center placeholder:text-gray-400"
                        onBlur={(e) => updatePaymentMethod(method.id, { number: e.target.value })}
                      />
                      <div className="absolute inset-y-0 left-4 flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">اسم المستلم (للتحويل)</label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue={method.recipientName || ''}
                        placeholder="مثال: شركة Smart Dental"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center placeholder:text-gray-400"
                        onBlur={(e) => updatePaymentMethod(method.id, { recipientName: e.target.value })}
                      />
                      <div className="absolute inset-y-0 left-4 flex items-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">QR Code</label>
                    <label className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all group-hover:border-opacity-100 block relative overflow-hidden group/qr">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;



                          // ... (inside renderPaymentTab)

                          // Simple Direct Upload Logic
                          try {
                            setUploadingStates(prev => ({ ...prev, [method.id]: true }));
                            const ext = file.name.split('.').pop();
                            const fileName = `qr-${method.id}-${Date.now()}.${ext}`;
                            const { data, error } = await supabase.storage
                              .from('platform-assets')
                              .upload(`qr-codes/${fileName}`, file);

                            if (error) throw error;

                            const { data: { publicUrl } } = supabase.storage
                              .from('platform-assets')
                              .getPublicUrl(`qr-codes/${fileName}`);

                            await updatePaymentMethod(method.id, { qrCodeUrl: publicUrl });

                            // Success Feedback (could be a toast, but using alert for now as requested)
                            alert('تم رفع الصورة بنجاح وتحديث رمز QR');

                          } catch (err) {
                            console.error('Upload failed', err);
                            alert('فشل رفع الصورة: ' + (err instanceof Error ? err.message : 'Unknown error'));
                          } finally {
                            setUploadingStates(prev => ({ ...prev, [method.id]: false }));
                          }
                        }}
                      />

                      {uploadingStates[method.id] ? (
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span className="text-sm font-medium text-blue-600">جاري الرفع...</span>
                        </div>
                      ) : method.qrCodeUrl ? (
                        <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                          <img src={method.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity rounded-xl">
                            <PenTool className="text-white w-6 h-6" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`w-12 h-12 mx-auto mb-3 bg-${themeColor}-50 rounded-full flex items-center justify-center`}>
                            <QrCode className={`w-6 h-6 text-${themeColor}-500`} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">انقر لرفع رمز QR</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderAgentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h3 className="font-bold text-lg text-gray-900">الوكلاء المعتمدون</h3>
          <p className="text-gray-500 text-sm">إدارة وكلاء المبيعات في المحافظات</p>
        </div>
        <Button onClick={() => { setSelectedAgent(null); setShowAgentModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
          <Plus className="w-4 h-4 ml-2" />
          إضافة وكيل
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <AdminTable
          columns={agentColumns}
          data={agents}
        // actions prop removed as we manually added actions column
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">إدارة المنصة</h2>
          <p className="text-gray-600">التحكم الكامل في إعدادات النظام والمدفوعات</p>
        </div>

        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users className="w-4 h-4" />
            المستخدمين
          </button>
          <button
            onClick={() => setActiveTab('pending_requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'pending_requests' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Clock className="w-4 h-4" />
            الطلبات المعلقة
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'activities' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Activity className="w-4 h-4" />
            سجل النشاطات
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings className="w-4 h-4" />
            الإعدادات
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'payment' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <CreditCard className="w-4 h-4" />
            طرق الدفع
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'agents' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users className="w-4 h-4" />
            الوكلاء
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoStatCard
          title="إجمالي العيادات"
          value={stats.clinicsCount}
          icon={Building2}
          color="blue"
          trend="neutral"
          trendValue="مسجلة"
          delay={0}
        />

        <BentoStatCard
          title="إجمالي المختبرات"
          value={stats.labsCount}
          icon={TestTube}
          color="purple"
          trend="neutral"
          trendValue="مسجلة"
          delay={100}
        />

        <BentoStatCard
          title="عدد الموردين"
          value={stats.suppliersCount}
          icon={Users}
          color="green"
          trend="neutral"
          trendValue="نشط"
          delay={200}
        />

        <BentoStatCard
          title="إيرادات الشهر"
          value={stats.monthlyRevenue.toLocaleString()}
          icon={DollarSign}
          color="orange"
          trend="up"
          trendValue="د.ع"
          delay={300}
        />
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'pending_requests' && <PendingRequestsManager />}
        {activeTab === 'activities' && <RecentActivitiesManager />}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'payment' && renderPaymentTab()}
        {activeTab === 'agents' && renderAgentsTab()}
      </div>

      <FormModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        title={selectedAgent ? 'تعديل بيانات الوكيل' : 'إضافة وكيل جديد'}
        fields={agentFormFields}
        initialValues={selectedAgent || {}}
        onSubmit={handleSubmitAgent}
      />

      <ClinicDetailsModal
        clinic={selectedClinicDetails}
        isOpen={showClinicDetailsModal}
        onClose={() => setShowClinicDetailsModal(false)}
      />

      <AgentDetailsModal
        agent={selectedAgentDetails}
        isOpen={showAgentDetailsModal}
        onClose={() => setShowAgentDetailsModal(false)}
      />
    </div>
  );
};
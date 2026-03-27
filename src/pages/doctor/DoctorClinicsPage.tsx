import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, MapPin, Plus, Settings, Users, Shield, LayoutDashboard, Star, Phone, Clock, Activity, Trash2, AlertTriangle, Lock, CheckCircle, Mail, Check, X } from 'lucide-react';
import { useInvitations } from '../../hooks/useInvitations';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useClinics } from '@/hooks/useClinics';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { useStaff } from '../../hooks/useStaff';
// Re-trigger

import { useSubscriptionLimits } from '../../hooks/useSubscriptionLimits'; // Added import
import { useAuth } from '../../contexts/AuthContext';
import { useDoctorContext } from '../../contexts/DoctorContext';
import { ClinicLocationPicker } from '../../components/common/ClinicLocationPicker';
import { useStorage } from '../../hooks/useStorage';
import { UpgradeModal } from '../../components/subscription/UpgradeModal';
import { StaffManagement } from './components/StaffManagement';
import { formatLocation } from '../../utils/location';

export const DoctorClinicsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth(); // Added user hook
  // Removed duplicate hook call from here, moving it down to use selectedClinic state
  const isSystemStaff = user?.role === 'staff'; // System-level staff flag
  const { selectedClinicId } = useDoctorContext(); // Get global filter

  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { checkLimit, hasFeature } = useSubscriptionLimits(selectedClinic || undefined); // Use limits hook with context
  const [showAddClinic, setShowAddClinic] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<{ title: string; description: string } | undefined>(undefined);
  const [clinicToDelete, setClinicToDelete] = useState<string | null>(null);

  /* 
   * Updated Tab Logic:
   * - Exclusive conditional rendering for each tab to prevent merging.
   * - Renamed 'permissions' to 'staff_settings'.
   * - Added Credential Management.
   */
  const [isSaved, setIsSaved] = useState(false);

  const [generatedCredentials, setGeneratedCredentials] = useState<{ [key: string]: { username?: string, password?: string, saved?: boolean } }>({});
  const [activeTab, setActiveTab] = useState<'settings' | 'profile' | 'staff_settings'>('settings');

  // Real Data
  const { appointments } = useAppointments();
  const { patients } = usePatients(undefined); // Fetch all patients
  const { staff, updateStaff, leaveClinic } = useStaff(); // Fetch all staff (filtered by RLS)
  const { invitations, respondToInvitation, refresh: refreshInvitations } = useInvitations();
  const { clinics, loading, addClinic, updateClinic, deleteClinic, refresh: refreshClinics } = useClinics();

  // Handler for staff member to leave a clinic
  const handleLeaveClinic = async (clinicId: string) => {
    if (!user?.id) return;
    if (!confirm('هل أنت متأكد من الخروج من هذه العيادة؟ لن تتمكن من الوصول إليها بعد ذلك.')) return;
    try {
      await leaveClinic(clinicId, user.id);
      await refreshClinics();
    } catch (err) {
      // Error handled inside leaveClinic
    }
  };

  // New Clinic Form State
  const [newClinic, setNewClinic] = useState({
    name: '', phone: '', address: '', governorate: 'بغداد'
  });

  // File Input Refs
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  // File Upload Logic
  const { uploadFile, loading: uploading } = useStorage();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Local preview while uploading (to feel snappy)
    const previewUrl = URL.createObjectURL(file);
    setTempSettings(prev => ({
      ...prev,
      [type === 'logo' ? 'logo' : 'coverImage']: previewUrl
    }));

    try {
      toast.info('جاري رفع الصورة...');
      // Upload to 'clinics' bucket, under a folder for the specific clinic if possible, or just root/random
      const result = await uploadFile(file, 'clinics', `clinic_${selectedClinic}/${type}`);

      if (result) {
        setTempSettings(prev => ({
          ...prev,
          [type === 'logo' ? 'logo' : 'coverImage']: result.url
        }));
        toast.success('تم رفع الصورة بنجاح');
      }
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('فشل رفع الصورة');
    }
  };

  // Temp Settings State for Editing
  const [tempSettings, setTempSettings] = useState<{
    specialties: string[];
    services: string[];
    workingHours: string;
    logo: string;
    coverImage: string;
    phone: string;
    description: string;
    latitude?: number;
    longitude?: number;
    governorate?: string;
    address?: string;
    isFeatured: boolean;
    isDigitalBookingEnabled: boolean;
    settings: any;
  }>({ specialties: [], services: [], workingHours: '', logo: '', coverImage: '', phone: '', description: '', isFeatured: false, isDigitalBookingEnabled: false, settings: {} });

  // Initialize/Update temp settings when modal opens or clinic changes
  React.useEffect(() => {
    if (selectedClinic) {
      const clinic = clinics.find(c => c.id === selectedClinic);
      if (clinic) {
        setTempSettings({
          specialties: clinic.specialties || [],
          services: clinic.services || [],
          workingHours: clinic.workingHours || '',
          logo: clinic.image || '',
          coverImage: clinic.coverImage || '',
          phone: clinic.phone || '',
          description: clinic.description || '',

          latitude: clinic.location?.lat,
          longitude: clinic.location?.lng,
          governorate: clinic.governorate || 'بغداد',
          address: clinic.address || '',

          isFeatured: clinic.isFeatured || false,
          isDigitalBookingEnabled: clinic.isDigitalBookingEnabled || false,
          settings: clinic.settings || {}
        });
      }
    }
  }, [selectedClinic, showSettings]);



  const handleSaveSettings = async () => {
    if (!selectedClinic) return;

    try {
      // Capture working hours from input if needed, or stick to controlled state if we fully refactored
      // Since I used an ID selector in the view, let's grab it or rely on synced state if I added onChange
      // I added onChange to input but it didn't update state directly in the previous snippet.
      // Let's rely on reading the input value directly or better, update the snippet to be controlled.
      // Actually, in the previous snippet I didn't fully hook up `workingHours` to `tempSettings`.
      // I will fix this in THIS replace block by ensuring `tempSettings` is used.

      const startInput = document.getElementById('working-hours-start') as HTMLInputElement;
      const endInput = document.getElementById('working-hours-end') as HTMLInputElement;
      const updatedWorkingHours = (startInput && endInput && startInput.value && endInput.value) 
        ? `${startInput.value} - ${endInput.value}` 
        : tempSettings.workingHours;

      await updateClinic(selectedClinic, {
        specialties: tempSettings.specialties,
        services: tempSettings.services,
        workingHours: updatedWorkingHours,
        image: tempSettings.logo,
        coverImage: tempSettings.coverImage,
        phone: tempSettings.phone,
        description: tempSettings.description,
        location: (tempSettings.latitude && tempSettings.longitude) ? { lat: tempSettings.latitude, lng: tempSettings.longitude } : undefined,
        governorate: tempSettings.governorate,
        address: tempSettings.address,
        isFeatured: tempSettings.isFeatured,
        isDigitalBookingEnabled: tempSettings.isDigitalBookingEnabled,
        settings: tempSettings.settings
      });
      // Show success state
      setIsSaved(true);
      toast.success('تم حفظ إعدادات العيادة بنجاح');

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);

    } catch (err) {
      toast.error('فشل حفظ الإعدادات');
      console.error(err);
    }
  };

  const renderFeatureToggle = (
    id: string,
    label: string,
    description: string,
    featureKey: 'map' | 'booking' | 'featured' | 'articles',
    currentValue: boolean,
    onChange: (val: boolean) => void
  ) => {
    const isLocked = !hasFeature(featureKey);

    return (
      <div className={`flex items-center justify-between p-4 rounded-lg border ${isLocked ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 hover:border-blue-200'} transition-all`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
            {isLocked ? <Lock className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`font-medium ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>{label}</h4>
              {isLocked && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full">متاح في الباقة المتقدمة</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>

        <div onClick={(e) => {
          if (isLocked) {
            e.preventDefault();
            setUpgradeFeature({
              title: `فتح ميزة ${label}`,
              description: `هذه الميزة متاحة فقط في الباقات المتقدمة. قم بترقية باقتك للوصول إلى ${label} والعديد من المميزات الأخرى.`
            });
            setShowUpgradeModal(true);
            return;
          }
        }}>
          <label className={`relative inline-flex items-center ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={currentValue}
              onChange={(e) => !isLocked && onChange(e.target.checked)}
              disabled={isLocked}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    );
  };

  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newClinic.name) {
      toast.error('يرجى إدخال اسم العيادة');
      return;
    }

    try {
      await addClinic({
        name: newClinic.name,
        address: newClinic.address,
        governorate: newClinic.governorate,
        phone: newClinic.phone
      });
      toast.success('تم إضافة العيادة بنجاح');
      setShowAddClinic(false);
      // Reset form
      setNewClinic({ name: '', phone: '', address: '', governorate: 'بغداد' });
    } catch (err: any) {
      console.error('Failed to add clinic:', err);
      toast.error('فشل إضافة العيادة: ' + (err.message || 'خطأ غير معروف'));
    }
  };

  const handleDeleteClinic = async () => {
    if (!clinicToDelete) return;
    try {
      await deleteClinic(clinicToDelete);
      toast.success('تم حذف العيادة بنجاح');
      setShowDeleteModal(false);
      setClinicToDelete(null);
    } catch (err) {
      toast.error('فشل حذف العيادة');
    }
  };




  const currentClinic = clinics.find(c => c.id === selectedClinic);
  const isCurrentClinicOwner = currentClinic && currentClinic.owner_id === user?.id;
  const selectedClinicPermissions = staff.find(
    s => String(s.clinicId) === String(selectedClinic) && s.email === user?.email
  )?.permissions;

  if (loading && clinics.length === 0) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">عياداتي</h1>
          <p className="text-gray-600 mt-1">إدارة جميع عياداتك المستهدفة ({clinics.length} عيادات مشتركة)</p>
        </div>
        {!isSystemStaff && (
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => {
              const limitCheck = checkLimit('clinics');
              if (!limitCheck.allowed) {
                setUpgradeFeature({
                  title: 'وصلت الحد الأقصى للعيادات',
                  description: 'ترقية باقتك لإضافة عدد غير محدود من العيادات وإدارة فروع متعددة.'
                });
                setShowUpgradeModal(true);
                return;
              }
              setShowAddClinic(true);
            }}
          >
            <Plus className="w-5 h-5" />
            إضافة عيادة جديدة
          </Button>
        )}
      </div>


      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Invitations */}
        {invitations.map((invitation) => {
          const clinic = invitation.clinic;
          if (!clinic) return null;

          return (
            <Card key={`inv-${invitation.id}`} className="overflow-hidden border-2 border-dashed border-purple-200 bg-white/50 backdrop-blur-sm transition-all relative">
              <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Mail className="w-3 h-3" />
                دعوة انضمام
              </div>
              
              {/* Clinic Image */}
              <div className="h-32 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img
                  src={clinic.coverImage || clinic.image}
                  alt={clinic.name}
                  className="w-full h-full object-cover grayscale-[30%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 right-0 p-4">
                  {/* Logo Overlay */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 backdrop-blur-sm">
                      <img src={clinic.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{clinic.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">{clinic.phone || 'غير مسجل'}</span>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-800 mt-4 border border-purple-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <p>المنصب المقترح: <span className="font-bold">{invitation.role === 'doctor' ? 'طبيب' : invitation.role === 'nurse' ? 'ممرض' : invitation.role === 'receptionist' ? 'إستقبال' : invitation.role}</span></p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-purple-100">
                  <Button
                    variant="primary"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={async (e) => {
                      e.stopPropagation();
                      toast.promise(async () => {
                        await respondToInvitation(invitation.id, true);
                        await Promise.all([refreshClinics(), refreshInvitations()]);
                      }, {
                        loading: 'جاري قبول الدعوة...',
                        success: 'تم قبول الدعوة بنجاح!',
                        error: 'فشل قبول الدعوة'
                      });
                    }}
                  >
                    <Check className="w-4 h-4 ml-1" />
                    قبول
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('هل أنت متأكد من رفض هذه الدعوة؟')) {
                        try {
                          await respondToInvitation(invitation.id, false);
                          toast.success('تم رفض الدعوة');
                        } catch (err) {
                          toast.error('حدث خطأ أثناء رفض الدعوة');
                        }
                      }
                    }}
                  >
                    <X className="w-4 h-4 ml-1" />
                    رفض
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Real Clinics */}
        {clinics
          .filter(c => {
            if (selectedClinicId === 'all') return true;
            return c.id === selectedClinicId;
          })
          .map((clinic) => {
            const isClinicStaff = clinic.owner_id !== user?.id; // Determine per-clinic specific role
            const userStaffRecord = staff.find(
              s => String(s.clinicId) === String(clinic.id) && s.email === user?.email
            );
            const userPermissions = userStaffRecord?.permissions;

            return (
            <Card key={clinic.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              navigate(`/doctor/clinic/${clinic.id}`);
            }}>
              {/* Clinic Image */}
              <div className="h-32 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img
                  src={clinic.coverImage || clinic.image}
                  alt={clinic.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 right-0 p-4">
                  {/* Logo Overlay */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 backdrop-blur-sm">
                      <img src={clinic.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{clinic.name}</h3>
                  <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {formatLocation(clinic.governorate, clinic.address)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{clinic.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{clinic.workingHours}</span>
                  </div>
                </div>

                {/* Rating and Specialties */}
                <div className="flex items-center justify-between pt-4 border-t">
                  {/* Rating removed */}
                  <div className="text-xs text-gray-600">
                    {clinic.specialties[0]}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {patients.filter(p => String(p.clinicId) === String(clinic.id)).length}
                    </p>
                    <p className="text-xs text-gray-600">المرضى</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {staff.filter(s => String(s.clinicId) === String(clinic.id)).length || 0}
                    </p>
                    <p className="text-xs text-gray-600">الموظفون</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {appointments.filter(a => String(a.clinicId) === String(clinic.id) && a.date === new Date().toISOString().split('T')[0]).length}
                    </p>
                    <p className="text-xs text-gray-600">مواعيد</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <button
                    onClick={() => navigate(`/doctor/clinic/${clinic.id}`)}
                    className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex flex-col items-center gap-1"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-xs font-medium">لوحة التحكم</span>
                  </button>

                  {/* Settings Button: Owner Only */}
                  {(!isClinicStaff || userPermissions?.settings) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClinic(clinic.id);
                        setActiveTab('settings');
                        setShowSettings(true);
                      }}
                      className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all flex flex-col items-center gap-1"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="text-xs font-medium">الإعدادات</span>
                    </button>
                  )}
                </div>

                {/* Owner Only Actions */}
                {!isClinicStaff && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setClinicToDelete(clinic.id);
                      setShowDeleteModal(true);
                    }}
                    className="w-full mt-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs font-medium">حذف العيادة</span>
                  </button>
                )}

                {/* Activity Log: Owner Only */}
                {(!isClinicStaff || userPermissions?.activityLog) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/doctor/clinic/${clinic.id}/activity`);
                    }}
                    className="w-full mt-2 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-medium">سجل النشاطات</span>
                  </button>
                )}

                {/* Staff Only Actions */}
                {isClinicStaff && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeaveClinic(clinic.id);
                    }}
                    className="w-full mt-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-xs font-medium">الخروج من العيادة</span>
                  </button>
                )}
              </div>
            </Card>
            );
          })}
      </div>

      {/* Add Clinic Modal - Owner Only */}
      {!isSystemStaff && (
        <Modal
          isOpen={showAddClinic}
          onClose={() => setShowAddClinic(false)}
          title="إضافة عيادة جديدة"
          size="lg"
        >
          <form onSubmit={handleAddClinic} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العيادة</label>
              <input
                type="text"
                value={newClinic.name}
                onChange={e => setNewClinic({ ...newClinic, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="مثال: عيادة النور لطب الأسنان"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
              <select
                value={newClinic.governorate}
                onChange={e => setNewClinic({ ...newClinic, governorate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                {['بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك', 'كركو', 'صلاح الدين', 'ديالى', 'الأنبار', 'بابل', 'كربلاء', 'النجف', 'واسط', 'القادسية', 'ميسان', 'ذي قار', 'المثنى'].map((gov) => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
              <input
                type="text"
                value={newClinic.address}
                onChange={e => setNewClinic({ ...newClinic, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
              <input
                type="text"
                value={newClinic.phone}
                onChange={e => setNewClinic({ ...newClinic, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowAddClinic(false)}>إلغاء</Button>
              <Button type="submit" variant="primary">إضافة العيادة</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="إعدادات العيادة"
        size="lg"
      >
        <div className="flex flex-col h-[600px]">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {(isCurrentClinicOwner || selectedClinicPermissions?.settings) && (
              <button
                className={`pb-3 px-6 font-medium text-sm transition-colors relative ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('settings')}
              >
                الإعدادات العامة
                {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
            )}
            {(isCurrentClinicOwner || selectedClinicPermissions?.settings) && (
              <button
                className={`pb-3 px-6 font-medium text-sm transition-colors relative ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('profile')}
              >
                ملف العيادة
                {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
            )}
            {(isCurrentClinicOwner || selectedClinicPermissions?.manageStaff) && (
              <button
                className={`pb-3 px-6 font-medium text-sm transition-colors relative ${activeTab === 'staff_settings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('staff_settings')}
              >
                إعدادات الطاقم
                {activeTab === 'staff_settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-1">
            {activeTab === 'settings' && (
              <div className="space-y-6">

                {/* Feature Toggles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">مميزات العيادة</h3>

                  {renderFeatureToggle(
                    'digital-booking',
                    'الحجز الإلكتروني',
                    'تمكين المرضى من حجز المواعيد عبر الإنترنت من خلال رابط العيادة الخاص.',
                    'booking',
                    tempSettings.isDigitalBookingEnabled,
                    (val) => setTempSettings(prev => ({ ...prev, isDigitalBookingEnabled: val }))
                  )}

                  {renderFeatureToggle(
                    'map-visibility',
                    'الظهور على الخريطة',
                    'إظهار موقع عيادتك على خريطة البحث للمرضى القريبين.',
                    'map',
                    tempSettings.settings?.showOnMap || false,
                    (val) => setTempSettings(prev => ({ ...prev, settings: { ...prev.settings, showOnMap: val } }))
                  )}

                  {renderFeatureToggle(
                    'featured-clinic',
                    'عيادة مميزة',
                    'إظهار عيادتك في قائمة العيادات المميزة وفي أعلى نتائج البحث.',
                    'featured',
                    tempSettings.isFeatured,
                    (val) => setTempSettings(prev => ({ ...prev, isFeatured: val }))
                  )}

                  {renderFeatureToggle(
                    'article-suggestions',
                    'الظهور في مقترحات المقالات',
                    'إظهار عيادتك كعيادة مقترحة أسفل المقالات الطبية لزيادة الوصول.',
                    'articles',
                    tempSettings.settings?.articleSuggestions || false,
                    (val) => setTempSettings(prev => ({ ...prev, settings: { ...prev.settings, articleSuggestions: val } }))
                  )}
                </div>

                {/* Booking Link (Only if enabled) */}
                {tempSettings.isDigitalBookingEnabled && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in">
                    <label className="block text-xs font-medium text-blue-800 mb-1">رابط الحجز الخارجي</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        readOnly
                        value={`${window.location.origin}/booking?clinic=${currentClinic?.id || '...'}`}
                        className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-600 font-mono text-sm dir-ltr"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const url = `${window.location.origin}/booking?clinic=${currentClinic?.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success('تم نسخ الرابط بنجاح');
                        }}
                      >
                        نسخ
                      </Button>
                    </div>
                  </div>
                )}

                {/* Booking Configuration */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-bold text-gray-900 pb-2">خيارات الحجز المتقدمة</h4>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-sm text-gray-900">السماح باختيار الطبيب</p>
                      <p className="text-xs text-gray-500">تمكين المريض من اختيار طبيب معين عند الحجز</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={tempSettings.settings?.allowDoctorSelection !== false} // Default true
                        onChange={(e) => setTempSettings(prev => ({ ...prev, settings: { ...prev.settings, allowDoctorSelection: e.target.checked } }))}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-sm text-gray-900">إظهار أوقات الانتظار المتوقعة</p>
                      <p className="text-xs text-gray-500">عرض وقت تقريبي للانتظار بناءً على المواعيد</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={tempSettings.settings?.showWaitTimes || false}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, settings: { ...prev.settings, showWaitTimes: e.target.checked } }))}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>


              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Clinic Profile Header (Cover & Logo) */}
                <div className="relative mb-8 group">
                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    ref={coverInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'cover')}
                  />
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                  />

                  {/* Cover Image */}
                  <div
                    className="h-48 w-full bg-gray-100 rounded-xl overflow-hidden relative cursor-pointer group/cover border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {tempSettings.coverImage ? (
                      <img src={tempSettings.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                        <div className="w-12 h-12 bg-gray-200 md:bg-white/50 rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs">اضغط لرفع صورة غلاف</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/cover:opacity-100">
                      <span className="bg-white/90 text-gray-900 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">تغيير الغلاف</span>
                    </div>
                  </div>

                  {/* Logo - Overlapping */}
                  <div className="absolute -bottom-6 right-6">
                    <div
                      className="w-24 h-24 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden cursor-pointer relative group/logo"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {tempSettings.logo ? (
                        <img src={tempSettings.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                          <Building2 className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover/logo:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/logo:opacity-100">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  {/* Basic Details */}
                  <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">اسم العيادة</label>
                        <input type="text" defaultValue={currentClinic?.name} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" disabled />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">وصف العيادة (يظهر للمرضى)</label>
                        <textarea
                          value={tempSettings.description}
                          onChange={(e) => setTempSettings({ ...tempSettings, description: e.target.value })}
                          placeholder="اكتب وصفاً مختصراً للعيادة، الخدمات المقدمة، والخبرات..."
                          className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input
                          type="text"
                          value={tempSettings.phone}
                          onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                          placeholder="07XX XXXXXXX"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">ساعات العمل</label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 mb-0.5">من</label>
                            <input
                              type="time"
                              id="working-hours-start"
                              defaultValue={currentClinic?.workingHours?.split(' - ')[0] || '09:00'}
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 mb-0.5">إلى</label>
                            <input
                              type="time"
                              id="working-hours-end"
                              defaultValue={currentClinic?.workingHours?.split(' - ')[1] || '18:00'}
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                            />
                          </div>
                        </div>
                        <input type="hidden" id="working-hours-input" value="" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">المحافظة</label>
                        <select
                          value={tempSettings.governorate || 'بغداد'}
                          onChange={(e) => setTempSettings({ ...tempSettings, governorate: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                        >
                          {['بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك', 'كركو', 'صلاح الدين', 'ديالى', 'الأنبار', 'بابل', 'كربلاء', 'النجف', 'واسط', 'القادسية', 'ميسان', 'ذي قار', 'المثنى'].map((gov) => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">المدينة / المنطقة</label>
                        <input
                          type="text"
                          value={tempSettings.address || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                          placeholder="مثال: المنصور، الكرادة"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    {/* Map Section - Full Width at Bottom */}
                    {/* Map Section - Only if Enabled */}
                    {tempSettings.settings?.showOnMap && (
                      <div className="animate-in fade-in slide-in-from-top-4">
                        <label className="block text-xs font-medium text-gray-700 mb-2">الموقع على الخريطة (اضغط على الخريطة لتحديد موقع العيادة بدقة)</label>
                        <div className="w-full border rounded-xl overflow-hidden shadow-sm">
                          <ClinicLocationPicker
                            initialLat={tempSettings.latitude}
                            initialLng={tempSettings.longitude}
                            onLocationSelect={(lat, lng, governorate, city) => {
                              setTempSettings(prev => ({
                                ...prev,
                                latitude: lat,
                                longitude: lng,
                                governorate: governorate || prev.governorate,
                                address: city || prev.address
                              }));
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {!tempSettings.settings?.showOnMap && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                        <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">تم تعطيل الخريطة لهذه العيادة</p>
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            toast.info('يرجى تفعيل خيار "الظهور على الخريطة" من الإعدادات العامة');
                          }}
                          className="text-xs text-blue-600 font-medium hover:underline mt-1"
                        >
                          تفعيل الخريطة
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Services & Specialties Configuration */}
                  <div className="space-y-6">
                    {/* Specialties */}
                    <div>
                      <h4 className="font-bold text-gray-900 border-b pb-2 mb-3">الاختصاصات</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['جراحة وجه وفكين', 'تقويم الأسنان', 'طب أسنان أطفال', 'علاج الجذور', 'لثة وأنسجة داعمة', 'زراعة الأسنان', 'طب أسنان عام', 'تجميل الأسنان'].map((spec) => (
                          <label key={spec} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 cursor-pointer hover:bg-gray-100">
                            <span className="text-sm text-gray-900">{spec}</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={tempSettings.specialties.includes(spec)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTempSettings(prev => ({ ...prev, specialties: [...prev.specialties, spec] }));
                                  } else {
                                    setTempSettings(prev => ({ ...prev, specialties: prev.specialties.filter(s => s !== spec) }));
                                  }
                                }}
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <h4 className="font-bold text-gray-900 border-b pb-2 mb-3">الخدمات</h4>
                      <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 flex items-start gap-2 mb-3">
                        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        يمكنك إضافة خدمات إضافية تظهر للمرضى عند الحجز.
                      </div>

                      <div className="space-y-2">
                        {tempSettings.services.map((service, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                            <span className="text-sm text-gray-900">{service}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 h-auto py-1 px-2"
                              onClick={() => {
                                setTempSettings(prev => ({ ...prev, services: prev.services.filter(s => s !== service) }));
                              }}
                            >
                              حذف
                            </Button>
                          </div>
                        ))}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="اسم الخدمة الجديدة"
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val) {
                                  setTempSettings(prev => ({ ...prev, services: [...prev.services, val] }));
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            id="new-service-input"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById('new-service-input') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                setTempSettings(prev => ({ ...prev, services: [...prev.services, input.value.trim()] }));
                                input.value = '';
                              }
                            }}
                          >
                            إضافة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'staff_settings' && selectedClinic && (
              <StaffManagement clinicId={selectedClinic} clinicOwnerId={currentClinic?.owner_id} />
            )}
          </div>

          <div className="pt-6 mt-2 border-t border-gray-100">
            <Button
              variant={isSaved ? "secondary" : "primary"}
              className={`w-full transition-all duration-300 ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}`}
              onClick={handleSaveSettings}
              disabled={isSaved}
            >
              {isSaved ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>تم الحفظ بنجاح</span>
                </div>
              ) : 'حفظ التغييرات'}
            </Button>
          </div>
        </div>
      </Modal>


      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد حذف العيادة"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg flex gap-3 text-red-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              هل أنت متأكد من حذف هذه العيادة؟ سيتم حذف جميع البيانات المرتبطة بها (مرضى، مواعيد، تقارير) بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>إلغاء</Button>
            <Button variant="danger" onClick={handleDeleteClinic} className="bg-red-600 hover:bg-red-700 text-white">
              نعم، حذف العيادة
            </Button>
          </div>
        </div>
      </Modal>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={upgradeFeature?.title || "ترقية الباقة"}
        description={upgradeFeature?.description || "قم بترقية باقتك للوصول إلى هذه الميزة."}
      />
    </div >
  );
};

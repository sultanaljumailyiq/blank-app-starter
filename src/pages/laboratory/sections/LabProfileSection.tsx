import React, { useState, useRef, useEffect } from 'react';
import {
  User, Settings, Building2, MapPin, Phone, Mail, Clock,
  Shield, Star, Edit, Save, X, Plus, Trash2, Camera,
  Key, Bell, Eye, EyeOff, Upload, Download, Award,
  CheckCircle, AlertCircle, Globe, CreditCard, Calendar,
  Package, FileText, DollarSign, Truck, Users, Activity,
  Timer, Navigation, Stethoscope, FlaskConical, ChevronLeft
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { NotificationsList } from '../../../components/common/NotificationsList';
import { SocialBadges } from '../../../components/auth/SocialBadges';

import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useLabProfile } from '../../../hooks/useLabProfile';
import { toast } from 'sonner';

interface LabProfile {
  // بيانات المختبر الأساسية
  id: string;
  labName: string;
  labNameAr: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  description: string;
  descriptionAr: string;
  establishmentDate: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  verificationStatus: string;
  logo?: string;

  // إدارة المختبر
  labSettings: {
    workingHours: string;
    responseTime: string;
    emergencyService: boolean;
    autoAcceptOrders: boolean;
    deliveryRadius: number;
    // priceList removed
  };

  // إحصائيات
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyRevenue: number;
  averageDeliveryTime: number;
}

export const LabProfileSection: React.FC = () => {
  const { user } = useAuth();
  const { profile: dbLabProfile, updateProfile: updateDbLabProfile } = useLabProfile();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showLabSettings, setShowLabSettings] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `lab-logos/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('فشل رفع الصورة');
        return;
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        setProfile({ ...profile, logo: urlData.publicUrl });
        // Also persist to DB via the hook
        await updateDbLabProfile({ avatar: urlData.publicUrl });
        toast.success('تم تحديث صورة المختبر');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('حدث خطأ أثناء رفع الصورة');
    }
  };

  // بيانات افتراضية للملف الشخصي
  const [profile, setProfile] = useState<LabProfile>({
    id: '',
    labName: '',
    labNameAr: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    governorate: 'بغداد',
    description: '',
    descriptionAr: '',
    establishmentDate: new Date().toISOString().split('T')[0],
    licenseNumber: '',
    licenseExpiryDate: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    workingHours: {
      start: '08:00',
      end: '18:00',
      days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
    },
    rating: 0,
    reviewCount: 0,
    isActive: false,
    isFeatured: false,
    verificationStatus: 'pending',

    labSettings: {
      workingHours: '8:00 ص - 6:00 م',
      responseTime: '30-60 دقيقة',
      emergencyService: false,
      autoAcceptOrders: false,
      deliveryRadius: 10,
    },

    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    monthlyRevenue: 0,
    averageDeliveryTime: 0
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    emailNotifications: true
  });

  const iraqiGovernorates = [
    'بغداد', 'البصرة', 'أربيل', 'نينوى', 'النجف', 'كربلاء',
    'ديالى', 'كركوك', 'ذي قار', 'ميسان', 'المثنى',
    'الأنبار', 'بابل', 'صلاح الدين', 'واسط', 'القادسية'
  ];

  // Sync db data into local state when it loads
  useEffect(() => {
    if (dbLabProfile && (dbLabProfile.id || dbLabProfile.email)) {
      setProfile(prev => ({
        ...prev,
        id: dbLabProfile.id || '',
        labName: dbLabProfile.name || '',
        email: dbLabProfile.email || '',
        phone: dbLabProfile.phone || '',
        address: dbLabProfile.address || '',
        // governorate now has its own column — read it directly
        governorate: (dbLabProfile as any).governorate || prev.governorate || 'بغداد',
        description: dbLabProfile.description || '',
        logo: dbLabProfile.avatar || '',
      }));
    }
  }, [dbLabProfile]);

  const handleSaveProfile = async () => {
    try {
      await updateDbLabProfile({
        name: profile.labName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,       // street address only
        governorate: profile.governorate, // separate column
        description: profile.description
      } as any);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handlePasswordChange = () => {
    if (passwords.new === passwords.confirm && passwords.new.length >= 6) {
      setShowPasswordChange(false);
      setPasswords({ current: '', new: '', confirm: '' });

    }
  };

  const handleSaveLabSettings = () => {
    setShowLabSettings(false);

  };

  const renderProfile = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Logo and Basic Info */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-purple-100 to-indigo-50 opacity-50 transition-all group-hover:opacity-70"></div>
        <div className="relative flex flex-col lg:flex-row gap-8 items-start">
          {/* Logo Upload */}
          <div className="flex-shrink-0 relative">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[2rem] flex items-center justify-center relative shadow-lg group-hover:rotate-3 transition-transform duration-300 overflow-hidden">
              {profile.logo ? (
                <img src={profile.logo} alt={profile.labName} className="w-full h-full object-cover" />
              ) : (
                <FlaskConical className="w-14 h-14 text-white" />
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 border border-gray-100 z-10"
              >
                <Camera className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1 w-full pt-4 lg:pt-0">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.labName}</h1>
                <p className="text-gray-600 text-lg mb-2 max-w-2xl leading-relaxed">{profile.description}</p>
                <div className="mb-4">
                  <SocialBadges />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    {isEditing ? (
                      <input
                        type="number"
                        value={new Date(profile.establishmentDate).getFullYear()}
                        onChange={(e) => setProfile({ ...profile, establishmentDate: new Date(parseInt(e.target.value), 0, 1).toISOString() })}
                        className="w-20 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none text-center font-bold"
                        placeholder="السنة"
                      />
                    ) : (
                      <span>تأسس في {new Date(profile.establishmentDate).getFullYear()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Shield className="w-4 h-4 text-purple-500" />
                    {isEditing ? (
                      <>
                        <span>رقم الترخيص:</span>
                        <input
                          type="text"
                          value={profile.licenseNumber}
                          onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                          className="w-32 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none font-bold"
                          placeholder="رقم الترخيص"
                        />
                      </>
                    ) : (
                      <span>رقم الترخيص: {profile.licenseNumber}</span>
                    )}
                  </div>
                  {profile.isActive && (
                    <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-bold">معتمد رسمياً</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-md active:scale-95 font-bold"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ التغييرات</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all active:scale-95 font-medium"
                    >
                      <X className="w-4 h-4" />
                      <span>إلغاء</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-all hover:border-purple-300 shadow-sm active:scale-95 font-bold"
                  >
                    <Edit className="w-4 h-4" />
                    <span>تعديل الملف</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats - Bento UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
              <BentoStatCard
                title="إجمالي الطلبات"
                value={profile.totalOrders}
                icon={Package}
                color="purple"
                trend="up"
                trendValue="12%"
                delay={0}
              />
              <BentoStatCard
                title="طلبات مكتملة"
                value={profile.completedOrders}
                icon={CheckCircle}
                color="green"
                trend="up"
                trendValue="98%"
                delay={100}
              />
              <BentoStatCard
                title="الإيرادات الشهرية"
                value={`${profile.monthlyRevenue.toLocaleString()} د.ع`}
                icon={DollarSign}
                color="blue"
                trend="up"
                trendValue="8%"
                delay={200}
              />
              <BentoStatCard
                title="التقييم"
                value={profile.rating}
                icon={Star}
                color="amber"
                trend="neutral"
                trendValue={`${profile.reviewCount} تقييم`}
                delay={300}
              />
              <BentoStatCard
                title="متوسط التسليم"
                value={`${profile.averageDeliveryTime}h`}
                icon={Truck}
                color="indigo"
                trend="down"
                trendValue="-30m"
                delay={400}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-full">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            تواصل معنا
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">البريد الإلكتروني</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-bold text-gray-900">{profile.email || <span className="text-gray-400 font-normal">لم يُدخل بعد</span>}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">رقم الهاتف</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none py-1"
                  />
                ) : (
                  profile.phone
                    ? <a href={`tel:${profile.phone}`} className="font-bold text-green-700 hover:underline" dir="ltr">{profile.phone}</a>
                    : <p className="text-gray-400 font-normal">لم يُدخل بعد</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">العنوان</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-bold text-gray-900">
                    {profile.address || <span className="text-gray-400 font-normal">لم يُحدد العنوان</span>}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">المحافظة</p>
                {isEditing ? (
                  <div className="flex gap-2">
                    <select
                      value={profile.governorate}
                      onChange={(e) => setProfile({ ...profile, governorate: e.target.value })}
                      className="font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none flex-1 py-1"
                    >
                      {iraqiGovernorates.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="font-bold text-gray-900">{profile.governorate || 'بغداد'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">المدير المسؤول</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.ownerName}
                    onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                    className="w-full font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-bold text-gray-900">{profile.ownerName}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours & Lab Settings Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              ساعات العمل
            </h3>
            <div className="space-y-4">
              {profile.workingHours.days.map((day) => (
                <div key={day} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 last:pb-0">
                  <span className="font-bold text-gray-900">{day}</span>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type="time"
                          value={profile.workingHours.start}
                          onChange={(e) => setProfile({
                            ...profile,
                            workingHours: { ...profile.workingHours, start: e.target.value }
                          })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <span className="text-gray-400 font-bold">-</span>
                        <input
                          type="time"
                          value={profile.workingHours.end}
                          onChange={(e) => setProfile({
                            ...profile,
                            workingHours: { ...profile.workingHours, end: e.target.value }
                          })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </>
                    ) : (
                      <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium">
                        {profile.workingHours.start} - {profile.workingHours.end}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laboratory Management Settings Preview */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                </div>
                إعدادات المختبر
              </h3>
              <button
                onClick={() => setShowLabSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95 text-sm font-bold"
              >
                <Settings className="w-4 h-4" />
                <span>إعدادات مفصلة</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900 text-sm">وقت الاستجابة</span>
                </div>
                <p className="text-blue-700 font-medium">{profile.labSettings.responseTime}</p>
              </div>

              <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-gray-900 text-sm">نطاق التوصيل</span>
                </div>
                <p className="text-green-700 font-medium">{profile.labSettings.deliveryRadius} كم</p>
              </div>

              <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-gray-900 text-sm">خدمة الطوارئ</span>
                </div>
                <p className={`text-sm font-bold ${profile.labSettings.emergencyService ? 'text-green-600' : 'text-red-500'}`}>
                  {profile.labSettings.emergencyService ? 'مفعلة' : 'غير مفعلة'}
                </p>
              </div>

              <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-900 text-sm">قبول تلقائي</span>
                </div>
                <p className={`text-sm font-bold ${profile.labSettings.autoAcceptOrders ? 'text-green-600' : 'text-red-500'}`}>
                  {profile.labSettings.autoAcceptOrders ? 'مفعل' : 'غير مفعل'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Services and Pricing - MOVED to Finance Section */}

    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Account Settings */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          إعدادات الحساب
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">تغيير كلمة المرور</h4>
              <p className="text-sm text-gray-500 mt-1">آخر تغيير: 2024-01-01</p>
            </div>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold shadow-sm"
            >
              تغيير كلمة المرور
            </button>
          </div>

          {showPasswordChange && (
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-200 animate-slideDown">
              <input
                type="password"
                placeholder="كلمة المرور الحالية"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePasswordChange}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-md"
                >
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswords({ current: '', new: '', confirm: '' });
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-600" />
          </div>
          إعدادات الأمان
        </h3>
        <div className="space-y-4">
          {Object.entries(security).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-50 hover:border-gray-100">
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1">
                  {key === 'twoFactorAuth' && 'المصادقة الثنائية'}
                  {key === 'emailNotifications' && 'إشعارات البريد الإلكتروني'}
                </h4>
                <p className="text-sm text-gray-500">
                  {key === 'twoFactorAuth' && 'تفعيل المصادقة الثنائية للحماية الإضافية'}
                  {key === 'emailNotifications' && 'استقبال إشعارات الطلبات الجديدة عبر البريد'}
                </p>
              </div>
              <button
                onClick={() => setSecurity({ ...security, [key]: !value })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${value ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-[1.4rem]' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          إدارة البيانات
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <h4 className="font-bold text-gray-900">تصدير التقارير</h4>
              <p className="text-sm text-gray-500 mt-1">تحميل تقارير الطلبات والأسعار بتنسيق Excel أو PDF</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-bold shadow-sm">
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-bold shadow-sm">
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <h4 className="font-bold text-gray-900">استيراد قوائم الأسعار</h4>
              <p className="text-sm text-gray-500 mt-1">رفع ملف Excel لتحديث أسعار الخدمات</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-bold shadow-sm">
              <Upload className="w-4 h-4" />
              <span>رفع ملف</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <h4 className="font-bold text-gray-900">نسخ احتياطي</h4>
              <p className="text-sm text-gray-500 mt-1">إنشاء نسخة احتياطية من جميع البيانات</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-bold shadow-sm">
              <Package className="w-4 h-4" />
              <span>إنشاء نسخة احتياطية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit mx-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'profile'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
          الملف الشخصي
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'settings'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
          الإعدادات والأمان
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'notifications'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
          الإشعارات
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'notifications' && <NotificationsList />}
      </div>

      {/* Lab Settings Modal */}
      {showLabSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                إعدادات المختبر المفصلة
              </h3>
              <button
                onClick={() => setShowLabSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نطاق التوصيل (كم)</label>
                <input
                  type="number"
                  value={profile.labSettings.deliveryRadius}
                  onChange={(e) => setProfile({
                    ...profile,
                    labSettings: { ...profile.labSettings, deliveryRadius: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                />
              </div>

              <div className="space-y-4 pt-2">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={profile.labSettings.emergencyService}
                    onChange={(e) => setProfile({
                      ...profile,
                      labSettings: { ...profile.labSettings, emergencyService: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-bold text-gray-700">تفعيل خدمة الطوارئ</span>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={profile.labSettings.autoAcceptOrders}
                    onChange={(e) => setProfile({
                      ...profile,
                      labSettings: { ...profile.labSettings, autoAcceptOrders: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-bold text-gray-700">قبول الطلبات تلقائياً</span>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSaveLabSettings}
                  className="flex-1 bg-purple-600 text-white py-3.5 px-6 rounded-xl hover:bg-purple-700 transition-all font-bold shadow-lg"
                >
                  حفظ الإعدادات
                </button>
                <button
                  onClick={() => setShowLabSettings(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3.5 px-6 rounded-xl hover:bg-gray-200 transition-all font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
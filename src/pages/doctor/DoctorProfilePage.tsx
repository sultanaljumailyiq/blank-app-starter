import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin,
  Calendar, Clock, Star,
  CheckCircle, XCircle,
  Building2, Award, DollarSign,
  TrendingUp, Shield, Edit2, Save, X, Activity, Camera
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { BentoStatCard } from '../../components/dashboard/BentoStatCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useClinics } from '../../hooks/useClinics';
import { usePatients } from '../../hooks/usePatients';
import { useTransactions } from '../../hooks/useTransactions';
import { supabase } from '../../lib/supabase';
import { IRAQI_GOVERNORATES } from '../../utils/location';
import { toast } from 'sonner';
import { SocialBadges } from '../../components/auth/SocialBadges';

const SubscriptionCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  // Helper: calculate expiry date from billing_period
  const calcExpiry = (createdAt: string, billingPeriod?: string) => {
    const start = new Date(createdAt);
    const end = new Date(start);
    if (billingPeriod === 'yearly') end.setFullYear(end.getFullYear() + 1);
    else if (billingPeriod === 'semi_annual') end.setMonth(end.getMonth() + 6);
    else end.setMonth(end.getMonth() + 1); // default monthly
    return end;
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Get latest approved request
        const { data: request, error } = await supabase
          .from('subscription_requests')
          .select('*, plan:subscription_plans(*)')
          .eq('doctor_id', user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"

        if (request) {
          const billingPeriod = request.payment_details?.billing_period;
          const expiryDate = calcExpiry(request.created_at, billingPeriod);
          const discountApplied = request.payment_details?.discount_applied || request.payment_details?.discountApplied || 0;
          const basePrice = request.amount_paid || request.plan?.price?.monthly || 0;

          setSubscription({
            ...request,
            planName: request.plan?.name || 'Unknown Plan',
            planNameEn: request.plan?.name_en || 'Plan',
            expiryDate,
            isExpired: new Date() > expiryDate,
            billingPeriod: billingPeriod || 'monthly',
            discountApplied,
            price: Number(basePrice),
            features: request.plan?.features || [],
            maxClinics: request.plan?.limits?.max_clinics || 1,
            maxPatients: request.plan?.limits?.max_patients || 50,
            maxServices: request.plan?.limits?.max_services || 10,
            aiRequestLimit: request.plan?.limits?.max_ai || 0
          });
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);


  if (loading) return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;

  // Default / Free Plan State if no subscription found
  const sub = subscription || {
    planName: 'الباقة المجانية',
    planNameEn: 'Free Plan',
    expiryDate: null,
    isExpired: false,
    billingPeriod: 'monthly',
    discountApplied: 0,
    price: 0,
    maxClinics: 1,
    maxPatients: 50,
    maxServices: 5,
    aiRequestLimit: 0,
    isFree: true
  };

  const billingLabel = sub.billingPeriod === 'yearly' ? 'سنوي' : sub.billingPeriod === 'semi_annual' ? '6 أشهر' : 'شهري';
  const activeStatus = sub.isFree ? 'باقة افتراضية' : sub.isExpired ? 'منتهية الصلاحية' : 'نشط حالياً';
  const statusColor = sub.isFree ? 'bg-gray-500/20' : sub.isExpired ? 'bg-red-500/20' : 'bg-green-500/20';


  return (
    <Card className={`bg-gradient-to-br ${sub.isFree ? 'from-gray-700 to-gray-900' : sub.isExpired ? 'from-red-900 to-gray-900' : 'from-indigo-900 to-blue-900'} text-white border-none overflow-hidden relative`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

      <div className="p-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 ${statusColor}`}>
                {activeStatus}
              </span>
              {!sub.isFree && (
                <span className="text-white/60 text-sm bg-white/10 px-2 py-0.5 rounded-full">{billingLabel}</span>
              )}
              {sub.expiryDate && (
                <span className={`text-sm ${sub.isExpired ? 'text-red-300' : 'text-white/60'}`}>
                  {sub.isExpired ? 'انتهت في: ' : 'تنتهي في: '}{sub.expiryDate.toLocaleDateString('ar-EG')}
                </span>
              )}
            </div>

            <h2 className="text-3xl font-bold mb-2">{sub.planName}</h2>
            <p className="text-blue-100 max-w-xl">
              {sub.isFree ? 'قم بالترقية للحصول على المزيد من المميزات وإدارة عيادات متعددة.' : 'استمتع بميزات باقتك الحالية.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              className="whitespace-nowrap bg-white text-blue-900 hover:bg-blue-50 border-none"
              onClick={() => navigate('/doctor/subscription/upgrade')}
            >
              <Star className="w-4 h-4 mr-2" />
              {sub.isFree ? 'ترقية الباقة' : 'تغيير الباقة'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/10">
          <div>
            <p className="text-blue-200 text-xs mb-1">قيمة الاشتراك</p>
            <p className="text-xl font-bold">{sub.price?.toLocaleString()} <span className="text-xs font-normal text-blue-200">د.ع</span></p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">العيادات المسموحة</p>
            <p className="text-xl font-bold">{sub.maxClinics}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">المرضى</p>
            <p className="text-xl font-bold">{sub.maxPatients >= 9999 ? '∞' : sub.maxPatients}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">الذكاء الاصطناعي</p>
            <p className="text-xl font-bold">{sub.aiRequestLimit === -1 ? '∞' : sub.aiRequestLimit} <span className="text-xs font-normal text-blue-200">طلب</span></p>
          </div>
        </div>
      </div>
    </Card>
  );
};
export const DoctorProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Real Data Hooks
  const { clinics } = useClinics();
  const { patients } = usePatients();
  const { transactions } = useTransactions();

  // Doctor Statistics
  const userRole = user?.role || 'owner';
  const isStaff = userRole === 'staff';

  const totalClinics = isStaff ? 1 : clinics.length;
  const totalPatients = patients?.length || 0;

  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const successRate = 98.5;

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    governorate: 'بغداد',
    address: '',
    specialization: isStaff ? 'طاقم عيادة' : 'طب الأسنان التجميلي',
    experience: '5 سنوات',
    license: 'رقم الترخيص: DT-12345',
    bio: isStaff ? 'موظف في عيادة النور التخصصية' : 'طبيب أسنان متخصص في التجميل والزراعة مع خبرة 10 سنوات',
  });

  // Load profile location from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from('profiles').select('governorate, address, phone, full_name').eq('id', user.id).single();
      if (data) {
        setProfileData(prev => ({
          ...prev,
          name: data.full_name || prev.name,
          phone: data.phone || prev.phone,
          governorate: data.governorate || 'بغداد',
          address: data.address || '',
        }));
      }
    };
    loadProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (user?.id) {
      await supabase.from('profiles').update({
        governorate: profileData.governorate,
        address: profileData.address,
        phone: profileData.phone,
      }).eq('id', user.id);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Update Profile table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('تم تحديث الصورة الشخصية بنجاح');
      window.location.reload(); 
    } catch (err: any) {
      console.error('Upload error:', err);
    }
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'security'>('overview');

  // Fetch Subscription History
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);

  // Helper: compute expiry from billing_period stored in payment_details
  const computeExpiry = (createdAt: string, paymentDetails: any) => {
    const bp = paymentDetails?.billing_period;
    const start = new Date(createdAt);
    const end = new Date(start);
    if (bp === 'yearly') end.setFullYear(end.getFullYear() + 1);
    else if (bp === 'semi_annual') end.setMonth(end.getMonth() + 6);
    else end.setMonth(end.getMonth() + 1);
    return end;
  };

  const billingPeriodLabel = (bp?: string) => {
    if (bp === 'yearly') return 'سنوي';
    if (bp === 'semi_annual') return '6 أشهر';
    return 'شهري';
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('subscription_requests')
          .select('*, plan:subscription_plans(name, price)')
          .eq('doctor_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching history:', error);
        } else {
          setSubscriptionHistory(data || []);
        }
      } catch (e) { console.error(e); }
    };

    if (activeTab === 'subscriptions') {
      fetchHistory();
    }
  }, [user, activeTab]);




  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600 mt-1">إدارة معلوماتك الشخصية والمهنية</p>
        </div>
        {!isEditing && activeTab === 'overview' ? (
          <Button
            variant="primary"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            تعديل الملف
          </Button>
        ) : isEditing && activeTab === 'overview' ? (
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              إلغاء
            </Button>
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'overview' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          نظرة عامة
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        {!isStaff && (
          <button
            className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'subscriptions' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            الاشتراكات
            {activeTab === 'subscriptions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        )}
        <button
          className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'security' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('security')}
        >
          إعدادات الدخول
          {activeTab === 'security' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="flex flex-col gap-6">
            {/* Top Section: Profile Picture & Professional Info */}
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Profile Picture Card */}
              <Card className="w-full lg:w-1/3">
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 mb-4 group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg mx-auto">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-1">{profileData.name}</h2>
                  <p className="text-gray-500 text-sm mb-2">{profileData.specialization}</p>
                  
                  <div className="mb-4">
                    <SocialBadges />
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    تغيير الصورة
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </Card>

              {/* Professional Information (Moved to Top) */}
              <Card className="w-full lg:w-2/3">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">المعلومات المهنية</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">{isStaff ? 'الدور الوظيفي' : 'التخصص'}</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.specialization}
                          onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.specialization}</p>
                      )}
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900">سنوات الخبرة</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.experience}
                          onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-green-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.experience}</p>
                      )}
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-gray-900">عضو منذ</span>
                      </div>
                      <p className="text-gray-700">يناير 2020</p>
                    </div>
                    {/* License Removed as requested */}
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom Section: Personal Info */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">المعلومات الشخصية</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2"><User className="w-4 h-4" /> الاسم الكامل</div>
                    </label>
                    <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} disabled={!isEditing} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> البريد الإلكتروني</div>
                    </label>
                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} disabled={!isEditing} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> رقم الهاتف</div>
                    </label>
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} disabled={!isEditing} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                  </div>
                  {/* Governorate + Address */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> المحافظة</div>
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.governorate}
                          onChange={(e) => setProfileData({ ...profileData, governorate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {IRAQI_GOVERNORATES.map(gov => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value={profileData.governorate} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50" />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> العنوان (اختياري)</div>
                      </label>
                      <input type="text" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} disabled={!isEditing} placeholder="شارع، حي، منطقة..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                    </div>
                  </div>
                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">نبذة مختصرة</label>
                    <textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} disabled={!isEditing} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : activeTab === 'subscriptions' ? (
        <div className="space-y-6 animate-in fade-in">

          {/* Current Subscription Card (Dynamic) */}
          <SubscriptionCard />

          {/* Subscription History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">سجل الاشتراكات والمدفوعات</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-right py-3 px-3 font-semibold text-gray-900">رقم الطلب</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-900">الباقة</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-900">المدة</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-900">تاريخ الطلب</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-900">تاريخ الانتهاء</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-900">المبلغ المدفوع</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-900">الخصم</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-900">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {subscriptionHistory.length > 0 ? (
                      subscriptionHistory.map((req: any) => {
                        const bp = req.payment_details?.billing_period;
                        const expiryDate = computeExpiry(req.created_at, req.payment_details);
                        const isExpired = req.status === 'approved' && new Date() > expiryDate;
                        const discount = req.payment_details?.discount_applied || req.payment_details?.discountApplied || 0;
                        const amountPaid = req.amount_paid || req.plan?.price?.monthly || 0;
                        
                        let statusLabel = 'مرفوض';
                        let statusClass = 'bg-red-100 text-red-700';
                        if (req.status === 'pending') { statusLabel = 'قيد المراجعة'; statusClass = 'bg-yellow-100 text-yellow-700'; }
                        else if (req.status === 'approved' && isExpired) { statusLabel = 'منتهي'; statusClass = 'bg-gray-100 text-gray-600'; }
                        else if (req.status === 'approved') { statusLabel = 'نشط'; statusClass = 'bg-green-100 text-green-700'; }

                        return (
                          <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs text-gray-500">#{req.id.slice(0, 8)}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                {(() => {
                                  const period = req.payment_details?.billing_period || 'monthly';
                                  const durationIcon = period === 'yearly' ? '12' : period === 'semi_annual' ? '6' : '1';
                                  return (
                                    <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-black rounded-md shadow-sm">
                                      {durationIcon}
                                    </span>
                                  );
                                })()}
                                <span className="font-bold text-gray-900 text-xs">{req.plan?.name || 'باقة غير معروفة'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                                {billingPeriodLabel(bp)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-gray-600" dir="ltr">
                              {new Date(req.created_at).toLocaleDateString('ar-EG')}
                            </td>
                            <td className={`py-3 px-3 text-[10px] font-bold ${isExpired ? 'text-red-600' : 'text-gray-600'}`} dir="ltr">
                              {req.status === 'approved' ? expiryDate.toLocaleDateString('ar-EG') : '-'}
                            </td>
                            <td className="py-3 px-3 font-bold text-gray-900 text-xs">
                              {Number(amountPaid).toLocaleString()} <span className="text-[10px] font-normal text-gray-400">د.ع</span>
                            </td>
                            <td className="py-3 px-3">
                              {discount > 0 ? (
                                <span className="text-green-600 font-bold text-[10px] bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                  −{Number(discount).toLocaleString()} د.ع
                                </span>
                              ) : (
                                <span className="text-gray-300 text-[10px]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${statusClass}`}>
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">لا توجد سجلات اشتراك سابقة</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">إعدادات الأمان والدخول</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={(user as any)?.username || (isStaff ? 'staff.user' : 'admin.user')}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">يتم تعيين اسم المستخدم من قبل إدارة العيادة</p>
                </div>

                <div className="border-t border-gray-100 my-6 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">تغيير كلمة المرور</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
                      <input type="password" placeholder="********" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                      <input type="password" placeholder="********" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                      <input type="password" placeholder="********" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={() => alert('تم تحديث كلمة المرور بنجاح')}
                    >
                      <Shield className="w-4 h-4 ml-2" />
                      تحديث كلمة المرور
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

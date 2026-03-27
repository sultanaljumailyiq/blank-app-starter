import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Building, Star, Shield,
  Camera, Edit3, Save, X, CheckCircle, Award, Calendar,
  Globe, Upload, Settings, Lock, Bell, Eye, EyeOff
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../lib/utils';
import { useSupplierProfile, SupplierProfile } from '../../hooks/useSupplierProfile';
import { NotificationsList } from '../../components/common/NotificationsList';
import { supabase } from '../../lib/supabase';
import { IRAQI_GOVERNORATES, formatLocation } from '../../utils/location';
import { SocialBadges } from '../../components/auth/SocialBadges';

export const SupplierProfilePage: React.FC = () => {
  const { profile, loading, updateProfile } = useSupplierProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'verification' | 'settings' | 'notifications'>('profile');
  const [showPassword, setShowPassword] = useState(false);

  // Local state for editing
  const [editForm, setEditForm] = useState<SupplierProfile>(profile);

  useEffect(() => {
    // Only update editForm if profile has actual data (has an id)
    if (profile && profile.id) {
      setEditForm(profile);
    }
  }, [profile.id]); // Only depend on profile.id to avoid infinite loops

  const tabs = [
    { id: 'profile', label: 'المعلومات الشخصية', icon: User },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'company', label: 'بيانات الشركة', icon: Building },
    { id: 'verification', label: 'التحقق والضمانات', icon: Shield },
    { id: 'settings', label: 'إعدادات الحساب', icon: Settings }
  ];

  const achievements = [
    {
      title: 'مورد معتمد',
      description: 'موثق ومعتمد من المنصة',
      icon: '🏆',
      date: '2018-03-15',
      verified: true
    },
    {
      title: 'مورد موثوق',
      description: 'حاصل على تقييمات ممتازة',
      icon: '⭐',
      date: '2020-06-20',
      verified: true
    },
    {
      title: 'أفضل خدمة عملاء',
      description: 'متميز في خدمة العملاء',
      icon: '🎖️',
      date: '2022-12-01',
      verified: true
    },
    {
      title: 'مورد السنة',
      description: 'أفضل مورد لعام 2023',
      icon: '👑',
      date: '2023-12-31',
      verified: true
    }
  ];

  const documents = [
    { type: 'رخصة العمل', status: 'مصدّق', uploadDate: '2018-03-15', expiryDate: '2028-03-15' },
    { type: 'الهوية التجارية', status: 'مصدّق', uploadDate: '2018-03-15', expiryDate: '2028-03-15' },
    { type: 'شهادة الضرائب', status: 'مصدّق', uploadDate: '2024-01-01', expiryDate: '2024-12-31' },
    { type: 'شهادة الجودة ISO', status: 'مصدّق', uploadDate: '2023-06-01', expiryDate: '2026-06-01' }
  ];

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل الملف الشخصي...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600 mt-1">إدارة المعلومات الشخصية وبيانات الشركة</p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                حفظ
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              تعديل
            </Button>
          )}
        </div>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl rounded-[2rem] relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <Building className="absolute -bottom-10 -left-10 w-64 h-64 rotate-12" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20"></div>
        </div>

        <div className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-start gap-8">

            {/* Avatar Section */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-5xl backdrop-blur-md shadow-2xl border-4 border-white/10 overflow-hidden">
                {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:')) ? (
                  <img src={profile.avatar} alt={profile.companyName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white/80">
                    {(profile.companyName || profile.firstName || '?').charAt(0)}
                  </span>
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !profile.id) return;
                      try {
                        const fileExt = file.name.split('.').pop();
                        const filePath = `supplier-logos/${profile.id}.${fileExt}`;

                        const { error: uploadError } = await supabase.storage
                          .from('supplier-logos')
                          .upload(filePath, file, { upsert: true });

                        if (uploadError) {
                          console.error('Upload error:', uploadError);
                          return;
                        }

                        const { data: urlData } = supabase.storage
                          .from('supplier-logos')
                          .getPublicUrl(filePath);

                        if (urlData?.publicUrl) {
                          setEditForm(prev => ({ ...prev, avatar: urlData.publicUrl }));
                          // Also sync to profiles table for community consistency
                          const { data: { user: authUser } } = await supabase.auth.getUser();
                          if (authUser?.id) {
                            await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', authUser.id);
                          }
                        }
                      } catch (err) {
                        console.error('Avatar upload failed:', err);
                      }
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </>
              )}
              {profile.verified && (
                <div className="absolute top-0 left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-right space-y-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold tracking-tight">{profile.firstName} {profile.lastName}</h2>
                  {profile.trusted && (
                    <div className="flex items-center gap-1.5 bg-yellow-400/20 text-yellow-200 px-3 py-1 rounded-full border border-yellow-400/30 backdrop-blur-sm shadow-sm">
                      <Shield className="w-4 h-4 fill-current" />
                      <span className="text-xs font-bold">موثوق</span>
                    </div>
                  )}
                </div>
                <p className="text-xl text-blue-100 font-medium opacity-90">{profile.companyName}</p>
                <div className="mt-2 flex justify-center md:justify-start">
                  <SocialBadges />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{profile.rating}</span>
                  <span className="opacity-70">({profile.totalReviews} تقييم)</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/5">
                  <Calendar className="w-4 h-4 text-blue-200" />
                  <span className="opacity-90">عضو منذ {new Date(profile.joinDate).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/5">
                  <Award className="w-4 h-4 text-purple-200" />
                  <span className="opacity-90">{profile.totalOrders} طلب مكتمل</span>
                </div>
              </div>
            </div>

            {/* Stats/Quick Info */}
            <div className="hidden lg:flex gap-4">
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold mb-1">98%</p>
                <p className="text-xs text-blue-200">نسبة الرضا</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold mb-1">24h</p>
                <p className="text-xs text-blue-200">سرعة الرد</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden">
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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم العائلة</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="flex-1 px-4 py-2 bg-gray-50 rounded-lg">{profile.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="flex-1 px-4 py-2 bg-gray-50 rounded-lg">{profile.phone}</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة و العنوان</label>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <select
                          value={editForm.governorate || 'بغداد'}
                          onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                          {IRAQI_GOVERNORATES.map(gov => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-start gap-2">
                        <textarea
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          rows={1}
                          placeholder="الشارع، الحي..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <p className="flex-1 px-4 py-2 bg-gray-50 rounded-lg">
                        {formatLocation(profile.governorate, profile.address) || 'غير محدد'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشركة</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.companyName}
                      onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.companyName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف الشركة</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.companyDescription}
                      onChange={(e) => setEditForm({ ...editForm, companyDescription: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.companyDescription}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الرخصة التجارية</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.businessLicense}
                      onChange={(e) => setEditForm({ ...editForm, businessLicense: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.businessLicense}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الضريبي</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.taxNumber}
                      onChange={(e) => setEditForm({ ...editForm, taxNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.taxNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموقع الإلكتروني</label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سنة التأسيس</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.establishedYear}
                      onChange={(e) => setEditForm({ ...editForm, establishedYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.establishedYear}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-8">
              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الوثائق المطلوبة</h3>
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.status === 'مصدّق' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                          {doc.status === 'مصدّق' ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{doc.type}</p>
                          <p className="text-sm text-gray-600">
                            رُفعت: {formatDate(doc.uploadDate)} |
                            تنتهي: {formatDate(doc.expiryDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${doc.status === 'مصدّق' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                          {doc.status}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الإنجازات والشارات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(achievement.date)}
                        </p>
                      </div>
                      {achievement.verified && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <NotificationsList />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Contact Visibility Settings - NEW */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات خصوصية معلومات الاتصال</h3>
                <p className="text-sm text-gray-500 mb-4">تحكم في المعلومات التي تظهر للأطباء في صفحة ملفك الشخصي</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">إظهار رقم الهاتف</p>
                        <p className="text-sm text-gray-600">السماح للأطباء برؤية رقم هاتفك للتواصل المباشر</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.settings?.showPhone ?? true}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, showPhone: e.target.checked } as any
                          }))}
                          disabled={!isEditing}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${(!isEditing) ? 'opacity-50 cursor-not-allowed' : ''} peer-checked:bg-blue-600`}></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">إظهار البريد الإلكتروني</p>
                        <p className="text-sm text-gray-600">السماح للأطباء بمراسلتك عبر البريد</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.settings?.showEmail ?? true}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, showEmail: e.target.checked } as any
                          }))}
                          disabled={!isEditing}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${(!isEditing) ? 'opacity-50 cursor-not-allowed' : ''} peer-checked:bg-blue-600`}></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">إظهار العنوان التفصيلي</p>
                        <p className="text-sm text-gray-600">عرض موقعك الجغرافي بالتفصيل</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.settings?.showAddress ?? true}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, showAddress: e.target.checked } as any
                          }))}
                          disabled={!isEditing}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${(!isEditing) ? 'opacity-50 cursor-not-allowed' : ''} peer-checked:bg-blue-600`}></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الأمان</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">كلمة المرور</p>
                        <p className="text-sm text-gray-600">آخر تغيير منذ 3 أشهر</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      تغيير
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">التحقق بخطوتين</p>
                        <p className="text-sm text-gray-600">حماية إضافية لحسابك</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الإشعارات</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">إشعارات الطلبات الجديدة</p>
                        <p className="text-sm text-gray-600">تنبيهات فورية للطلبات الجديدة</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">إشعارات البريد الإلكتروني</p>
                        <p className="text-sm text-gray-600">تقارير أسبوعية وتحديثات</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
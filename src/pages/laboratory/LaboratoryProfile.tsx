import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Building, Camera, Edit3, Save,
  X, Shield, Award, Calendar, Settings, Lock, FileText, CheckCircle
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLabProfile } from '../../hooks/useLabProfile';

export const LaboratoryProfile: React.FC = () => {
  const { profile, loading, updateProfile } = useLabProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'team' | 'settings'>('info');

  // Sync form with profile when loaded
  React.useEffect(() => {
    if (profile) setEditForm(profile);
  }, [profile]);

  const tabs = [
    { id: 'info', label: 'معلومات المعمل', icon: Building },
    { id: 'services', label: 'الخدمات والأسعار', icon: FileText },
    { id: 'team', label: 'فريق العمل', icon: Users },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  const UsersIcon = Users; // Alias for use in tabs array

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  if (loading) return <div className="p-8 text-center">جاري تحميل الملف الشخصي...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600 mt-1">إدارة معلومات المعمل والخدمات</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 ml-2" />
              تعديل
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl backdrop-blur-sm">
              {profile.avatar}
            </div>
            {isEditing && (
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              {profile.isVerified && (
                <div className="bg-white/20 p-1 rounded-full" title="موثق">
                  <Shield className="w-5 h-5 text-blue-100" />
                </div>
              )}
              {profile.isAccredited && (
                <div className="bg-white/20 p-1 rounded-full" title="معتمد">
                  <CheckCircle className="w-5 h-5 text-yellow-300" />
                </div>
              )}
            </div>
            <p className="opacity-90">{profile.description}</p>
            <div className="flex gap-4 mt-4 text-sm opacity-80">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.address}</span>
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.phone}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المعمل</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                ) : <p className="p-2 bg-gray-50 rounded-lg">{profile.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المدير المسؤول</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.managerName}
                    onChange={e => setEditForm({ ...editForm, managerName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                ) : <p className="p-2 bg-gray-50 rounded-lg">{profile.managerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الترخيص</label>
                <p className="p-2 bg-gray-50 rounded-lg flex justify-between items-center">
                  {profile.licenseNumber}
                  <Shield className="w-4 h-4 text-green-500" />
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ساعات العمل</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.workingHours}
                    onChange={e => setEditForm({ ...editForm, workingHours: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                ) : <p className="p-2 bg-gray-50 rounded-lg">{profile.workingHours}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                {isEditing ? (
                  <textarea
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={2}
                  />
                ) : <p className="p-2 bg-gray-50 rounded-lg">{profile.address}</p>}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-8">
              {/* Delegates Control Section */}
              {/* Delegates Control Section */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    إدارة المندوبين
                  </h3>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                    {editForm.delegates?.length || 0} مندوبين
                  </div>
                </div>

                {/* List of Delegates */}
                <div className="space-y-3 mb-4">
                  {(editForm.delegates || []).map((delegate, idx) => (
                    <div key={delegate.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${delegate.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-bold text-gray-700">{delegate.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Toggle */}
                        <button
                          onClick={() => {
                            const updatedDelegates = [...(editForm.delegates || [])];
                            const newStatus: 'available' | 'busy' = !delegate.isAvailable ? 'available' : 'busy';
                            updatedDelegates[idx] = {
                              ...delegate,
                              isAvailable: !delegate.isAvailable,
                              status: newStatus
                            };
                            setEditForm({ ...editForm, delegates: updatedDelegates });
                          }}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${delegate.isAvailable
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                        >
                          {delegate.isAvailable ? 'متاح' : 'مشغول'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            const updatedDelegates = (editForm.delegates || []).filter(d => d.id !== delegate.id);
                            setEditForm({ ...editForm, delegates: updatedDelegates });
                          }}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(editForm.delegates || []).length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-2">لا يوجد مندوبين مسجلين</p>
                  )}
                </div>

                {/* Add New Delegate */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اسم المندوب الجديد"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value;
                        if (val) {
                          const newDelegate: any = {
                            id: Date.now().toString(),
                            name: val,
                            status: 'available',
                            isAvailable: true
                          };
                          setEditForm({
                            ...editForm,
                            delegates: [...(editForm.delegates || []), newDelegate]
                          });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value) {
                        const newDelegate = {
                          id: Date.now().toString(),
                          name: input.value,
                          status: 'available',
                          isAvailable: true
                        };
                        setEditForm({
                          ...editForm,
                          delegates: [...(editForm.delegates || []), newDelegate as any]
                        });
                        input.value = '';
                      }
                    }}
                    className="whitespace-nowrap"
                  >
                    + إضافة
                  </Button>
                </div>
              </div>

              {/* Specialties Section */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">التخصصات والخدمات</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(editForm.services || profile.services).map((service, idx) => (
                    <div key={idx} className="p-4 border rounded-lg text-center bg-gray-50 relative group">
                      <span className="font-medium">{service}</span>
                      {isEditing && (
                        <button
                          onClick={() => {
                            const newServices = editForm.services.filter((_, i) => i !== idx);
                            setEditForm({ ...editForm, services: newServices });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newService = prompt("أدخل اسم الخدمة الجديدة:");
                        if (newService) setEditForm({ ...editForm, services: [...editForm.services, newService] });
                      }}
                      className="p-4 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors"
                    >
                      + إضافة خدمة
                    </button>
                  )}
                </div>
              </div>

              {/* Price List Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">قائمة الأسعار</h3>
                  {isEditing && <Button size="sm" variant="outline">إضافة عنصر</Button>}
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                      <tr>
                        <th className="p-3">الخدمة</th>
                        <th className="p-3">السعر (د.ع)</th>
                        {isEditing && <th className="p-3">إجراء</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: 'Zirconia Crown', price: 85000 },
                        { name: 'E-Max Veneer', price: 120000 },
                        { name: 'PFM Crown', price: 45000 },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3">{item.name}</td>
                          <td className="p-3 font-bold">{item.price.toLocaleString()}</td>
                          {isEditing && (
                            <td className="p-3">
                              <button className="text-red-500 hover:text-red-700">
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>لا توجد معلومات عن الفريق حالياً</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-bold">تغيير كلمة المرور</h4>
                  <p className="text-sm text-gray-500">تحديث كلمة مرور الحساب</p>
                </div>
                <Button variant="outline" size="sm">تحديث</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-bold">الإشعارات</h4>
                  <p className="text-sm text-gray-500">تخصيص تنبيهات الطلبات والرسائل</p>
                </div>
                <Button variant="outline" size="sm">إدارة</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Helper for icon usage
import { Users } from 'lucide-react';

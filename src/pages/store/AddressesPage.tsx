import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit3, CheckCircle, Navigation, ArrowRight, Building, Stethoscope } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useStoreAddresses } from '../../hooks/useStoreAddresses';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../../components/layout/BottomNavigation';

export const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addresses, loading, addAddress, deleteAddress } = useStoreAddresses();
  const [showForm, setShowForm] = useState(false);

  if (loading) return <div className="p-12 text-center text-slate-500">جاري تحميل العناوين...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">


      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Info Request Card */}
        {!showForm && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100 flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-orange-900 mb-1">إضافة عنوان جديد</h3>
              <p className="text-sm text-orange-700/80">أضف عناوين عياداتك لتسهيل عملية الشحن.</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 text-white rounded-xl px-4 py-2 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إضافة
            </Button>
          </div>
        )}

        {showForm && (
          <Card className="p-6 mb-8 border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-slate-400" />
              تفاصيل العنوان الجديد
            </h3>
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">اسم العنوان (مثلاً: العيادة الرئيسية)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="الاسم"
                  id="addr-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">المحافظة</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none"
                  id="addr-gov"
                >
                  <option value="بغداد">بغداد</option>
                  <option value="أربيل">أربيل</option>
                  <option value="البصرة">البصرة</option>
                  <option value="النجف">النجف</option>
                  <option value="نينوى">نينوى</option>
                  <option value="ذي قار">ذي قار</option>
                  <option value="كركوك">كركوك</option>
                  <option value="الأنبار">الأنبار</option>
                  <option value="ديالى">ديالى</option>
                  <option value="المثنى">المثنى</option>
                  <option value="القادسية">القادسية</option>
                  <option value="ميسان">ميسان</option>
                  <option value="واسط">واسط</option>
                  <option value="صلاح الدين">صلاح الدين</option>
                  <option value="دهوك">دهوك</option>
                  <option value="السليمانية">السليمانية</option>
                  <option value="بابل">بابل</option>
                  <option value="كربلاء">كربلاء</option>
                </select>
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500">المدينة / المنطقة</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="مثال: المنصور"
                  id="addr-city"
                />
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500">رقم الهاتف</label>
                <input
                  type="tel"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="0770..."
                  id="addr-phone"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500">العنوان التفصيلي</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none h-24"
                  placeholder="الشارع، رقم المبنى، علامة مميزة..."
                  id="addr-street"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-500">إلغاء</Button>
              <Button
                onClick={() => {
                  const name = (document.getElementById('addr-name') as HTMLInputElement).value;
                  const gov = (document.getElementById('addr-gov') as HTMLSelectElement).value;
                  const city = (document.getElementById('addr-city') as HTMLInputElement).value;
                  const street = (document.getElementById('addr-street') as HTMLTextAreaElement).value;
                  const phone = (document.getElementById('addr-phone') as HTMLInputElement).value;

                  if (name && city && street && phone) {
                    addAddress({ name, city: gov, street: `${city} - ${street}`, phone }); // Mapping simplified
                    setShowForm(false);
                  }
                }}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                حفظ العنوان
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {addresses.map(address => (
            <div
              key={address.id}
              className={`p-6 rounded-3xl transition-all duration-300 relative group
                                ${address.isDefault
                  ? 'bg-white shadow-lg border-2 border-green-500'
                  : 'bg-white shadow-sm border border-slate-100 hover:shadow-md'
                }
                            `}
            >
              {address.isDefault && (
                <div className="absolute top-4 left-4 text-white bg-green-500 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  <CheckCircle className="w-3 h-3" />
                  مفعل
                </div>
              )}

              <div className="mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${address.type === 'clinic' ? 'bg-blue-50 text-blue-500' :
                  address.type === 'lab' ? 'bg-purple-50 text-purple-500' :
                    'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'
                  }`}>
                  {address.type === 'clinic' ? <Stethoscope className="w-5 h-5" /> :
                    address.type === 'lab' ? <Building className="w-5 h-5" /> :
                      <MapPin className="w-5 h-5" />}
                </div>
                <h3 className="font-bold text-lg text-slate-900">{address.name}</h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  {address.city}، {address.area}<br />
                  {address.street}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                  <span className="text-xs text-slate-400">هاتف:</span>
                  <span className="text-xs font-mono font-bold text-slate-600" dir="ltr">{address.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                <button className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  {address.type === 'custom' ? 'تعديل' : 'عرض'}
                </button>
                {address.type === 'custom' && (
                  <button
                    onClick={() => deleteAddress(address.id)}
                    className="flex-1 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    حذف
                  </button>
                )}
              </div>
            </div>
          ))}

          {addresses.length === 0 && !showForm && (
            <div className="col-span-full py-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">لا توجد عناوين محفوظة</h3>
              <p className="text-slate-400 text-sm mt-1">أضف عنواناً جديداً لبدء الشحن.</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

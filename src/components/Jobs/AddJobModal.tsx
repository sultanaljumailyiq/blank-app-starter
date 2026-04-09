import React, { useState } from 'react';
import { X, Plus, UserSearch, Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = 'choose-type' | 'need-doctor' | 'create-job';

export const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('choose-type');

  if (!isOpen) return null;

  const resetAndClose = () => {
    setCurrentStep('choose-type');
    onClose();
  };

  const ChooseTypeStep = () => (
    <div className="p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إضافة فرصة عمل جديدة</h2>
        <p className="text-gray-600">اختر نوع الطلب الذي تريد إنشاءه</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* أحتاج طبيب */}
        <button
          onClick={() => setCurrentStep('need-doctor')}
          className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 hover:border-green-300 transition-all hover:shadow-lg"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UserSearch className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">أحتاج طبيب</h3>
            <p className="text-sm text-gray-600 mb-4">
              أبحث عن طبيب أسنان للعمل في عيادتي أو مشفاي
            </p>
            <div className="text-xs text-green-700 bg-green-200 px-3 py-1 rounded-full inline-block">
              طلب توظيف سريع
            </div>
          </div>
        </button>

        {/* إنشاء وظيفة */}
        <button
          onClick={() => setCurrentStep('create-job')}
          className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all hover:shadow-lg"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">إنشاء وظيفة</h3>
            <p className="text-sm text-gray-600 mb-4">
              نشر وظيفة كاملة مع جميع التفاصيل والمتطلبات
            </p>
            <div className="text-xs text-blue-700 bg-blue-200 px-3 py-1 rounded-full inline-block">
              إعلان مفصل
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const NeedDoctorForm = () => (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentStep('choose-type')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <UserSearch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">أحتاج طبيب أسنان</h2>
            <p className="text-sm text-gray-600">املأ البيانات للبحث عن طبيب</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المؤسسة / العيادة
            </label>
            <input
              type="text"
              placeholder="عيادة الابتسامة الذهبية"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الموقع
            </label>
            <input
              type="text"
              placeholder="بغداد - الكرادة"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التخصص المطلوب
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500">
              <option value="">اختر التخصص</option>
              <option value="general">طب أسنان عام</option>
              <option value="orthodontics">تقويم أسنان</option>
              <option value="surgery">جراحة الفم والأسنان</option>
              <option value="pediatric">طب أسنان الأطفال</option>
              <option value="endodontics">عصب الأسنان</option>
              <option value="periodontics">أمراض اللثة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع العمل
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500">
              <option value="full-time">دوام كامل</option>
              <option value="part-time">دوام جزئي</option>
              <option value="contract">عقد مؤقت</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الراتب المقترح (د.ع شهرياً)
            </label>
            <input
              type="text"
              placeholder="1,500,000 - 2,500,000"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سنوات الخبرة المطلوبة
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500">
              <option value="entry">0-2 سنوات</option>
              <option value="mid">3-5 سنوات</option>
              <option value="senior">6+ سنوات</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وصف مختصر عن المطلوب
          </label>
          <textarea
            rows={4}
            placeholder="نبحث عن طبيب أسنان مؤهل للانضمام لفريقنا..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            معلومات التواصل
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
            />
            <input
              type="tel"
              placeholder="رقم الهاتف"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" className="flex-1 py-3 text-lg">
            نشر طلب البحث عن طبيب
          </Button>
          <Button variant="secondary" onClick={resetAndClose} className="px-6 py-3">
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );

  const CreateJobForm = () => (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentStep('choose-type')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">إنشاء وظيفة جديدة</h2>
            <p className="text-sm text-gray-600">املأ تفاصيل الوظيفة كاملة</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان الوظيفة
          </label>
          <input
            type="text"
            placeholder="طبيب أسنان عام - دوام كامل"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المحافظة
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500">
              <option value="">اختر المحافظة</option>
              <option value="baghdad">بغداد</option>
              <option value="basra">البصرة</option>
              <option value="erbil">أربيل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500">
              <option value="">اختر الفئة</option>
              <option value="general">طب أسنان عام</option>
              <option value="orthodontics">تقويم أسنان</option>
              <option value="surgery">جراحة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع العمل
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500">
              <option value="full-time">دوام كامل</option>
              <option value="part-time">دوام جزئي</option>
              <option value="contract">عقد مؤقت</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وصف الوظيفة
          </label>
          <textarea
            rows={4}
            placeholder="نبحث عن طبيب أسنان عام ذو خبرة للانضمام لفريقنا الطبي..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            متطلبات الوظيفة (اكتب كل متطلب في سطر منفصل)
          </label>
          <textarea
            rows={4}
            placeholder="شهادة بكالوريوس في طب الأسنان&#10;خبرة لا تقل عن 3 سنوات&#10;إجادة اللغة الإنجليزية"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="primary" className="flex-1 py-3 text-lg">
            نشر الوظيفة
          </Button>
          <Button variant="secondary" onClick={resetAndClose} className="px-6 py-3">
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetAndClose}>
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={resetAndClose}
          className="absolute top-4 left-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        {currentStep === 'choose-type' && <ChooseTypeStep />}
        {currentStep === 'need-doctor' && <NeedDoctorForm />}
        {currentStep === 'create-job' && <CreateJobForm />}
      </div>
    </div>
  );
};
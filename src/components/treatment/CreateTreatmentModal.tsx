import React, { useState } from 'react';
import { X, Plus, Save, FileText, Calendar, DollarSign, User, Clock, Beaker } from 'lucide-react';
import { Button } from '../common/Button';

interface NewTreatmentPlan {
  patientId: string;
  patientName: string;
  toothNumber: number;
  treatmentType: string;
  diagnosis: string;
  notes?: string;
  estimatedCost: number;
  estimatedSessions: number;
  estimatedDuration: number;
  labOrderRequired: boolean;
  labDetails?: string;
}

interface CreateTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (plan: NewTreatmentPlan) => void;
  patientInfo?: {
    id: string;
    name: string;
  };
}

import { getTreatments } from '../../data/mock/assets';

// ... (interfaces remain same)

export const CreateTreatmentModal: React.FC<CreateTreatmentModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  patientInfo
}) => {
  const treatments = getTreatments();
  const [formData, setFormData] = useState<NewTreatmentPlan>({
    patientId: patientInfo?.id || '',
    patientName: patientInfo?.name || '',
    toothNumber: 16,
    treatmentType: treatments[0]?.name || '',
    diagnosis: '',
    estimatedCost: treatments[0]?.basePrice || 0,
    estimatedSessions: treatments[0]?.expectedSessions || 1,
    estimatedDuration: 60,
    labOrderRequired: false
  });

  const [isDraft, setIsDraft] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof NewTreatmentPlan, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
    onCreate(formData);
    onClose();
    resetForm();
  };

  const handleSaveAsDraft = () => {
    setIsDraft(true);
    // حفظ كمسودة

    onClose();
    resetForm();
  };

  const resetForm = () => {
    const defaultTreatment = treatments[0];
    setFormData({
      patientId: patientInfo?.id || '',
      patientName: patientInfo?.name || '',
      toothNumber: 16,
      treatmentType: defaultTreatment?.name || '',
      diagnosis: '',
      estimatedCost: defaultTreatment?.basePrice || 0,
      estimatedSessions: defaultTreatment?.expectedSessions || 1,
      estimatedDuration: 60,
      labOrderRequired: false
    });
  };

  const handleTreatmentTypeChange = (typeName: string) => {
    handleInputChange('treatmentType', typeName);

    // Find the selected treatment object
    const selectedTreatment = treatments.find(t => t.name === typeName);

    if (selectedTreatment) {
      // Update cost and sessions from assets
      handleInputChange('estimatedCost', selectedTreatment.basePrice);
      handleInputChange('estimatedSessions', selectedTreatment.expectedSessions || 1);

      // Logic for Lab Requirement (example logic based on category)
      const labRequired = ['تعويضات', 'جراحة'].includes(selectedTreatment.category) || selectedTreatment.name.includes('تاج') || selectedTreatment.name.includes('طقم');
      handleInputChange('labOrderRequired', labRequired);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* رأس النافذة - برتقالي */}
        <div className="sticky top-0 bg-orange-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-1">إنشاء خطة علاجية جديدة</h3>
              <p className="text-orange-100">إضافة خطة علاج جديدة من الصفر</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-orange-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* معلومات المريض */}
          <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-orange-600" />
              <h4 className="font-bold text-gray-900">معلومات المريض</h4>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">اسم المريض:</span>
                  <span className="font-medium mr-2">{formData.patientName}</span>
                </div>
                <div>
                  <span className="text-gray-600">رقم الملف:</span>
                  <span className="font-medium mr-2">{formData.patientId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات السن والعلاج */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-gray-900">معلومات السن والعلاج</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم السن <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.toothNumber}
                  onChange={(e) => handleInputChange('toothNumber', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="11"
                  max="48"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">الأسنان من 11 إلى 48 (نظام FDI)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العلاج <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.treatmentType}
                  onChange={(e) => handleTreatmentTypeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">اختر نوع العلاج...</option>
                  {treatments.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} - {t.basePrice.toLocaleString()} د.ع ({t.expectedSessions} جلسات)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التشخيص <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="أدخل التشخيص التفصيلي للحالة..."
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="أضف أي ملاحظات أو تعليمات خاصة..."
              />
            </div>
          </div>

          {/* التفاصيل الأساسية */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-gray-900">التفاصيل الأساسية</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الجلسات المتوقع
                </label>
                <input
                  type="number"
                  value={formData.estimatedSessions}
                  onChange={(e) => handleInputChange('estimatedSessions', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مدة الجلسة (دقيقة)
                </label>
                <div className="relative">
                  <Clock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="15"
                    max="240"
                    step="15"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدة الإجمالية
                </label>
                <div className="p-3 bg-white rounded-lg border border-gray-300 text-center">
                  <span className="font-medium text-gray-900">
                    {formData.estimatedSessions * formData.estimatedDuration} دقيقة
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    ({(formData.estimatedSessions * formData.estimatedDuration / 60).toFixed(1)} ساعة)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* المعلومات المالية */}
          <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-gray-900">المعلومات المالية</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التكلفة التقديرية (د.ع)
                </label>
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  السعر التقديري لـ{formData.treatmentType}: {
                    treatments.find(t => t.name === formData.treatmentType)?.basePrice.toLocaleString() || 0
                  } د.ع
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تكلفة الجلسة الواحدة
                </label>
                <div className="p-3 bg-white rounded-lg border border-gray-300 text-center">
                  <span className="font-medium text-purple-600 text-xl">
                    {formData.estimatedSessions > 0
                      ? (formData.estimatedCost / formData.estimatedSessions).toLocaleString()
                      : '0'} د.ع
                  </span>
                  <p className="text-xs text-gray-500 mt-1">للجلسة الواحدة</p>
                </div>
              </div>
            </div>
          </div>

          {/* طلب المختبر */}
          <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Beaker className="w-5 h-5 text-yellow-600" />
                <h4 className="font-bold text-gray-900">طلب المختبر</h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.labOrderRequired}
                  onChange={(e) => handleInputChange('labOrderRequired', e.target.checked)}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">يتطلب عمل مختبري</span>
              </label>
            </div>

            {formData.labOrderRequired && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تفاصيل العمل المطلوب من المختبر
                </label>
                <textarea
                  value={formData.labDetails || ''}
                  onChange={(e) => handleInputChange('labDetails', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="مثال: تاج خزفي E-max للضرس 16، اللون A2..."
                />
                <p className="text-xs text-yellow-700 mt-2">
                  ملاحظة: سيتم إرسال طلب منفصل للمختبر بعد إنشاء الخطة
                </p>
              </div>
            )}
          </div>

          {/* ملخص الخطة */}
          <div className="bg-gray-100 rounded-xl p-5 border-2 border-orange-300">
            <h4 className="font-bold text-gray-900 mb-4 text-center">ملخص الخطة العلاجية</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">السن</p>
                <p className="text-xl font-bold text-blue-600">{formData.toothNumber}</p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">عدد الجلسات</p>
                <p className="text-xl font-bold text-green-600">{formData.estimatedSessions}</p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">التكلفة</p>
                <p className="text-xl font-bold text-purple-600">{formData.estimatedCost.toLocaleString()}</p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">مختبر</p>
                <p className="text-xl font-bold text-yellow-600">{formData.labOrderRequired ? 'نعم' : 'لا'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex gap-3 justify-between">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              إلغاء
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveAsDraft}
                variant="outline"
                className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Save className="w-4 h-4" />
                حفظ كمسودة
              </Button>
              <Button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!formData.diagnosis || !formData.toothNumber}
              >
                <Plus className="w-4 h-4" />
                إنشاء الخطة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle, Calendar, DollarSign, User, Clock, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';

interface TreatmentPlan {
  id: string;
  patientName: string;
  toothNumber: number;
  treatmentType: string;
  diagnosis: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  totalCost: number;
  paidAmount: number;
  remainingAmount: number;
  sessions: Session[];
  notes?: string;
  createdDate: string;
  estimatedCompletion?: string;
}

interface Session {
  id: string;
  sessionNumber: number;
  date?: string;
  time?: string;
  duration: number;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  procedureDetails?: string;
  cost: number;
  paidAmount: number;
  notes?: string;
}

interface EditTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: TreatmentPlan) => void;
  treatmentPlan: TreatmentPlan | null;
}

export const EditTreatmentModal: React.FC<EditTreatmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  treatmentPlan
}) => {
  const [formData, setFormData] = useState<TreatmentPlan | null>(null);

  useEffect(() => {
    if (treatmentPlan) {
      setFormData({ ...treatmentPlan });
    }
  }, [treatmentPlan]);

  if (!isOpen || !formData) return null;

  const handleInputChange = (field: keyof TreatmentPlan, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSessionChange = (sessionIndex: number, field: keyof Session, value: any) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedSessions = [...prev.sessions];
      updatedSessions[sessionIndex] = {
        ...updatedSessions[sessionIndex],
        [field]: value
      };
      return { ...prev, sessions: updatedSessions };
    });
  };

  const handleAddSession = () => {
    setFormData(prev => {
      if (!prev) return null;
      const newSession: Session = {
        id: `session-${Date.now()}`,
        sessionNumber: prev.sessions.length + 1,
        duration: 60,
        status: 'pending',
        cost: 0,
        paidAmount: 0
      };
      return { ...prev, sessions: [...prev.sessions, newSession] };
    });
  };

  const handleRemoveSession = (sessionIndex: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedSessions = prev.sessions.filter((_, index) => index !== sessionIndex);
      // إعادة ترقيم الجلسات
      updatedSessions.forEach((session, index) => {
        session.sessionNumber = index + 1;
      });
      return { ...prev, sessions: updatedSessions };
    });
  };

  const handleSave = () => {
    if (formData) {
      // حساب التكلفة الإجمالية والمتبقية
      const totalCost = formData.sessions.reduce((sum, s) => sum + s.cost, 0);
      const paidAmount = formData.sessions.reduce((sum, s) => sum + s.paidAmount, 0);
      const updatedPlan = {
        ...formData,
        totalCost,
        paidAmount,
        remainingAmount: totalCost - paidAmount
      };
      onSave(updatedPlan);
      onClose();
    }
  };

  const handleCompletePlan = () => {
    if (formData) {
      const updatedPlan = {
        ...formData,
        status: 'completed' as const
      };
      onSave(updatedPlan);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* رأس النافذة - أخضر */}
        <div className="sticky top-0 bg-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-1">تعديل الخطة العلاجية</h3>
              <p className="text-green-100">تحرير البيانات وتحديث التفاصيل</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-green-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* معلومات أساسية */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-gray-900">معلومات الخطة الأساسية</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم السن
                </label>
                <input
                  type="number"
                  value={formData.toothNumber}
                  onChange={(e) => handleInputChange('toothNumber', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="11"
                  max="48"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العلاج
                </label>
                <select
                  value={formData.treatmentType}
                  onChange={(e) => handleInputChange('treatmentType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="علاج عصب">علاج عصب</option>
                  <option value="حشوة">حشوة</option>
                  <option value="تاج">تاج</option>
                  <option value="خلع">خلع</option>
                  <option value="تنظيف">تنظيف</option>
                  <option value="تقويم">تقويم</option>
                  <option value="قشرة">قشرة</option>
                  <option value="زراعة">زراعة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة الخطة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="pending">معلقة</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغية</option>
                </select>
              </div>
            </div>
          </div>

          {/* التشخيص */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-gray-900">التشخيص والملاحظات</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التشخيص
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="أدخل التشخيص التفصيلي..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات عامة
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="أضف ملاحظات إضافية..."
                />
              </div>
            </div>
          </div>

          {/* الجلسات */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-gray-900">الجلسات العلاجية ({formData.sessions.length})</h4>
              </div>
              <Button
                onClick={handleAddSession}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                إضافة جلسة
              </Button>
            </div>

            <div className="space-y-4">
              {formData.sessions.map((session, index) => (
                <div key={session.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-green-600">{session.sessionNumber}</span>
                      </div>
                      <h5 className="font-medium text-gray-900">الجلسة {session.sessionNumber}</h5>
                    </div>
                    {formData.sessions.length > 1 && (
                      <Button
                        onClick={() => handleRemoveSession(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        التاريخ
                      </label>
                      <input
                        type="date"
                        value={session.date || ''}
                        onChange={(e) => handleSessionChange(index, 'date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الوقت
                      </label>
                      <input
                        type="time"
                        value={session.time || ''}
                        onChange={(e) => handleSessionChange(index, 'time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المدة (دقيقة)
                      </label>
                      <input
                        type="number"
                        value={session.duration}
                        onChange={(e) => handleSessionChange(index, 'duration', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحالة
                      </label>
                      <select
                        value={session.status}
                        onChange={(e) => handleSessionChange(index, 'status', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="pending">معلقة</option>
                        <option value="scheduled">مجدولة</option>
                        <option value="completed">مكتملة</option>
                        <option value="cancelled">ملغية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        التكلفة (د.ع)
                      </label>
                      <input
                        type="number"
                        value={session.cost}
                        onChange={(e) => handleSessionChange(index, 'cost', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المدفوع (د.ع)
                      </label>
                      <input
                        type="number"
                        value={session.paidAmount}
                        onChange={(e) => handleSessionChange(index, 'paidAmount', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تفاصيل الإجراء
                      </label>
                      <textarea
                        value={session.procedureDetails || ''}
                        onChange={(e) => handleSessionChange(index, 'procedureDetails', e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="وصف الإجراءات المنفذة..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ملاحظات الجلسة
                      </label>
                      <textarea
                        value={session.notes || ''}
                        onChange={(e) => handleSessionChange(index, 'notes', e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="ملاحظات إضافية..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ملخص مالي */}
          <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <h4 className="font-bold text-gray-900">الملخص المالي</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">التكلفة الإجمالية</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formData.sessions.reduce((sum, s) => sum + s.cost, 0).toLocaleString()} د.ع
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">المبلغ المدفوع</p>
                <p className="text-2xl font-bold text-green-600">
                  {formData.sessions.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()} د.ع
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">المبلغ المتبقي</p>
                <p className="text-2xl font-bold text-red-600">
                  {(formData.sessions.reduce((sum, s) => sum + s.cost, 0) - 
                    formData.sessions.reduce((sum, s) => sum + s.paidAmount, 0)).toLocaleString()} د.ع
                </p>
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
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4" />
                حفظ التعديلات
              </Button>
              <Button
                onClick={handleCompletePlan}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="w-4 h-4" />
                إكمال الخطة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

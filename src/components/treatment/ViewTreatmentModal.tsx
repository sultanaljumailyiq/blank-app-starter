import React from 'react';
import { X, Printer, Edit2, Calendar, DollarSign, User, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
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

interface ViewTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  treatmentPlan: TreatmentPlan | null;
}

export const ViewTreatmentModal: React.FC<ViewTreatmentModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  treatmentPlan
}) => {
  if (!isOpen || !treatmentPlan) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'معلقة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* رأس النافذة - أزرق */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-1">تفاصيل الخطة العلاجية</h3>
              <p className="text-blue-100">عرض شامل للخطة - قراءة فقط</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-gray-900">معلومات المريض</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">اسم المريض:</span>
                  <span className="font-medium">{treatmentPlan.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم السن:</span>
                  <span className="font-medium">{treatmentPlan.toothNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع العلاج:</span>
                  <span className="font-medium">{treatmentPlan.treatmentType}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-gray-900">المعلومات المالية</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">التكلفة الإجمالية:</span>
                  <span className="font-medium text-green-700">{treatmentPlan.totalCost.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ المدفوع:</span>
                  <span className="font-medium">{treatmentPlan.paidAmount.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ المتبقي:</span>
                  <span className="font-medium text-red-600">{treatmentPlan.remainingAmount.toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>
          </div>

          {/* التشخيص والحالة */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <h4 className="font-bold text-gray-900">التشخيص والحالة</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">التشخيص:</p>
                <p className="text-gray-900">{treatmentPlan.diagnosis}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الحالة:</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(treatmentPlan.status)}`}>
                  {treatmentPlan.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {getStatusLabel(treatmentPlan.status)}
                </span>
              </div>
            </div>
            {treatmentPlan.notes && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">ملاحظات:</p>
                <p className="text-gray-900">{treatmentPlan.notes}</p>
              </div>
            )}
          </div>

          {/* الجلسات */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-gray-900">الجلسات العلاجية ({treatmentPlan.sessions.length})</h4>
            </div>
            <div className="space-y-3">
              {treatmentPlan.sessions.map((session) => (
                <div key={session.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-600">{session.sessionNumber}</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">الجلسة {session.sessionNumber}</h5>
                        {session.date && (
                          <p className="text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString('ar-IQ')}
                            {session.time && ` - ${session.time}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">المدة:</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration} دقيقة
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">التكلفة:</p>
                      <p className="font-medium">{session.cost.toLocaleString()} د.ع</p>
                    </div>
                    <div>
                      <p className="text-gray-600">المدفوع:</p>
                      <p className="font-medium text-green-600">{session.paidAmount.toLocaleString()} د.ع</p>
                    </div>
                    <div>
                      <p className="text-gray-600">المتبقي:</p>
                      <p className="font-medium text-red-600">{(session.cost - session.paidAmount).toLocaleString()} د.ع</p>
                    </div>
                  </div>

                  {session.procedureDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">تفاصيل الإجراء:</p>
                      <p className="text-sm text-gray-900">{session.procedureDetails}</p>
                    </div>
                  )}
                  
                  {session.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">ملاحظات:</p>
                      <p className="text-sm text-gray-900">{session.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* إحصائيات ملخصة */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600 mb-1">إجمالي الجلسات</p>
              <p className="text-2xl font-bold text-blue-700">{treatmentPlan.sessions.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600 mb-1">الجلسات المكتملة</p>
              <p className="text-2xl font-bold text-green-700">
                {treatmentPlan.sessions.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-sm text-yellow-600 mb-1">الجلسات المعلقة</p>
              <p className="text-2xl font-bold text-yellow-700">
                {treatmentPlan.sessions.filter(s => s.status === 'pending' || s.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              إغلاق
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
            {onEdit && (
              <Button
                onClick={onEdit}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Edit2 className="w-4 h-4" />
                تعديل الخطة
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

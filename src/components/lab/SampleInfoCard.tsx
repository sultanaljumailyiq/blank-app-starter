import React, { useState } from 'react';
import { 
  TestTube, 
  User, 
  Calendar, 
  Clock, 
  Thermometer,
  Droplets,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  FileText,
  Beaker,
  Activity,
  Timer,
  MapPin,
  Phone
} from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '@/lib/utils';

interface SampleInfo {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  sampleType: string;
  collectionDate: string;
  collectionTime: string;
  collectedBy: string;
  temperature?: string;
  volume?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'collected' | 'received' | 'processing' | 'completed' | 'rejected';
  location?: string;
  contactInfo?: {
    phone: string;
    email: string;
  };
  specialInstructions?: string;
  storage?: {
    type: string;
    location: string;
    expiry: string;
  };
  tests: {
    id: string;
    name: string;
    status: 'pending' | 'in-progress' | 'completed';
    result?: string;
    unit?: string;
    reference?: string;
  }[];
}

interface SampleInfoCardProps {
  sample: SampleInfo;
  onUpdateStatus?: (id: string, status: SampleInfo['status']) => void;
  onUpdateCondition?: (id: string, condition: SampleInfo['condition']) => void;
  onAddNote?: (id: string, note: string) => void;
  onEditSample?: (id: string, data: Partial<SampleInfo>) => void;
  className?: string;
  editable?: boolean;
}

const getStatusConfig = (status: SampleInfo['status']) => {
  switch (status) {
    case 'collected':
      return {
        icon: TestTube,
        label: 'تم جمعها',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    case 'received':
      return {
        icon: FileText,
        label: 'تم استلامها',
        className: 'bg-amber-100 text-amber-800 border-amber-200'
      };
    case 'processing':
      return {
        icon: Activity,
        label: 'قيد المعالجة',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    case 'completed':
      return {
        icon: CheckCircle,
        label: 'مكتملة',
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    case 'rejected':
      return {
        icon: XCircle,
        label: 'مرفوضة',
        className: 'bg-red-100 text-red-800 border-red-200'
      };
  }
};

const getConditionConfig = (condition: SampleInfo['condition']) => {
  switch (condition) {
    case 'excellent':
      return {
        label: 'ممتازة',
        className: 'text-green-600 bg-green-100'
      };
    case 'good':
      return {
        label: 'جيدة',
        className: 'text-blue-600 bg-blue-100'
      };
    case 'fair':
      return {
        label: 'متوسطة',
        className: 'text-amber-600 bg-amber-100'
      };
    case 'poor':
      return {
        label: 'ضعيفة',
        className: 'text-red-600 bg-red-100'
      };
  }
};

const getTestStatusColor = (status: SampleInfo['tests'][0]['status']) => {
  switch (status) {
    case 'pending':
      return 'text-gray-600 bg-gray-100';
    case 'in-progress':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
  }
};

export const SampleInfoCard: React.FC<SampleInfoCardProps> = ({
  sample,
  onUpdateStatus,
  onUpdateCondition,
  onAddNote,
  onEditSample,
  className,
  editable = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<SampleInfo>>(sample);
  const [note, setNote] = useState('');

  const statusConfig = getStatusConfig(sample.status);
  const conditionConfig = getConditionConfig(sample.condition);
  const StatusIcon = statusConfig.icon;

  const handleSave = () => {
    onEditSample?.(sample.id, editData);
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote?.(sample.id, note);
      setNote('');
    }
  };

  return (
    <Card hover className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TestTube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                عينة #{sample.id}
              </h3>
              <p className="text-sm text-gray-600">{sample.sampleType}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              conditionConfig.className
            )}>
              {conditionConfig.label}
            </span>
            <span className={cn(
              'flex items-center space-x-1 space-x-reverse px-3 py-1 rounded-full text-xs font-medium border',
              statusConfig.className
            )}>
              <StatusIcon className="w-3 h-3" />
              <span>{statusConfig.label}</span>
            </span>
            {editable && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">معلومات المريض</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">الاسم</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.patientName || ''}
                  onChange={(e) => setEditData({...editData, patientName: e.target.value})}
                  className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <p className="text-sm font-semibold text-gray-900">{sample.patientName}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600">الرقم الطبي</p>
              <p className="text-sm font-semibold text-gray-900">{sample.patientId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">الطبيب المعالج</p>
              <p className="text-sm font-semibold text-gray-900">{sample.doctorName}</p>
            </div>
            {sample.contactInfo && (
              <div>
                <p className="text-xs text-gray-600">رقم الهاتف</p>
                <p className="text-sm font-semibold text-gray-900">{sample.contactInfo.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sample Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Collection Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Beaker className="w-4 h-4 ml-2" />
              معلومات الجمع
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">تاريخ الجمع</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.collectionDate || ''}
                      onChange={(e) => setEditData({...editData, collectionDate: e.target.value})}
                      className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{sample.collectionDate}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">وقت الجمع</p>
                  {isEditing ? (
                    <input
                      type="time"
                      value={editData.collectionTime || ''}
                      onChange={(e) => setEditData({...editData, collectionTime: e.target.value})}
                      className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{sample.collectionTime}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <User className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">جمع بواسطة</p>
                  <p className="text-sm font-medium text-gray-900">{sample.collectedBy}</p>
                </div>
              </div>
              {sample.temperature && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Thermometer className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">درجة الحرارة</p>
                    <p className="text-sm font-medium text-gray-900">{sample.temperature}°C</p>
                  </div>
                </div>
              )}
              {sample.volume && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Droplets className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">الحجم</p>
                    <p className="text-sm font-medium text-gray-900">{sample.volume} ml</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Storage & Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 ml-2" />
              التخزين والموقع
            </h4>
            <div className="space-y-3">
              {sample.storage && (
                <>
                  <div>
                    <p className="text-xs text-gray-600">نوع التخزين</p>
                    <p className="text-sm font-medium text-gray-900">{sample.storage.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">موقع التخزين</p>
                    <p className="text-sm font-medium text-gray-900">{sample.storage.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">تاريخ الانتهاء</p>
                    <p className="text-sm font-medium text-gray-900">{sample.storage.expiry}</p>
                  </div>
                </>
              )}
              {sample.location && (
                <div>
                  <p className="text-xs text-gray-600">الموقع الحالي</p>
                  <p className="text-sm font-medium text-gray-900">{sample.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tests */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <FileText className="w-4 h-4 ml-2" />
            الفحوصات المطلوبة
          </h4>
          <div className="space-y-2">
            {sample.tests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">{test.name}</h5>
                  {test.result && (
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-700">
                        النتيجة: <span className="font-semibold">{test.result} {test.unit || ''}</span>
                      </p>
                      {test.reference && (
                        <p className="text-xs text-gray-500">
                          المرجع: {test.reference}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getTestStatusColor(test.status)
                )}>
                  {test.status === 'pending' && 'في الانتظار'}
                  {test.status === 'in-progress' && 'قيد التنفيذ'}
                  {test.status === 'completed' && 'مكتمل'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        {sample.specialInstructions && (
          <div className="bg-blue-50 rounded-lg p-4 border-r-4 border-blue-500">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">تعليمات خاصة</span>
            </div>
            <p className="text-sm text-blue-800">{sample.specialInstructions}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          {isEditing ? (
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 space-x-reverse px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>حفظ</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <div className="flex space-x-2 space-x-reverse">
              {onUpdateStatus && sample.status !== 'completed' && (
                <button
                  onClick={() => {
                    const nextStatus = sample.status === 'collected' ? 'received' :
                                     sample.status === 'received' ? 'processing' :
                                     sample.status === 'processing' ? 'completed' : 'completed';
                    onUpdateStatus(sample.id, nextStatus);
                  }}
                  className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                >
                  تحديث الحالة
                </button>
              )}
              {onUpdateCondition && (
                <select
                  value={sample.condition}
                  onChange={(e) => onUpdateCondition(sample.id, e.target.value as SampleInfo['condition'])}
                  className="px-3 py-1 border border-gray-300 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="excellent">ممتازة</option>
                  <option value="good">جيدة</option>
                  <option value="fair">متوسطة</option>
                  <option value="poor">ضعيفة</option>
                </select>
              )}
            </div>
          )}

          {/* Add Note */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="إضافة ملاحظة..."
              className="px-3 py-1 border border-gray-300 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleAddNote}
              disabled={!note.trim()}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              إضافة
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
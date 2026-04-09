import React from 'react';
import { 
  Clock, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  FileText,
  Phone,
  Mail,
  Stethoscope
} from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '@/lib/utils';

interface LabRequest {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  testType: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  expectedDelivery: string;
  sampleCollected: boolean;
  contactInfo?: {
    phone: string;
    email: string;
  };
  notes?: string;
}

interface LabRequestCardProps {
  request: LabRequest;
  onViewDetails?: (id: string) => void;
  onUpdateStatus?: (id: string, status: LabRequest['status']) => void;
  className?: string;
}

const getStatusConfig = (status: LabRequest['status']) => {
  switch (status) {
    case 'pending':
      return {
        icon: Clock,
        label: 'في الانتظار',
        className: 'bg-amber-100 text-amber-800 border-amber-200'
      };
    case 'in-progress':
      return {
        icon: Stethoscope,
        label: 'قيد التنفيذ',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    case 'completed':
      return {
        icon: CheckCircle,
        label: 'مكتمل',
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    case 'cancelled':
      return {
        icon: XCircle,
        label: 'ملغي',
        className: 'bg-red-100 text-red-800 border-red-200'
      };
  }
};

const getPriorityConfig = (priority: LabRequest['priority']) => {
  switch (priority) {
    case 'emergency':
      return {
        label: 'طارئ',
        className: 'bg-red-500 text-white'
      };
    case 'urgent':
      return {
        label: 'عاجل',
        className: 'bg-orange-500 text-white'
      };
    case 'normal':
      return {
        label: 'عادي',
        className: 'bg-gray-500 text-white'
      };
  }
};

export const LabRequestCard: React.FC<LabRequestCardProps> = ({
  request,
  onViewDetails,
  onUpdateStatus,
  className
}) => {
  const statusConfig = getStatusConfig(request.status);
  const priorityConfig = getPriorityConfig(request.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <Card 
      hover 
      className={cn(
        'p-6 border-r-4',
        request.status === 'completed' ? 'border-green-500' :
        request.status === 'in-progress' ? 'border-blue-500' :
        request.status === 'pending' ? 'border-amber-500' :
        'border-red-500',
        className
      )}
    >
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                طلب #{request.id}
              </h3>
              <p className="text-sm text-gray-600">{request.testType}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              priorityConfig.className
            )}>
              {priorityConfig.label}
            </span>
            <span className={cn(
              'flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-full text-xs font-medium border',
              statusConfig.className
            )}>
              <StatusIcon className="w-3 h-3" />
              <span>{statusConfig.label}</span>
            </span>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">معلومات المريض</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">الاسم</p>
              <p className="text-sm font-semibold text-gray-900">{request.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">الرقم الطبي</p>
              <p className="text-sm font-semibold text-gray-900">{request.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">الطبيب المعالج</p>
              <p className="text-sm font-semibold text-gray-900">{request.doctorName}</p>
            </div>
            {request.sampleCollected && (
              <div>
                <p className="text-sm text-gray-600">العينة</p>
                <p className="text-sm font-semibold text-green-600">تم جمعها</p>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Calendar className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">تاريخ الطلب</p>
              <p className="text-sm font-medium text-gray-900">{request.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Clock className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">الوقت المتوقع</p>
              <p className="text-sm font-medium text-gray-900">{request.expectedDelivery}</p>
            </div>
          </div>
        </div>

        {/* Contact Info (if available) */}
        {request.contactInfo && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-600 mb-2">معلومات الاتصال</p>
            <div className="flex items-center space-x-4 space-x-reverse text-sm">
              <div className="flex items-center space-x-1 space-x-reverse">
                <Phone className="w-3 h-3 text-gray-600" />
                <span className="text-gray-700">{request.contactInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <Mail className="w-3 h-3 text-gray-600" />
                <span className="text-gray-700">{request.contactInfo.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {request.notes && (
          <div className="bg-blue-50 rounded-lg p-3 border-r-4 border-blue-500">
            <p className="text-xs text-gray-600 mb-1">ملاحظات</p>
            <p className="text-sm text-gray-900">{request.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <button
            onClick={() => onViewDetails?.(request.id)}
            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
          >
            عرض التفاصيل
          </button>
          
          {onUpdateStatus && request.status === 'pending' && (
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => onUpdateStatus(request.id, 'in-progress')}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
              >
                بدء العمل
              </button>
              <button
                onClick={() => onUpdateStatus(request.id, 'cancelled')}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          )}
          
          {onUpdateStatus && request.status === 'in-progress' && (
            <button
              onClick={() => onUpdateStatus(request.id, 'completed')}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
            >
              إكمال
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
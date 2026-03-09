import React from 'react';
import { Appointment, AppointmentStatus, AppointmentType } from '../../types/appointments';
import { appointmentStatuses, appointmentTypes } from '../../data/mock/appointments';
import { 
  Clock, 
  User, 
  Phone, 
  Stethoscope,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  compact?: boolean;
  showActions?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onCancel, 
  onComplete,
  onView,
  compact = false,
  showActions = true
}) => {
  const statusConfig = appointmentStatuses[appointment.status];
  const typeConfig = appointmentTypes.find(t => t.type === appointment.type);
  
  // تحديد أيقونة الحالة
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'delayed':
        return <Timer className="w-4 h-4 text-orange-600" />;
      case 'inprogress':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // تحديد ما إذا كان الموعد في الماضي
  const isPast = new Date(appointment.date) < new Date(new Date().setHours(0, 0, 0, 0));
  const isToday = new Date(appointment.date).toDateString() === new Date().toDateString();
  const isUpcoming = new Date(appointment.date) > new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className={`
      bg-white rounded-xl border transition-all duration-200
      ${compact ? 'p-3' : 'p-4'}
      ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
      hover:shadow-lg hover:border-purple-300 group
    `}>
      {/* الجزء العلوي - الوقت والحالة */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`
            p-2 rounded-lg font-semibold text-sm
            ${isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}
          `}>
            {appointment.startTime}
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon(appointment.status)}
            <span 
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ 
                color: statusConfig.color, 
                backgroundColor: statusConfig.bgColor 
              }}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* الأولوية */}
        {appointment.priority !== 'normal' && (
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${appointment.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
              appointment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'}
          `}>
            {appointment.priority === 'urgent' ? 'عاجل' : 
             appointment.priority === 'high' ? 'مهم' : 'منخفض'}
          </div>
        )}
      </div>

      {/* معلومات المريض */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900">{appointment.patientName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{appointment.patientPhone}</span>
        </div>

        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{appointment.doctorName}</span>
        </div>
      </div>

      {/* نوع الموعد والمدة */}
      <div className="flex items-center justify-between mb-3">
        <div 
          className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium"
          style={{ 
            backgroundColor: `${typeConfig?.color}15`, 
            color: typeConfig?.color 
          }}
        >
          <Calendar className="w-4 h-4" />
          <span>{typeConfig?.label}</span>
        </div>

        <div className="text-sm text-gray-500">
          {appointment.duration} دقيقة
        </div>
      </div>

      {/* الملاحظات */}
      {appointment.notes && !compact && (
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <p className="text-xs text-gray-600 line-clamp-2">{appointment.notes}</p>
        </div>
      )}

      {/* معلومات إضافية */}
      {!compact && (
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {appointment.estimatedCost && (
            <span>{appointment.estimatedCost.toLocaleString()} د.ع</span>
          )}
          
          {appointment.waitingTime && (
            <span>انتظار: {appointment.waitingTime} د</span>
          )}
          
          {appointment.isRecurring && (
            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              متكرر
            </span>
          )}
        </div>
      )}

      {/* أزرار الإجراءات */}
      {showActions && (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onView && (
            <button
              onClick={() => onView(appointment)}
              className="flex-1 py-2 px-3 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              عرض
            </button>
          )}
          
          {onEdit && !isPast && (
            <button
              onClick={() => onEdit(appointment)}
              className="flex-1 py-2 px-3 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              تعديل
            </button>
          )}
          
          {onComplete && appointment.status === 'confirmed' && (
            <button
              onClick={() => onComplete(appointment)}
              className="flex-1 py-2 px-3 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              إكمال
            </button>
          )}
          
          {onCancel && !isPast && appointment.status !== 'cancelled' && (
            <button
              onClick={() => onCancel(appointment)}
              className="flex-1 py-2 px-3 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              إلغاء
            </button>
          )}
        </div>
      )}
    </div>
  );
};
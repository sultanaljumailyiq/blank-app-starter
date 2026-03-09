import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User,
  Calendar,
  MapPin,
  Phone,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarX,
  CalendarCheck,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment, AppointmentStatus } from '../../types/appointments';

interface CalendarViewProps {
  appointments: Appointment[];
  view: 'month' | 'week' | 'day';
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  view,
  selectedDate,
  onDateSelect,
  onAppointmentClick,
  onStatusChange
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date(selectedDate));

  // تحويل التاريخ لنص قابل للقراءة
  const formatDate = (date: Date, format: 'full' | 'month' | 'day' = 'full') => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    if (format === 'month') return months[date.getMonth()];
    if (format === 'day') return days[date.getDay()];
    
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // الانتقال للشهر السابق/التالي
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // الانتقال للأسبوع السابق/التالي
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // الانتقال لليوم السابق/التالي
  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    onDateSelect(newDate.toISOString().split('T')[0]);
  };

  // حساب أيام الشهر للعرض الشهري
  const getMonthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // إضافة أيام الشهر السابق
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({
        date: day,
        isCurrentMonth: false,
        dateString: day.toISOString().split('T')[0]
      });
    }

    // إضافة أيام الشهر الحالي
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        dateString: date.toISOString().split('T')[0]
      });
    }

    // إضافة أيام الشهر التالي لملء الشبكة
    const remainingCells = 42 - days.length; // 6 صفوف × 7 أيام
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        dateString: date.toISOString().split('T')[0]
      });
    }

    return days;
  }, [currentDate]);

  // حساب أيام الأسبوع للعرض الأسبوعي
  const getWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push({
        date: day,
        dateString: day.toISOString().split('T')[0]
      });
    }
    return days;
  }, [currentDate]);

  // فلترة المواعيد حسب التاريخ
  const getAppointmentsForDate = (dateString: string) => {
    return appointments.filter(apt => apt.date === dateString);
  };

  // ألوان حالات المواعيد
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'inprogress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'noshow': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // أيقونات حالات المواعيد
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-3 h-3" />;
      case 'confirmed': return <CheckCircle className="w-3 h-3" />;
      case 'inprogress': return <PlayCircle className="w-3 h-3" />;
      case 'completed': return <CalendarCheck className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      case 'noshow': return <CalendarX className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // عرض شهري
  const renderMonthView = () => (
    <div className="space-y-4">
      {/* التنقل والعنوان */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {formatDate(currentDate, 'month')} {currentDate.getFullYear()}
          </h2>
          <div className="text-sm text-gray-500">
            العرض الشهري
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* أيام الأسبوع */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
          <div key={day} className="bg-gray-50 px-2 py-3 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* شبكة الأيام */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {getMonthDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day.dateString);
          const isSelected = day.dateString === selectedDate;
          const isToday = day.dateString === new Date().toISOString().split('T')[0];
          
          return (
            <div
              key={index}
              onClick={() => onDateSelect(day.dateString)}
              className={`
                bg-white p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 transition-colors relative
                ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
                ${isToday ? 'bg-blue-50 border-blue-200' : ''}
              `}
            >
              <div className={`
                text-sm font-medium mb-2 
                ${isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isSelected ? 'text-purple-600' : ''}
              `}>
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(appointment);
                    }}
                    className={`
                      text-xs px-2 py-1 rounded border cursor-pointer
                      ${getStatusColor(appointment.status)}
                      hover:shadow-sm transition-shadow
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(appointment.status)}
                      <span className="truncate">{appointment.startTime}</span>
                    </div>
                    <div className="truncate font-medium">
                      {appointment.patientName}
                    </div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{dayAppointments.length - 3} أخرى
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // عرض أسبوعي
  const renderWeekView = () => (
    <div className="space-y-4">
      {/* التنقل والعنوان */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            الأسبوع من {getWeekDays[0]?.date.getDate()} إلى {getWeekDays[6]?.date.getDate()} {formatDate(currentDate, 'month')} {currentDate.getFullYear()}
          </h2>
          <div className="text-sm text-gray-500">
            العرض الأسبوعي
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* شبكة الأسبوع */}
      <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* عمود الساعات */}
        <div className="bg-gray-50">
          <div className="p-4 font-medium text-gray-700 border-b border-gray-200">
            الوقت
          </div>
          {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
            <div key={hour} className="p-4 text-sm text-gray-600 border-b border-gray-200 h-20">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* أعمدة الأيام */}
        {getWeekDays.map(day => {
          const dayAppointments = getAppointmentsForDate(day.dateString);
          const isSelected = day.dateString === selectedDate;
          const isToday = day.dateString === new Date().toISOString().split('T')[0];
          
          return (
            <div key={day.dateString} className="bg-white">
              <div 
                className={`
                  p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                  ${isSelected ? 'bg-purple-50 text-purple-600' : ''}
                  ${isToday ? 'bg-blue-50 text-blue-600' : ''}
                `}
                onClick={() => onDateSelect(day.dateString)}
              >
                <div className="text-xs font-medium">
                  {formatDate(day.date, 'day')}
                </div>
                <div className="text-lg font-bold">
                  {day.date.getDate()}
                </div>
              </div>
              
              {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                <div key={hour} className="border-b border-gray-200 h-20 p-1 relative">
                  {dayAppointments
                    .filter(apt => {
                      const appointmentHour = parseInt(apt.startTime.split(':')[0]);
                      return appointmentHour === hour;
                    })
                    .map(appointment => (
                      <div
                        key={appointment.id}
                        onClick={() => onAppointmentClick(appointment)}
                        className={`
                          absolute inset-1 p-2 rounded text-xs cursor-pointer
                          ${getStatusColor(appointment.status)}
                          hover:shadow-sm transition-shadow
                        `}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {getStatusIcon(appointment.status)}
                          <span className="font-medium">{appointment.startTime}</span>
                        </div>
                        <div className="truncate">{appointment.patientName}</div>
                        <div className="truncate text-xs opacity-75">{appointment.type}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  // عرض يومي
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    const sortedAppointments = [...dayAppointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    return (
      <div className="space-y-4">
        {/* التنقل والعنوان */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {formatDate(new Date(selectedDate))}
            </h2>
            <div className="text-sm text-gray-500">
              العرض اليومي • {dayAppointments.length} موعد
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDay('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateDay('next')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* جدول زمني تفصيلي */}
        <div className="bg-white rounded-lg border border-gray-200">
          {sortedAppointments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {sortedAppointments.map(appointment => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`
                          p-3 rounded-full 
                          ${appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                            appointment.status === 'inprogress' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'}
                        `}>
                          {getStatusIcon(appointment.status)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientName}
                          </h3>
                          <span className={`
                            px-2 py-1 text-xs font-medium rounded-full border
                            ${getStatusColor(appointment.status)}
                          `}>
                            {appointment.status === 'scheduled' ? 'مجدول' :
                             appointment.status === 'confirmed' ? 'مؤكد' :
                             appointment.status === 'inprogress' ? 'جاري التنفيذ' :
                             appointment.status === 'completed' ? 'مكتمل' :
                             appointment.status === 'cancelled' ? 'ملغي' : 'لم يحضر'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.startTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            <span>{appointment.doctorName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{appointment.type === 'consultation' ? 'استشارة' :
                                    appointment.type === 'treatment' ? 'علاج' :
                                    appointment.type === 'followup' ? 'متابعة' :
                                    appointment.type === 'emergency' ? 'طوارئ' :
                                    appointment.type === 'cleaning' ? 'تنظيف' : 'فحص'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{appointment.patientPhone}</span>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onAppointmentClick(appointment)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      تفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواعيد</h3>
              <p className="text-gray-500">لا توجد مواعيد مجدولة في هذا التاريخ</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </div>
  );
};
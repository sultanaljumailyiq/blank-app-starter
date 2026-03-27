import React, { useState, useMemo } from 'react';
import { Clock, ChevronLeft, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import { Doctor, DaySchedule, TimeSlot, AppointmentDuration } from '../../types/appointments';
import { doctors, mockAppointments, defaultWorkingHours } from '../../data/mock/appointments';

interface TimeSlotSelectorProps {
  selectedDate: string; // "2025-11-08"
  selectedDoctor?: Doctor;
  duration: AppointmentDuration;
  onSelectTime: (time: string) => void;
  selectedTime?: string;
  excludeAppointmentId?: string; // لاستبعاد موعد معين عند التعديل
  clinicWorkingHours?: string; // ساعات عمل العيادة
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  selectedDoctor,
  duration,
  onSelectTime,
  selectedTime,
  excludeAppointmentId,
  clinicWorkingHours
}) => {
  // Determine initial view based on selectedTime or current time
  const initialView = useMemo(() => {
    if (selectedTime) {
      const hour = parseInt(selectedTime.split(':')[0]);
      return hour >= 12 ? 'evening' : 'morning';
    }
    const currentHour = new Date().getHours();
    return currentHour >= 12 ? 'evening' : 'morning';
  }, [selectedTime]);

  const [currentView, setCurrentView] = useState<'morning' | 'evening'>(initialView);

  // Update view when selectedTime changes externally (e.g. if loaded from editing)
  React.useEffect(() => {
    if (selectedTime) {
      const hour = parseInt(selectedTime.split(':')[0]);
      const view = hour >= 12 ? 'evening' : 'morning';
      setCurrentView(view);
    }
  }, [selectedTime]);

  // الحصول على جدول عمل الطبيب أو الجدول الافتراضي
  const schedule = useMemo(() => {
    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    let start = defaultWorkingHours.start;
    let end = defaultWorkingHours.end;

    if (clinicWorkingHours && clinicWorkingHours.includes(' - ')) {
      const [startClinic, endClinic] = clinicWorkingHours.split(' - ');
      if (startClinic && endClinic) {
        start = startClinic.trim();
        end = endClinic.trim();
      }
    }

    return selectedDoctor?.schedule?.[dayName] || {
      isWorking: true,
      startTime: start,
      endTime: end,
      breakStart: defaultWorkingHours.breakStart,
      breakEnd: defaultWorkingHours.breakEnd
    };
  }, [selectedDate, selectedDoctor, clinicWorkingHours]);

  // إنشاء شقوق الوقت للتاريخ المحدد
  const timeSlots = useMemo(() => {
    if (!schedule.isWorking) return [];

    // الحصول على المواعيد الموجودة في هذا التاريخ
    const existingAppointments = mockAppointments.filter(apt =>
      apt.date === selectedDate &&
      (!selectedDoctor || apt.doctorId === selectedDoctor.id) &&
      apt.id !== excludeAppointmentId && // استبعاد الموعد المحدد
      ['scheduled', 'confirmed', 'inprogress'].includes(apt.status)
    );

    const slots: TimeSlot[] = [];
    const slotDuration = 30; // دقيقة
    const startTime = parseTime(schedule.startTime);
    const endTime = parseTime(schedule.endTime);
    const breakStart = schedule.breakStart ? parseTime(schedule.breakStart) : null;
    const breakEnd = schedule.breakEnd ? parseTime(schedule.breakEnd) : null;

    // إنشاء شقوق كل 30 دقيقة
    for (let time = startTime; time <= endTime; time += slotDuration) {
      const timeString = formatTime(time);

      // تخطي أوقات الاستراحة
      if (breakStart && breakEnd && time >= breakStart && time < breakEnd) {
        continue;
      }

      // التحقق من التداخل مع المواعيد الموجودة
      const isBooked = existingAppointments.some(apt => {
        const aptStart = parseTime(apt.startTime);
        const aptEnd = parseTime(apt.endTime);

        // تحقق إذا كان الوقت الحالي + المدة يتداخل مع الموعد الموجود
        const slotEnd = time + duration;

        return (time < aptEnd && slotEnd > aptStart);
      });

      // تحقق إذا كان الوقت + المدة لا يتجاوز نهاية العمل (أو يبدأ عند نهاية العمل بالضبط)
      const isAvailable = !isBooked && (time === endTime || (time + duration) <= endTime);

      // إذا كان هناك استراحة، تأكد من أن الموعد لا يتداخل معها
      if (breakStart && breakEnd && isAvailable) {
        const slotEnd = time + duration;
        if (time < breakEnd && slotEnd > breakStart) {
          continue; // تخطي الوقت الذي يتداخل مع الاستراحة
        }
      }

      slots.push({
        time: timeString,
        isAvailable,
        isBooked
      });
    }

    return slots;
  }, [selectedDate, selectedDoctor, duration, excludeAppointmentId, clinicWorkingHours]);

  // تصفية الأوقات حسب العرض الحالي
  const filteredSlots = useMemo(() => {
    return timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      if (currentView === 'morning') {
        return hour < 12; // قبل 12 ظهراً
      } else {
        return hour >= 12; // بعد 12 ظهراً
      }
    });
  }, [timeSlots, currentView]);

  // تحويل الوقت النصي إلى دقائق
  function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // تحويل الدقائق إلى نص
  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Helper function to format time in 12-hour format with Arabic suffix
  const formatTime12h = (time24: string): string => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const suffix = hours >= 12 ? 'م' : 'ص';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours}:${minutesStr} ${suffix}`;
  };

  // تحديد ما إذا كان التاريخ في الماضي
  const isPastDate = new Date(selectedDate) < new Date(new Date().setHours(0, 0, 0, 0));
  const isToday = new Date(selectedDate).toDateString() === new Date().toDateString();

  if (isPastDate) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>لا يمكن حجز مواعيد في التواريخ الماضية</p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2" />
        <p>لا توجد أوقات متاحة في هذا التاريخ</p>
        {selectedDoctor && (
          <p className="text-sm mt-1">الطبيب غير متوفر في هذا اليوم</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* تبويبات الوقت */}
      <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button
          onClick={() => setCurrentView('morning')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-all ${currentView === 'morning'
            ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50 font-bold'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
        >
          <span className="flex flex-col items-center gap-1">
            <span className="text-sm">الفترة الصباحية</span>
            <span className="text-[10px] opacity-70 bg-gray-200/50 px-2 py-0.5 rounded-full">
              {formatTime12h(schedule.startTime)} - 12:00 م
            </span>
          </span>
        </button>
        <button
          onClick={() => setCurrentView('evening')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-all ${currentView === 'evening'
            ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50 font-bold'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
        >
          <span className="flex flex-col items-center gap-1">
            <span className="text-sm">الفترة المسائية</span>
            <span className="text-[10px] opacity-70 bg-gray-200/50 px-2 py-0.5 rounded-full">
              12:00 م - {formatTime12h(schedule.endTime)}
            </span>
          </span>
        </button>
      </div>

      {/* شبكة الأوقات */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
        {filteredSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => slot.isAvailable && onSelectTime(slot.time)}
            disabled={!slot.isAvailable}
            className={`
              relative p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1
              ${!slot.isAvailable
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' // Busy
                : selectedTime === slot.time
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-transparent text-white shadow-lg transform scale-105 ring-4 ring-purple-100' // Selected - Professional "Pressed" Look
                  : 'bg-white border-gray-100 text-gray-700 hover:border-purple-200 hover:bg-purple-50 hover:shadow-md hover:-translate-y-0.5' // Available
              }
            `}
          >
            <span className={`text-base font-bold ${selectedTime === slot.time ? 'text-white' : 'text-gray-800'}`} dir="ltr">
              {formatTime12h(slot.time)}
            </span>

            {/* Status Text removed for cleaner look, or kept minimal */}
            {selectedTime === slot.time && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-in fade-in zoom-in">
                محدد
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredSlots.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا توجد أوقات متاحة في هذه الفترة</p>
          <button
            onClick={() => setCurrentView(currentView === 'morning' ? 'evening' : 'morning')}
            className="text-purple-600 text-sm mt-2 hover:underline"
          >
            الانتقال للفترة {currentView === 'morning' ? 'المسائية' : 'الصباحية'}
          </button>
        </div>
      )}

      {/* Selected Time Summary */}

    </div>
  );
};
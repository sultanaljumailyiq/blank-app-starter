import React, { useEffect, useState } from 'react';
import { Stethoscope, Clock, Calendar, CheckCircle, User, AlertCircle } from 'lucide-react';
import { Doctor } from '../../types/appointments';
import { useStaff } from '../../hooks/useStaff';
import { useCurrentClinic } from '../../hooks/useCurrentClinic';

interface StaffSelectorProps {
  clinicId?: string;
  selectedDate?: string;
  selectedDoctor?: Doctor;
  onSelectDoctor: (doctor: Doctor) => void;
  showSchedule?: boolean;
}

export const StaffSelector: React.FC<StaffSelectorProps> = ({
  clinicId,
  selectedDate,
  selectedDoctor,
  onSelectDoctor,
  showSchedule = true,
}) => {
  const { clinic, loading: clinicLoading } = useCurrentClinic();
  // Fetch ALL staff for the current clinic.
  // Prioritize passed clinicId, then context clinic.id. If neither, use '0' to avoid fetch-all.
  const targetClinicId = clinicId || clinic?.id || '0';
  const { staff, loading: staffLoading, refresh } = useStaff(targetClinicId);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loading = (clinicLoading && !clinicId) || staffLoading;

  useEffect(() => {
    if (staff) {
      // Map ALL staff members to the Doctor interface for display
      // We do NOT filter by role anymore, so everyone (including Owner) is shown.
      const mappedStaff = staff.map(s => {
        // Helper to check if a day is in the work schedule array (handling case sensitivity)
        const isWorkingDay = (day: string) => s.workSchedule?.days?.some(d => d.toLowerCase() === day.toLowerCase()) || false;

        return {
          id: s.id,
          name: s.name,
          specialty: s.department || s.position || 'عام', // Fallback to position if department is empty
          phone: s.phone,
          email: s.email,
          isActive: s.status === 'active',
          avatar: s.avatar,
          // Map schedule if available
          schedule: s.workSchedule ? {
            sunday: { isWorking: isWorkingDay('Sunday') || isWorkingDay('الأحد'), startTime: s.workSchedule.startTime || '09:00', endTime: s.workSchedule.endTime || '17:00' },
            monday: { isWorking: isWorkingDay('Monday') || isWorkingDay('الاثنين'), startTime: s.workSchedule.startTime || '09:00', endTime: s.workSchedule.endTime || '17:00' },
            tuesday: { isWorking: isWorkingDay('Tuesday') || isWorkingDay('الثلاثاء'), startTime: s.workSchedule.startTime || '09:00', endTime: s.workSchedule.endTime || '17:00' },
            wednesday: { isWorking: isWorkingDay('Wednesday') || isWorkingDay('الأربعاء'), startTime: s.workSchedule.startTime || '09:00', endTime: s.workSchedule.endTime || '17:00' },
            thursday: { isWorking: isWorkingDay('Thursday') || isWorkingDay('الخميس'), startTime: s.workSchedule.startTime || '09:00', endTime: s.workSchedule.endTime || '17:00' },
            friday: { isWorking: isWorkingDay('Friday') || isWorkingDay('الجمعة'), startTime: s.workSchedule.startTime || '09:00', endTime: s.workSchedule.endTime || '17:00' },
            saturday: { isWorking: isWorkingDay('Saturday') || isWorkingDay('السبت'), startTime: s.workSchedule.startTime || '09:00', endTime: s.workSchedule.endTime || '17:00' },
          } : {},
        } as Doctor;
      });
      setDoctors(mappedStaff);
    }
  }, [staff]);


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

  // تحديد ما إذا كان الطبيب متوفراً في التاريخ المحدد
  const isDoctorAvailable = (doctor: Doctor, date?: string): boolean => {
    if (!date || !doctor.schedule) return true;

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = doctor.schedule[dayName];

    return daySchedule?.isWorking || false;
  };

  // تحويل أسماء الأيام
  const getDayNameArabic = (dayName: string): string => {
    const dayNames = {
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت'
    };
    return dayNames[dayName as keyof typeof dayNames] || dayName;
  };

  // تحويل التخصص
  const getSpecialtyColor = (specialty: string): string => {
    if (specialty.includes('عام')) return 'bg-blue-100 text-blue-800';
    if (specialty.includes('تقويم')) return 'bg-purple-100 text-purple-800';
    if (specialty.includes('جراحة')) return 'bg-red-100 text-red-800';
    if (specialty.includes('عصب')) return 'bg-green-100 text-green-800';
    if (specialty.includes('طوارئ')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">جاري تحميل القائمة...</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">لا يوجد موظفين</h3>
        <p className="text-gray-500">لم يتم العثور على موظفين لهذه العيادة.</p>
        <button onClick={() => refresh()} className="mt-4 text-purple-600 hover:underline">
          تحديث القائمة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* العنوان */}
      <div className="flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">اختيار المختص (الطاقم)</h3>
        {selectedDate && (
          <span className="text-sm text-gray-500">
            ليوم {new Date(selectedDate).toLocaleDateString('ar-EG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        )}
      </div>

      {/* قائمة الأطباء */}
      <div className="space-y-3">
        {doctors.map((doctor) => {
          const isAvailable = isDoctorAvailable(doctor, selectedDate);
          const isSelected = selectedDoctor?.id === doctor.id;

          return (
            <div
              key={doctor.id}
              onClick={() => isAvailable && onSelectDoctor(doctor)}
              className={`
                relative p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer
                ${!isAvailable
                  ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  : isSelected
                    ? 'bg-purple-50 border-purple-600 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }
              `}
            >
              {/* شارة الاختيار */}
              {isSelected && (
                <div className="absolute top-3 left-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* معلومات الطبيب */}
              <div className="flex items-start gap-4">
                {/* الصورة الرمزية */}
                {doctor.avatar ? (
                  <img src={doctor.avatar} alt={doctor.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {doctor.name.split(' ')[1]?.charAt(0) || doctor.name.charAt(0)}
                  </div>
                )}

                {/* التفاصيل */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{doctor.name}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getSpecialtyColor(doctor.specialty)}`}>
                        {doctor.specialty}
                      </span>
                    </div>

                    {/* حالة التوفر */}
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    `}>
                      {isAvailable ? 'متوفر' : 'غير متوفر'}
                    </div>
                  </div>

                  {/* معلومات الاتصال */}
                  {doctor.phone && (
                    <div className="text-sm text-gray-600 mb-2">
                      📞 {doctor.phone}
                    </div>
                  )}

                  {/* جدول العمل */}
                  {showSchedule && doctor.schedule && selectedDate && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        جدول العمل لهذا اليوم:
                      </h5>

                      {(() => {
                        const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                        const daySchedule = doctor.schedule![dayName];

                        if (!daySchedule?.isWorking) {
                          return (
                            <div className="text-sm text-red-600">
                              🔴 يوم راحة
                            </div>
                          );
                        }

                        return (
                          <div className="text-sm text-gray-700 space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>من {formatTime12h(daySchedule.startTime)} إلى {formatTime12h(daySchedule.endTime)}</span>
                            </div>
                            {daySchedule.breakStart && daySchedule.breakEnd && (
                              <div className="flex items-center gap-2 text-orange-600">
                                <Clock className="w-3 h-3" />
                                <span>استراحة: {formatTime12h(daySchedule.breakStart)} - {formatTime12h(daySchedule.breakEnd)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* جدول العمل الأسبوعي */}
                  {showSchedule && doctor.schedule && !selectedDate && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        جدول العمل الأسبوعي:
                      </h5>

                      <div className="grid grid-cols-1 gap-1 text-xs">
                        {Object.entries(doctor.schedule).map(([day, schedule]) => (
                          <div key={day} className="flex items-center justify-between">
                            <span className="font-medium">{getDayNameArabic(day)}:</span>
                            <span className={schedule.isWorking ? 'text-green-600' : 'text-red-600'}>
                              {schedule.isWorking
                                ? `${formatTime12h(schedule.startTime)} - ${formatTime12h(schedule.endTime)}`
                                : 'راحة'
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ملاحظة */}
      {selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-700">
            💡 <strong>ملاحظة:</strong> يتم عرض الطاقم المتوفر فقط في التاريخ المحدد
          </div>
        </div>
      )}

      {/* إحصائيات سريعة */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">إحصائيات الطاقم</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{doctors.length}</div>
            <div className="text-sm text-gray-600">القائمة الكلية</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {selectedDate ? doctors.filter(d => isDoctorAvailable(d, selectedDate)).length : doctors.length}
            </div>
            <div className="text-sm text-gray-600">متوفرين {selectedDate ? 'اليوم' : 'عموماً'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
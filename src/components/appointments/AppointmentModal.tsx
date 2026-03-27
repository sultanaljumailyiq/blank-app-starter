import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, FileText, AlertCircle, Save } from 'lucide-react';
import { Appointment, AppointmentType, AppointmentDuration, Doctor } from '../../types/appointments';
import { Patient } from '../../types/patients';
import { appointmentTypes, doctors as defaultDoctors } from '../../data/mock/appointments';

import { PatientSearch, SelectedPatientCard } from './PatientSearch';
import { StaffSelector } from './StaffSelector';
import { TimeSlotSelector } from './TimeSlotSelector';
import { useClinics } from '../../hooks/useClinics';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>) => Promise<void> | void;
  editingAppointment?: Appointment | null;
  preSelectedDate?: string;
  preSelectedTime?: string;
  preSelectedPatient?: Patient | null;
  doctors?: Doctor[];
  patients?: Patient[]; // Add patients prop
  clinicId?: string; // Add clinicId prop
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAppointment,
  preSelectedDate,
  preSelectedTime,
  preSelectedPatient,
  doctors: propDoctors,
  patients: propsPatients, // Destructure patients
  clinicId
}) => {
  // حالات النموذج
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('consultation');
  const [duration, setDuration] = useState<AppointmentDuration>(30);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState<string>('');



  const { clinics } = useClinics();
  const currentClinic = clinics.find(c => c.id === clinicId);

  const [currentStep, setCurrentStep] = useState<'patient' | 'doctor' | 'datetime' | 'details'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // إعادة تعيين النموذج
  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedDoctor(null);
    setSelectedDate(preSelectedDate || '');
    setSelectedTime(preSelectedTime || '');
    setAppointmentType('consultation');
    setDuration(30);
    setPriority('normal');
    setTitle('');
    setDescription('');
    setNotes('');
    setEstimatedCost('');
    setCurrentStep('patient');
    setErrors({});
  };

  // تهيئة النموذج عند فتحه
  useEffect(() => {
    if (isOpen) {
      if (editingAppointment) {
        // تحديث موعد موجود
        loadAppointmentData(editingAppointment);
        setCurrentStep('details');
      } else {
        // موعد جديد
        resetForm();
        if (preSelectedDate) {
          setSelectedDate(preSelectedDate);
          setCurrentStep('patient');
        }
        if (preSelectedTime) {
          setSelectedTime(preSelectedTime);
        }
        if (preSelectedPatient) {
          setSelectedPatient(preSelectedPatient);
          // Optionally advance step if patient is selected, but maybe user wants to confirm?
          // Let's stay on patient step but it's filled, or advance to doctor?
          // Better to stay on patient step so they see who is selected, or just advance if we are confident.
          // Given the UI shows steps, let's keep it on 'patient' but filled, or 'doctor'. 
          // Let's set it to 'doctor' if patient is provided to save a click.
          setCurrentStep('doctor');
        }
      }
    }
  }, [isOpen, editingAppointment, preSelectedDate, preSelectedTime, preSelectedPatient]);

  // تحديث المدة الافتراضية عند تغيير نوع الموعد
  useEffect(() => {
    const typeConfig = appointmentTypes.find(t => t.type === appointmentType);
    if (typeConfig) {
      setDuration(typeConfig.defaultDuration);
    }
  }, [appointmentType]);



  const convertTo24h = (timeStr: string): string => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [time, ampm] = timeStr.split(' ');
      const [h, m] = time.split(':');
      let hours = parseInt(h, 10);
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${m}`;
    }
    return timeStr; // Already 24h
  };

  const formatTime12h = (time24: string): string => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const suffix = hours >= 12 ? 'مساءً' : 'صباحاً';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours.toString().padStart(2, '0')}:${minutesStr} ${suffix}`;
  };

  // تحميل بيانات الموعد للتحديث
  const loadAppointmentData = (appointment: Appointment) => {
    // Create doctor object from appointment data
    const doctor = {
      id: appointment.doctorId,
      name: appointment.doctorName || 'طبيب غير معروف',
      specialty: 'عام',
      schedule: {},
      isActive: true
    } as Doctor;

    // Find patient in the real list or create fallback
    const patient = (propsPatients || []).find(p => p.id === appointment.patientId) || {
      id: appointment.patientId,
      fullName: appointment.patientName,
      phone: appointment.patientPhone || '',
      firstName: appointment.patientName.split(' ')[0] || '',
      lastName: appointment.patientName.split(' ').slice(1).join(' ') || '',
      gender: 'male',
      age: 0,
      totalVisits: 0,
      status: 'active',
      name: appointment.patientName
    } as unknown as Patient;

    setSelectedPatient(patient);
    setSelectedDoctor(doctor);
    setSelectedDate(appointment.date);
    setSelectedTime(convertTo24h(appointment.startTime));
    setAppointmentType(appointment.type);
    setDuration(appointment.duration);
    setPriority(appointment.priority);
    setTitle(appointment.title || '');
    setDescription(appointment.description || '');
    setNotes(appointment.notes || '');
    setEstimatedCost(appointment.estimatedCost?.toString() || '');
  };

  // التحقق من صحة البيانات


  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedPatient) newErrors.patient = 'يجب اختيار المريض';
    // Doctor validation removed to check if step is doctor
    if (currentStep === 'doctor' && !selectedDoctor) newErrors.doctor = 'يجب اختيار الطبيب';
    if (currentStep === 'datetime') {
      if (!selectedDate) newErrors.date = 'يجب اختيار التاريخ';
      if (!selectedTime) newErrors.time = 'يجب اختيار الوقت';
      // التحقق من أن التاريخ ليس في الماضي
      if (selectedDate) {
        const appointmentDate = new Date(selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
          newErrors.date = 'لا يمكن حجز موعد في الماضي';
        }
      }
    }

    // Final validation for save
    if (currentStep === 'details' || Object.keys(newErrors).length === 0) {
      if (!selectedPatient) newErrors.patient = 'يجب اختيار المريض';
      if (!selectedDoctor) newErrors.doctor = 'يجب اختيار الطبيب';
      if (!selectedDate) newErrors.date = 'يجب اختيار التاريخ';
      if (!selectedTime) newErrors.time = 'يجب اختيار الوقت';
      if (!appointmentType) newErrors.type = 'يجب اختيار نوع الموعد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [status, setStatus] = useState<any>('scheduled');

  // Load Status if editing
  useEffect(() => {
    if (editingAppointment) {
      setStatus(editingAppointment.status);
    }
  }, [editingAppointment]);

  // Sync Title with Type
  useEffect(() => {
    const typeLabel = appointmentTypes.find(t => t.type === appointmentType)?.label;
    if (typeLabel) {
      setTitle(typeLabel);
    }
  }, [appointmentType]);

  // حفظ الموعد
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // إعداد بيانات الموعد
      const appointmentData: Partial<Appointment> = {
        id: editingAppointment?.id,
        patientId: selectedPatient!.id,
        patientName: selectedPatient!.fullName,
        patientPhone: selectedPatient!.phone,
        doctorId: selectedDoctor!.id,
        doctorName: selectedDoctor!.name,
        date: selectedDate,
        startTime: selectedTime,
        endTime: calculateEndTime(selectedTime, duration),
        duration,
        type: appointmentType,
        status: status, // Updated status
        title: title || appointmentTypes.find(t => t.type === appointmentType)?.label, // Form Title or derive from Type
        notes,
        priority,
        // Removed estimatedCost and description as requested
        createdAt: editingAppointment?.createdAt || new Date().toISOString(),
        createdBy: editingAppointment?.createdBy || 'CURRENT_USER',
        updatedAt: editingAppointment ? new Date().toISOString() : undefined,
        updatedBy: editingAppointment ? 'CURRENT_USER' : undefined
      };

      // محاكاة حفظ البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSave(appointmentData);
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ الموعد:', error);
      setErrors({ general: 'حدث خطأ أثناء حفظ الموعد' });
    } finally {
      setIsLoading(false);
    }
  };

  // حساب وقت الانتهاء
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + duration);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  // الانتقال للخطوة التالية
  const handleNext = () => {
    const steps = ['patient', 'doctor', 'datetime', 'details'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as any);
    }
  };

  // العودة للخطوة السابقة
  const handlePrevious = () => {
    const steps = ['patient', 'doctor', 'datetime', 'details'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as any);
    }
  };

  // التحقق من إمكانية المتابعة للخطوة التالية
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'patient':
        return !!selectedPatient;
      case 'doctor':
        return !!selectedDoctor;
      case 'datetime':
        return !!selectedDate && !!selectedTime;
      case 'details':
        return !!appointmentType;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* الخلفية المعتمة */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* المحتوى */}
      <div className="flex min-h-full items-center justify-center p-4" dir="rtl">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
          {/* الرأس */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAppointment ? 'تعديل الموعد' : 'حجز موعد جديد'}
              </h2>
              <p className="text-gray-600 mt-1">
                {currentStep === 'patient' && 'اختيار المريض'}
                {currentStep === 'doctor' && 'اختيار الطبيب'}
                {currentStep === 'datetime' && 'اختيار التاريخ والوقت'}
                {currentStep === 'details' && 'تفاصيل الموعد'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* شريط التقدم */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="relative">
              {/* Connecting Line currently behind */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0 transform -translate-y-1/2 hidden sm:block" />

              <div className="flex justify-between items-start relative z-10">
                {[
                  { id: 'patient', label: 'المريض', icon: User, isCompleted: !!selectedPatient },
                  { id: 'doctor', label: 'الطبيب', icon: Stethoscope, isCompleted: !!selectedDoctor },
                  { id: 'datetime', label: 'تفاصيل الموعد', icon: Calendar, isCompleted: !!selectedDate && !!selectedTime },
                  { id: 'details', label: 'التفاصيل', icon: FileText, isCompleted: false } // Details is last
                ].map((stepItem, index, array) => {
                  const isActive = currentStep === stepItem.id;

                  // Determine if this step is clickable
                  // It's clickable if it's the current step OR if all previous steps are completed OR if we are editing
                  const isPreviousStepsCompleted = array.slice(0, index).every(s => s.isCompleted);
                  const isClickable = editingAppointment || isPreviousStepsCompleted || stepItem.id === 'patient';

                  // Determine visual state
                  // A step is "completed" visually if we are past it in the sequence
                  const currentStepIndex = array.findIndex(s => s.id === currentStep);
                  const isPast = index < currentStepIndex;

                  return (
                    <button
                      key={stepItem.id}
                      onClick={() => isClickable && setCurrentStep(stepItem.id as any)} // Cast safely
                      disabled={!isClickable}
                      className={`
                        flex flex-col items-center group w-1/4
                        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2
                        ${isActive
                          ? 'bg-purple-600 border-purple-600 text-white shadow-md scale-110'
                          : isPast
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white border-gray-300 text-gray-500 group-hover:border-purple-300'}
                      `}>
                        {/* Always show icon, stick to green background for availability */}
                        <stepItem.icon className="w-4 h-4" />
                      </div>
                      <span className={`
                        text-[10px] sm:text-xs mt-2 font-medium transition-colors text-center
                        ${isActive ? 'text-purple-700' : isPast ? 'text-green-600' : 'text-gray-500'}
                      `}>
                        {stepItem.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* رسائل الأخطاء العامة */}
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.general}</span>
                </div>
              </div>
            )}

            {/* خطوة اختيار المريض */}
            {currentStep === 'patient' && (
              <div className="space-y-4">
                {selectedPatient ? (
                  <SelectedPatientCard
                    patient={selectedPatient}
                    onClear={() => setSelectedPatient(null)}
                  />
                ) : (
                  <PatientSearch
                    onSelectPatient={setSelectedPatient}
                    autoFocus={true}
                    patients={propsPatients} // Pass the real patients list
                  />
                )}



                {errors.patient && (
                  <div className="text-red-600 text-sm">{errors.patient}</div>
                )}
              </div>
            )}

            {/* خطوة اختيار الطبيب */}
            {currentStep === 'doctor' && (
              <div className="space-y-4">
                <StaffSelector
                  clinicId={clinicId}
                  selectedDate={selectedDate}
                  selectedDoctor={selectedDoctor}
                  onSelectDoctor={setSelectedDoctor}
                  showSchedule={true}
                />

                {errors.doctor && (
                  <div className="text-red-600 text-sm">{errors.doctor}</div>
                )}
              </div>
            )}

            {/* خطوة اختيار التاريخ والوقت */}
            {currentStep === 'datetime' && (
              <div className="space-y-6">
                {/* نوع الموعد */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الموعد
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {appointmentTypes.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => setAppointmentType(type.type)}
                        className={`
                          p-3 border-2 rounded-lg text-sm font-medium transition-colors
                          ${appointmentType === type.type
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300'
                          }
                        `}
                      >
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.defaultDuration} دقيقة</div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Duration & Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* مدة الموعد */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مدة الموعد (بالدقائق)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value) as AppointmentDuration)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={15}>15 دقيقة</option>
                      <option value={30}>30 دقيقة</option>
                      <option value={45}>45 دقيقة</option>
                      <option value={60}>60 دقيقة</option>
                      <option value={90}>90 دقيقة</option>
                      <option value={120}>120 دقيقة</option>
                      <option value={150}>150 دقيقة</option>
                      <option value={180}>180 دقيقة</option>
                    </select>
                  </div>

                  {/* اختيار التاريخ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline ml-1" />
                      تاريخ الموعد
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {errors.date && (
                      <div className="text-red-600 text-sm mt-1">{errors.date}</div>
                    )}
                  </div>
                </div>



                {/* اختيار الوقت */}
                {selectedDate && selectedDoctor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline ml-1" />
                      وقت الموعد
                    </label>
                    <TimeSlotSelector
                      selectedDate={selectedDate}
                      selectedDoctor={selectedDoctor}
                      duration={duration}
                      selectedTime={selectedTime}
                      onSelectTime={setSelectedTime}
                      excludeAppointmentId={editingAppointment?.id}
                      clinicWorkingHours={currentClinic?.workingHours}
                    />
                    {errors.time && (
                      <div className="text-red-600 text-sm mt-1">{errors.time}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* خطوة التفاصيل */}
            {currentStep === 'details' && (
              <div className="space-y-6">
                {/* ملخص الموعد المختار */}
                <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-100 hover:border-purple-200 shadow-sm space-y-3 mb-4 transition-all">
                  <h4 className="font-bold text-sm text-purple-900 border-b border-purple-100 pb-2 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-purple-600" />
                    مراجعة بيانات الموعد قبل الحفظ
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div onClick={() => setCurrentStep('patient')} className="flex items-center gap-2 p-3 bg-white/60 hover:bg-white rounded-lg border border-transparent hover:border-purple-200 cursor-pointer transition-all">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">المريض</span>
                        <span className="font-bold text-gray-900">{selectedPatient?.fullName || 'عابر'}</span>
                      </div>
                    </div>

                    <div onClick={() => setCurrentStep('doctor')} className="flex items-center gap-2 p-3 bg-white/60 hover:bg-white rounded-lg border border-transparent hover:border-purple-200 cursor-pointer transition-all">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">الطبيب المعالج</span>
                        <span className="font-bold text-gray-900">{selectedDoctor?.name || 'أي طبيب'}</span>
                      </div>
                    </div>

                    <div onClick={() => setCurrentStep('datetime')} className="flex items-center gap-2 p-3 bg-white/60 hover:bg-white rounded-lg border border-transparent hover:border-purple-200 cursor-pointer transition-all col-span-2 md:col-span-1">
                      <div className="p-2 bg-green-100 rounded-lg text-green-700">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">الوقت والتاريخ</span>
                        <span className="font-bold text-gray-900 text-xs">{selectedDate || '...'} | {selectedTime ? formatTime12h(selectedTime) : '...'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duration & Status Row - Removed Duration */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">حالة الموعد</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="scheduled">مجدول</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                      <option value="noshow">لم يحضر</option>
                      <option value="pending">معلق</option>
                    </select>
                  </div>
                </div>

                {/* الأولوية */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    أولوية الموعد
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'low', label: 'منخفض', color: 'green' },
                      { value: 'normal', label: 'عادي', color: 'blue' },
                      { value: 'high', label: 'مهم', color: 'orange' },
                      { value: 'urgent', label: 'عاجل', color: 'red' }
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        onClick={() => setPriority(value as any)}
                        className={`
                          p-2 border-2 rounded-lg text-sm font-medium transition-colors
                          ${priority === value
                            ? `border-${color}-600 bg-${color}-50 text-${color}-700`
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* الملاحظات */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات الطبيب (اختياري)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="ملاحظات خاصة للطبيب..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* التذييل */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
            <div className="flex justify-between">
              <div>
                {currentStep !== 'patient' && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    السابق
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>

                {/* Show Save button if editing OR if last step */}
                {(editingAppointment || currentStep === 'details') ? (
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !canProceed()}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingAppointment ? 'حفظ التعديلات' : 'حجز الموعد'}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
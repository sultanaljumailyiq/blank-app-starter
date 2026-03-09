import {
  Doctor,
  Appointment,
  AppointmentType,
  AppointmentStatus,
  AppointmentDuration,
  DailyStats,
  MonthlyStats
} from '../../types/appointments';
import { allPatients } from './patients';

// الأطباء في العيادة
export const doctors: Doctor[] = [
  {
    id: 'DOC001',
    name: 'د. محمد الخزرجي',
    specialty: 'طبيب أسنان عام',
    phone: '07801234567',
    email: 'dr.mohammed@clinic.com',
    schedule: {
      sunday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      monday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      tuesday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      wednesday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      thursday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      friday: { isWorking: false, startTime: '', endTime: '' },
      saturday: { isWorking: true, startTime: '09:00', endTime: '14:00' }
    },
    isActive: true
  },
  {
    id: 'DOC002',
    name: 'د. سارة النجفي',
    specialty: 'أخصائي تقويم الأسنان',
    phone: '07802345678',
    email: 'dr.sara@clinic.com',
    schedule: {
      sunday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
      monday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorking: false, startTime: '', endTime: '' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorking: false, startTime: '', endTime: '' },
      saturday: { isWorking: true, startTime: '10:00', endTime: '15:00' }
    },
    isActive: true
  },
  {
    id: 'DOC003',
    name: 'د. عمر البصري',
    specialty: 'أخصائي جراحة الوجه والفكين',
    phone: '07803456789',
    email: 'dr.omar@clinic.com',
    schedule: {
      sunday: { isWorking: true, startTime: '10:00', endTime: '18:00', breakStart: '14:00', breakEnd: '15:00' },
      monday: { isWorking: true, startTime: '10:00', endTime: '18:00', breakStart: '14:00', breakEnd: '15:00' },
      tuesday: { isWorking: false, startTime: '', endTime: '' },
      wednesday: { isWorking: true, startTime: '10:00', endTime: '18:00', breakStart: '14:00', breakEnd: '15:00' },
      thursday: { isWorking: true, startTime: '10:00', endTime: '18:00', breakStart: '14:00', breakEnd: '15:00' },
      friday: { isWorking: false, startTime: '', endTime: '' },
      saturday: { isWorking: false, startTime: '', endTime: '' }
    },
    isActive: true
  },
  {
    id: 'DOC004',
    name: 'د. نور الحلي',
    specialty: 'أخصائي علاج العصب',
    phone: '07804567890',
    email: 'dr.noor@clinic.com',
    schedule: {
      sunday: { isWorking: true, startTime: '08:30', endTime: '16:30', breakStart: '12:30', breakEnd: '13:30' },
      monday: { isWorking: true, startTime: '08:30', endTime: '16:30', breakStart: '12:30', breakEnd: '13:30' },
      tuesday: { isWorking: true, startTime: '08:30', endTime: '16:30', breakStart: '12:30', breakEnd: '13:30' },
      wednesday: { isWorking: true, startTime: '08:30', endTime: '16:30', breakStart: '12:30', breakEnd: '13:30' },
      thursday: { isWorking: false, startTime: '', endTime: '' },
      friday: { isWorking: false, startTime: '', endTime: '' },
      saturday: { isWorking: true, startTime: '09:00', endTime: '13:00' }
    },
    isActive: true
  },
  {
    id: 'DOC005',
    name: 'د. علي الموصلي',
    specialty: 'أخصائي الطوارئ',
    phone: '07805678901',
    email: 'dr.ali@clinic.com',
    schedule: {
      sunday: { isWorking: true, startTime: '16:00', endTime: '00:00' },
      monday: { isWorking: true, startTime: '16:00', endTime: '00:00' },
      tuesday: { isWorking: true, startTime: '16:00', endTime: '00:00' },
      wednesday: { isWorking: true, startTime: '16:00', endTime: '00:00' },
      thursday: { isWorking: true, startTime: '16:00', endTime: '00:00' },
      friday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      saturday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakStart: '12:00', breakEnd: '13:00' }
    },
    isActive: true
  }
];

// أنواع المواعيد مع الأوصاف
export const appointmentTypes: { type: AppointmentType; label: string; defaultDuration: AppointmentDuration; color: string }[] = [
  { type: 'consultation', label: 'استشارة', defaultDuration: 30, color: '#3B82F6' },
  { type: 'treatment', label: 'علاج', defaultDuration: 60, color: '#10B981' },
  { type: 'followup', label: 'متابعة', defaultDuration: 30, color: '#F59E0B' },
  { type: 'emergency', label: 'طوارئ', defaultDuration: 45, color: '#EF4444' }
];

// حالات المواعيد مع الألوان
export const appointmentStatuses = {
  scheduled: { label: 'مجدول', color: '#3B82F6', bgColor: '#EFF6FF' },
  confirmed: { label: 'مؤكد', color: '#10B981', bgColor: '#F0FDF4' },
  completed: { label: 'مكتمل', color: '#059669', bgColor: '#ECFDF5' },
  cancelled: { label: 'ملغي', color: '#DC2626', bgColor: '#FEF2F2' },
  noshow: { label: 'لم يحضر', color: '#9CA3AF', bgColor: '#F9FAFB' },
  delayed: { label: 'متأخر', color: '#F59E0B', bgColor: '#FFFBEB' },
  rescheduled: { label: 'مؤجل', color: '#8B5CF6', bgColor: '#F5F3FF' },
  inprogress: { label: 'جاري التنفيذ', color: '#06B6D4', bgColor: '#F0F9FF' }
};

// توليد مواعيد عشوائية
function generateRandomAppointment(id: number, date: Date): Appointment {
  const patient = allPatients[Math.floor(Math.random() * allPatients.length)];
  const doctor = doctors[Math.floor(Math.random() * doctors.length)];
  const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];

  // توليد وقت عشوائي خلال ساعات العمل
  const workStart = 8; // 8 صباحاً
  const workEnd = 18;  // 6 مساءً
  const startHour = workStart + Math.floor(Math.random() * (workEnd - workStart));
  const startMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

  const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;

  // حساب وقت الانتهاء
  const endDate = new Date(date);
  endDate.setHours(startHour, startMinute + appointmentType.defaultDuration);
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

  // تحديد حالة الموعد بناءً على التاريخ
  const today = new Date();
  const appointmentDate = new Date(date);

  let status: AppointmentStatus;
  if (appointmentDate < today) {
    // مواعيد الماضي
    const pastStatuses: AppointmentStatus[] = ['completed', 'noshow', 'cancelled'];
    const weights = [0.8, 0.1, 0.1]; // 80% مكتمل، 10% لم يحضر، 10% ملغي
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < pastStatuses.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        status = pastStatuses[i];
        break;
      }
    }
    status = status || 'completed';
  } else if (appointmentDate.toDateString() === today.toDateString()) {
    // مواعيد اليوم
    const todayStatuses: AppointmentStatus[] = ['confirmed', 'inprogress', 'completed', 'delayed'];
    status = todayStatuses[Math.floor(Math.random() * todayStatuses.length)];
  } else {
    // مواعيد المستقبل
    const futureStatuses: AppointmentStatus[] = ['scheduled', 'confirmed'];
    status = futureStatuses[Math.floor(Math.random() * futureStatuses.length)];
  }

  const priority = ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any;

  // تاريخ الإنشاء (قبل موعد الحجز)
  const createdDate = new Date(date);
  createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30) - 1);

  return {
    id: `APT${id.toString().padStart(4, '0')}`,
    clinicId: '1', // Default clinic ID for mocks
    patientId: patient.id,
    patientName: patient.fullName,
    patientPhone: patient.phone,
    doctorId: doctor.id,
    doctorName: doctor.name,
    date: appointmentDate.toISOString().split('T')[0],
    startTime,
    time: startTime, // Alias for compatibility
    endTime,
    duration: appointmentType.defaultDuration,
    type: appointmentType.type,
    status,
    title: `${appointmentType.label} - ${patient.fullName}`,
    description: `${appointmentType.label} للمريض ${patient.fullName}`,
    notes: Math.random() > 0.6 ? 'ملاحظات خاصة بالموعد' : undefined,
    priority,
    createdAt: createdDate.toISOString(),
    createdBy: 'ADMIN001',
    updatedAt: Math.random() > 0.7 ? new Date().toISOString() : undefined,

    // تفاصيل إضافية
    estimatedCost: Math.floor(Math.random() * 200000) + 50000, // 50-250 ألف دينار
    actualCost: status === 'completed' ? Math.floor(Math.random() * 200000) + 50000 : undefined,
    paymentStatus: status === 'completed' ?
      (['paid', 'partial', 'pending'][Math.floor(Math.random() * 3)] as any) : 'pending',

    // المواعيد المتكررة (10% من المواعيد)
    isRecurring: Math.random() < 0.1,
    recurringPattern: Math.random() < 0.1 ? {
      frequency: ['weekly', 'monthly'][Math.floor(Math.random() * 2)] as any,
      interval: Math.random() > 0.5 ? 1 : 2,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 شهور
    } : undefined,

    // التذكيرات
    reminders: [
      {
        id: `REM${id}_1`,
        type: 'sms',
        timing: 1440, // 24 ساعة
        isActive: true,
        status: appointmentDate <= today ? 'sent' : 'pending'
      },
      {
        id: `REM${id}_2`,
        type: 'call',
        timing: 60, // ساعة واحدة
        isActive: Math.random() > 0.3,
        status: appointmentDate <= today ?
          (['sent', 'delivered', 'failed'][Math.floor(Math.random() * 3)] as any) : 'pending'
      }
    ],

    // معلومات الحضور (للمواعيد المكتملة فقط)
    checkInTime: status === 'completed' || status === 'inprogress' ?
      `${startHour.toString().padStart(2, '0')}:${(startMinute + Math.floor(Math.random() * 15)).toString().padStart(2, '0')}` : undefined,
    checkOutTime: status === 'completed' ?
      `${endDate.getHours().toString().padStart(2, '0')}:${(endDate.getMinutes() + Math.floor(Math.random() * 30)).toString().padStart(2, '0')}` : undefined,
    waitingTime: status === 'completed' || status === 'inprogress' ? Math.floor(Math.random() * 20) + 5 : undefined
  };
}

// توليد مواعيد لفترة 3 شهور (شهر ماضي، الحالي، والمقبل)
function generateAppointments(): Appointment[] {
  const appointments: Appointment[] = [];
  let appointmentId = 1;

  // الشهر الماضي
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthDays = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= lastMonthDays; day++) {
    const date = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), day);

    // تخطي الجمعة للراحة الأسبوعية
    if (date.getDay() === 5) continue;

    // عدد المواعيد في اليوم (2-8 مواعيد)
    const appointmentsPerDay = Math.floor(Math.random() * 7) + 2;

    for (let i = 0; i < appointmentsPerDay; i++) {
      appointments.push(generateRandomAppointment(appointmentId++, date));
    }
  }

  // الشهر الحالي
  const thisMonth = new Date();
  const thisMonthDays = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= thisMonthDays; day++) {
    const date = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), day);

    if (date.getDay() === 5) continue;

    const appointmentsPerDay = Math.floor(Math.random() * 8) + 3;

    for (let i = 0; i < appointmentsPerDay; i++) {
      appointments.push(generateRandomAppointment(appointmentId++, date));
    }
  }

  // الشهر القادم  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthDays = Math.min(15, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()); // أول 15 يوم فقط

  for (let day = 1; day <= nextMonthDays; day++) {
    const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);

    if (date.getDay() === 5) continue;

    const appointmentsPerDay = Math.floor(Math.random() * 6) + 1;

    for (let i = 0; i < appointmentsPerDay; i++) {
      appointments.push(generateRandomAppointment(appointmentId++, date));
    }
  }

  return appointments.sort((a, b) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison === 0) {
      return a.startTime.localeCompare(b.startTime);
    }
    return dateComparison;
  });
}

export const mockAppointments = generateAppointments();

// إحصائيات يومية للشهر الحالي
export const dailyStats: DailyStats[] = (() => {
  const stats: DailyStats[] = [];
  const thisMonth = new Date();
  const daysInMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];

    const dayAppointments = mockAppointments.filter(apt => apt.date === dateString);

    if (dayAppointments.length > 0) {
      const completed = dayAppointments.filter(apt => apt.status === 'completed').length;
      const cancelled = dayAppointments.filter(apt => apt.status === 'cancelled').length;
      const noshow = dayAppointments.filter(apt => apt.status === 'noshow').length;
      const total = dayAppointments.length;

      const revenue = dayAppointments
        .filter(apt => apt.actualCost && apt.paymentStatus === 'paid')
        .reduce((sum, apt) => sum + (apt.actualCost || 0), 0);

      const patientCount = new Set(dayAppointments.map(apt => apt.patientId)).size;

      const doctorUtilization: { [doctorId: string]: number } = {};
      doctors.forEach(doctor => {
        const doctorAppointments = dayAppointments.filter(apt => apt.doctorId === doctor.id);
        const totalWorkingHours = 8; // ساعات العمل اليومية
        const actualHours = doctorAppointments.reduce((sum, apt) => sum + apt.duration / 60, 0);
        doctorUtilization[doctor.id] = Math.round((actualHours / totalWorkingHours) * 100);
      });

      stats.push({
        date: dateString,
        total,
        scheduled: dayAppointments.filter(apt => apt.status === 'scheduled').length,
        completed,
        cancelled,
        noshow,
        attendanceRate: total > 0 ? Math.round(((completed) / total) * 100) : 0,
        cancellationRate: total > 0 ? Math.round(((cancelled + noshow) / total) * 100) : 0,
        avgWaitingTime: dayAppointments
          .filter(apt => apt.waitingTime)
          .reduce((sum, apt, _, arr) => sum + (apt.waitingTime || 0) / arr.length, 0),
        avgAppointmentDuration: dayAppointments
          .reduce((sum, apt, _, arr) => sum + apt.duration / arr.length, 0),
        revenue,
        patientCount,
        doctorUtilization
      });
    }
  }

  return stats;
})();

// إحصائيات شهرية
export const monthlyStats: MonthlyStats = (() => {
  const thisMonth = new Date();
  const monthString = `${thisMonth.getFullYear()}-${(thisMonth.getMonth() + 1).toString().padStart(2, '0')}`;

  const monthAppointments = mockAppointments.filter(apt => apt.date.startsWith(monthString));

  const completed = monthAppointments.filter(apt => apt.status === 'completed').length;
  const cancelled = monthAppointments.filter(apt => apt.status === 'cancelled').length;
  const noshow = monthAppointments.filter(apt => apt.status === 'noshow').length;
  const total = monthAppointments.length;

  // أكثر الساعات ازدحاماً
  const hourCounts: { [hour: string]: number } = {};
  monthAppointments.forEach(apt => {
    const hour = apt.startTime.split(':')[0];
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const peakHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // أشهر أنواع العلاجات
  const treatmentCounts: { [type: string]: number } = {};
  monthAppointments.forEach(apt => {
    treatmentCounts[apt.type] = (treatmentCounts[apt.type] || 0) + 1;
  });

  const popularTreatments = Object.entries(treatmentCounts)
    .map(([type, count]) => ({ type: type as AppointmentType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // أفضل الأطباء
  const doctorCounts: { [doctorId: string]: number } = {};
  monthAppointments.forEach(apt => {
    doctorCounts[apt.doctorId] = (doctorCounts[apt.doctorId] || 0) + 1;
  });

  const topDoctors = Object.entries(doctorCounts)
    .map(([doctorId, appointmentCount]) => ({ doctorId, appointmentCount }))
    .sort((a, b) => b.appointmentCount - a.appointmentCount);

  const revenue = monthAppointments
    .filter(apt => apt.actualCost && apt.paymentStatus === 'paid')
    .reduce((sum, apt) => sum + (apt.actualCost || 0), 0);

  return {
    month: monthString,
    total,
    scheduled: monthAppointments.filter(apt => apt.status === 'scheduled').length,
    completed,
    cancelled,
    noshow,
    attendanceRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    cancellationRate: total > 0 ? Math.round(((cancelled + noshow) / total) * 100) : 0,
    avgWaitingTime: monthAppointments
      .filter(apt => apt.waitingTime)
      .reduce((sum, apt, _, arr) => sum + (apt.waitingTime || 0) / arr.length, 0),
    avgAppointmentDuration: monthAppointments
      .reduce((sum, apt, _, arr) => sum + apt.duration / arr.length, 0),
    dailyStats,
    peakHours,
    popularTreatments,
    topDoctors,
    revenue
  };
})();

// وقت العمل الافتراضي
export const defaultWorkingHours = {
  start: '08:00',
  end: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  slotDuration: 30 // بالدقائق
};

// ألوان التقويم
export const calendarColors = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  secondary: '#6B7280'
};
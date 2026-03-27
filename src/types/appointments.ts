// أنواع البيانات الخاصة بالمواعيد

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  schedule?: WeeklySchedule;
  isActive: boolean;
  avatar?: string;
}

export interface WeeklySchedule {
  [key: string]: DaySchedule; // 'monday', 'tuesday', etc.
}

export interface DaySchedule {
  isWorking: boolean;
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  breakStart?: string; // "12:00"
  breakEnd?: string;   // "13:00"
}

export type AppointmentType =
  | 'consultation'      // استشارة
  | 'treatment'         // علاج
  | 'followup'          // متابعة
  | 'emergency'         // طوارئ
  | 'cleaning'          // تنظيف
  | 'extraction'        // قلع
  | 'filling'          // حشو
  | 'rootcanal'        // علاج عصب
  | 'orthodontics'     // تقويم
  | 'surgery';         // جراحة

export type AppointmentStatus =
  | 'scheduled'         // مجدول
  | 'confirmed'         // مؤكد
  | 'completed'         // مكتمل
  | 'cancelled'         // ملغي
  | 'noshow'           // لم يحضر
  | 'delayed'          // متأخر
  | 'rescheduled'      // مؤجل
  | 'inprogress'       // جاري التنفيذ
  | 'pending';         // معلق (للطلبات الأونلاين)

export type AppointmentDuration = 15 | 30 | 45 | 60 | 90 | 120;

export interface Appointment {
  id: string;
  clinicId: string;     // Added
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  date: string;           // "2025-11-08"
  startTime: string;      // "14:30"
  time: string;           // Added Compatibility Alias for startTime
  endTime: string;        // "15:30"
  duration: AppointmentDuration; // in minutes
  type: AppointmentType;
  status: AppointmentStatus;
  title?: string;         // عنوان مخصص
  description?: string;   // وصف الموعد
  notes?: string;         // ملاحظات الطبيب
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // معلومات إضافية
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;

  // للمواعيد المتكررة
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  parentAppointmentId?: string; // للمواعيد المتكررة

  // التذكيرات والإشعارات
  reminders?: AppointmentReminder[];
  notifications?: AppointmentNotification[];

  // التكلفة والدفع
  estimatedCost?: number;
  actualCost?: number;
  cost?: number;          // Added Compatibility Alias
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'refunded';

  // سبب الإلغاء أو التأجيل
  cancellationReason?: string;
  rescheduleReason?: string;

  // معلومات الحضور
  checkInTime?: string;
  checkOutTime?: string;
  waitingTime?: number; // بالدقائق
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // كل كم (يوم/أسبوع/شهر/سنة)
  endDate?: string;
  occurrences?: number; // عدد التكرارات
  daysOfWeek?: number[]; // للتكرار الأسبوعي [0=أحد, 1=اثنين, ...]
  monthlyType?: 'date' | 'day'; // تكرار شهري بنفس التاريخ أو نفس اليوم
}

export interface AppointmentReminder {
  id: string;
  type: 'sms' | 'call' | 'email' | 'notification';
  timing: number; // كم دقيقة قبل الموعد
  isActive: boolean;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
}

export interface AppointmentNotification {
  id: string;
  type: 'created' | 'updated' | 'cancelled' | 'reminder' | 'completed';
  recipient: 'patient' | 'doctor' | 'admin';
  message: string;
  sentAt: string;
  isRead: boolean;
}

// للتقويم والعرض
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any; // للمعلومات الإضافية
  color?: string;
  textColor?: string;
  borderColor?: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  appointmentId?: string;
  duration?: number;
}

export interface DaySlots {
  date: string;
  slots: TimeSlot[];
}

// للإحصائيات والتقارير
export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noshow: number;
  attendanceRate: number; // معدل الحضور %
  cancellationRate: number; // معدل الإلغاء %
  avgWaitingTime: number; // متوسط وقت الانتظار
  avgAppointmentDuration: number;
}

export interface DailyStats extends AppointmentStats {
  date: string;
  revenue: number;
  patientCount: number;
  doctorUtilization: { [doctorId: string]: number }; // معدل استغلال الطبيب %
}

export interface MonthlyStats extends AppointmentStats {
  month: string; // "2025-11"
  dailyStats: DailyStats[];
  peakHours: { hour: string; count: number }[];
  popularTreatments: { type: AppointmentType; count: number }[];
  topDoctors: { doctorId: string; appointmentCount: number }[];
  revenue: number;
}

// للبحث والفلترة
export interface AppointmentFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: AppointmentStatus[];
  type?: AppointmentType[];
  doctorId?: string;
  patientId?: string;
  priority?: ('low' | 'normal' | 'high' | 'urgent')[];
  searchTerm?: string; // للبحث في الأسماء والملاحظات
}

export interface AppointmentSearchParams {
  query?: string;
  filters?: AppointmentFilters;
  sortBy?: 'date' | 'time' | 'patient' | 'doctor' | 'type' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// للتصدير
export interface AppointmentExport {
  appointments: Appointment[];
  format: 'csv' | 'excel' | 'pdf';
  fields: string[]; // الحقول المطلوب تصديرها
  dateRange: { from: string; to: string };
  filters?: AppointmentFilters;
}
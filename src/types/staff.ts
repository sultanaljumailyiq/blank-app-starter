// أنواع البيانات الخاصة بالطاقم والموظفين

export interface Employee {
  id: string;
  employeeNumber: string;

  // البيانات الشخصية
  personalInfo: PersonalInfo;

  // معلومات العمل
  workInfo: WorkInfo;

  // المؤهلات والخبرة
  qualifications: Qualification[];
  experience: WorkExperience[];

  // الوثائق
  documents: EmployeeDocument[];

  // معلومات الطوارئ
  emergencyContact: EmergencyContact;

  // الراتب والمزايا
  payroll: PayrollInfo;

  // الحضور والجداول
  schedule: WorkSchedule;
  attendance: AttendanceRecord[];

  // التقييمات والأداء
  evaluations: PerformanceEvaluation[];
  goals: Goal[];

  // التدريب والشهادات
  training: TrainingRecord[];
  certifications: Certification[];

  // الإجازات
  leaves: LeaveRequest[];
  leaveBalance: LeaveBalance;

  // الحالة والإعدادات
  status: EmployeeStatus;
  permissions: Permission[];
  notes: Note[];

  // تواريخ مهمة
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  clinicId?: string; // Added for multi-clinic filtering
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  nationality: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationalId: string;
  passportNumber?: string;

  // معلومات الاتصال
  phone: string;
  mobile: string;
  email: string;
  address: Address;

  // الصورة الشخصية
  profilePicture?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface WorkInfo {
  department: Department;
  position: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'on_leave';
  hireDate: string;
  probationEndDate?: string;
  terminationDate?: string;
  terminationReason?: string;

  // المدير المباشر
  supervisor?: {
    employeeId: string;
    name: string;
  };

  // الموظفين التابعين
  subordinates?: {
    employeeId: string;
    name: string;
  }[];

  // مستوى الوصول
  accessLevel: 'admin' | 'manager' | 'supervisor' | 'employee';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager?: {
    employeeId: string;
    name: string;
  };
  budget?: number;
  location?: string;
}

export interface Qualification {
  id: string;
  type: 'degree' | 'diploma' | 'certificate' | 'license';
  title: string;
  institution: string;
  field: string;
  graduationYear: string;
  grade?: string;
  isVerified: boolean;
  documentUrl?: string;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string; // null إذا كان العمل حالي
  description: string;
  reasonForLeaving?: string;
  supervisorName?: string;
  supervisorContact?: string;
}

export interface EmployeeDocument {
  id: string;
  type: 'resume' | 'id_copy' | 'passport' | 'certificate' | 'contract' | 'medical' | 'other';
  title: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  expiryDate?: string;
  isConfidential: boolean;
  uploadedBy: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  mobile?: string;
  address?: string;
  email?: string;
}

export interface PayrollInfo {
  basicSalary: number;
  currency: string;
  payFrequency: 'monthly' | 'bi_weekly' | 'weekly' | 'hourly';

  // البدلات
  allowances: {
    housing?: number;
    transportation?: number;
    food?: number;
    medical?: number;
    communication?: number;
    other?: { [key: string]: number };
  };

  // الحوافز
  bonuses: {
    performance?: number;
    sales?: number;
    annual?: number;
    other?: { [key: string]: number };
  };

  // الخصومات
  deductions: {
    tax?: number;
    insurance?: number;
    loan?: number;
    advance?: number;
    other?: { [key: string]: number };
  };

  // المزايا
  benefits: {
    healthInsurance: boolean;
    lifeInsurance: boolean;
    retirement: boolean;
    vacation: number; // أيام الإجازة السنوية
    sickLeave: number; // أيام الإجازة المرضية
  };

  // حساب الراتب
  grossSalary: number;
  netSalary: number;
  lastPayDate?: string;
  nextPayDate?: string;
}

export interface WorkSchedule {
  type: 'fixed' | 'rotating' | 'flexible';
  weeklyHours: number;

  // الجدول الأسبوعي
  weeklySchedule: {
    [key: string]: DaySchedule; // 'monday', 'tuesday', etc.
  };

  // المناوبات (للعمل المتناوب)
  shifts?: Shift[];
  currentShift?: string;

  // ساعات العمل المرنة
  flexibleHours?: {
    coreHoursStart: string;
    coreHoursEnd: string;
    minHoursPerDay: number;
    maxHoursPerDay: number;
  };

  // الراحة
  breaks: Break[];
}

export interface DaySchedule {
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  totalHours?: number;
  breaks?: Break[];
  shift?: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'morning' | 'afternoon' | 'night' | 'weekend';
  premium?: number; // علاوة المناوبة %
}

export interface Break {
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // بالدقائق
  isPaid: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;

  // أوقات الحضور والانصراف
  clockIn?: string;
  clockOut?: string;

  // الحالة
  status: 'present' | 'absent' | 'late' | 'early_departure' | 'half_day' | 'overtime';

  // التفاصيل
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyDepartureMinutes?: number;

  // الملاحظات
  notes?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;

  // الموقع (إذا كان هناك تسجيل بالموقع)
  clockInLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  clockOutLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface PerformanceEvaluation {
  id: string;
  period: string; // "2024-Q1", "2024-01", etc.
  type: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

  // التقييم
  overallScore: number; // من 1 إلى 5
  maxScore: number;

  // المعايير
  criteria: {
    [key: string]: {
      score: number;
      weight: number;
      comments?: string;
    };
  };

  // التقييمات المختلفة
  selfAssessment?: number;
  supervisorAssessment: number;
  peerAssessment?: number[];
  clientFeedback?: number;

  // التعليقات
  strengths: string[];
  areasForImprovement: string[];
  achievements: string[];
  goals: string[];

  // التوقيعات
  employeeSignature?: {
    date: string;
    agreed: boolean;
    comments?: string;
  };
  supervisorSignature: {
    date: string;
    supervisorId: string;
    supervisorName: string;
  };

  // الحالة
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  dueDate: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'learning' | 'behavioral' | 'project';
  priority: 'low' | 'medium' | 'high' | 'critical';

  // التوقيت
  startDate: string;
  dueDate: string;
  completedDate?: string;

  // قياس الإنجاز
  metrics: {
    type: 'percentage' | 'number' | 'yes_no' | 'rating';
    target: number | string;
    current: number | string;
    unit?: string;
  };

  // الحالة
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  progress: number; // من 0 إلى 100

  // المتابعة
  milestones: Milestone[];
  updates: GoalUpdate[];

  // الدعم
  supervisor: {
    employeeId: string;
    name: string;
  };
  resources?: string[];
  budget?: number;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'overdue';
}

export interface GoalUpdate {
  id: string;
  date: string;
  progress: number;
  notes: string;
  attachments?: string[];
  updatedBy: string;
}

export interface TrainingRecord {
  id: string;
  title: string;
  type: 'internal' | 'external' | 'online' | 'certification';
  provider: string;
  instructor?: string;

  // التوقيت
  startDate: string;
  endDate: string;
  duration: number; // بالساعات

  // التكلفة
  cost: number;
  currency: string;
  paidBy: 'company' | 'employee' | 'shared';

  // التقييم
  completionStatus: 'registered' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  score?: number;
  grade?: string;
  certificate?: string;

  // التطبيق
  skills: string[];
  objectivesAchieved: boolean;
  feedback: string;

  // المتابعة
  followUpRequired: boolean;
  followUpDate?: string;
  applicationPlan?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;

  // الحالة
  status: 'active' | 'expired' | 'suspended' | 'pending_renewal';
  isRequired: boolean; // مطلوبة للعمل

  // التجديد
  renewalRequired: boolean;
  renewalDeadline?: string;
  renewalCost?: number;
  reminderSent?: boolean;

  // الوثائق
  certificateUrl?: string;
  attachments?: string[];
}

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;

  // التفاصيل
  reason: string;
  description?: string;
  isHalfDay?: boolean;
  attachments?: string[];

  // الحالة
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;

  // الموافقات
  approvals: LeaveApproval[];
  rejectionReason?: string;

  // البديل
  coverageArrangement?: {
    employeeId: string;
    employeeName: string;
    notes?: string;
  };

  // التأثير على الراتب
  isPaid: boolean;
  deductionAmount?: number;
}

export type LeaveType =
  | 'annual'        // إجازة سنوية
  | 'sick'          // إجازة مرضية
  | 'maternity'     // إجازة أمومة
  | 'paternity'     // إجازة أبوة
  | 'emergency'     // إجازة طارئة
  | 'bereavement'   // إجازة عزاء
  | 'study'         // إجازة دراسية
  | 'unpaid'        // إجازة بدون راتب
  | 'compensatory'; // إجازة تعويضية

export interface LeaveApproval {
  level: number;
  approver: {
    employeeId: string;
    name: string;
    position: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  date?: string;
  comments?: string;
}

export interface LeaveBalance {
  annual: {
    entitled: number;
    used: number;
    remaining: number;
    carryOver?: number;
  };
  sick: {
    entitled: number;
    used: number;
    remaining: number;
  };
  other: {
    [key in LeaveType]?: {
      entitled: number;
      used: number;
      remaining: number;
    };
  };
}

export type EmployeeStatus =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'suspended'
  | 'terminated'
  | 'retired';

export interface Permission {
  module: string;
  actions: ('read' | 'write' | 'delete' | 'approve')[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'warning' | 'achievement' | 'disciplinary';
  isConfidential: boolean;
  author: {
    employeeId: string;
    name: string;
  };
  date: string;
  attachments?: string[];
}

// للبحث والفلترة
export interface EmployeeFilters {
  department?: string[];
  position?: string[];
  status?: EmployeeStatus[];
  employmentType?: string[];
  hireDate?: {
    from: string;
    to: string;
  };
  salary?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

// للتقارير
export interface HRReport {
  type: 'headcount' | 'attendance' | 'performance' | 'payroll' | 'training' | 'turnover';
  period: {
    from: string;
    to: string;
  };
  filters?: EmployeeFilters;
  data: any;
  generatedAt: string;
  generatedBy: string;
}

// للإحصائيات
export interface HRStatistics {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;

  departmentBreakdown: {
    [department: string]: number;
  };

  attendanceRate: number;
  averagePerformanceScore: number;
  trainingHours: number;
  leaveUtilization: number;
}

// للتواصل الداخلي
export interface InternalMessage {
  id: string;
  subject: string;
  content: string;
  type: 'message' | 'announcement' | 'notice' | 'memo';
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // المرسل
  sender: {
    employeeId: string;
    name: string;
  };

  // المستقبلون
  recipients: {
    type: 'all' | 'department' | 'position' | 'individual';
    employeeIds?: string[];
    departments?: string[];
    positions?: string[];
  };

  // الحالة
  sentAt: string;
  readBy: {
    employeeId: string;
    readAt: string;
  }[];

  // المرفقات
  attachments?: string[];

  // التفاعل
  isReplyAllowed: boolean;
  replies?: InternalMessage[];

  // انتهاء الصلاحية
  expiryDate?: string;
  isActive: boolean;
}
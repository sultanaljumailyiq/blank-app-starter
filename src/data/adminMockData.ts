// البيانات الوهمية للوحة تحكم إدارة العيادة

export interface DashboardStats {
  totalPatients: number;
  monthlyAppointments: number;
  monthlyRevenue: number;
  satisfactionRate: number;
  totalTreatments: number;
}

export interface FinanceData {
  revenue: number;
  expenses: number;
  netProfit: number;
  averageTransaction: number;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  salary: number;
  phone: string;
  joinDate: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category: string;
  minStock: number;
}

export interface Equipment {
  id: number;
  name: string;
  price: number;
  purchaseDate: string;
  condition: string;
}

export interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  treatment: string;
}

export interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string;
  age: number;
  lastVisit: string;
  doctor: string;
  totalVisits: number;
}

export interface Treatment {
  id: number;
  name: string;
  price: number;
  duration: string;
  category: string;
}

export interface LabWork {
  id: number;
  patientName: string;
  testType: string;
  date: string;
  status: 'pending' | 'completed';
  result: string;
}

// إحصائيات النظرة العامة
export const dashboardStats: DashboardStats = {
  totalPatients: 245,
  monthlyAppointments: 58,
  monthlyRevenue: 1250000,
  satisfactionRate: 95,
  totalTreatments: 185,
};

// بيانات المالية
export const financeData: FinanceData = {
  revenue: 1250000,
  expenses: 750000,
  netProfit: 500000,
  averageTransaction: 75000,
};

// بيانات الإيرادات الشهرية (آخر 6 أشهر)
export const monthlyRevenueData = [
  { month: 'مايو', revenue: 980000, expenses: 650000 },
  { month: 'يونيو', revenue: 1150000, expenses: 720000 },
  { month: 'يوليو', revenue: 1050000, expenses: 680000 },
  { month: 'أغسطس', revenue: 1280000, expenses: 770000 },
  { month: 'سبتمبر', revenue: 1180000, expenses: 740000 },
  { month: 'أكتوبر', revenue: 1250000, expenses: 750000 },
];

// بيانات المعالجات (توزيع حسب النوع)
export const treatmentDistribution = [
  { name: 'تنظيف', value: 45 },
  { name: 'حشو', value: 30 },
  { name: 'خلع', value: 15 },
  { name: 'تقويم', value: 10 },
];

// طاقم العيادة
export const staffMembers: StaffMember[] = [
  {
    id: 1,
    name: 'د. أحمد محمد',
    role: 'طبيب أسنان',
    salary: 400000,
    phone: '+964 770 111 1111',
    joinDate: '2020-01-15',
  },
  {
    id: 2,
    name: 'فاطمة علي',
    role: 'ممرضة',
    salary: 250000,
    phone: '+964 770 222 2222',
    joinDate: '2021-03-20',
  },
  {
    id: 3,
    name: 'د. محمود حسن',
    role: 'طبيب أسنان',
    salary: 380000,
    phone: '+964 770 333 3333',
    joinDate: '2019-06-10',
  },
  {
    id: 4,
    name: 'نور الدين',
    role: 'مساعد',
    salary: 200000,
    phone: '+964 770 444 4444',
    joinDate: '2022-02-01',
  },
  {
    id: 5,
    name: 'سعاد كاطع',
    role: 'محاسبة',
    salary: 300000,
    phone: '+964 770 555 5555',
    joinDate: '2020-08-12',
  },
];

// المخزون
export const inventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: 'مسكن ألم دنتال',
    quantity: 50,
    price: 15000,
    category: 'أدوية',
    minStock: 20,
  },
  {
    id: 2,
    name: 'مضاد حيوي 500mg',
    quantity: 30,
    price: 45000,
    category: 'أدوية',
    minStock: 15,
  },
  {
    id: 3,
    name: 'مطهر فم',
    quantity: 20,
    price: 25000,
    category: 'مستلزمات',
    minStock: 10,
  },
  {
    id: 4,
    name: 'قفازات طبية',
    quantity: 200,
    price: 5000,
    category: 'مستلزمات',
    minStock: 50,
  },
  {
    id: 5,
    name: 'حشوة أسنان فضية',
    quantity: 15,
    price: 35000,
    category: 'مواد طبية',
    minStock: 10,
  },
];

// الأجهزة
export const equipment: Equipment[] = [
  {
    id: 1,
    name: 'جهاز أشعة سينية',
    price: 5000000,
    purchaseDate: '2019-03-15',
    condition: 'ممتاز',
  },
  {
    id: 2,
    name: 'كرسي أسنان متطور',
    price: 8000000,
    purchaseDate: '2020-06-20',
    condition: 'ممتاز',
  },
  {
    id: 3,
    name: 'جهاز تعقيم',
    price: 1200000,
    purchaseDate: '2021-01-10',
    condition: 'جيد',
  },
  {
    id: 4,
    name: 'مجهر تقويم',
    price: 3500000,
    purchaseDate: '2020-09-05',
    condition: 'جيد جداً',
  },
];

// الحجوزات
export const appointments: Appointment[] = [
  {
    id: 1,
    patientName: 'علي حسين',
    doctorName: 'د. أحمد محمد',
    date: '2025-11-08',
    time: '09:00',
    status: 'scheduled',
    treatment: 'تنظيف',
  },
  {
    id: 2,
    patientName: 'مريم سالم',
    doctorName: 'د. محمود حسن',
    date: '2025-11-08',
    time: '10:30',
    status: 'scheduled',
    treatment: 'حشو',
  },
  {
    id: 3,
    patientName: 'خالد عباس',
    doctorName: 'د. أحمد محمد',
    date: '2025-11-07',
    time: '14:00',
    status: 'completed',
    treatment: 'خلع ضرس',
  },
  {
    id: 4,
    patientName: 'نور فاضل',
    doctorName: 'د. محمود حسن',
    date: '2025-11-09',
    time: '11:00',
    status: 'scheduled',
    treatment: 'تقويم',
  },
  {
    id: 5,
    patientName: 'أحمد كريم',
    doctorName: 'د. أحمد محمد',
    date: '2025-11-06',
    time: '15:30',
    status: 'cancelled',
    treatment: 'فحص',
  },
];

// المرضى
export const patients: Patient[] = [
  {
    id: 1,
    name: 'علي حسين محمد',
    phone: '+964 770 123 4567',
    email: 'ali.hussein@email.com',
    age: 32,
    lastVisit: '2025-10-15',
    doctor: 'د. أحمد محمد',
    totalVisits: 8,
  },
  {
    id: 2,
    name: 'مريم سالم أحمد',
    phone: '+964 770 234 5678',
    email: 'mariam.salem@email.com',
    age: 28,
    lastVisit: '2025-10-20',
    doctor: 'د. محمود حسن',
    totalVisits: 5,
  },
  {
    id: 3,
    name: 'خالد عباس علي',
    phone: '+964 770 345 6789',
    email: 'khaled.abbas@email.com',
    age: 45,
    lastVisit: '2025-11-07',
    doctor: 'د. أحمد محمد',
    totalVisits: 12,
  },
  {
    id: 4,
    name: 'نور فاضل حسن',
    phone: '+964 770 456 7890',
    email: 'noor.fadel@email.com',
    age: 19,
    lastVisit: '2025-09-30',
    doctor: 'د. محمود حسن',
    totalVisits: 3,
  },
  {
    id: 5,
    name: 'أحمد كريم صالح',
    phone: '+964 770 567 8901',
    email: 'ahmed.karim@email.com',
    age: 38,
    lastVisit: '2025-11-01',
    doctor: 'د. أحمد محمد',
    totalVisits: 6,
  },
];

// العلاجات والخدمات
export const treatments: Treatment[] = [
  {
    id: 1,
    name: 'تنظيف أسنان',
    price: 50000,
    duration: '30 دقيقة',
    category: 'وقاية',
  },
  {
    id: 2,
    name: 'حشو عادي',
    price: 75000,
    duration: '45 دقيقة',
    category: 'علاج',
  },
  {
    id: 3,
    name: 'خلع ضرس',
    price: 100000,
    duration: '30 دقيقة',
    category: 'جراحة',
  },
  {
    id: 4,
    name: 'تقويم أسنان',
    price: 500000,
    duration: '60 دقيقة',
    category: 'تجميل',
  },
  {
    id: 5,
    name: 'تبييض أسنان',
    price: 250000,
    duration: '90 دقيقة',
    category: 'تجميل',
  },
  {
    id: 6,
    name: 'زراعة سن',
    price: 800000,
    duration: '120 دقيقة',
    category: 'جراحة',
  },
];

// أعمال المختبر
export const labWorks: LabWork[] = [
  {
    id: 1,
    patientName: 'علي حسين',
    testType: 'تحليل لعاب',
    date: '2025-11-06',
    status: 'completed',
    result: 'طبيعي',
  },
  {
    id: 2,
    patientName: 'مريم سالم',
    testType: 'أشعة بانوراما',
    date: '2025-11-07',
    status: 'pending',
    result: 'قيد الانتظار',
  },
  {
    id: 3,
    patientName: 'خالد عباس',
    testType: 'تحليل بكتيريا',
    date: '2025-11-05',
    status: 'completed',
    result: 'إيجابي - يحتاج علاج',
  },
];

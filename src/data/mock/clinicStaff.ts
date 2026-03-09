// بيانات الموظفين لكل عيادة
export interface StaffMember {
  id: string;
  clinicId: string;
  name: string;
  position: 'doctor' | 'assistant' | 'nurse' | 'receptionist' | 'admin' | 'technician';
  department: string;
  phone: string;
  email: string;
  address: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated' | 'suspended';
  qualifications: string[];
  certifications: string[];
  workSchedule: {
    days: string[];
    startTime: string;
    endTime: string;
    breaks: { start: string; end: string; duration: number }[];
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    overtime: number;
  };
  performance: {
    rating: number;
    lastReview: string;
    achievements: string[];
    goals: string[];
  };
  skills: string[];
  languages: string[];
  notes: string;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  financialRecords?: {
    id: string;
    type: 'salary' | 'commission' | 'bonus' | 'deduction';
    amount: number;
    date: string;
    note?: string;
  }[];
  assignedCases?: {
    patientName: string;
    treatmentType: string;
    status: 'in_progress' | 'completed';
    date: string;
    revenue: number;
  }[];
}

export const clinicStaffData: { [clinicId: string]: StaffMember[] } = {
  '1': [
    {
      id: 's1-1',
      clinicId: '1',
      name: 'د. أحمد محمد علي',
      position: 'doctor',
      department: 'تقويم الأسنان',
      phone: '0770-1111111',
      email: 'dr.ahmed@clinic1.com',
      address: 'بغداد - الكرخ، شارع الجامعة',
      hireDate: '2020-01-15',
      salary: 2500000,
      status: 'active',
      qualifications: ['بكالوريوس طب وجراحة الفم والأسنان', 'دبلوم تقويم الأسنان'],
      certifications: ['رخصة مزاولة مهنة طب الأسنان', 'شهادة تقويم الأسنان المتقدم'],
      workSchedule: {
        days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        startTime: '09:00',
        endTime: '18:00',
        breaks: [{ start: '13:00', end: '14:00', duration: 60 }]
      },
      attendance: { present: 180, absent: 2, late: 1, overtime: 15 },
      performance: {
        rating: 4.9,
        lastReview: '2024-11-30',
        achievements: ['أفضل طبيب في التقويم 2024', 'حصل على شكر من 95% من المرضى'],
        goals: ['زيادة عدد المرضى الجدد 20%', 'إنهاء دورات متقدمة في التقويم']
      },
      skills: ['تقويم الأسنان', 'علاج التقويم المعقد', 'إدارة العيادة'],
      languages: ['العربية', 'الإنجليزية'],
      notes: 'طبيب متخصص ومتمرس، يحظي بثقة عالية من المرضى',
      emergencyContact: { name: 'فاطمة أحمد محمد', phone: '0770-1111112', relationship: 'زوجة' },
      financialRecords: [
        { id: 'fin-1', type: 'salary', amount: 2500000, date: '2024-11-01', note: 'راتب شهر تشرين الثاني' },
        { id: 'fin-2', type: 'commission', amount: 150000, date: '2024-11-05', note: 'نسبة حالة تقويم (مريض: علي)' },
        { id: 'fin-3', type: 'commission', amount: 200000, date: '2024-11-12', note: 'نسبة حالة زراعة (مريض: سارة)' },
        { id: 'fin-4', type: 'deduction', amount: 50000, date: '2024-11-20', note: 'تأخير' },
      ],
      assignedCases: [
        { patientName: 'علي حسن', treatmentType: 'تقويم معدني', status: 'in_progress', date: '2024-10-10', revenue: 1500000 },
        { patientName: 'سارة محمد', treatmentType: 'زراعة سن', status: 'completed', date: '2024-09-01', revenue: 800000 },
        { patientName: 'خالد عمر', treatmentType: 'تقويم شفاف', status: 'in_progress', date: '2024-11-01', revenue: 2000000 },
      ]
    },
    {
      id: 's1-2',
      clinicId: '1',
      name: 'لينا سالم حسن',
      position: 'assistant',
      department: 'مساعدة طبية',
      phone: '0770-2222222',
      email: 'lina.salem@clinic1.com',
      address: 'بغداد - الكرخ، مجمع الأندلس',
      hireDate: '2021-03-10',
      salary: 650000,
      status: 'active',
      qualifications: ['دبلوم مساعد طبي', 'دورة الإسعافات الأولية'],
      certifications: ['شهادة مساعد طبي معتمد'],
      workSchedule: {
        days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        startTime: '08:30',
        endTime: '17:30',
        breaks: [{ start: '12:30', end: '13:30', duration: 60 }]
      },
      attendance: { present: 220, absent: 3, late: 5, overtime: 8 },
      performance: {
        rating: 4.7,
        lastReview: '2024-11-15',
        achievements: ['أفضل مساعد طبي في المساء', 'ممتازة في تنظيم المواعيد'],
        goals: ['التخصص في تقويم الأسنان', 'إتقان استخدام التقنيات الجديدة']
      },
      skills: ['إعداد الأدوات', 'تنظيم المواعيد', 'مساعدة الطبيب', 'التعقيم'],
      languages: ['العربية'],
      notes: 'مساعدة مجتهدة ومنظمة، تحب العمل مع الأطفال'
    },
    {
      id: 's1-3',
      clinicId: '1',
      name: 'محمد علي أحمد',
      position: 'receptionist',
      department: 'الاستقبال',
      phone: '0770-3333333',
      email: 'mohammed.ali@clinic1.com',
      address: 'بغداد - الكرخ، شارع الكرادة',
      hireDate: '2022-06-20',
      salary: 450000,
      status: 'active',
      qualifications: ['دبلوم إدارة المكاتب', 'دورة خدمة العملاء'],
      certifications: ['شهادة إدارة المكاتب'],
      workSchedule: {
        days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        startTime: '08:00',
        endTime: '16:00',
        breaks: [{ start: '12:00', end: '13:00', duration: 60 }]
      },
      attendance: { present: 200, absent: 5, late: 2, overtime: 3 },
      performance: {
        rating: 4.5,
        lastReview: '2024-10-30',
        achievements: ['أحسن في خدمة العملاء', 'نمو في الحجوزات 15%'],
        goals: ['التخصص في إدارة المرضى', 'تعلم تقنيات جديدة في الحجز']
      },
      skills: ['استقبال المرضى', 'إدارة المواعيد', 'خدمة العملاء', 'محاسبة'],
      languages: ['العربية', 'الإنجليزية (أساسيات)'],
      notes: 'مستقبل ودود ومهذب، يحافظ على سمعة العيادة'
    }
  ],
  '2': [
    {
      id: 's2-1',
      clinicId: '2',
      name: 'د. فاطمة رشيد حسن',
      position: 'doctor',
      department: 'طب أسنان الأطفال',
      phone: '0770-4444444',
      email: 'dr.fatima@clinic2.com',
      address: 'بغداد - الرصافة، شارع الكسنزان',
      hireDate: '2019-09-01',
      salary: 2800000,
      status: 'active',
      qualifications: ['بكالوريوس طب وجراحة الفم والأسنان', 'دبلوم طب أسنان الأطفال'],
      certifications: ['رخصة مزاولة مهنة طب الأسنان', 'شهادة تخصص الأطفال'],
      workSchedule: {
        days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        startTime: '08:00',
        endTime: '19:00',
        breaks: [{ start: '12:00', end: '13:30', duration: 90 }]
      },
      attendance: { present: 250, absent: 1, late: 0, overtime: 20 },
      performance: {
        rating: 4.9,
        lastReview: '2024-12-01',
        achievements: ['تخصص متميز في الأطفال', 'نسبة رضا المرضى 98%'],
        goals: ['افتتاح عيادة أطفال جديدة', 'تطوير برامج الوقاية']
      },
      skills: ['طب أسنان الأطفال', 'التعامل مع الأطفال', 'الوقاية', 'تقويم الأطفال'],
      languages: ['العربية', 'الإنجليزية'],
      notes: 'طبيبة متخصصة وذات خبرة عالية مع الأطفال'
    },
    {
      id: 's2-2',
      clinicId: '2',
      name: 'سارة أحمد محمد',
      position: 'nurse',
      department: 'تمريض',
      phone: '0770-5555555',
      email: 'sara.ahmed@clinic2.com',
      address: 'بغداد - الرصافة، الكاظمية',
      hireDate: '2020-12-15',
      salary: 750000,
      status: 'active',
      qualifications: ['دبلوم تمريض', 'دورة طب أسنان الأطفال'],
      certifications: ['رخصة تمريض', 'شهادة طب الأسنان للأطفال'],
      workSchedule: {
        days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        startTime: '08:30',
        endTime: '18:30',
        breaks: [{ start: '12:30', end: '13:30', duration: 60 }]
      },
      attendance: { present: 230, absent: 4, late: 2, overtime: 12 },
      performance: {
        rating: 4.8,
        lastReview: '2024-11-20',
        achievements: ['أفضل ممرضة في العناية بالأطفال', 'تطوير برامج تعليم الأطفال'],
        goals: ['الحصول على دبلوم متقدم', 'تطوير مهارات جديدة']
      },
      skills: ['تمريض الأطفال', 'التعليم الصحي', 'إدارة الألم', 'تطمين الأطفال'],
      languages: ['العربية'],
      notes: 'ممرضة متفانية وحنونة، تحسن التعامل مع الأطفال الصغار'
    }
  ],
  '3': [
    {
      id: 's3-1',
      clinicId: '3',
      name: 'د. علي داود سالم',
      position: 'doctor',
      department: 'جراحة الفم',
      phone: '0780-6666666',
      email: 'dr.ali@clinic3.com',
      address: 'البصرة - المركز، شارع النيل',
      hireDate: '2018-05-20',
      salary: 3200000,
      status: 'active',
      qualifications: ['بكالوريوس طب وجراحة الفم والأسنان', 'ماجستير جراحة الفم', 'دبلوم زراعة الأسنان'],
      certifications: ['رخصة مزاولة مهنة طب الأسنان', 'شهادة جراحة الفم المتقدم', 'رخصة زراعة الأسنان'],
      workSchedule: {
        days: ['الأحد', 'الاثنين', 'الأربعاء', 'الخميس', 'الجمعة'],
        startTime: '10:00',
        endTime: '17:00',
        breaks: [{ start: '13:00', end: '14:00', duration: 60 }]
      },
      attendance: { present: 150, absent: 1, late: 0, overtime: 25 },
      performance: {
        rating: 4.8,
        lastReview: '2024-12-05',
        achievements: ['أفضل جراح فم في البصرة 2024', 'نجاح 99% في عمليات الزرع'],
        goals: ['تطوير تقنيات الجراحة المتقدمة', 'فتح عيادة جراحة متخصصة']
      },
      skills: ['جراحة الفم', 'زراعة الأسنان', 'علاج الجذور المعقد', 'إدارة الطوارئ'],
      languages: ['العربية', 'الإنجليزية'],
      notes: 'جراح متميز وذو خبرة عالية في العمليات المعقدة'
    }
  ],
  '4': [
    {
      id: 's4-1',
      clinicId: '4',
      name: 'د. زينب عبدالرحمن محمد',
      position: 'doctor',
      department: 'طب أسنان الأطفال',
      phone: '0780-7777777',
      email: 'dr.zainab@clinic4.com',
      address: 'الموصل - المركزية، شارع النور',
      hireDate: '2021-08-10',
      salary: 2400000,
      status: 'active',
      qualifications: ['بكالوريوس طب وجراحة الفم والأسنان', 'دبلوم طب أسنان الأطفال'],
      certifications: ['رخصة مزاولة مهنة طب الأسنان', 'شهادة تخصص الأطفال', 'دورة التعامل مع قلق الأطفال'],
      workSchedule: {
        days: ['السبت', 'الأحد', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        startTime: '09:30',
        endTime: '18:30',
        breaks: [{ start: '13:00', end: '14:00', duration: 60 }]
      },
      attendance: { present: 180, absent: 3, late: 2, overtime: 5 },
      performance: {
        rating: 4.7,
        lastReview: '2024-11-25',
        achievements: ['ممتازة في تهدئة الأطفال المخيفين', 'نمو مريضين جدد 30%'],
        goals: ['تطوير برامج الوقاية للأطفال', 'تعلم تقنيات جديدة في علاج الأطفال']
      },
      skills: ['طب أسنان الأطفال', 'التعامل مع قلق الأطفال', 'الوقاية', 'التعليم الصحي'],
      languages: ['العربية'],
      notes: 'طبيبة صبورة ومتفهمة، تتميز بقدرتها على التعامل مع الأطفال الصغار'
    }
  ],
  '5': [
    {
      id: 's5-1',
      clinicId: '5',
      name: 'د. عمر عبدالله حسن',
      position: 'doctor',
      department: 'تقويم الأسنان',
      phone: '0790-8888888',
      email: 'dr.omar@clinic5.com',
      address: 'كربلاء المقدسة، شارع الإمام',
      hireDate: '2017-11-15',
      salary: 3000000,
      status: 'active',
      qualifications: ['بكالوريوس طب وجراحة الفم والأسنان', 'ماجستير تقويم الأسنان'],
      certifications: ['رخصة مزاولة مهنة طب الأسنان', 'رخصة تقويم الأسنان المتقدم'],
      workSchedule: {
        days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        startTime: '08:30',
        endTime: '18:00',
        breaks: [{ start: '13:00', end: '14:00', duration: 60 }]
      },
      attendance: { present: 280, absent: 0, late: 1, overtime: 30 },
      performance: {
        rating: 4.9,
        lastReview: '2024-12-02',
        achievements: ['أفضل أخصائي تقويم في كربلاء 2024', 'نسبة نجاح 97% في العلاجات'],
        goals: ['تطوير تقنيات التقويم الرقمي', 'توسيع العيادة']
      },
      skills: ['تقويم الأسنان', 'زراعة الأسنان', 'جراحة الفم', 'تجميل الأسنان'],
      languages: ['العربية', 'الإنجليزية'],
      notes: 'أخصائي تقويم متميز مع خبرة واسعة في الحالات المعقدة'
    }
  ],
  '6': [
    {
      id: 's6-1',
      clinicId: '6',
      name: 'د. نادية سعد الدين',
      position: 'doctor',
      department: 'الأسنان العامة',
      phone: '0790-9999999',
      email: 'dr.nadia@clinic6.com',
      address: 'الأنبار - الرمادي، شارع الجمهورية',
      hireDate: '2019-07-20',
      salary: 2200000,
      status: 'active',
      qualifications: ['بكالوريوس طب وجراحة الفم والأسنان'],
      certifications: ['رخصة مزاولة مهنة طب الأسنان'],
      workSchedule: {
        days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الخميس'],
        startTime: '09:00',
        endTime: '19:00',
        breaks: [{ start: '13:00', end: '14:30', duration: 90 }]
      },
      attendance: { present: 200, absent: 5, late: 3, overtime: 10 },
      performance: {
        rating: 4.6,
        lastReview: '2024-11-10',
        achievements: ['تحسن في نسبة رضا المرضى', 'نمو العيادة 25%'],
        goals: ['التخصص في طب الجذور', 'تطوير مهارات جديدة']
      },
      skills: ['علاج الأسنان العام', 'الوقاية', 'علاج الجذور', 'تجميل الأسنان'],
      languages: ['العربية'],
      notes: 'طبيبة مجتهدة وتحب مساعدة المرضى'
    }
  ],
  '7': [
    {
      id: 's7-1',
      clinicId: '7',
      name: 'د. حسام مقدم محمد',
      position: 'doctor',
      department: 'جراحة الفم',
      phone: '0770-1010101',
      email: 'dr.hussam@clinic7.com',
      address: 'النجف الأشرف، شارع الكوفة',
      hireDate: '2016-03-10',
      salary: 3500000,
      status: 'active',
      qualifications: ['بكالوريوس طب وجراحة الفم والأسنان', 'ماجستير جراحة الفم', 'دبلوم زراعة الأسنان المتقدم'],
      certifications: ['رخصة مزاولة مهنة طب الأسنان', 'رخصة جراحة الفم المتقدم', 'رخصة زراعة الأسنان'],
      workSchedule: {
        days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        startTime: '10:00',
        endTime: '17:00',
        breaks: [{ start: '13:00', end: '14:00', duration: 60 }]
      },
      attendance: { present: 260, absent: 1, late: 0, overtime: 35 },
      performance: {
        rating: 4.9,
        lastReview: '2024-12-03',
        achievements: ['أفضل جراح فم في العراق 2024', 'نجاح 100% في عمليات الزرع', 'تدريب 20 طبيب جديد'],
        goals: ['افتتاح مركز جراحة متطور', 'القيادة في مجال زراعة الأسنان']
      },
      skills: ['جراحة الفم', 'زراعة الأسنان', 'تقويم الأسنان', 'تجميل الأسنان', 'إدارة'],
      languages: ['العربية', 'الإنجليزية'],
      notes: 'جراح متميز على المستوى الوطني، يقود فريق طبي متميز'
    }
  ],
  '8': [
    {
      id: 's8-1',
      clinicId: '8',
      name: 'د. ليلى كمال رحيم',
      position: 'doctor',
      department: 'طب أسنان الأطفال',
      phone: '0770-2020202',
      email: 'dr.layla@clinic8.com',
      address: 'أربيل - المركز، شارع خاصة',
      hireDate: '2020-10-05',
      salary: 2600000,
      status: 'active',
      qualifications: ['بكالوريوس طب وجراحة الفم والأسنان', 'دبلوم طب أسنان الأطفال', 'دورة التعامل مع قلق الأطفال'],
      certifications: ['رخصة مزاولة مهنة طب الأسنان', 'شهادة تخصص الأطفال', 'دورة القلق عند الأطفال'],
      workSchedule: {
        days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        startTime: '08:00',
        endTime: '18:00',
        breaks: [{ start: '12:30', end: '13:30', duration: 60 }]
      },
      attendance: { present: 220, absent: 2, late: 1, overtime: 8 },
      performance: {
        rating: 4.8,
        lastReview: '2024-11-28',
        achievements: ['أخصائية متميزة في علاج الأطفال في أربيل', 'تطوير برامج الوقاية للأطفال'],
        goals: ['افتتاح عيادة أطفال متخصصة', 'التوسع في خدمة المناطق النائية']
      },
      skills: ['طب أسنان الأطفال', 'التعامل مع قلق الأطفال', 'الوقاية', 'التعليم الصحي'],
      languages: ['العربية', 'الكردية', 'الإنجليزية (أساسيات)'],
      notes: 'طبيبة متفهمة وصبورة، تحسن كسب ثقة الأطفال'
    }
  ]
};

// دالة للحصول على موظفي العيادة
export const getStaffByClinic = (clinicId: string): StaffMember[] => {
  return clinicStaffData[clinicId] || [];
};

// دالة للبحث في الموظفين
export const searchStaff = (clinicId: string, query: string): StaffMember[] => {
  const staff = getStaffByClinic(clinicId);
  return staff.filter(member =>
    member.name.toLowerCase().includes(query.toLowerCase()) ||
    member.position.toLowerCase().includes(query.toLowerCase()) ||
    member.department.toLowerCase().includes(query.toLowerCase()) ||
    member.qualifications.some(q => q.includes(query)) ||
    member.skills.some(s => s.includes(query))
  );
};

// دالة للحصول على إحصائيات الموظفين
export const getStaffStats = (clinicId: string) => {
  const staff = getStaffByClinic(clinicId);
  return {
    total: staff.length,
    doctors: staff.filter(s => s.position === 'doctor').length,
    assistants: staff.filter(s => s.position === 'assistant').length,
    nurses: staff.filter(s => s.position === 'nurse').length,
    receptionists: staff.filter(s => s.position === 'receptionist').length,
    admin: staff.filter(s => s.position === 'admin').length,
    active: staff.filter(s => s.status === 'active').length,
    onLeave: staff.filter(s => s.status === 'on_leave').length,
    avgRating: staff.length > 0 ?
      Math.round((staff.reduce((sum, s) => sum + s.performance.rating, 0) / staff.length) * 10) / 10 : 0,
    totalSalary: staff.reduce((sum, s) => sum + s.salary, 0),
    avgAttendance: staff.length > 0 ?
      Math.round((staff.reduce((sum, s) => sum + (s.attendance.present / (s.attendance.present + s.attendance.absent) * 100), 0) / staff.length) * 10) / 10 : 0
  };
};
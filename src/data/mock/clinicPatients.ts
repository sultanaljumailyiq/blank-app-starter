// بيانات المرضى لكل عيادة
export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  address: string;
  medicalHistory: string[];
  allergies: string[];
  lastVisit: string;
  nextAppointment?: string;
  totalVisits: number;
  status: 'active' | 'inactive' | 'emergency';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  balance: number;
  registrationDate: string;
  notes: string;
  avatar?: string;
}

export const clinicPatientsData: { [clinicId: string]: Patient[] } = {
  '1': [
    {
      id: 'p1-1',
      clinicId: '1',
      name: 'سارة أحمد محمد',
      age: 28,
      gender: 'female',
      phone: '0770-1111111',
      email: 'sara.ahmed@gmail.com',
      address: 'بغداد - الكرخ، شارع الجامعة',
      medicalHistory: ['تسوس خفيف', 'التهاب اللثة'],
      allergies: ['أدوية البنسلين', 'فول'],
      lastVisit: '2024-12-05',
      nextAppointment: '2024-12-20',
      totalVisits: 8,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2024-06-15',
      notes: 'مريضة منتظمة، تحتاج متابعة علاج التسوس'
    },
    {
      id: 'p1-2',
      clinicId: '1',
      name: 'محمد علي حسن',
      age: 35,
      gender: 'male',
      phone: '0770-2222222',
      address: 'بغداد - الكرخ، مجمع الأندلس',
      medicalHistory: ['مشاكل التقويم', 'أسنان مطمورة'],
      allergies: ['أسبرين'],
      lastVisit: '2024-12-01',
      totalVisits: 5,
      status: 'active',
      paymentStatus: 'pending',
      balance: 50000,
      registrationDate: '2024-08-20',
      notes: 'يحتاج علاج تقويم، جلسات متبقية 12 جلسة'
    },
    {
      id: 'p1-3',
      clinicId: '1',
      name: 'فاطمة سالم أحمد',
      age: 42,
      gender: 'female',
      phone: '0770-3333333',
      address: 'بغداد - الكرخ، شارع الكرادة',
      medicalHistory: ['مرض السكري', 'ضغط الدم'],
      allergies: [],
      lastVisit: '2024-11-28',
      totalVisits: 12,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2024-03-10',
      notes: 'مريضة سكر، تحتاج حذر في العلاجات'
    }
  ],
  '2': [
    {
      id: 'p2-1',
      clinicId: '2',
      name: 'عبدالله محمد علي',
      age: 12,
      gender: 'male',
      phone: '0770-4444444',
      address: 'بغداد - الرصافة، شارع الكسنزان',
      medicalHistory: ['تسوس الأطفال', 'نمو غير طبيعي'],
      allergies: ['حليب'],
      lastVisit: '2024-12-04',
      totalVisits: 6,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2024-07-15',
      notes: 'طفل، يحتاج متابعة دورية'
    },
    {
      id: 'p2-2',
      clinicId: '2',
      name: 'نور وحيد سالم',
      age: 25,
      gender: 'female',
      phone: '0770-5555555',
      address: 'بغداد - الرصافة، الكاظمية',
      medicalHistory: ['خراج لثة', 'التهاب شديد'],
      allergies: [],
      lastVisit: '2024-12-06',
      totalVisits: 15,
      status: 'active',
      paymentStatus: 'overdue',
      balance: 75000,
      registrationDate: '2024-01-20',
      notes: 'مريضة تحتاج علاج جذر'
    }
  ],
  '3': [
    {
      id: 'p3-1',
      clinicId: '3',
      name: 'حسين داود سالم',
      age: 45,
      gender: 'male',
      phone: '0780-6666666',
      address: 'البصرة - المركز، شارع النيل',
      medicalHistory: ['فقدان أسنان', 'فك غير متوازن'],
      allergies: ['ليدوكايين'],
      lastVisit: '2024-12-03',
      totalVisits: 3,
      status: 'emergency',
      paymentStatus: 'pending',
      balance: 150000,
      registrationDate: '2024-11-15',
      notes: 'حالة طوارئ، يحتاج زراعة أسنان'
    },
    {
      id: 'p3-2',
      clinicId: '3',
      name: 'رقية علي محمد',
      age: 38,
      gender: 'female',
      phone: '0780-7777777',
      address: 'البصرة - المركز، المعقل',
      medicalHistory: ['مشاكل الجذور', 'خراج كبير'],
      allergies: [],
      lastVisit: '2024-12-07',
      totalVisits: 8,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2024-05-10',
      notes: 'تم علاج الجذور بنجاح، تحتاج متابعة'
    }
  ],
  '4': [
    {
      id: 'p4-1',
      clinicId: '4',
      name: 'علي زينب عبدالله',
      age: 8,
      gender: 'male',
      phone: '0780-8888888',
      address: 'الموصل - المركزية، شارع النور',
      medicalHistory: ['خوف من طبيب الأسنان', 'تسوس مبكر'],
      allergies: ['فاكهة الحمضيات'],
      lastVisit: '2024-12-02',
      totalVisits: 4,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2024-09-01',
      notes: 'طفل يخاف طبيب الأسنان، يحتاج طريقة خاصة'
    },
    {
      id: 'p4-2',
      clinicId: '4',
      name: 'أميرة عبدالرحمن',
      age: 14,
      gender: 'female',
      phone: '0780-9999999',
      address: 'الموصل - المركزية،祕ص',
      medicalHistory: ['تقويم أسنان الأطفال', 'فك ضيق'],
      allergies: [],
      lastVisit: '2024-12-05',
      totalVisits: 7,
      status: 'active',
      paymentStatus: 'pending',
      balance: 40000,
      registrationDate: '2024-06-20',
      notes: 'تحتاج تقويم، جلسات متبقية 8'
    }
  ],
  '5': [
    {
      id: 'p5-1',
      clinicId: '5',
      name: 'كرار عبدالله حسن',
      age: 22,
      gender: 'male',
      phone: '0790-1111222',
      address: 'كربلاء المقدسة، شارع الإمام',
      medicalHistory: ['تقويم معقد', 'أسنان متداخلة'],
      allergies: [],
      lastVisit: '2024-12-06',
      totalVisits: 20,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2023-12-01',
      notes: 'تقويم متقدم، نتائج ممتازة'
    },
    {
      id: 'p5-2',
      clinicId: '5',
      name: 'زينب سالم أحمد',
      age: 30,
      gender: 'female',
      phone: '0790-2222333',
      address: 'كربلاء المقدسة، شارع الحر',
      medicalHistory: ['زراعة أسنان', 'فقدان ضروس'],
      allergies: ['أسبرين'],
      lastVisit: '2024-12-04',
      totalVisits: 12,
      status: 'active',
      paymentStatus: 'pending',
      balance: 80000,
      registrationDate: '2024-02-15',
      notes: 'زراعة أسنان ناجحة، تحتاج متابعة'
    }
  ],
  '6': [
    {
      id: 'p6-1',
      clinicId: '6',
      name: 'عمر سعد الدين',
      age: 55,
      gender: 'male',
      phone: '0790-3333444',
      address: 'الأنبار - الرمادي، شارع الجمهورية',
      medicalHistory: ['أمراض لثة', 'تسوس شديد'],
      allergies: [],
      lastVisit: '2024-12-01',
      totalVisits: 9,
      status: 'active',
      paymentStatus: 'overdue',
      balance: 120000,
      registrationDate: '2024-04-10',
      notes: 'يحتاج علاج شامل، متابعة دورية'
    },
    {
      id: 'p6-2',
      clinicId: '6',
      name: 'غادة نادر محمد',
      age: 32,
      gender: 'female',
      phone: '0790-4444555',
      address: 'الأنبار - الرمادي، شارع المطار',
      medicalHistory: ['علاج الجذور', 'إعادة ترميم'],
      allergies: ['بنسلين'],
      lastVisit: '2024-12-07',
      totalVisits: 6,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2024-08-25',
      notes: 'علاج الجذور تم بنجاح، تحتاج ترميم'
    }
  ],
  '7': [
    {
      id: 'p7-1',
      clinicId: '7',
      name: 'مريم مقدم محمد',
      age: 27,
      gender: 'female',
      phone: '0770-5555666',
      address: 'النجف الأشرف، شارع الكوفة',
      medicalHistory: ['تجميل الأسنان', 'تبييض'],
      allergies: [],
      lastVisit: '2024-12-05',
      totalVisits: 10,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2024-05-20',
      notes: 'مرضعة سعيدة بالنتيجة، تحتاج متابعة'
    },
    {
      id: 'p7-2',
      clinicId: '7',
      name: 'رائد كمال رحيم',
      age: 40,
      gender: 'male',
      phone: '0770-6666777',
      address: 'النجف الأشرف، شارع邮电',
      medicalHistory: ['جراحة فم معقدة', 'زراعة متعددة'],
      allergies: ['ليدوكايين'],
      lastVisit: '2024-12-03',
      totalVisits: 25,
      status: 'active',
      paymentStatus: 'pending',
      balance: 200000,
      registrationDate: '2024-01-10',
      notes: 'جراحة ناجحة، يحتاج متابعة دقيقة'
    }
  ],
  '8': [
    {
      id: 'p8-1',
      clinicId: '8',
      name: 'زينب كمال رحيم',
      age: 6,
      gender: 'female',
      phone: '0770-7777888',
      address: 'أربيل - المركز، شارع خاص',
      medicalHistory: ['تسوس الأطفال المبكر', 'خوف شديد'],
      allergies: ['الشوكولاتة'],
      lastVisit: '2024-12-04',
      totalVisits: 3,
      status: 'active',
      paymentStatus: 'paid',
      balance: 0,
      registrationDate: '2024-10-15',
      notes: 'طفل صغير، تحتاج صبر وهدوء'
    },
    {
      id: 'p8-2',
      clinicId: '8',
      name: 'أكرم حميد سالم',
      age: 16,
      gender: 'male',
      phone: '0770-8888999',
      address: 'أربيل - المركز، شارع الزالة',
      medicalHistory: ['تقويم أسنان المراهقين', 'فك غير متوازن'],
      allergies: [],
      lastVisit: '2024-12-06',
      totalVisits: 15,
      status: 'active',
      paymentStatus: 'pending',
      balance: 65000,
      registrationDate: '2023-09-20',
      notes: 'تقويم متقدم، نتائج ممتازة'
    }
  ]
};

// دالة للحصول على مرضى العيادة
export const getPatientsByClinic = (clinicId: string): Patient[] => {
  return clinicPatientsData[clinicId] || [];
};

// دالة للبحث في المرضى
export const searchPatients = (clinicId: string, query: string): Patient[] => {
  const patients = getPatientsByClinic(clinicId);
  return patients.filter(patient => 
    patient.name.toLowerCase().includes(query.toLowerCase()) ||
    patient.phone.includes(query) ||
    patient.medicalHistory.some(history => history.includes(query))
  );
};

// دالة للحصول على إحصائيات المرضى
export const getPatientStats = (clinicId: string) => {
  const patients = getPatientsByClinic(clinicId);
  return {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    emergency: patients.filter(p => p.status === 'emergency').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
    pendingPayments: patients.filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'overdue').length,
    overdueBalance: patients.filter(p => p.paymentStatus === 'overdue').reduce((sum, p) => sum + p.balance, 0),
    avgVisits: patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.totalVisits, 0) / patients.length) : 0
  };
};
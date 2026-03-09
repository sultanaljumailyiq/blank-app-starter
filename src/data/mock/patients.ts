import { Patient } from '../../types/patients';

// أسماء عراقية واقعية
const iraqiFirstNames = {
  male: [
    'أحمد', 'محمد', 'علي', 'حسن', 'حسين', 'عمر', 'يوسف', 'إبراهيم', 'عبدالله', 'عبدالرحمن',
    'فاروق', 'نبيل', 'سامر', 'رامي', 'خالد', 'مصطفى', 'عماد', 'وليد', 'طارق', 'سعد',
    'محمود', 'عادل', 'باسل', 'عصام', 'جمال', 'كمال', 'فؤاد', 'زياد', 'مجيد', 'سالم'
  ],
  female: [
    'فاطمة', 'زينب', 'مريم', 'عائشة', 'سارة', 'نور', 'أمل', 'رنا', 'دعاء', 'هدى',
    'سعاد', 'سماح', 'نبال', 'وفاء', 'إيمان', 'نجلاء', 'سندس', 'شيماء', 'ريم', 'لمياء',
    'زهراء', 'إسراء', 'آية', 'نداء', 'ضحى', 'منى', 'ليلى', 'سلمى', 'نورا', 'رشا'
  ]
};

const iraqiLastNames = [
  'العبيدي', 'التميمي', 'الخزرجي', 'الهاشمي', 'الكربلائي', 'البغدادي', 'النجفي', 'البصري',
  'الموصلي', 'الحلي', 'السامرائي', 'العكيدي', 'الزبيدي', 'الربيعي', 'الغرباوي', 'المشهداني',
  'الدليمي', 'الجبوري', 'الكعبي', 'الخفاجي', 'الطائي', 'العنزي', 'الشمري', 'الركابي',
  'الطالباني', 'البرزاني', 'السوراني', 'الفيلي', 'المندلاوي', 'الآلوسي', 'القرغولي', 'الوائلي'
];

const iraqiCities = [
  'بغداد - الكرادة', 'بغداد - الجادرية', 'بغداد - المنصور', 'بغداد - الكاظمية', 'بغداد - الصدر',
  'البصرة - الجزائر', 'البصرة - الحرية', 'أربيل - عنكاوا', 'أربيل - شاخوكة', 'دهوك - نيرامون',
  'النجف - الحنانة', 'كربلاء - العباس', 'الموصل - الفتح', 'السليمانية - سليم', 'كركوك - الواسطي',
  'الأنبار - الرمادي', 'ديالى - بعقوبة', 'بابل - الحلة', 'نينوى - سنجار', 'ميسان - العمارة'
];

// أمراض شائعة في طب الأسنان
const dentalConditions = [
  'تسوس الأسنان', 'التهاب اللثة', 'حساسية الأسنان', 'طحن الأسنان الليلي', 'رائحة الفم',
  'جفاف الفم', 'تقرحات الفم', 'التهاب الجذور', 'كسر الأسنان', 'فقدان الأسنان'
];

const medications = [
  'مسكن الألم', 'مضاد حيوي', 'مضاد التهاب', 'غسول الفم الطبي', 'جل اللثة',
  'فيتامين د', 'الكالسيوم', 'مكملات الفلورايد', 'مرطب الفم', 'مضاد الفطريات'
];

const allergies = [
  'البنسلين', 'الأسبرين', 'اللاتكس', 'المعادن', 'المخدر الموضعي',
  'اليود', 'السلفا', 'المطاط', 'النيكل', 'الفضة'
];

const treatmentHistory = [
  'تنظيف الأسنان', 'حشوة مركبة', 'حشوة أملغم', 'علاج عصب', 'قلع سن',
  'تركيب تاج', 'تركيب جسر', 'زراعة أسنان', 'تقويم الأسنان', 'تبييض الأسنان',
  'علاج اللثة', 'تنظيف الجذور', 'جراحة اللثة', 'إزالة الجير', 'علاج القناة'
];

// توليد مريض عشوائي
function generateRandomPatient(id: number): Patient {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = iraqiFirstNames[gender][Math.floor(Math.random() * iraqiFirstNames[gender].length)];
  const lastName = iraqiLastNames[Math.floor(Math.random() * iraqiLastNames.length)];
  const fullName = `${firstName} ${lastName}`;
  
  // تاريخ ميلاد عشوائي (18-80 سنة)
  const age = 18 + Math.floor(Math.random() * 62);
  const birthYear = 2025 - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const dateOfBirth = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
  
  // تاريخ التسجيل (آخر سنتين)
  const regDate = new Date();
  regDate.setDate(regDate.getDate() - Math.floor(Math.random() * 730));
  const registrationDate = regDate.toISOString().split('T')[0];
  
  // آخر زيارة (آخر 6 شهور أو null)
  const lastVisit = Math.random() > 0.3 ? (() => {
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 180));
    return visitDate.toISOString().split('T')[0];
  })() : undefined;
  
  const totalVisits = Math.floor(Math.random() * 20) + 1;
  const phone = `0790${Math.floor(Math.random() * 9000000) + 1000000}`;
  const address = iraqiCities[Math.floor(Math.random() * iraqiCities.length)];
  
  // تاريخ طبي عشوائي
  const hasAllergies = Math.random() > 0.7;
  const hasMedications = Math.random() > 0.6;
  const hasConditions = Math.random() > 0.5;
  const hasTreatments = Math.random() > 0.4;
  
  return {
    id: `PAT${id.toString().padStart(3, '0')}`,
    firstName,
    lastName,
    fullName,
    phone,
    email: Math.random() > 0.6 ? `${firstName.toLowerCase()}${lastName.toLowerCase()}@gmail.com` : undefined,
    dateOfBirth,
    gender,
    address,
    nationalId: `${Math.floor(Math.random() * 900000) + 100000}${Math.floor(Math.random() * 9000) + 1000}`,
    emergencyContact: Math.random() > 0.3 ? {
      name: `${iraqiFirstNames[gender === 'male' ? 'female' : 'male'][Math.floor(Math.random() * 10)]} ${lastName}`,
      phone: `0770${Math.floor(Math.random() * 9000000) + 1000000}`,
      relationship: Math.random() > 0.5 ? 'الزوج/الزوجة' : 'الأخ/الأخت'
    } : undefined,
    medicalHistory: {
      allergies: hasAllergies ? [
        allergies[Math.floor(Math.random() * allergies.length)],
        ...(Math.random() > 0.7 ? [allergies[Math.floor(Math.random() * allergies.length)]] : [])
      ] : [],
      medications: hasMedications ? [
        medications[Math.floor(Math.random() * medications.length)],
        ...(Math.random() > 0.6 ? [medications[Math.floor(Math.random() * medications.length)]] : [])
      ] : [],
      conditions: hasConditions ? [
        dentalConditions[Math.floor(Math.random() * dentalConditions.length)],
        ...(Math.random() > 0.6 ? [dentalConditions[Math.floor(Math.random() * dentalConditions.length)]] : [])
      ] : [],
      notes: Math.random() > 0.7 ? 'ملاحظات طبية خاصة بالمريض' : undefined
    },
    dentalHistory: {
      lastVisit,
      treatmentHistory: hasTreatments ? Array.from(
        { length: Math.floor(Math.random() * 5) + 1 }, 
        () => treatmentHistory[Math.floor(Math.random() * treatmentHistory.length)]
      ) : [],
      currentTreatments: Math.random() > 0.8 ? [
        treatmentHistory[Math.floor(Math.random() * treatmentHistory.length)]
      ] : [],
      notes: Math.random() > 0.6 ? 'ملاحظات طبية للأسنان' : undefined
    },
    insurance: Math.random() > 0.6 ? {
      provider: ['التأمين الصحي العراقي', 'شركة الزمان للتأمين', 'شركة دجلة والفرات للتأمين'][Math.floor(Math.random() * 3)],
      policyNumber: `POL${Math.floor(Math.random() * 900000) + 100000}`,
      expiryDate: '2025-12-31'
    } : undefined,
    registrationDate,
    lastVisit,
    totalVisits,
    status: Math.random() > 0.1 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'archived'),
    notes: Math.random() > 0.7 ? 'ملاحظات إضافية عن المريض' : undefined
  };
}

// إنشاء قائمة المرضى
export const mockPatients: Patient[] = Array.from({ length: 60 }, (_, index) => generateRandomPatient(index + 1));

// مرضى مميزون للاختبار
export const featuredPatients: Patient[] = [
  {
    id: 'PAT001',
    firstName: 'أحمد',
    lastName: 'العبيدي',
    fullName: 'أحمد العبيدي',
    phone: '07901234567',
    email: 'ahmed.alobaydi@gmail.com',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    address: 'بغداد - الكرادة',
    nationalId: '19850315001',
    emergencyContact: {
      name: 'فاطمة العبيدي',
      phone: '07701234567',
      relationship: 'الزوجة'
    },
    medicalHistory: {
      allergies: ['البنسلين'],
      medications: ['مسكن الألم'],
      conditions: ['حساسية الأسنان'],
      notes: 'مريض منتظم ومتعاون'
    },
    dentalHistory: {
      lastVisit: '2025-10-15',
      treatmentHistory: ['تنظيف الأسنان', 'حشوة مركبة', 'علاج عصب'],
      currentTreatments: ['تقويم الأسنان'],
      notes: 'يحتاج متابعة شهرية للتقويم'
    },
    insurance: {
      provider: 'التأمين الصحي العراقي',
      policyNumber: 'POL123456',
      expiryDate: '2025-12-31'
    },
    registrationDate: '2023-01-15',
    lastVisit: '2025-10-15',
    totalVisits: 12,
    status: 'active',
    notes: 'مريض VIP - يفضل المواعيد المسائية'
  },
  {
    id: 'PAT002',
    firstName: 'زينب',
    lastName: 'التميمي',
    fullName: 'زينب التميمي',
    phone: '07902345678',
    email: 'zainab.tamimi@yahoo.com',
    dateOfBirth: '1992-07-22',
    gender: 'female',
    address: 'بغداد - الجادرية',
    nationalId: '19920722002',
    emergencyContact: {
      name: 'علي التميمي',
      phone: '07702345678',
      relationship: 'الزوج'
    },
    medicalHistory: {
      allergies: [],
      medications: [],
      conditions: ['التهاب اللثة'],
      notes: 'تحتاج تنظيف دوري كل 3 شهور'
    },
    dentalHistory: {
      lastVisit: '2025-11-01',
      treatmentHistory: ['تنظيف الأسنان', 'تبييض الأسنان'],
      currentTreatments: [],
      notes: 'نتائج ممتازة مع العلاج'
    },
    registrationDate: '2023-05-20',
    lastVisit: '2025-11-01',
    totalVisits: 8,
    status: 'active',
    notes: 'مريضة ملتزمة بالمواعيد'
  }
];

// دمج المرضى المميزين مع المرضى العشوائيين
export const allPatients = [...featuredPatients, ...mockPatients.slice(2)];
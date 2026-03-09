import { Job } from '../../types';

// محافظات العراق
export const iraqGovernorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 
  'الأنبار', 'ديالى', 'بابل', 'واسط', 'صلاح الدين', 'كركوك',
  'ذي قار', 'المثنى', 'ميسان', 'القادسية', 'السليمانية', 'دهوك'
];

// أقضية بغداد
export const baghdadDistricts = [
  'الكرخ', 'الرصافة', 'الكاظمية', 'الصدر', 'المدائن', 'أبو غريب',
  'الطارمية', 'محمودية'
];

// أقضية البصرة
export const basraDistricts = [
  'البصرة', 'الزبير', 'القرنة', 'شط العرب', 'أبو الخصيب', 
  'الفاو', 'المدينة'
];

// أقضية نينوى
export const ninevehDistricts = [
  'الموصل', 'تلعفر', 'الحمدانية', 'الشيخان', 'سنجار', 
  'تلكيف', 'القيارة', 'الشورة'
];

// مساعدة لاختيار الأقضية حسب المحافظة
export const getDistrictsByGovernorate = (governorate: string): string[] => {
  switch (governorate) {
    case 'بغداد': return baghdadDistricts;
    case 'البصرة': return basraDistricts;
    case 'نينوى': return ninevehDistricts;
    default: return ['المركز', 'قضاء أول', 'قضاء ثاني', 'قضاء ثالث'];
  }
};

// بيانات وهمية للوظائف
export const mockJobs: Job[] = [
  {
    id: 'job001',
    title: 'طبيب أسنان عام - دوام كامل',
    companyId: 'clinic001',
    companyName: 'عيادة النور الطبية',
    companyLogo: '/images/clinics/alnoor.png',
    location: 'حي الجادرية، بغداد',
    governorate: 'بغداد',
    district: 'الكرخ',
    type: 'full-time',
    salary: {
      min: 1500000,
      max: 2500000,
      currency: 'د.ع',
      period: 'monthly'
    },
    workingHours: '8:00 ص - 4:00 م (الأحد - الخميس)',
    description: 'نبحث عن طبيب أسنان عام ذو خبرة للانضمام لفريقنا الطبي المتميز. العيادة مجهزة بأحدث الأجهزة والتقنيات.',
    requirements: [
      'شهادة بكالوريوس في طب الأسنان معترف بها',
      'خبرة لا تقل عن 3 سنوات في طب الأسنان العام',
      'إجادة اللغة الإنجليزية',
      'مهارات تواصل ممتازة مع المرضى',
      'القدرة على العمل ضمن فريق'
    ],
    benefits: [
      'راتب تنافسي + مكافآت',
      'تأمين صحي شامل',
      'إجازات سنوية مدفوعة الأجر',
      'فرص تطوير مهني مستمر',
      'بيئة عمل حديثة ومريحة'
    ],
    experience: 'mid-level',
    postedDate: '2025-11-01',
    deadline: '2025-11-30',
    status: 'open',
    category: 'طب الأسنان',
    contactEmail: 'hr@alnoor-clinic.com',
    contactPhone: '07901234567',
    applicants: 12,
    featured: true,
    urgent: false
  },
  {
    id: 'job002',
    title: 'أخصائي تقويم أسنان',
    companyId: 'clinic002',
    companyName: 'مجمع سمايل الطبي',
    companyLogo: '/images/clinics/smile.png',
    location: 'شارع الكندي، بغداد',
    governorate: 'بغداد',
    district: 'الرصافة',
    type: 'full-time',
    salary: {
      min: 2000000,
      max: 3500000,
      currency: 'د.ع',
      period: 'monthly'
    },
    workingHours: '9:00 ص - 5:00 م (السبت - الأربعاء)',
    description: 'فرصة ذهبية للعمل مع أحد أفضل أخصائيي تقويم الأسنان في العراق. المجمع يضم أحدث تقنيات التقويم الشفاف والتقليدي.',
    requirements: [
      'دبلوم عالي أو ماجستير في تقويم الأسنان',
      'خبرة لا تقل عن 5 سنوات في تقويم الأسنان',
      'معرفة بأحدث تقنيات التقويم الشفاف',
      'إتقان استخدام برامج التصميم ثلاثي الأبعاد',
      'شهادات تدريبية معتمدة'
    ],
    benefits: [
      'راتب مميز + نسبة من الإيرادات',
      'تأمين صحي للطبيب وعائلته',
      'دورات تدريبية في الخارج',
      'سيارة خدمة',
      'مكتب خاص مجهز بالكامل'
    ],
    experience: 'senior-level',
    postedDate: '2025-10-28',
    deadline: '2025-11-25',
    status: 'open',
    category: 'تقويم الأسنان',
    contactEmail: 'careers@smile-center.com',
    contactPhone: '07801234567',
    applicants: 8,
    featured: true,
    urgent: true
  },
  {
    id: 'job003',
    title: 'مساعد طبيب أسنان',
    companyId: 'clinic003',
    companyName: 'عيادة الرعاية المتقدمة',
    location: 'حي العامرية، بغداد',
    governorate: 'بغداد',
    district: 'الكرخ',
    type: 'part-time',
    salary: {
      min: 800000,
      max: 1200000,
      currency: 'د.ع',
      period: 'monthly'
    },
    workingHours: '2:00 ظ - 8:00 م (الأحد، الثلاثاء، الخميس)',
    description: 'نبحث عن مساعد طبيب أسنان محترف للعمل بنظام الدوام الجزئي في عيادتنا المتخصصة.',
    requirements: [
      'دبلوم في مساعدة طبيب الأسنان',
      'خبرة سنتين على الأقل في نفس المجال',
      'معرفة بأدوات ومعدات طب الأسنان',
      'مهارات تعامل جيدة مع المرضى',
      'القدرة على العمل تحت الضغط'
    ],
    benefits: [
      'راتب مناسب للدوام الجزئي',
      'مرونة في أوقات العمل',
      'تدريب مستمر',
      'بيئة عمل ودية'
    ],
    experience: 'entry-level',
    postedDate: '2025-11-03',
    deadline: '2025-11-20',
    status: 'open',
    category: 'مساعد طبي',
    contactEmail: 'info@advanced-care.com',
    contactPhone: '07701234567',
    applicants: 15,
    featured: false,
    urgent: false
  },
  {
    id: 'job004',
    title: 'جراح أسنان ووجه وفكين',
    companyId: 'hospital001',
    companyName: 'مستشفى البصرة التخصصي',
    location: 'مركز محافظة البصرة',
    governorate: 'البصرة',
    district: 'البصرة',
    type: 'full-time',
    salary: {
      min: 3000000,
      max: 5000000,
      currency: 'د.ع',
      period: 'monthly'
    },
    workingHours: '7:00 ص - 3:00 م + مناوبات طوارئ',
    description: 'فرصة استثنائية للعمل في أكبر مستشفى تخصصي في البصرة. نبحث عن جراح ماهر في جراحة الوجه والفكين.',
    requirements: [
      'شهادة اختصاص في جراحة الفم والوجه والفكين',
      'خبرة لا تقل عن 7 سنوات في الجراحة',
      'شهادة البورد العراقي أو العربي',
      'خبرة في الجراحة التجميلية للوجه',
      'قدرة على إجراء عمليات معقدة'
    ],
    benefits: [
      'راتب مميز جداً + مكافآت العمليات',
      'تأمين صحي شامل',
      'سكن مجاني (اختياري)',
      'دورات تخصصية سنوية',
      'مختبر وغرفة عمليات حديثة'
    ],
    experience: 'senior-level',
    postedDate: '2025-10-30',
    deadline: '2025-12-15',
    status: 'open',
    category: 'جراحة',
    contactEmail: 'hr@basra-hospital.gov.iq',
    contactPhone: '07601234567',
    applicants: 5,
    featured: true,
    urgent: true
  },
  {
    id: 'job005',
    title: 'فني مختبر أسنان',
    companyId: 'lab001',
    companyName: 'مختبر الدقة للأسنان',
    location: 'حي الأطباء، أربيل',
    governorate: 'أربيل',
    district: 'المركز',
    type: 'full-time',
    salary: {
      min: 1200000,
      max: 1800000,
      currency: 'د.ع',
      period: 'monthly'
    },
    workingHours: '8:00 ص - 4:00 م (السبت - الخميس)',
    description: 'نبحث عن فني مختبر أسنان ماهر للعمل في مختبرنا المجهز بأحدث التقنيات في تصنيع التركيبات السنية.',
    requirements: [
      'دبلوم في تقنيات مختبر الأسنان',
      'خبرة 3 سنوات في تصنيع التركيبات',
      'معرفة بأحدث مواد الأسنان',
      'إتقان استخدام أجهزة CAD/CAM',
      'دقة في العمل والانتباه للتفاصيل'
    ],
    benefits: [
      'راتب ثابت + حوافز إنتاج',
      'تدريب على أحدث التقنيات',
      'بيئة عمل نظيفة ومنظمة',
      'إجازة أسبوعية يوم الجمعة'
    ],
    experience: 'mid-level',
    postedDate: '2025-11-02',
    deadline: '2025-11-28',
    status: 'open',
    category: 'مختبر',
    contactEmail: 'jobs@precision-lab.com',
    contactPhone: '07501234567',
    applicants: 9,
    featured: false,
    urgent: false
  },
  {
    id: 'job006',
    title: 'استشاري طب أسنان الأطفال',
    companyId: 'clinic004',
    companyName: 'مركز أطفال للأسنان',
    location: 'حي الجامعة، الموصل',
    governorate: 'نينوى',
    district: 'الموصل',
    type: 'contract',
    salary: {
      min: 2500000,
      max: 4000000,
      currency: 'د.ع',
      period: 'monthly'
    },
    workingHours: '10:00 ص - 6:00 م (الأحد - الخميس)',
    description: 'مركز متخصص في طب أسنان الأطفال يبحث عن استشاري متخصص لقيادة فريق طبي متميز.',
    requirements: [
      'شهادة اختصاص في طب أسنان الأطفال',
      'خبرة لا تقل عن 8 سنوات في التخصص',
      'مهارات تعامل استثنائية مع الأطفال',
      'شهادة في التخدير للأطفال (مفضل)',
      'خبرة في إدارة الفرق الطبية'
    ],
    benefits: [
      'عقد استشاري بشروط مميزة',
      'نسبة من إيرادات المركز',
      'مرونة في تحديد أوقات العمل',
      'مكتب واستقبال خاص',
      'فريق طبي مساعد'
    ],
    experience: 'senior-level',
    postedDate: '2025-10-25',
    deadline: '2025-11-22',
    status: 'open',
    category: 'طب أسنان الأطفال',
    contactEmail: 'admin@kids-dental.com',
    contactPhone: '07401234567',
    applicants: 3,
    featured: true,
    urgent: false
  },
  {
    id: 'job007',
    title: 'مدير عيادة أسنان',
    companyId: 'clinic005',
    companyName: 'عيادة الابتسامة الذهبية',
    location: 'شارع الحبوبي، النجف',
    governorate: 'النجف',
    district: 'المركز',
    type: 'full-time',
    salary: {
      min: 1800000,
      max: 2800000,
      currency: 'د.ع',
      period: 'monthly'
    },
    workingHours: '8:00 ص - 6:00 م (السبت - الخميس)',
    description: 'نبحث عن مدير عيادة محترف لإدارة عملياتنا اليومية وضمان أعلى مستوى من الخدمة للمرضى.',
    requirements: [
      'شهادة في إدارة المؤسسات الصحية',
      'خبرة لا تقل عن 5 سنوات في إدارة العيادات',
      'مهارات قيادية وإدارية ممتازة',
      'خبرة في أنظمة إدارة العيادات الإلكترونية',
      'إتقان اللغة الإنجليزية'
    ],
    benefits: [
      'راتب إداري مميز',
      'تأمين صحي شامل',
      'دورات تدريبية في الإدارة',
      'سيارة خدمة',
      'مكتب مجهز بالكامل'
    ],
    experience: 'mid-level',
    postedDate: '2025-11-01',
    deadline: '2025-11-30',
    status: 'open',
    category: 'إدارة',
    contactEmail: 'hr@golden-smile.com',
    contactPhone: '07301234567',
    applicants: 11,
    featured: false,
    urgent: false
  },
  {
    id: 'job008',
    title: 'طبيب أسنان - عمل مسائي',
    companyId: 'clinic006',
    companyName: 'عيادة المساء المتخصصة',
    location: 'حي الأندلس، كربلاء',
    governorate: 'كربلاء',
    district: 'المركز',
    type: 'part-time',
    salary: {
      min: 1000000,
      max: 1600000,
      currency: 'د.ع',
      period: 'monthly'
    },
    workingHours: '4:00 ظ - 10:00 م (السبت، الأحد، الثلاثاء)',
    description: 'عيادة متخصصة تخدم المرضى في فترة المساء. نبحث عن طبيب للعمل بنظام الدوام الجزئي.',
    requirements: [
      'شهادة بكالوريوس في طب الأسنان',
      'خبرة سنتين على الأقل',
      'مرونة في أوقات العمل المسائية',
      'مهارات تواصل جيدة',
      'صبر في التعامل مع المرضى'
    ],
    benefits: [
      'راتب مناسب للدوام الجزئي',
      'مرونة في الإجازات',
      'تدريب مستمر',
      'عمولة على الحالات الخاصة'
    ],
    experience: 'entry-level',
    postedDate: '2025-11-04',
    deadline: '2025-11-25',
    status: 'open',
    category: 'طب الأسنان',
    contactEmail: 'evening@specialized-clinic.com',
    contactPhone: '07201234567',
    applicants: 7,
    featured: false,
    urgent: false
  }
];

// إحصائيات سريعة
export const jobStats = {
  totalJobs: mockJobs.length,
  openJobs: mockJobs.filter(job => job.status === 'open').length,
  featuredJobs: mockJobs.filter(job => job.featured).length,
  urgentJobs: mockJobs.filter(job => job.urgent).length,
  categoriesCount: [...new Set(mockJobs.map(job => job.category))].length,
  locationsCount: [...new Set(mockJobs.map(job => job.governorate))].length,
};

// فئات الوظائف
export const jobCategories = [
  'جميع الفئات',
  'طب الأسنان',
  'تقويم الأسنان', 
  'جراحة',
  'طب أسنان الأطفال',
  'مساعد طبي',
  'مختبر',
  'إدارة'
];

// أنواع الوظائف
export const jobTypes = [
  'جميع الأنواع',
  'دوام كامل',
  'دوام جزئي',
  'عقد مؤقت',
  'عمل حر'
];

// مستويات الخبرة
export const experienceLevels = [
  'جميع المستويات',
  'مبتدئ',
  'متوسط',
  'خبير'
];
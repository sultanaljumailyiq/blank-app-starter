import {
  PlatformStats,
  DoctorSubscriptionRequest,
  SubscriptionPlan,
  LocalAgent,
  SupplierRequest,
  WebinarManagement,
  EliteDoctor,
  JobManagement,
  SystemNotification,
  SupportTicket,
  DepartmentStats,
  DiscountCoupon,
  ActivityLog,
  PlatformSettings,
  SupplierManagement,
  RewardPenaltySystem
} from '../../types/admin';

// الإحصائيات العامة للمنصة
export const platformStats: PlatformStats = {
  totalClinics: 342,
  totalSuppliers: 89,
  pendingSuppliers: 12,
  pendingDoctors: 28,
  totalRevenue: 125420000, // 125.42 مليون دينار
  productsSold: 2847,
  jobsPosted: 156,
  activeUsers: 1284,
  monthlyGrowth: 18.5
};

// خطط الاشتراك
// خطط الاشتراك
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'الباقة الأساسية',
    nameEn: 'Basic Plan',
    price: {
      monthly: 250000,
      yearly: 2500000,
      currency: 'د.ع'
    },
    features: [
      'إدارة عيادة واحدة',
      'حفظ ملفات المرضى',
      'جدولة المواعيد',
      'إنشاء التقارير الأساسية',
      'دعم فني أساسي'
    ],
    limitations: [
      'حد أقصى 100 مريض',
      'دعم فني محدود',
      'لا يشمل الذكاء الاصطناعي'
    ],
    maxClinics: 1,
    aiRequestLimit: 0,
    digitalBooking: false,
    mapVisibility: false,
    maxPatients: 100,
    maxServices: 5,
    articleSuggestion: false,
    isFeatured: false,
    isPopular: false
  },
  {
    id: 'professional',
    name: 'الباقة المهنية',
    nameEn: 'Professional Plan',
    price: {
      monthly: 500000,
      yearly: 5000000,
      currency: 'د.ع'
    },
    features: [
      'إدارة 3 عيادات',
      'ملفات مرضى غير محدودة',
      'نظام مواعيد متقدم',
      'تقارير مفصلة وإحصائيات',
      'دعم فني متقدم',
      'مساعد ذكي أساسي',
      'نسخ احتياطي تلقائي'
    ],
    maxClinics: 3,
    maxServices: 20,
    aiRequestLimit: 50,
    digitalBooking: true,
    mapVisibility: true,
    maxPatients: 1000,
    articleSuggestion: true,
    isFeatured: true,
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'الباقة المتقدمة',
    nameEn: 'Enterprise Plan',
    price: {
      monthly: 1000000,
      yearly: 10000000,
      currency: 'د.ع'
    },
    features: [
      'عيادات غير محدودة',
      'جميع الميزات المتقدمة',
      'ذكاء اصطناعي كامل',
      'دعم فني مخصص 24/7',
      'تدريب الفريق',
      'تكامل مع الأنظمة الخارجية',
      'تقارير مخصصة',
      'أولوية في الميزات الجديدة'
    ],
    maxClinics: 999,
    maxServices: 999,
    aiRequestLimit: -1,
    digitalBooking: true,
    mapVisibility: true,
    maxPatients: 999999,
    articleSuggestion: true,
    isFeatured: true,
    isPopular: false
  }
];

// طلبات اشتراك الأطباء
export const doctorSubscriptionRequests: DoctorSubscriptionRequest[] = [
  {
    id: 'req001',
    doctorName: 'د. أحمد محمد العلي',
    email: 'dr.ahmed.ali@email.com',
    phone: '07901234567',
    clinicName: 'عيادة الأطباء المتحدة',
    location: 'شارع الكرادة، بغداد',
    governorate: 'بغداد',
    district: 'الكرخ',
    specialty: 'طب أسنان عام',
    experience: 8,
    requestedPlan: subscriptionPlans[1], // Professional
    documents: [
      {
        id: 'doc001',
        name: 'إجازة ممارسة المهنة',
        type: 'license',
        url: '/documents/license_001.pdf',
        uploadDate: '2025-11-01',
        verified: false
      },
      {
        id: 'doc002',
        name: 'شهادة التخصص',
        type: 'certificate',
        url: '/documents/cert_001.pdf',
        uploadDate: '2025-11-01',
        verified: false
      }
    ],
    status: 'pending',
    submittedDate: '2025-11-01',
    notes: 'طبيب ممتاز مع خبرة واسعة، يحتاج مراجعة الوثائق'
  },
  {
    id: 'req002',
    doctorName: 'د. فاطمة حسين الزهراء',
    email: 'dr.fatima.zahra@email.com',
    phone: '07801234567',
    clinicName: 'مركز الابتسامة النسائي',
    location: 'حي الجامعة، بغداد',
    governorate: 'بغداد',
    district: 'الرصافة',
    specialty: 'تقويم أسنان',
    experience: 12,
    requestedPlan: subscriptionPlans[2], // Enterprise
    documents: [
      {
        id: 'doc003',
        name: 'إجازة ممارسة المهنة',
        type: 'license',
        url: '/documents/license_002.pdf',
        uploadDate: '2025-10-28',
        verified: true,
        verifiedBy: 'admin_001',
        verificationDate: '2025-10-29'
      }
    ],
    status: 'approved',
    submittedDate: '2025-10-28',
    reviewedBy: 'admin_001',
    reviewDate: '2025-10-29',
    notes: 'تمت الموافقة - أخصائية ممتازة مع سجل حافل'
  }
];

// الوكلاء المحليين
export const localAgents: LocalAgent[] = [
  {
    id: 'agent001',
    name: 'أحمد سالم المالكي',
    phone: '07701234567',
    email: 'ahmed.malki@agents.com',
    governorate: 'بغداد',
    districts: ['الكرخ', 'الرصافة', 'الكاظمية'],
    commissionRate: 5, // 5%
    totalSales: 15420000,
    activeClients: 23,
    joinDate: '2025-06-15',
    status: 'active',
    bankAccount: {
      accountNumber: '123456789012',
      bankName: 'بنك بغداد',
      accountHolder: 'أحمد سالم المالكي'
    }
  },
  {
    id: 'agent002',
    name: 'سارة عبد الله الحسني',
    phone: '07601234567',
    email: 'sara.hasani@agents.com',
    governorate: 'البصرة',
    districts: ['البصرة', 'الزبير', 'القرنة'],
    commissionRate: 4.5, // 4.5%
    totalSales: 9850000,
    activeClients: 18,
    joinDate: '2025-07-20',
    status: 'active',
    bankAccount: {
      accountNumber: '987654321098',
      bankName: 'المصرف الأهلي العراقي',
      accountHolder: 'سارة عبد الله الحسني'
    }
  }
];

// طلبات الموردين
export const supplierRequests: SupplierRequest[] = [
  {
    id: 'sup_req001',
    companyName: 'شركة المعدات الطبية المتقدمة',
    contactPerson: 'محمد علي الخزرجي',
    email: 'info@advanced-medical.com',
    phone: '07901234567',
    address: 'شارع الجمهورية، بغداد',
    governorate: 'بغداد',
    district: 'الرصافة',
    businessType: 'distributor',
    documents: [
      {
        id: 'sup_doc001',
        name: 'سجل تجاري',
        type: 'license',
        url: '/documents/trade_license_001.pdf',
        uploadDate: '2025-10-25',
        verified: false
      }
    ],
    productsCategories: ['أجهزة أشعة', 'معدات جراحية', 'مواد تخدير'],
    expectedVolume: '500,000 - 1,000,000 دينار شهرياً',
    status: 'pending',
    submittedDate: '2025-10-25',
    verificationLevel: 'none'
  }
];

// إدارة الندوات والدورات
export const webinarManagement: WebinarManagement[] = [
  {
    id: 'web001',
    title: 'أحدث تقنيات زراعة الأسنان',
    instructor: 'د. علي محمد الخبير',
    instructorBio: 'أستاذ جراحة الفم والأسنان، خبرة 20 سنة',
    type: 'webinar',
    category: 'جراحة الأسنان',
    date: '2025-11-15T14:00:00',
    duration: '2 ساعة',
    maxAttendees: 100,
    currentAttendees: 67,
    price: 50000,
    description: 'ندوة شاملة حول أحدث التقنيات في زراعة الأسنان',
    topics: ['التخطيط الرقمي', 'الزراعة الفورية', 'المضاعفات وحلولها'],
    requirements: ['خبرة أساسية في طب الأسنان', 'شهادة طب أسنان'],
    status: 'scheduled',
    isElite: true,
    certificateProvided: true,
    recordingAvailable: true,
    createdBy: 'admin_001',
    createdDate: '2025-10-20'
  }
];

// أطباء النخبة
export const eliteDoctors: EliteDoctor[] = [
  {
    id: 'elite001',
    name: 'د. سعد عبد الرحمن القيسي',
    specialty: 'جراحة الوجه والفكين',
    clinic: 'مركز القيسي للجراحة المتخصصة',
    location: 'بغداد',
    experience: 18,
    achievements: [
      'رئيس الجمعية العراقية لجراحة الوجه والفكين',
      'أفضل جراح للعام 2024',
      'أكثر من 2000 عملية ناجحة'
    ],
    publications: 15,
    rating: 4.9,
    patientsCount: 3420,
    joinDate: '2025-01-15',
    eliteSince: '2025-03-01',
    specialBenefits: [
      'شارة نخبة ذهبية',
      'أولوية في العرض',
      'دعم فني متقدم'
    ],
    contributionScore: 95
  }
];

// إدارة الوظائف من المنصة
export const platformJobs: JobManagement[] = [
  {
    id: 'job_admin_001',
    title: 'طبيب أسنان - فرصة ذهبية في بغداد',
    description: 'عيادة مرموقة في بغداد تبحث عن طبيب أسنان متمكن للانضمام للفريق',
    governorate: 'بغداد',
    district: 'الكرخ',
    category: 'طب الأسنان',
    type: 'full-time',
    salary: {
      min: 2000000,
      max: 3500000,
      currency: 'د.ع'
    },
    requirements: [
      'شهادة بكالوريوس في طب الأسنان',
      'خبرة لا تقل عن 3 سنوات',
      'مهارات تواصل ممتازة'
    ],
    benefits: [
      'راتب مجزي',
      'تأمين صحي',
      'فرص تطوير مهني'
    ],
    featured: true,
    urgent: false,
    views: 234,
    applications: 12,
    postedDate: '2025-11-01',
    endDate: '2025-11-30',
    status: 'active',
    postedBy: 'admin'
  }
];

// إشعارات النظام
export const systemNotifications: SystemNotification[] = [
  {
    id: 'notif001',
    title: 'خصم 50% على جميع باقات الاشتراك',
    content: 'احتفالاً بإطلاق المنصة، نقدم خصم 50% على جميع باقات الاشتراك لمدة شهر',
    type: 'promotional',
    targetAudience: 'doctors',
    priority: 'high',
    scheduledDate: '2025-11-10T09:00:00',
    expiryDate: '2025-12-10T23:59:59',
    status: 'scheduled',
    createdBy: 'admin_001',
    createdDate: '2025-11-05',
    openRate: 0,
    clickRate: 0
  }
];

// طلبات الدعم الفني
export const supportTickets: SupportTicket[] = [
  {
    id: 'ticket001',
    ticketNumber: 'SUP-2025-001',
    userId: 'user123',
    userName: 'د. محمد أحمد',
    userType: 'doctor',
    subject: 'مشكلة في تسجيل الدخول',
    description: 'لا أستطيع الدخول إلى حسابي منذ يومين',
    category: 'technical',
    priority: 'high',
    status: 'open',
    createdDate: '2025-11-06T10:30:00',
    lastUpdate: '2025-11-06T10:30:00',
    history: [
      {
        id: 'hist001',
        action: 'created',
        performedBy: 'user123',
        performedByRole: 'user',
        description: 'تم إنشاء طلب الدعم',
        timestamp: '2025-11-06T10:30:00'
      }
    ]
  }
];

// إحصائيات الأقسام
export const departmentStats: DepartmentStats = {
  subscriptions: {
    totalRequests: 156,
    pendingRequests: 28,
    approvedThisMonth: 34,
    rejectedThisMonth: 8,
    revenue: {
      monthly: 42500000,
      yearly: 356000000,
      growth: 23.5
    },
    planDistribution: {
      'basic': 45,
      'professional': 89,
      'enterprise': 22
    }
  },
  suppliers: {
    totalSuppliers: 89,
    pendingApproval: 12,
    activeSuppliers: 77,
    suspendedSuppliers: 3,
    totalProducts: 1247,
    totalSales: 89420000,
    avgRating: 4.6
  },
  community: {
    totalWebinars: 23,
    totalAttendees: 1456,
    eliteDoctors: 15,
    postsThisMonth: 234,
    engagementRate: 78.5
  },
  jobs: {
    totalJobs: 156,
    activeJobs: 89,
    applications: 1247,
    filledJobs: 45,
    averageSalary: 2250000
  },
  support: {
    openTickets: 23,
    avgResponseTime: 4.2, // hours
    avgResolutionTime: 18.5, // hours
    satisfactionRate: 94.2, // percentage
    ticketsByCategory: {
      'technical': 45,
      'billing': 23,
      'account': 18,
      'complaint': 12,
      'feature_request': 8,
      'other': 5
    }
  }
};

// كوبونات الخصم
export const discountCoupons: DiscountCoupon[] = [
  {
    id: 'coupon001',
    code: 'LAUNCH50',
    name: 'خصم الإطلاق',
    description: 'خصم 50% على باقة الاشتراك الأولى',
    type: 'percentage',
    value: 50,
    minAmount: 100000,
    maxDiscount: 500000,
    usageLimit: 100,
    usedCount: 34,
    applicableTo: 'subscriptions',
    applicablePlans: ['professional', 'enterprise'],
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    status: 'active',
    createdBy: 'admin_001',
    createdDate: '2025-10-25'
  }
];

// سجل النشاطات
export const activityLogs: ActivityLog[] = [
  {
    id: 'log001',
    userId: 'admin_001',
    userName: 'مدير النظام',
    userRole: 'doctor', // This should probably be 'admin' but using existing UserRole
    action: 'subscription_approved',
    description: 'تمت الموافقة على طلب اشتراك د. فاطمة الزهراء',
    category: 'subscription',
    timestamp: '2025-11-06T14:30:00',
    ipAddress: '192.168.1.100',
    severity: 'info'
  },
  {
    id: 'log002',
    userId: 'admin_001',
    userName: 'مدير النظام',
    userRole: 'doctor',
    action: 'supplier_suspended',
    description: 'تم إيقاف مورد بسبب شكاوى متعددة',
    category: 'store',
    timestamp: '2025-11-06T10:15:00',
    severity: 'warning'
  }
];

// إعدادات المنصة
export const platformSettings: PlatformSettings = {
  general: {
    platformName: 'منصة الأطباء الذكية',
    platformLogo: '/images/logo.png',
    tagline: 'مستقبل طب الأسنان الرقمي',
    contactEmail: 'info@dental-platform.com',
    contactPhone: '+964 770 123 4567',
    address: 'بغداد، العراق',
    socialMedia: {
      facebook: 'https://facebook.com/dental-platform',
      twitter: 'https://twitter.com/dental-platform',
      instagram: 'https://instagram.com/dental-platform'
    }
  },
  features: {
    storeEnabled: true,
    jobsEnabled: true,
    communityEnabled: true,
    subscriptionsEnabled: true,
    aiSupportEnabled: true,
    notificationsEnabled: true
  },
  policies: {
    privacyPolicy: 'سياسة الخصوصية الكاملة...',
    termsOfService: 'شروط الاستخدام...',
    refundPolicy: 'سياسة الاسترداد...',
    dataRetentionDays: 365
  },
  integrations: {
    googleMapsApiKey: 'AIzaSy...',
    stripePublishableKey: 'pk_test_...',
    emailServiceProvider: 'SendGrid',
    smsServiceProvider: 'Twilio',
    analyticsEnabled: true
  },
  security: {
    maxLoginAttempts: 5,
    sessionTimeout: 60, // minutes
    twoFactorRequired: false,
    passwordPolicy: {
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true
    }
  }
};

// معلومات الموردين المفصلة
export const supplierManagementData: SupplierManagement[] = [
  {
    id: 'supplier001',
    basicInfo: {
      companyName: 'شركة المعدات الطبية الحديثة',
      contactPerson: 'أحمد محمد الصالح',
      email: 'info@modern-medical.com',
      phone: '07901234567',
      website: 'www.modern-medical.com',
      establishedYear: 2018
    },
    location: {
      address: 'شارع الكرادة، بغداد',
      governorate: 'بغداد',
      district: 'الكرخ',
      coordinates: {
        lat: 33.3152,
        lng: 44.3661
      }
    },
    business: {
      type: 'distributor',
      categories: ['أجهزة أشعة', 'معدات جراحية'],
      totalProducts: 156,
      activeProducts: 142,
      totalSales: 15420000,
      rating: 4.8,
      reviewsCount: 89
    },
    performance: {
      ordersFulfilled: 234,
      avgDeliveryTime: 3.2,
      returnRate: 2.1,
      customerSatisfaction: 4.7,
      complaintCount: 3,
      warningCount: 0
    },
    financial: {
      revenue: 15420000,
      platformCommission: 1542000, // 10%
      paymentMethod: 'bank_transfer',
      taxId: 'TAX123456789',
      bankAccount: {
        accountNumber: '123456789012',
        bankName: 'بنك بغداد',
        accountHolder: 'شركة المعدات الطبية الحديثة'
      }
    },
    status: {
      isActive: true,
      isVerified: true,
      isFeatured: true,
      isPremium: false,
      joinDate: '2025-06-15',
      lastLoginDate: '2025-11-06'
    }
  }
];

// نظام المكافآت والعقوبات
export const rewardPenaltyData: RewardPenaltySystem[] = [
  {
    id: 'reward001',
    userId: 'supplier001',
    userName: 'شركة المعدات الطبية الحديثة',
    userType: 'supplier',
    type: 'reward',
    reason: 'تميز في خدمة العملاء',
    description: 'حصول على تقييم 5 نجوم من 50 عميل متتالي',
    severity: 'minor',
    points: 100,
    monetaryValue: 50000, // مكافأة مالية
    issuedBy: 'admin_001',
    issuedDate: '2025-11-01',
    status: 'active'
  },
  {
    id: 'penalty001',
    userId: 'supplier002',
    userName: 'مورد مخالف',
    userType: 'supplier',
    type: 'penalty',
    reason: 'تأخير في التسليم',
    description: 'تأخير متكرر في تسليم الطلبات دون مبرر',
    severity: 'moderate',
    points: -50,
    monetaryValue: -25000, // غرامة
    issuedBy: 'admin_001',
    issuedDate: '2025-10-25',
    status: 'active',
    expiryDate: '2025-12-25'
  }
];

// بيانات شاملة للتصدير
export const adminMockData = {
  platformStats,
  subscriptionPlans,
  doctorSubscriptionRequests,
  localAgents,
  supplierRequests,
  webinarManagement,
  eliteDoctors,
  platformJobs,
  systemNotifications,
  supportTickets,
  departmentStats,
  discountCoupons,
  activityLogs,
  platformSettings,
  supplierManagementData,
  rewardPenaltyData
};

export default adminMockData;// ========== بيانات المجتمع الطبي والتعليم ==========

// الندوات والدورات
export const webinars = [
  {
    id: 'WEB001',
    title: 'أحدث تقنيات زراعة الأسنان',
    description: 'دورة شاملة حول أحدث التقنيات في زراعة الأسنان والتطورات الحديثة',
    instructor: 'د. محمد العبيدي',
    instructorSpecialty: 'أخصائي جراحة الوجه والفكين',
    date: '2025-11-15',
    time: '19:00',
    duration: 120,
    maxAttendees: 100,
    currentAttendees: 78,
    type: 'webinar',
    category: 'جراحة الأسنان',
    level: 'متقدم',
    price: 150000,
    status: 'scheduled',
    rating: 4.8,
    reviewsCount: 45,
    certificate: true,
    cmePoints: 3,
    language: 'العربية',
    materials: ['عرض تقديمي', 'فيديو تعليمي', 'كتاب إلكتروني'],
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-11-05T15:30:00Z'
  },
  {
    id: 'WEB002',
    title: 'التشخيص الرقمي في طب الأسنان',
    description: 'استخدام التكنولوجيا الحديثة في التشخيص وتخطيط العلاج',
    instructor: 'د. سارة النجفي',
    instructorSpecialty: 'أخصائي تشخيص الفم والأسنان',
    date: '2025-11-20',
    time: '20:00',
    duration: 90,
    maxAttendees: 80,
    currentAttendees: 52,
    type: 'course',
    category: 'التشخيص',
    level: 'متوسط',
    price: 100000,
    status: 'open_registration',
    rating: 4.7,
    reviewsCount: 32,
    certificate: true,
    cmePoints: 2,
    language: 'العربية',
    materials: ['دليل التشخيص', 'حالات عملية', 'برنامج محاكاة'],
    createdAt: '2025-10-25T14:20:00Z',
    updatedAt: '2025-11-06T09:45:00Z'
  },
  {
    id: 'WEB003',
    title: 'طب الأسنان الوقائي للأطفال',
    description: 'برنامج تدريبي شامل حول الوقاية وعلاج أسنان الأطفال',
    instructor: 'د. علي الموصلي',
    instructorSpecialty: 'أخصائي طب أسنان الأطفال',
    date: '2025-11-25',
    time: '18:30',
    duration: 150,
    maxAttendees: 60,
    currentAttendees: 38,
    type: 'workshop',
    category: 'طب أسنان الأطفال',
    level: 'مبتدئ',
    price: 80000,
    status: 'open_registration',
    rating: 4.9,
    reviewsCount: 28,
    certificate: true,
    cmePoints: 3,
    language: 'العربية',
    materials: ['كتيب الوقاية', 'ألعاب تعليمية', 'خطة علاج نموذجية'],
    createdAt: '2025-10-30T11:15:00Z',
    updatedAt: '2025-11-07T16:20:00Z'
  }
];

// النخبة الطبية
export const eliteDoctorsData = [
  {
    id: 'ELITE001',
    doctorId: 'DOC001',
    doctorName: 'د. أحمد الخزرجي',
    specialty: 'جراحة الفم والوجه والفكين',
    hospital: 'مستشفى بغداد التخصصي',
    experience: 15,
    achievements: [
      'رئيس قسم جراحة الوجه والفكين',
      'عضو الجمعية العراقية لجراحي الفم',
      'محاضر في جامعة بغداد'
    ],
    certifications: ['الزمالة العراقية', 'البورد العربي', 'دبلوم زراعة الأسنان'],
    publications: 12,
    surgicalCases: 1500,
    joinDate: '2024-03-15',
    status: 'active',
    rating: 4.9,
    reviewsCount: 180,
    consultationFee: 100000,
    nextAvailableSlot: '2025-11-12T14:00:00Z',
    languages: ['العربية', 'الإنجليزية'],
    awards: ['جائزة التميز الطبي 2024', 'أفضل جراح للعام 2023']
  },
  {
    id: 'ELITE002',
    doctorId: 'DOC002',
    doctorName: 'د. فاطمة التميمي',
    specialty: 'تقويم الأسنان والفكين',
    hospital: 'عيادة الابتسامة المثالية',
    experience: 12,
    achievements: [
      'رئيس قسم التقويم في الجامعة المستنصرية',
      'عضو الجمعية الدولية لتقويم الأسنان',
      'خبير في التقويم الشفاف'
    ],
    certifications: ['الزمالة الأمريكية في التقويم', 'شهادة Invisalign', 'البورد العراقي'],
    publications: 8,
    surgicalCases: 800,
    joinDate: '2024-06-20',
    status: 'active',
    rating: 4.8,
    reviewsCount: 95,
    consultationFee: 75000,
    nextAvailableSlot: '2025-11-10T16:30:00Z',
    languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
    awards: ['جائزة الإبداع في التقويم 2024']
  }
];

// المجموعات الطبية
export const medicalGroups = [
  {
    id: 'GROUP001',
    name: 'مجموعة جراحي الفم والوجه والفكين',
    description: 'مجموعة تضم أخصائي جراحة الفم والوجه لتبادل الخبرات والحالات المعقدة',
    category: 'جراحة',
    memberCount: 45,
    adminId: 'DOC001',
    adminName: 'د. أحمد الخزرجي',
    isPrivate: false,
    createdDate: '2024-05-15',
    lastActivity: '2025-11-07T10:30:00Z',
    rules: [
      'نشر الحالات العلمية فقط',
      'احترام آراء الزملاء',
      'عدم الترويج التجاري'
    ],
    topics: ['زراعة الأسنان', 'جراحة الفكين', 'علاج كسور الوجه'],
    status: 'active',
    posts: 156,
    comments: 892,
    tags: ['جراحة', 'تخصص', 'حالات معقدة']
  },
  {
    id: 'GROUP002',
    name: 'مجموعة طب أسنان الأطفال',
    description: 'مجموعة تهتم بطب أسنان الأطفال والتحديات النفسية والعلاجية',
    category: 'طب أطفال',
    memberCount: 72,
    adminId: 'DOC003',
    adminName: 'د. علي الموصلي',
    isPrivate: false,
    createdDate: '2024-07-20',
    lastActivity: '2025-11-07T14:15:00Z',
    rules: [
      'التركيز على حالات الأطفال',
      'مشاركة تقنيات التعامل النفسي',
      'نصائح للأهالي'
    ],
    topics: ['تسوس الأطفال', 'التخدير للأطفال', 'الطوارئ'],
    status: 'active',
    posts: 203,
    comments: 1245,
    tags: ['أطفال', 'نفسي', 'وقائي']
  }
];

// ========== إدارة الوظائف ==========

export const featuredJobs = [
  {
    id: 'FJOB001',
    title: 'طبيب أسنان أول - عيادة النور',
    companyName: 'عيادة النور الطبية',
    location: 'بغداد - الكرادة',
    governorate: 'بغداد',
    district: 'الكرادة',
    type: 'دوام كامل',
    category: 'طبيب أسنان',
    salary: '2500000-3500000',
    experience: '5+ سنوات',
    description: 'مطلوب طبيب أسنان خبير للعمل في عيادة متخصصة',
    requirements: [
      'شهادة بكالوريوس طب الأسنان',
      'خبرة 5 سنوات على الأقل',
      'إجادة اللغة الإنجليزية',
      'مهارات تواصل ممتازة'
    ],
    benefits: [
      'راتب تنافسي',
      'تأمين صحي',
      'إجازة سنوية',
      'بدل مواصلات',
      'تدريب مستمر'
    ],
    contactEmail: 'hr@noor-clinic.com',
    contactPhone: '07901234567',
    postedDate: '2025-11-01',
    expiryDate: '2025-12-01',
    status: 'featured',
    isFeatured: true,
    viewsCount: 1250,
    applicationsCount: 45,
    sponsorshipLevel: 'premium',
    sponsorshipPrice: 500000,
    tags: ['مميز', 'راتب عالي', 'تدريب']
  },
  {
    id: 'FJOB002',
    title: 'أخصائي تقويم أسنان',
    companyName: 'مركز الابتسامة الدولي',
    location: 'أربيل - عنكاوا',
    governorate: 'أربيل',
    district: 'عنكاوا',
    type: 'دوام كامل',
    category: 'أخصائي تقويم',
    salary: '3000000-4000000',
    experience: '3+ سنوات',
    description: 'أخصائي تقويم أسنان للعمل مع أحدث التقنيات',
    requirements: [
      'شهادة اختصاص تقويم الأسنان',
      'خبرة في التقويم الشفاف',
      'معرفة بأحدث التقنيات',
      'إجادة الحاسوب'
    ],
    benefits: [
      'راتب ممتاز',
      'حوافز شهرية',
      'تأمين شامل',
      'سكن مؤقت',
      'دورات تطوير'
    ],
    contactEmail: 'careers@smile-center.com',
    contactPhone: '07507654321',
    postedDate: '2025-10-28',
    expiryDate: '2025-11-28',
    status: 'featured',
    isFeatured: true,
    viewsCount: 890,
    applicationsCount: 32,
    sponsorshipLevel: 'gold',
    sponsorshipPrice: 350000,
    tags: ['أخصائي', 'تقنيات حديثة', 'حوافز']
  }
];

export const jobsStatistics = {
  totalJobs: 234,
  featuredJobs: 12,
  activeJobs: 189,
  expiredJobs: 45,
  totalApplications: 1567,
  avgApplicationsPerJob: 7.8,
  topCategories: [
    { category: 'طبيب أسنان عام', count: 89, percentage: 38 },
    { category: 'أخصائي تقويم', count: 45, percentage: 19 },
    { category: 'مساعد طبيب أسنان', count: 67, percentage: 29 },
    { category: 'فني مختبر', count: 33, percentage: 14 }
  ],
  topGovernorates: [
    { governorate: 'بغداد', count: 98, percentage: 42 },
    { governorate: 'أربيل', count: 56, percentage: 24 },
    { governorate: 'البصرة', count: 34, percentage: 15 },
    { governorate: 'النجف', count: 46, percentage: 19 }
  ],
  monthlyTrends: [
    { month: '2025-08', jobs: 45, applications: 234 },
    { month: '2025-09', jobs: 67, applications: 456 },
    { month: '2025-10', jobs: 89, applications: 567 },
    { month: '2025-11', jobs: 33, applications: 310 }
  ]
};

// ========== إدارة الإشعارات والتنبيهات ==========

export const notificationCampaigns = [
  {
    id: 'NOTIF001',
    title: 'إشعار ترويجي - خصم 30% على جميع المنتجات',
    type: 'promotional',
    content: 'احصل على خصم 30% على جميع المنتجات الطبية لفترة محدودة. استخدم كود: DENTAL30',
    targetAudience: 'all_doctors',
    scheduledDate: '2025-11-10T09:00:00Z',
    status: 'scheduled',
    priority: 'high',
    channels: ['app', 'email', 'sms'],
    createdBy: 'ADMIN001',
    createdDate: '2025-11-05T14:30:00Z',
    sentCount: 0,
    readCount: 0,
    clickCount: 0,
    openRate: 0,
    clickRate: 0,
    couponCode: 'DENTAL30',
    validUntil: '2025-11-20T23:59:59Z',
    estimatedReach: 1250,
    budget: 200000,
    attachments: ['banner.jpg', 'terms.pdf']
  },
  {
    id: 'NOTIF002',
    title: 'تحديث النظام - صيانة مجدولة',
    type: 'system',
    content: 'سيتم إجراء صيانة دورية للنظام يوم الجمعة من الساعة 2:00 إلى 4:00 صباحاً. نعتذر عن أي إزعاج.',
    targetAudience: 'all_users',
    scheduledDate: '2025-11-08T20:00:00Z',
    status: 'sent',
    priority: 'urgent',
    channels: ['app', 'email'],
    createdBy: 'ADMIN002',
    createdDate: '2025-11-07T12:00:00Z',
    sentCount: 2345,
    readCount: 1890,
    clickCount: 234,
    openRate: 80.6,
    clickRate: 12.4,
    estimatedReach: 2345,
    maintenanceStart: '2025-11-09T02:00:00Z',
    maintenanceEnd: '2025-11-09T04:00:00Z'
  },
  {
    id: 'NOTIF003',
    title: 'دورة تدريبية جديدة - تقنيات زراعة الأسنان',
    type: 'educational',
    content: 'انضم إلى دورة تدريبية متخصصة في أحدث تقنيات زراعة الأسنان مع د. محمد الخزرجي',
    targetAudience: 'dentists',
    scheduledDate: '2025-11-12T10:00:00Z',
    status: 'draft',
    priority: 'normal',
    channels: ['app', 'email'],
    createdBy: 'ADMIN001',
    createdDate: '2025-11-06T16:45:00Z',
    sentCount: 0,
    readCount: 0,
    clickCount: 0,
    openRate: 0,
    clickRate: 0,
    estimatedReach: 567,
    courseDate: '2025-11-15T19:00:00Z',
    registrationFee: 150000,
    maxAttendees: 100
  }
];

export const notificationTemplates = [
  {
    id: 'TEMP001',
    name: 'قالب الترويج',
    type: 'promotional',
    subject: 'عرض خاص من {{platform_name}}',
    content: 'مرحباً {{user_name}},\n\nلديك عرض خاص: {{offer_description}}\nاستخدم الكود: {{promo_code}}\nصالح حتى: {{expiry_date}}',
    variables: ['user_name', 'platform_name', 'offer_description', 'promo_code', 'expiry_date'],
    isActive: true,
    usage_count: 145,
    created_date: '2024-08-15T10:00:00Z',
    last_used: '2025-11-07T14:30:00Z'
  },
  {
    id: 'TEMP002',
    name: 'قالب إشعار النظام',
    type: 'system',
    subject: 'إشعار من النظام - {{notification_type}}',
    content: 'عزيزي {{user_name}},\n\nنود إعلامك بـ: {{system_message}}\nالتاريخ: {{date}}\nالوقت: {{time}}',
    variables: ['user_name', 'notification_type', 'system_message', 'date', 'time'],
    isActive: true,
    usage_count: 89,
    created_date: '2024-09-20T14:15:00Z',
    last_used: '2025-11-07T20:45:00Z'
  }
];

// ========== الدعم الفني ==========

export const supportTicketsData = [
  {
    id: 'TICK001',
    title: 'مشكلة في تسجيل الدخول',
    description: 'لا أستطيع تسجيل الدخول إلى حسابي رغم إدخال البيانات الصحيحة',
    userId: 'DOC001',
    userName: 'د. أحمد الخزرجي',
    userType: 'doctor',
    category: 'account',
    priority: 'high',
    status: 'open',
    assignedTo: 'SUPPORT001',
    assignedToName: 'فريق الدعم الفني',
    createdDate: '2025-11-07T09:30:00Z',
    updatedDate: '2025-11-07T15:20:00Z',
    responseTime: 6,
    resolutionTime: null,
    satisfactionRating: null,
    tags: ['تسجيل دخول', 'حساب', 'مشكلة فنية'],
    attachments: ['screenshot.png', 'error_log.txt'],
    messages: [
      {
        id: 'MSG001',
        senderId: 'DOC001',
        senderName: 'د. أحمد الخزرجي',
        message: 'السلام عليكم، أواجه مشكلة في تسجيل الدخول منذ صباح اليوم',
        timestamp: '2025-11-07T09:30:00Z',
        isFromSupport: false
      },
      {
        id: 'MSG002',
        senderId: 'SUPPORT001',
        senderName: 'فريق الدعم الفني',
        message: 'مرحباً دكتور، شكراً لتواصلكم. سنقوم بفحص حسابكم والرد خلال ساعة',
        timestamp: '2025-11-07T10:15:00Z',
        isFromSupport: true
      }
    ]
  },
  {
    id: 'TICK002',
    title: 'طلب إضافة منتج جديد',
    description: 'أريد إضافة منتجات جديدة إلى متجري ولكن لا أعرف الطريقة',
    userId: 'SUP001',
    userName: 'شركة النور الطبية',
    userType: 'supplier',
    category: 'product_management',
    priority: 'normal',
    status: 'in_progress',
    assignedTo: 'SUPPORT002',
    assignedToName: 'أحمد محمود',
    createdDate: '2025-11-06T14:20:00Z',
    updatedDate: '2025-11-07T11:45:00Z',
    responseTime: 2,
    resolutionTime: null,
    satisfactionRating: null,
    tags: ['منتجات', 'متجر', 'إرشادات'],
    attachments: ['product_catalog.pdf'],
    messages: [
      {
        id: 'MSG003',
        senderId: 'SUP001',
        senderName: 'شركة النور الطبية',
        message: 'نحتاج مساعدة في إضافة منتجات جديدة لمتجرنا الإلكتروني',
        timestamp: '2025-11-06T14:20:00Z',
        isFromSupport: false
      },
      {
        id: 'MSG004',
        senderId: 'SUPPORT002',
        senderName: 'أحمد محمود',
        message: 'سأرسل لكم دليل إضافة المنتجات خلال اليوم',
        timestamp: '2025-11-06T16:30:00Z',
        isFromSupport: true
      }
    ]
  },
  {
    id: 'TICK003',
    title: 'شكوى على جودة المنتج',
    description: 'المنتج الذي استلمته لا يطابق الوصف ونوعيته رديئة',
    userId: 'DOC003',
    userName: 'د. سارة النجفي',
    userType: 'doctor',
    category: 'complaint',
    priority: 'urgent',
    status: 'resolved',
    assignedTo: 'SUPPORT003',
    assignedToName: 'ليلى أحمد',
    createdDate: '2025-11-05T11:00:00Z',
    updatedDate: '2025-11-06T16:30:00Z',
    responseTime: 1,
    resolutionTime: 29.5,
    satisfactionRating: 4,
    tags: ['شكوى', 'جودة', 'منتج', 'مورد'],
    attachments: ['product_photo.jpg', 'invoice.pdf'],
    messages: [
      {
        id: 'MSG005',
        senderId: 'DOC003',
        senderName: 'د. سارة النجفي',
        message: 'المنتج المستلم مختلف تماماً عن الصورة المعروضة',
        timestamp: '2025-11-05T11:00:00Z',
        isFromSupport: false
      },
      {
        id: 'MSG006',
        senderId: 'SUPPORT003',
        senderName: 'ليلى أحمد',
        message: 'نعتذر بشدة، سنقوم بإرجاع المبلغ كاملاً وتحديث سياسات المورد',
        timestamp: '2025-11-05T12:00:00Z',
        isFromSupport: true
      }
    ]
  }
];

export const supportStats = {
  totalTickets: 156,
  openTickets: 23,
  inProgressTickets: 45,
  resolvedTickets: 88,
  avgResponseTime: 3.5, // ساعات
  avgResolutionTime: 24.8, // ساعات
  satisfactionScore: 4.2,
  ticketsByCategory: [
    { category: 'مشاكل فنية', count: 67, percentage: 43 },
    { category: 'إدارة المنتجات', count: 34, percentage: 22 },
    { category: 'شكاوى', count: 28, percentage: 18 },
    { category: 'استفسارات عامة', count: 27, percentage: 17 }
  ],
  ticketsByPriority: [
    { priority: 'عاجل', count: 12, percentage: 8 },
    { priority: 'مرتفع', count: 34, percentage: 22 },
    { priority: 'عادي', count: 89, percentage: 57 },
    { priority: 'منخفض', count: 21, percentage: 13 }
  ],
  monthlyVolume: [
    { month: '2025-08', tickets: 145, resolved: 132 },
    { month: '2025-09', tickets: 167, resolved: 159 },
    { month: '2025-10', tickets: 189, resolved: 178 },
    { month: '2025-11', tickets: 67, resolved: 45 }
  ]
};

// إضافة البيانات الجديدة للتصدير
export const extendedAdminMockData = {
  // البيانات الموجودة سابقاً
  ...adminMockData,

  // البيانات الجديدة
  webinars,
  eliteDoctorsData,
  medicalGroups,
  featuredJobs,
  jobsStatistics,
  notificationCampaigns,
  notificationTemplates,
  supportTicketsData,
  supportStats
};
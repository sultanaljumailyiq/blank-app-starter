import {
  Employee,
  Department,
  EmployeeStatus,
  LeaveType,
  AttendanceRecord,
  PerformanceEvaluation,
  TrainingRecord,
  Certification,
  LeaveRequest,
  InternalMessage,
  HRStatistics
} from '../../types/staff';

// الأقسام في العيادة
export const departments: Department[] = [
  {
    id: 'DEPT001',
    name: 'الأطباء',
    description: 'قسم أطباء الأسنان والأخصائيين',
    manager: {
      employeeId: 'EMP001',
      name: 'د. محمد الخزرجي'
    },
    budget: 500000,
    location: 'الطابق الثاني'
  },
  {
    id: 'DEPT002',
    name: 'التمريض',
    description: 'قسم الممرضين والمساعدين الطبيين',
    manager: {
      employeeId: 'EMP006',
      name: 'ممرضة رئيسية فاطمة علي'
    },
    budget: 200000,
    location: 'الطابق الأول'
  },
  {
    id: 'DEPT003',
    name: 'الإدارة',
    description: 'قسم الإدارة والموارد البشرية',
    manager: {
      employeeId: 'EMP011',
      name: 'أحمد سعد - مدير إداري'
    },
    budget: 150000,
    location: 'الطابق الأرضي'
  },
  {
    id: 'DEPT004',
    name: 'الفنيين',
    description: 'الفنيين والتقنيين',
    manager: {
      employeeId: 'EMP016',
      name: 'علي محمود - رئيس فنيين'
    },
    budget: 120000,
    location: 'الطابق الأرضي'
  },
  {
    id: 'DEPT005',
    name: 'خدمة العملاء',
    description: 'قسم الاستقبال وخدمة العملاء',
    manager: {
      employeeId: 'EMP021',
      name: 'سارة أحمد - مشرفة خدمة عملاء'
    },
    budget: 80000,
    location: 'الطابق الأرضي'
  }
];

// إنشاء الموظفين
export const staffMembers: Employee[] = [
  // الأطباء
  {
    id: 'EMP001',
    employeeNumber: 'DOC001',
    personalInfo: {
      firstName: 'محمد',
      lastName: 'الخزرجي',
      fullName: 'د. محمد الخزرجي',
      dateOfBirth: '1985-03-15',
      gender: 'male',
      nationality: 'عراقي',
      maritalStatus: 'married',
      nationalId: '123456789012',
      phone: '07801234567',
      mobile: '07701234567',
      email: 'dr.mohammed@clinic.com',
      address: {
        street: 'شارع الكرادة 123',
        city: 'بغداد',
        state: 'بغداد',
        country: 'العراق',
        postalCode: '10001'
      }
    },
    workInfo: {
      department: departments[0],
      position: 'طبيب أسنان عام - رئيس قسم',
      employmentType: 'full_time',
      employmentStatus: 'active',
      hireDate: '2020-01-15',
      accessLevel: 'manager'
    },
    qualifications: [
      {
        id: 'QUAL001',
        type: 'degree',
        title: 'بكالوريوس طب الأسنان',
        institution: 'جامعة بغداد',
        field: 'طب الأسنان',
        graduationYear: '2008',
        grade: 'امتياز',
        isVerified: true
      },
      {
        id: 'QUAL002',
        type: 'certificate',
        title: 'زمالة تقويم الأسنان',
        institution: 'الكلية الملكية للجراحين',
        field: 'تقويم الأسنان',
        graduationYear: '2012',
        grade: 'ممتاز',
        isVerified: true
      }
    ],
    experience: [
      {
        id: 'EXP001',
        companyName: 'مستشفى النور التخصصي',
        position: 'طبيب أسنان',
        startDate: '2008-09-01',
        endDate: '2019-12-31',
        description: 'طبيب أسنان عام مع خبرة في التقويم',
        reasonForLeaving: 'طلب تحدي أكبر ومنصب إداري'
      }
    ],
    documents: [
      {
        id: 'DOC001',
        type: 'resume',
        title: 'السيرة الذاتية',
        fileName: 'cv_mohammed_alkharaji.pdf',
        fileUrl: '/documents/cv_mohammed_alkharaji.pdf',
        uploadDate: '2020-01-10',
        isConfidential: false,
        uploadedBy: 'HR_DEPT'
      }
    ],
    emergencyContact: {
      name: 'زينب الخزرجي',
      relationship: 'زوجة',
      phone: '07801234568',
      address: 'نفس العنوان'
    },
    payroll: {
      basicSalary: 2500000,
      currency: 'IQD',
      payFrequency: 'monthly',
      allowances: {
        housing: 300000,
        transportation: 150000,
        medical: 100000
      },
      bonuses: {
        performance: 200000,
        annual: 500000
      },
      deductions: {
        tax: 125000,
        insurance: 50000
      },
      benefits: {
        healthInsurance: true,
        lifeInsurance: true,
        retirement: true,
        vacation: 30,
        sickLeave: 15
      },
      grossSalary: 3800000,
      netSalary: 3625000
    },
    schedule: {
      type: 'fixed',
      weeklyHours: 40,
      weeklySchedule: {
        sunday: { isWorking: true, startTime: '08:00', endTime: '16:00', totalHours: 8 },
        monday: { isWorking: true, startTime: '08:00', endTime: '16:00', totalHours: 8 },
        tuesday: { isWorking: true, startTime: '08:00', endTime: '16:00', totalHours: 8 },
        wednesday: { isWorking: true, startTime: '08:00', endTime: '16:00', totalHours: 8 },
        thursday: { isWorking: true, startTime: '08:00', endTime: '16:00', totalHours: 8 },
        friday: { isWorking: false },
        saturday: { isWorking: false }
      },
      breaks: [
        {
          name: 'استراحة الغداء',
          startTime: '12:00',
          endTime: '13:00',
          duration: 60,
          isPaid: false
        }
      ]
    },
    attendance: [
      {
        id: 'ATT001',
        date: '2025-12-04',
        status: 'present',
        clockIn: '08:00',
        clockOut: '16:00',
        regularHours: 8,
        isApproved: true
      },
      {
        id: 'ATT002',
        date: '2025-12-03',
        status: 'present',
        clockIn: '08:05',
        clockOut: '16:10',
        regularHours: 8,
        lateMinutes: 5,
        isApproved: true
      },
      {
        id: 'ATT003',
        date: '2025-12-02',
        status: 'present',
        clockIn: '07:55',
        clockOut: '16:00',
        regularHours: 8,
        isApproved: true
      },
      {
        id: 'ATT004',
        date: '2025-12-01',
        status: 'absent',
        notes: 'إجازة مرضية',
        isApproved: true
      }
    ],
    evaluations: [
      {
        id: 'EVAL001',
        period: '2024- Annual',
        type: 'annual',
        overallScore: 4.8,
        maxScore: 5,
        criteria: {
          technical: { score: 5, weight: 0.4 },
          behavioral: { score: 4.5, weight: 0.3 },
          management: { score: 4.8, weight: 0.3 }
        },
        supervisorAssessment: 4.8,
        strengths: ['قيادة متميزة', 'خبرة تقنية عالية'],
        areasForImprovement: ['تفويض المهام'],
        achievements: ['تطوير بروتوكولات العمل'],
        goals: ['زيادة رضا المرضى بنسبة 10%'],
        supervisorSignature: {
          date: '2024-12-20',
          supervisorId: 'ADMIN001',
          supervisorName: 'مجلس الإدارة'
        },
        status: 'approved',
        dueDate: '2024-12-31',
        submittedAt: '2024-12-15',
        reviewedAt: '2024-12-20'
      }
    ],
    goals: [],
    training: [
      {
        id: 'TR001',
        title: 'أحدث تقنيات زراعة الأسنان',
        type: 'external',
        provider: 'الجمعية العراقية لطب الأسنان',
        startDate: '2025-06-15',
        endDate: '2025-06-18',
        duration: 24,
        cost: 1500,
        currency: 'USD',
        paidBy: 'company',
        completionStatus: 'completed',
        score: 95,
        skills: ['Implantology', 'Surgery'],
        objectivesAchieved: true,
        feedback: 'دورة ممتازة وشاملة',
        followUpRequired: false
      }
    ],
    certifications: [],
    leaves: [
      {
        id: 'LEAVE001',
        type: 'annual',
        startDate: '2025-08-01',
        endDate: '2025-08-07',
        totalDays: 7,
        reason: 'إجازة سنوية مع العائلة',
        status: 'approved',
        submittedAt: '2025-07-15',
        approvals: [
          {
            level: 1,
            approver: {
              employeeId: 'EMP011',
              name: 'أحمد سعد',
              position: 'مدير إداري'
            },
            status: 'approved',
            date: '2025-07-16'
          }
        ],
        isPaid: true
      }
    ],
    leaveBalance: {
      annual: {
        entitled: 30,
        used: 8,
        remaining: 22
      },
      sick: {
        entitled: 15,
        used: 2,
        remaining: 13
      },
      other: {}
    },
    status: 'active',
    permissions: [
      { module: 'staff', actions: ['read', 'write', 'approve'] },
      { module: 'patients', actions: ['read', 'write'] },
      { module: 'appointments', actions: ['read', 'write', 'approve'] }
    ],
    notes: [],
    createdAt: '2020-01-15T10:00:00.000Z',
    updatedAt: '2025-11-08T02:00:00.000Z',
    createdBy: 'SYSTEM'
  },

  {
    id: 'EMP002',
    employeeNumber: 'DOC002',
    personalInfo: {
      firstName: 'سارة',
      lastName: 'النجفي',
      fullName: 'د. سارة النجفي',
      dateOfBirth: '1990-07-22',
      gender: 'female',
      nationality: 'عراقية',
      maritalStatus: 'single',
      nationalId: '987654321098',
      phone: '07802345678',
      mobile: '07702345678',
      email: 'dr.sara@clinic.com',
      address: {
        street: 'حي الجادرية 456',
        city: 'بغداد',
        state: 'بغداد',
        country: 'العراق',
        postalCode: '10002'
      }
    },
    workInfo: {
      department: departments[0],
      position: 'أخصائي تقويم الأسنان',
      employmentType: 'full_time',
      employmentStatus: 'active',
      hireDate: '2021-03-01',
      supervisor: {
        employeeId: 'EMP001',
        name: 'د. محمد الخزرجي'
      },
      accessLevel: 'employee'
    },
    qualifications: [
      {
        id: 'QUAL003',
        type: 'degree',
        title: 'بكالوريوس طب الأسنان',
        institution: 'جامعة الكوفة',
        field: 'طب الأسنان',
        graduationYear: '2013',
        grade: 'جيد جداً',
        isVerified: true
      },
      {
        id: 'QUAL004',
        type: 'certificate',
        title: 'دبلوم تقويم الأسنان',
        institution: 'الجامعة الأمريكية',
        field: 'تقويم الأسنان',
        graduationYear: '2016',
        grade: 'ممتاز',
        isVerified: true
      }
    ],
    experience: [
      {
        id: 'EXP002',
        companyName: 'مجمع الزهراء الطبي',
        position: 'طبيب أسنان',
        startDate: '2013-10-01',
        endDate: '2021-02-28',
        description: 'أخصائي تقويم أسنان للأطفال والبالغين',
        reasonForLeaving: 'فرصة أفضل ومنصب أخصائي'
      }
    ],
    documents: [],
    emergencyContact: {
      name: 'أم سارة',
      relationship: 'أم',
      phone: '07802345679',
      address: 'النجف'
    },
    payroll: {
      basicSalary: 2000000,
      currency: 'IQD',
      payFrequency: 'monthly',
      allowances: {
        housing: 200000,
        transportation: 100000,
        medical: 80000
      },
      bonuses: {
        performance: 150000
      },
      deductions: {
        tax: 95000,
        insurance: 40000
      },
      benefits: {
        healthInsurance: true,
        lifeInsurance: true,
        retirement: true,
        vacation: 25,
        sickLeave: 12
      },
      grossSalary: 2530000,
      netSalary: 2395000
    },
    schedule: {
      type: 'fixed',
      weeklyHours: 40,
      weeklySchedule: {
        sunday: { isWorking: true, startTime: '09:00', endTime: '17:00', totalHours: 8 },
        monday: { isWorking: true, startTime: '09:00', endTime: '17:00', totalHours: 8 },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '17:00', totalHours: 8 },
        wednesday: { isWorking: false },
        thursday: { isWorking: true, startTime: '09:00', endTime: '17:00', totalHours: 8 },
        friday: { isWorking: false },
        saturday: { isWorking: true, startTime: '10:00', endTime: '15:00', totalHours: 5 }
      },
      breaks: [
        {
          name: 'استراحة الغداء',
          startTime: '13:00',
          endTime: '14:00',
          duration: 60,
          isPaid: false
        }
      ]
    },
    attendance: [],
    evaluations: [],
    goals: [],
    training: [],
    certifications: [],
    leaves: [],
    leaveBalance: {
      annual: {
        entitled: 25,
        used: 5,
        remaining: 20
      },
      sick: {
        entitled: 12,
        used: 1,
        remaining: 11
      },
      other: {}
    },
    status: 'active',
    permissions: [
      { module: 'patients', actions: ['read', 'write'] },
      { module: 'appointments', actions: ['read', 'write'] }
    ],
    notes: [],
    createdAt: '2021-03-01T10:00:00.000Z',
    updatedAt: '2025-11-08T02:00:00.000Z',
    createdBy: 'EMP001'
  },

  // ممرضين
  {
    id: 'EMP006',
    employeeNumber: 'NUR001',
    personalInfo: {
      firstName: 'فاطمة',
      lastName: 'علي',
      fullName: 'فاطمة علي حسن',
      dateOfBirth: '1987-12-10',
      gender: 'female',
      nationality: 'عراقية',
      maritalStatus: 'married',
      nationalId: '567890123456',
      phone: '07803456789',
      mobile: '07703456789',
      email: 'fatima.ali@clinic.com',
      address: {
        street: 'حي الشعب 789',
        city: 'بغداد',
        state: 'بغداد',
        country: 'العراق',
        postalCode: '10003'
      }
    },
    workInfo: {
      department: departments[1],
      position: 'ممرضة رئيسية',
      employmentType: 'full_time',
      employmentStatus: 'active',
      hireDate: '2018-06-01',
      accessLevel: 'supervisor'
    },
    qualifications: [
      {
        id: 'QUAL005',
        type: 'diploma',
        title: 'دبلوم التمريض',
        institution: 'معهد التمريض العراقي',
        field: 'التمريض',
        graduationYear: '2007',
        grade: 'جيد جداً',
        isVerified: true
      }
    ],
    experience: [
      {
        id: 'EXP003',
        companyName: 'مستشفى بغداد التعليمي',
        position: 'ممرضة',
        startDate: '2007-08-01',
        endDate: '2018-05-31',
        description: 'ممرضة في قسم الطوارئ والعمليات',
        reasonForLeaving: 'فرصة منصب رئيسية'
      }
    ],
    documents: [],
    emergencyContact: {
      name: 'محمد علي',
      relationship: 'زوج',
      phone: '07803456790'
    },
    payroll: {
      basicSalary: 1200000,
      currency: 'IQD',
      payFrequency: 'monthly',
      allowances: {
        housing: 150000,
        transportation: 80000,
        medical: 60000
      },
      bonuses: {
        performance: 100000
      },
      deductions: {
        tax: 60000,
        insurance: 25000
      },
      benefits: {
        healthInsurance: true,
        lifeInsurance: false,
        retirement: true,
        vacation: 22,
        sickLeave: 10
      },
      grossSalary: 1590000,
      netSalary: 1505000
    },
    schedule: {
      type: 'rotating',
      weeklyHours: 40,
      weeklySchedule: {
        sunday: { isWorking: true, startTime: '07:00', endTime: '15:00', totalHours: 8, shift: 'morning' },
        monday: { isWorking: true, startTime: '07:00', endTime: '15:00', totalHours: 8, shift: 'morning' },
        tuesday: { isWorking: true, startTime: '07:00', endTime: '15:00', totalHours: 8, shift: 'morning' },
        wednesday: { isWorking: true, startTime: '07:00', endTime: '15:00', totalHours: 8, shift: 'morning' },
        thursday: { isWorking: true, startTime: '07:00', endTime: '15:00', totalHours: 8, shift: 'morning' },
        friday: { isWorking: false },
        saturday: { isWorking: false }
      },
      shifts: [
        {
          id: 'SHIFT001',
          name: 'المناوبة الصباحية',
          startTime: '07:00',
          endTime: '15:00',
          duration: 8,
          type: 'morning'
        },
        {
          id: 'SHIFT002',
          name: 'المناوبة المسائية',
          startTime: '15:00',
          endTime: '23:00',
          duration: 8,
          type: 'afternoon'
        }
      ],
      currentShift: 'SHIFT001',
      breaks: [
        {
          name: 'استراحة قصيرة',
          startTime: '10:00',
          endTime: '10:15',
          duration: 15,
          isPaid: true
        },
        {
          name: 'استراحة الغداء',
          startTime: '12:00',
          endTime: '12:30',
          duration: 30,
          isPaid: false
        }
      ]
    },
    attendance: [],
    evaluations: [],
    goals: [],
    training: [],
    certifications: [],
    leaves: [],
    leaveBalance: {
      annual: {
        entitled: 22,
        used: 6,
        remaining: 16
      },
      sick: {
        entitled: 10,
        used: 3,
        remaining: 7
      },
      other: {}
    },
    status: 'active',
    permissions: [
      { module: 'patients', actions: ['read', 'write'] },
      { module: 'appointments', actions: ['read'] },
      { module: 'staff', actions: ['read'] }
    ],
    notes: [],
    createdAt: '2018-06-01T10:00:00.000Z',
    updatedAt: '2025-11-08T02:00:00.000Z',
    createdBy: 'EMP001'
  },

  // موظفين إداريين
  {
    id: 'EMP011',
    employeeNumber: 'ADM001',
    personalInfo: {
      firstName: 'أحمد',
      lastName: 'سعد',
      fullName: 'أحمد سعد محمد',
      dateOfBirth: '1982-05-18',
      gender: 'male',
      nationality: 'عراقي',
      maritalStatus: 'married',
      nationalId: '456789012345',
      phone: '07804567890',
      mobile: '07704567890',
      email: 'ahmed.saad@clinic.com',
      address: {
        street: 'حي المنصور 321',
        city: 'بغداد',
        state: 'بغداد',
        country: 'العراق',
        postalCode: '10004'
      }
    },
    workInfo: {
      department: departments[2],
      position: 'مدير إداري',
      employmentType: 'full_time',
      employmentStatus: 'active',
      hireDate: '2019-09-01',
      accessLevel: 'manager'
    },
    qualifications: [
      {
        id: 'QUAL006',
        type: 'degree',
        title: 'بكالوريوس إدارة أعمال',
        institution: 'جامعة بغداد',
        field: 'إدارة أعمال',
        graduationYear: '2004',
        grade: 'جيد جداً',
        isVerified: true
      },
      {
        id: 'QUAL007',
        type: 'certificate',
        title: 'دبلوم الموارد البشرية',
        institution: 'معهد الإدارة العراقي',
        field: 'الموارد البشرية',
        graduationYear: '2010',
        grade: 'ممتاز',
        isVerified: true
      }
    ],
    experience: [
      {
        id: 'EXP004',
        companyName: 'شركة النفط الوطنية',
        position: 'مشرف موارد بشرية',
        startDate: '2004-07-01',
        endDate: '2019-08-31',
        description: 'إدارة الموارد البشرية والشؤون الإدارية',
        reasonForLeaving: 'البحث عن تحدي جديد في القطاع الصحي'
      }
    ],
    documents: [],
    emergencyContact: {
      name: 'أم أحمد',
      relationship: 'زوجة',
      phone: '07804567891'
    },
    payroll: {
      basicSalary: 1800000,
      currency: 'IQD',
      payFrequency: 'monthly',
      allowances: {
        housing: 200000,
        transportation: 120000,
        communication: 50000
      },
      bonuses: {
        performance: 180000,
        annual: 300000
      },
      deductions: {
        tax: 90000,
        insurance: 35000
      },
      benefits: {
        healthInsurance: true,
        lifeInsurance: true,
        retirement: true,
        vacation: 25,
        sickLeave: 12
      },
      grossSalary: 2650000,
      netSalary: 2525000
    },
    schedule: {
      type: 'fixed',
      weeklyHours: 40,
      weeklySchedule: {
        sunday: { isWorking: true, startTime: '08:30', endTime: '16:30', totalHours: 8 },
        monday: { isWorking: true, startTime: '08:30', endTime: '16:30', totalHours: 8 },
        tuesday: { isWorking: true, startTime: '08:30', endTime: '16:30', totalHours: 8 },
        wednesday: { isWorking: true, startTime: '08:30', endTime: '16:30', totalHours: 8 },
        thursday: { isWorking: true, startTime: '08:30', endTime: '16:30', totalHours: 8 },
        friday: { isWorking: false },
        saturday: { isWorking: false }
      },
      breaks: [
        {
          name: 'استراحة قصيرة',
          startTime: '10:30',
          endTime: '10:45',
          duration: 15,
          isPaid: true
        },
        {
          name: 'استراحة الغداء',
          startTime: '12:30',
          endTime: '13:30',
          duration: 60,
          isPaid: false
        }
      ]
    },
    attendance: [],
    evaluations: [],
    goals: [],
    training: [],
    certifications: [],
    leaves: [],
    leaveBalance: {
      annual: {
        entitled: 25,
        used: 7,
        remaining: 18
      },
      sick: {
        entitled: 12,
        used: 1,
        remaining: 11
      },
      other: {}
    },
    status: 'active',
    permissions: [
      { module: 'staff', actions: ['read', 'write', 'approve', 'delete'] },
      { module: 'payroll', actions: ['read', 'write', 'approve'] },
      { module: 'reports', actions: ['read', 'write'] }
    ],
    notes: [],
    createdAt: '2019-09-01T10:00:00.000Z',
    updatedAt: '2025-11-08T02:00:00.000Z',
    createdBy: 'EMP001'
  }

  // سأضيف المزيد من الموظفين في باقي الملف...
];

// الرسائل الداخلية
export const internalMessages: InternalMessage[] = [
  {
    id: 'MSG001',
    subject: 'اجتماع فريق الأطباء الأسبوعي',
    content: 'يُعقد اجتماع فريق الأطباء يوم الأحد القادم الساعة 2:00 مساءً في قاعة الاجتماعات. سيتم مناقشة الحالات الجديدة وخطط العلاج.',
    type: 'announcement',
    priority: 'normal',
    sender: {
      employeeId: 'EMP001',
      name: 'د. محمد الخزرجي'
    },
    recipients: {
      type: 'department',
      departments: ['الأطباء']
    },
    sentAt: '2025-11-07T10:00:00.000Z',
    readBy: [
      {
        employeeId: 'EMP002',
        readAt: '2025-11-07T11:30:00.000Z'
      }
    ],
    isReplyAllowed: true,
    isActive: true
  },
  {
    id: 'MSG002',
    subject: 'تحديث سياسة الإجازات المرضية',
    content: 'تم تحديث سياسة الإجازات المرضية لتشمل إمكانية العمل من المنزل في حالة الأمراض الخفيفة. يرجى مراجعة الدليل المحدث.',
    type: 'notice',
    priority: 'high',
    sender: {
      employeeId: 'EMP011',
      name: 'أحمد سعد'
    },
    recipients: {
      type: 'all'
    },
    sentAt: '2025-11-06T14:00:00.000Z',
    readBy: [
      {
        employeeId: 'EMP001',
        readAt: '2025-11-06T14:15:00.000Z'
      },
      {
        employeeId: 'EMP002',
        readAt: '2025-11-06T15:30:00.000Z'
      }
    ],
    isReplyAllowed: false,
    isActive: true
  }
];

// الإحصائيات العامة للموارد البشرية
export const hrStatistics: HRStatistics = {
  totalEmployees: 25,
  activeEmployees: 23,
  newHires: 3,
  terminations: 1,
  turnoverRate: 4.2,
  departmentBreakdown: {
    'الأطباء': 5,
    'التمريض': 8,
    'الإدارة': 4,
    'الفنيين': 5,
    'خدمة العملاء': 3
  },
  attendanceRate: 94.5,
  averagePerformanceScore: 4.2,
  trainingHours: 1200,
  leaveUtilization: 68.5
};

// عينة من سجلات الحضور (آخر 30 يوم)
export const attendanceRecords: AttendanceRecord[] = (() => {
  const records: AttendanceRecord[] = [];
  const employees = staffMembers.slice(0, 5); // أول 5 موظفين

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    employees.forEach(employee => {
      // تخطي عطل نهاية الأسبوع للموظفين العاديين
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // الجمعة والسبت

      if (!isWeekend) {
        const isLate = Math.random() > 0.85;
        const isAbsent = Math.random() > 0.95;

        if (isAbsent) {
          records.push({
            id: `ATT_${employee.id}_${dateString}`,
            date: dateString,
            status: 'absent',
            isApproved: true,
            approvedBy: 'EMP011',
            notes: 'إجازة مرضية'
          });
        } else {
          const startTime = employee.schedule.weeklySchedule.sunday?.startTime || '08:00';
          const endTime = employee.schedule.weeklySchedule.sunday?.endTime || '16:00';

          let clockIn = startTime;
          let lateMinutes = 0;

          if (isLate) {
            const additionalMinutes = Math.floor(Math.random() * 30) + 5;
            const startTimeMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
            const lateTimeMinutes = startTimeMinutes + additionalMinutes;
            clockIn = `${Math.floor(lateTimeMinutes / 60).toString().padStart(2, '0')}:${(lateTimeMinutes % 60).toString().padStart(2, '0')}`;
            lateMinutes = additionalMinutes;
          }

          records.push({
            id: `ATT_${employee.id}_${dateString}`,
            date: dateString,
            clockIn,
            clockOut: endTime,
            status: isLate ? 'late' : 'present',
            totalHours: 8,
            regularHours: 8,
            overtimeHours: 0,
            lateMinutes,
            earlyDepartureMinutes: 0,
            isApproved: true,
            approvedBy: 'EMP011'
          });
        }
      }
    });
  }

  return records;
})();

// عينة من التقييمات
export const performanceEvaluations: PerformanceEvaluation[] = [
  {
    id: 'EVAL001',
    period: '2025-10',
    type: 'monthly',
    overallScore: 4.5,
    maxScore: 5,
    criteria: {
      'الجودة في العمل': { score: 5, weight: 25, comments: 'مستوى عالي من الدقة' },
      'الالتزام بالوقت': { score: 4, weight: 20, comments: 'بعض التأخيرات البسيطة' },
      'التعاون': { score: 5, weight: 20, comments: 'تعاون ممتاز مع الفريق' },
      'المبادرة': { score: 4, weight: 15, comments: 'يبدي مبادرات جيدة' },
      'خدمة المرضى': { score: 5, weight: 20, comments: 'تفاعل ممتاز مع المرضى' }
    },
    selfAssessment: 4.3,
    supervisorAssessment: 4.5,
    strengths: [
      'خبرة طبية عالية',
      'تعامل ممتاز مع المرضى',
      'قيادة فعالة للفريق'
    ],
    areasForImprovement: [
      'الحاجة لتحسين دقة المواعيد',
      'تطوير مهارات إدارية إضافية'
    ],
    achievements: [
      'إنجاز 150 عملية ناجحة هذا الشهر',
      'تدريب 3 أطباء جدد',
      'تحسين رضا المرضى بنسبة 15%'
    ],
    goals: [
      'تقليل وقت الانتظار للمرضى',
      'إجراء دورة تدريبية متقدمة في التقويم'
    ],
    supervisorSignature: {
      date: '2025-11-01T10:00:00.000Z',
      supervisorId: 'EMP011',
      supervisorName: 'أحمد سعد'
    },
    status: 'approved',
    dueDate: '2025-10-31',
    submittedAt: '2025-10-30T14:00:00.000Z',
    reviewedAt: '2025-11-01T10:00:00.000Z'
  }
];

// عينة من سجلات التدريب
export const trainingRecords: TrainingRecord[] = [
  {
    id: 'TRN001',
    title: 'دورة تطوير مهارات التواصل مع المرضى',
    type: 'external',
    provider: 'المركز العراقي للتدريب الطبي',
    instructor: 'د. علياء حسن',
    startDate: '2025-09-15',
    endDate: '2025-09-17',
    duration: 24,
    cost: 300000,
    currency: 'IQD',
    paidBy: 'company',
    completionStatus: 'completed',
    score: 87,
    grade: 'ممتاز',
    certificate: '/certificates/communication_skills_mohammed.pdf',
    skills: ['التواصل', 'خدمة العملاء', 'حل المشاكل'],
    objectivesAchieved: true,
    feedback: 'دورة مفيدة جداً في تحسين التواصل مع المرضى وفهم احتياجاتهم',
    followUpRequired: false
  }
];

// عينة من الشهادات
export const certifications: Certification[] = [
  {
    id: 'CERT001',
    name: 'ترخيص مزاولة مهنة طب الأسنان',
    issuedBy: 'نقابة أطباء الأسنان العراقية',
    issueDate: '2020-01-01',
    expiryDate: '2025-12-31',
    credentialId: 'DA_2020_0156',
    status: 'active',
    isRequired: true,
    renewalRequired: true,
    renewalDeadline: '2025-11-01',
    renewalCost: 150000,
    reminderSent: false
  }
];

// عينة من طلبات الإجازة
export const leaveRequests: LeaveRequest[] = [
  {
    id: 'LEAVE001',
    type: 'annual',
    startDate: '2025-12-20',
    endDate: '2025-12-25',
    totalDays: 6,
    reason: 'إجازة سنوية لقضاء العطلة مع العائلة',
    description: 'رحلة عائلية مخططة مسبقاً',
    status: 'approved',
    submittedAt: '2025-11-01T09:00:00.000Z',
    approvals: [
      {
        level: 1,
        approver: {
          employeeId: 'EMP011',
          name: 'أحمد سعد',
          position: 'مدير إداري'
        },
        status: 'approved',
        date: '2025-11-01T14:00:00.000Z',
        comments: 'موافق، تم ترتيب البديل'
      }
    ],
    coverageArrangement: {
      employeeId: 'EMP002',
      employeeName: 'د. سارة النجفي',
      notes: 'ستغطي المواعيد الطارئة'
    },
    isPaid: true
  }
];

// ملخص الأداء العام
export const overallPerformanceSummary = {
  averageAttendanceRate: 94.5,
  averagePerformanceScore: 4.2,
  employeeOfTheMonth: {
    employeeId: 'EMP001',
    name: 'د. محمد الخزرجي',
    score: 4.8,
    achievements: 'تفوق في جميع المعايير وقيادة استثنائية للفريق'
  },
  departmentPerformance: {
    'الأطباء': 4.6,
    'التمريض': 4.3,
    'الإدارة': 4.1,
    'الفنيين': 4.0,
    'خدمة العملاء': 4.2
  },
  topPerformers: [
    { employeeId: 'EMP001', name: 'د. محمد الخزرجي', score: 4.8 },
    { employeeId: 'EMP002', name: 'د. سارة النجفي', score: 4.6 },
    { employeeId: 'EMP006', name: 'فاطمة علي', score: 4.5 }
  ]
};

export const getStaffByClinic = (clinicId: string): Employee[] => {
  return staffMembers;
};
// أنواع البيانات الخاصة بمركز الإدارة

import { UserRole } from './index';

// الإحصائيات العامة للمنصة
export interface PlatformStats {
  totalClinics: number;
  totalSuppliers: number;
  pendingSuppliers: number;
  pendingDoctors: number;
  totalRevenue: number;
  productsSold: number;
  jobsPosted: number;
  activeUsers: number;
  monthlyGrowth: number;
}

// طلبات الاشتراك للأطباء
export interface DoctorSubscriptionRequest {
  id: string;
  doctorName: string;
  email: string;
  phone: string;
  clinicName: string;
  location: string;
  governorate: string;
  district: string;
  specialty: string;
  experience: number;
  requestedPlan: SubscriptionPlan;
  documents: Document[];
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  notes?: string;
}

// خطط الاشتراك
export interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn: string;
  price: {
    monthly: number;
    yearly?: number;
    currency: string;
  };
  features: string[];
  limitations?: string[];
  // Configuration stored in JSONB
  maxClinics: number; // 1 = Single, 999 = Unlimited
  maxPatients: number; // 999999 = Unlimited
  maxServices: number; // Limit on medical services/offerings
  mapVisibility: boolean; // Show on interactive map
  isFeatured: boolean; // Show in Featured Clinics
  articleSuggestion: boolean; // Suggest below articles
  aiRequestLimit: number; // -1 = Unlimited, 0 = None, >0 = Limited (Daily)
  digitalBooking: boolean; // Enable digital booking

  isPopular: boolean;
  hasAISupport?: boolean; // Deprecated, use aiRequestLimit
}

// الوكلاء المحليين
export interface LocalAgent {
  id: string;
  name: string;
  phone: string;
  email: string;
  governorate: string;
  districts: string[];
  commissionRate: number;
  totalSales: number;
  activeClients: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
}

// طلبات الموردين
export interface SupplierRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  governorate: string;
  district: string;
  businessType: 'manufacturer' | 'distributor' | 'retailer';
  documents: Document[];
  productsCategories: string[];
  expectedVolume: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  notes?: string;
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium';
}

// الوثائق
export interface Document {
  id: string;
  name: string;
  type: 'license' | 'certificate' | 'id' | 'tax_certificate' | 'bank_statement' | 'other';
  url: string;
  uploadDate: string;
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
}

// إدارة الندوات والدورات
export interface WebinarManagement {
  id: string;
  title: string;
  instructor: string;
  instructorBio: string;
  type: 'webinar' | 'course' | 'workshop';
  category: string;
  date: string;
  duration: string;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  description: string;
  topics: string[];
  requirements: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  isElite: boolean;
  certificateProvided: boolean;
  recordingAvailable: boolean;
  createdBy: string;
  createdDate: string;
}

// أطباء النخبة
export interface EliteDoctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  location: string;
  experience: number;
  achievements: string[];
  publications: number;
  rating: number;
  patientsCount: number;
  joinDate: string;
  eliteSince: string;
  specialBenefits: string[];
  contributionScore: number;
}

// إدارة الوظائف من قبل الإدارة
export interface JobManagement {
  id: string;
  title: string;
  description: string;
  governorate: string;
  district: string;
  category: string;
  type: 'full-time' | 'part-time' | 'contract';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  benefits: string[];
  featured: boolean;
  urgent: boolean;
  views: number;
  applications: number;
  postedDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'expired' | 'filled';
  postedBy: string; // "admin" for platform jobs
}

// إشعارات النظام
export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  type: 'promotional' | 'system' | 'warning' | 'info' | 'discount';
  targetAudience: 'doctors' | 'suppliers' | 'all' | 'specific';
  specificUsers?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: string;
  expiryDate?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'expired';
  createdBy: string;
  createdDate: string;
  sentDate?: string;
  openRate?: number;
  clickRate?: number;
}

// طلبات الدعم الفني
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userType: UserRole;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'complaint' | 'feature_request' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'pending_user' | 'resolved' | 'closed';
  assignedTo?: string;
  createdDate: string;
  lastUpdate: string;
  responseTime?: number; // in hours
  resolutionTime?: number; // in hours
  satisfaction?: number; // 1-5 rating
  attachments?: Document[];
  history: SupportTicketHistory[];
}

// تاريخ طلب الدعم
export interface SupportTicketHistory {
  id: string;
  action: 'created' | 'updated' | 'assigned' | 'responded' | 'resolved' | 'closed';
  performedBy: string;
  performedByRole: 'admin' | 'support_agent' | 'user';
  description: string;
  timestamp: string;
  attachments?: Document[];
}

// إحصائيات تفصيلية للأقسام
export interface DepartmentStats {
  subscriptions: {
    totalRequests: number;
    pendingRequests: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    revenue: {
      monthly: number;
      yearly: number;
      growth: number;
    };
    planDistribution: { [planId: string]: number };
  };
  suppliers: {
    totalSuppliers: number;
    pendingApproval: number;
    activeSuppliers: number;
    suspendedSuppliers: number;
    totalProducts: number;
    totalSales: number;
    avgRating: number;
  };
  community: {
    totalWebinars: number;
    totalAttendees: number;
    eliteDoctors: number;
    postsThisMonth: number;
    engagementRate: number;
  };
  jobs: {
    totalJobs: number;
    activeJobs: number;
    applications: number;
    filledJobs: number;
    averageSalary: number;
  };
  support: {
    openTickets: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    satisfactionRate: number;
    ticketsByCategory: { [category: string]: number };
  };
}

// كوبونات الخصم
export interface DiscountCoupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  applicableTo: 'subscriptions' | 'store' | 'all';
  applicableProducts?: string[];
  applicablePlans?: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'expired';
  createdBy: string;
  createdDate: string;
}

// مراقبة النشاط
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  description: string;
  category: 'auth' | 'subscription' | 'store' | 'community' | 'job' | 'admin' | 'support';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// إعدادات المنصة
export interface PlatformSettings {
  general: {
    platformName: string;
    platformLogo: string;
    tagline: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    socialMedia: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  features: {
    storeEnabled: boolean;
    jobsEnabled: boolean;
    communityEnabled: boolean;
    subscriptionsEnabled: boolean;
    aiSupportEnabled: boolean;
    notificationsEnabled: boolean;
  };
  policies: {
    privacyPolicy: string;
    termsOfService: string;
    refundPolicy: string;
    dataRetentionDays: number;
  };
  integrations: {
    googleMapsApiKey?: string;
    stripePublishableKey?: string;
    emailServiceProvider?: string;
    smsServiceProvider?: string;
    analyticsEnabled: boolean;
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number; // in minutes
    twoFactorRequired: boolean;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      requireUppercase: boolean;
    };
  };
}

// معلومات الموردين المفصلة للإدارة
export interface SupplierManagement {
  id: string;
  basicInfo: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    website?: string;
    establishedYear: number;
  };
  location: {
    address: string;
    governorate: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  business: {
    type: 'manufacturer' | 'distributor' | 'retailer';
    categories: string[];
    totalProducts: number;
    activeProducts: number;
    totalSales: number;
    rating: number;
    reviewsCount: number;
  };
  performance: {
    ordersFulfilled: number;
    avgDeliveryTime: number; // in days
    returnRate: number; // percentage
    customerSatisfaction: number; // 1-5
    complaintCount: number;
    warningCount: number;
  };
  financial: {
    revenue: number;
    platformCommission: number;
    paymentMethod: 'bank_transfer' | 'digital_wallet' | 'check';
    taxId?: string;
    bankAccount?: {
      accountNumber: string;
      bankName: string;
      accountHolder: string;
    };
  };
  status: {
    isActive: boolean;
    isVerified: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    suspensionReason?: string;
    joinDate: string;
    lastLoginDate: string;
  };
}

// نظام المكافآت والعقوبات
export interface RewardPenaltySystem {
  id: string;
  userId: string;
  userName: string;
  userType: UserRole;
  type: 'reward' | 'penalty' | 'warning';
  reason: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  points?: number; // reward/penalty points
  monetaryValue?: number; // bonus or fine
  issuedBy: string;
  issuedDate: string;
  status: 'active' | 'resolved' | 'appealed' | 'overturned';
  expiryDate?: string;
  appealReason?: string;
  appealDate?: string;
  appealResolvedBy?: string;
}

export type AdminSection =
  | 'overview'
  | 'platform-management'
  | 'subscriptions'
  | 'store-suppliers'
  | 'community'
  | 'jobs'
  | 'notifications'
  | 'support';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support_agent';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}
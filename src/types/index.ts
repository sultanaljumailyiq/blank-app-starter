// أنواع البيانات للتطبيق

export type UserRole = 'doctor' | 'supplier' | 'laboratory' | 'staff' | 'admin' | 'newuser';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  specialty?: string;
  location?: string;
  bio?: string;
  active?: boolean;
  // Extended fields for Doctors
  hospital?: string;
  experience?: number;
  publications?: number;
  rating?: number;
  reviewsCount?: number;
  isElite?: boolean;
  isSyndicate?: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  specialties: string[];
  workingHours: string;
  image?: string;
  description?: string;
  // Added based on usage
  governorate?: string; // Added for location management
  address?: string; // Added for unified location architecture
  email?: string;
  reviews?: number;
  owner_id?: string; // Links to Auth User
  services?: string[]; // Added for Clinic Services
  logo?: string;
  coverImage?: string;
  // Enhanced Settings
  settings?: any;
  isFeatured?: boolean;
  isDigitalBookingEnabled?: boolean;
}

export interface ClinicInvitation {
  id: string;
  clinicId: number;
  staffId?: string;    // if set, accept → update this staff record instead of creating new
  clinic?: Clinic;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdBy: string;
  createdAt: string;
  isStaffRecord?: boolean;
}

// Re-exporting from specific file to avoid duplication
export * from './appointments';

// Removing duplicate Appointment interface
// export interface Appointment { ... } 

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  lastVisit?: string;
  totalVisits: number;
  balance: number;
  gender?: 'male' | 'female';
  address?: string;
  notes?: string;
  medicalHistory?: string;
  // JSONB Mapped Fields from Supabase
  teethCondition?: any[]; // Mapped from teeth_condition
  treatmentPlans?: any[]; // Mapped from treatment_plans
  medicalHistoryData?: {
    vitals: { weight: string; height: string; bp: string; sugar: string; pulse: string; };
    conditions: string[];
    allergies: string[];
    habits: string[];
    notes: string;
  };
  clinicId?: string;
  status?: 'active' | 'inactive' | 'emergency';
  paymentStatus?: 'paid' | 'pending' | 'overdue';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  role_title?: string;
  email: string;
  phone: string;
  salary: number;
  joinDate: string;
  casesHandled?: number;
  commission?: number;
  clinicId?: string;
  isActive?: boolean;
  isLinkedAccount?: boolean;
}

export interface Product {
  id: string;
  name: string;
  supplierId: string;
  supplierName: string;
  brandId?: string;
  brandName?: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  images?: string[];
  description: string;
  stock: number;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
  subCategory?: string;
  childCategory?: string;
  // Added based on usage
  status?: 'active' | 'out_of_stock' | 'discontinued';
  views?: number;
  sales?: number;
  // Deals & Campaigns
  isDeal?: boolean;
  dealBadge?: string;
  dealStart?: string;
  dealEnd?: string;
  isFeatured?: boolean;
  featuredOrder?: number;
  // Role-Based Filtering
  target_audience?: ('clinic' | 'lab' | 'both')[];
  created_at?: string;
}

export interface PromotionalCard {
  id: string;
  title: string;
  description: string;
  image?: string;
  buttonText?: string;
  link?: string;
  active: boolean;
  section?: string;
  badge_text?: string;
}

export interface DealRequest {
  id: string;
  supplierId: string;
  supplierName?: string; // Optional for display
  productId: string;
  product?: Product; // Joined product
  type: 'deal' | 'featured';
  status: 'pending' | 'approved' | 'rejected';
  badgeType?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  logo?: string;
  logo_url?: string;
  rating: number;
  reviews: number;
  totalProducts: number;
  location: string;
  governorate: string;
  address: string;
  phone: string;
  email: string;
  verified: boolean;
  trusted: boolean;
  joinedDate: string;
  categories: string[];
  brands: string[];
  settings?: {
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
  };
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description: string;
  country: string;
  website?: string;
  verified: boolean;
  productCount: number;
  categories: string[];
  specialties: string[];
}

export interface Order {
  id: string;
  userId: string;
  user?: User; // Joined user data
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'cash' | 'card' | 'online';
  shippingAddress: Address;
  clinicName?: string; // New
  recipientName?: string; // New
  backupPhone?: string; // New
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  returnReason?: string; // For returned orders
  returnStatus?: 'pending' | 'received' | 'rejected';
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  supplierId: string;
  supplierName: string;
}

// Added specifically for Supplier Dashboard
export interface SupplierOrder {
  id: string;
  customer: {
    name: string;
    clinicName?: string; // New
    phone: string;
    backupPhone?: string; // New
    address: string;
    governorate?: string;
    city?: string;
    avatar?: string;
  };
  items: SupplierOrderItem[];
  total: number;
  status: 'pending' | 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  returnStatus?: 'pending' | 'received' | 'rejected'; // For returns
  orderDate: string;
  expectedDelivery?: string;
  priority?: 'normal' | 'urgent';
  paymentMethod: 'cash' | 'card';
  notes?: string;
  shippingAddress?: Address;
}

export interface SupplierOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  recipientName: string;
  phone: string;
  governorate: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  notes?: string;
  type?: 'home' | 'work' | 'other';
  isDefault: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image?: string;
  discountPercentage?: number;
  startDate: string;
  endDate: string;
  category?: string;
  supplierId?: string;
  badge_text?: string;
  button_text?: string;
  productIds?: string[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: 'دورة' | 'ندوة' | 'ورشة عمل';
  price: number;
  duration: string;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  description: string;
  image?: string;
  rating: number;
  students: number;
  date?: string;
  location?: string;
  featured?: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  author: string;
  date: string;
  category: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  category: string;
  sourceType?: 'treatment' | 'salary' | 'lab_order' | 'inventory' | 'bill' | 'other';
  sourceId?: string; // ID of the related Record (e.g., AppointmentID, StaffID)
  relatedPerson?: string; // Name of Patient/Staff/Supplier
  paymentMethod?: 'cash' | 'card' | 'bank';
  clinicId?: string;
  patientId?: string;
  doctorId?: string;
  staffId?: string;
  inventoryItemId?: string;
  treatmentId?: string;
  sessionId?: string; // For linking to specific treatment sessions
  labRequestId?: string; // For linking to specific lab requests
  assistantId?: string; // For staff who assisted
  extraCost?: number; // Additional costs recorded
  labId?: string; // Related Lab
  recordedById?: string; // Staff who recorded the transaction
  doctorName?: string;
  recorderName?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  lastRestocked?: string;
  // Added based on usage often found
  minStock?: number;
  price?: number;
  expiryDate?: string;
  clinicId?: string;
  clinicName?: string;
}

export interface Equipment {
  id: string;
  name: string;
  status: 'working' | 'maintenance' | 'broken';
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string; // Added to match UI needs
  content: string;
  image?: string;
  images?: string[]; // Support multiple images
  likes: number;
  comments: number; // Count
  date: string;
  isElite?: boolean;
  isSyndicate?: boolean;
  groupId?: string;
  likedByMe?: boolean; // Virtual field for UI
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole?: UserRole;
  content: string;
  createdAt: string;
}

export interface Like {
  postId: string;
  userId: string;
  createdAt: string;
}

export interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'course' | 'webinar';
  status: 'registered' | 'completed' | 'dropped';
  enrolledAt: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  governorate: string;
  district: string;
  type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'monthly' | 'weekly' | 'daily' | 'hourly';
  };
  workingHours: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  experience: 'entry-level' | 'mid-level' | 'senior-level';
  postedDate: string;
  deadline?: string;
  status: 'open' | 'closed' | 'expired';
  category: string;
  contactEmail?: string;
  contactPhone?: string;
  applicants: number;
  featured?: boolean;
  urgent?: boolean;
}

export interface Friend {
  id: string;
  name: string;
  role: UserRole;
  specialty?: string;
  location?: string;
  mutualFriends?: number;
  isOnline?: boolean;
  status?: 'online' | 'offline' | 'busy'; // Added for UI compatibility
  avatar?: string;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: UserRole;
  date: string;
  mutualFriends?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  posts: number;
  category: string;
  isJoined: boolean;
  image?: string;
  lastActive?: string;
  createdBy?: string;
  privacy: 'public' | 'private';
}

export interface ScientificResource {
  id: string;
  sourceId?: string;
  title: string;
  source: string;
  url: string;
  category: string;
  date: string;
  description: string;
  logo?: string;
  type?: string;
  name?: string;
  created_at?: string;
}



export interface SupplierStats {
  totalProducts: number;
  activeOrders: number;
  monthlyRevenue: number;
  customerRating: number;
  totalCustomers: number;
  viewsThisMonth: number;
}





// Subscription & Packages

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
  isPopular?: boolean;
  duration?: 'monthly' | 'yearly';
  maxClinics?: number;
  maxPatients?: number;
  maxServices?: number;
  aiRequestLimit?: number;
  mapVisibility?: boolean;
  isFeatured?: boolean;
  articleSuggestion?: boolean;
  digitalBooking?: boolean;
}

export interface SubscriptionAgent {
  id: string;
  name: string;
  code: string;
  phone: string;
  governorate: string;
  address?: string;
  status: 'active' | 'inactive';
  clinicsCount?: number;
  commissionRate?: number;
  joinDate?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'manual' | 'gateway' | 'agent';
  number?: string;
  qrCodeUrl?: string; // For manual/wallet
  details?: any;
  isActive: boolean;
}

export interface SubscriptionRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  paymentDetails?: any;
  agentId?: string;
  agent?: SubscriptionAgent;
  couponId?: string;
  transactionId?: string;
  amount?: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  usageLimit?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

import { Clinic, Article, Patient, Staff, Product, Appointment, InventoryItem, Equipment, CommunityPost, Course, Friend, FriendRequest, Group, ScientificResource } from '../../types';

// Import store-specific data
export {
  mockSuppliers,
  mockBrands,
  mockStoreProducts,
  mockPromotions,
  mockAddresses,
  mockOrders,
  mockMessages
} from './store';

// Import jobs-specific data
export {
  mockJobs,
  jobStats,
  jobCategories,
  jobTypes,
  experienceLevels,
  iraqGovernorates,
  getDistrictsByGovernorate
} from './jobs';

// Import financial data
export {
  mockTransactions,
  mockInvoices
} from './financial_data';

export { mockPosts } from './posts';

export const mockClinics: Clinic[] = [];
export const mockArticles: Article[] = [];
export const mockPatients: Patient[] = [];
export const mockStaff: Staff[] = [];
export const mockProducts: Product[] = [];
export const mockAppointments: Appointment[] = [];
export const mockInventory: InventoryItem[] = [];
export const mockEquipment: Equipment[] = [];
export const mockCommunityPosts: CommunityPost[] = [];
export const mockCourses: Course[] = [];
export const mockFriends: Friend[] = [];
export const mockFriendRequests: FriendRequest[] = [];
export const mockGroups: Group[] = [];
export const mockResourceSources: any[] = [];
export const mockScientificResources: ScientificResource[] = [];
export const mockDoctors: any[] = [];

export interface MentorshipSession {
  id: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  date: string;
  time: string;
  duration: number; // minutes
  price: number;
  status: 'available' | 'booked' | 'completed';
}

export interface MentorProfile {
  id: string;
  doctorId: string; // Links to mockDoctors
  name: string;
  specialty: string;
  bio: string;
  hourlyRate: number;
  rating: number;
  studentsCount: number;
  topics: string[];
  availability: string[]; // e.g., ['Mon', 'Wed']
  isElite: boolean; // Derived/Denormalized
}

export const mockMentors: MentorProfile[] = [];
export const mockMentalSessions: MentorshipSession[] = [];
export const mockModels: any[] = [];

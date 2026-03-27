// بيانات العيادات
export interface Clinic {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  type: 'orthodontics' | 'general' | 'oral-surgery' | 'pediatric';
  openTime: string;
  closeTime: string;
  rating: number;
  totalPatients: number;
  totalStaff: number;
  isActive: boolean;
  mainDoctor: string;
  specialties: string[];
  monthlyRevenue: number;
  dailyAppointments: number;
  pendingAppointments: number;
  averageRating: number;
  workingDays: string[];
  image: string;
  owner_id?: string;
}

export const clinicsData: Clinic[] = [];

// دالة للحصول على عيادة معينة
export const getClinicById = (id: string): Clinic | undefined => {
  return clinicsData.find(clinic => clinic.id === id) || clinicsData[0];
};

// دالة للحصول على العيادات النشطة
export const getActiveClinics = (): Clinic[] => {
  return clinicsData.filter(clinic => clinic.isActive);
};

// دالة للبحث في العيادات
export const searchClinics = (query: string): Clinic[] => {
  return clinicsData.filter(clinic =>
    clinic.name.toLowerCase().includes(query.toLowerCase()) ||
    clinic.location.toLowerCase().includes(query.toLowerCase()) ||
    clinic.specialties.some(specialty => specialty.toLowerCase().includes(query.toLowerCase()))
  );
};

// أنواع العيادات
export const clinicTypes = {
  orthodontics: 'تقويم الأسنان',
  general: 'الأسنان العامة',
  'oral-surgery': 'جراحة الفم',
  pediatric: 'أسنان الأطفال'
} as const;

export type ClinicType = keyof typeof clinicTypes;
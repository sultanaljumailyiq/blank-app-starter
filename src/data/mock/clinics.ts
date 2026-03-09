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

export const clinicsData: Clinic[] = [
  {
    id: '1',
    name: 'عيادة د. أحمد للأسنان التخصصية',
    location: 'بغداد - المنصور',
    address: 'شارع 14 رمضان، مجمع النخيل الطبي، ط 2',
    phone: '0770-1234567',
    type: 'orthodontics',
    openTime: '09:00',
    closeTime: '21:00',
    rating: 4.9,
    totalPatients: 850,
    totalStaff: 12,
    isActive: true,
    mainDoctor: 'د. أحمد محمد العلي',
    specialties: ['تقويم الأسنان', 'زراعة الأسنان', 'تجميل الأسنان'],
    monthlyRevenue: 25000000,
    dailyAppointments: 45,
    pendingAppointments: 12,
    averageRating: 4.9,
    workingDays: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop',
    owner_id: '1'
  },
  {
    id: '2',
    name: 'مركز الابتسامة المشرقة - د. سارة',
    location: 'بغداد - الكرادة',
    address: 'ساحة الواثق، بناية الحياة، ط 1',
    phone: '0780-9876543',
    type: 'general',
    openTime: '10:00',
    closeTime: '20:00',
    rating: 4.8,
    totalPatients: 1240,
    totalStaff: 18,
    isActive: true,
    mainDoctor: 'د. سارة حسن التميمي',
    specialties: ['طب أسنان الأطفال', 'علاج الجذور', 'التركيبات'],
    monthlyRevenue: 32000000,
    dailyAppointments: 50,
    pendingAppointments: 8,
    averageRating: 4.8,
    workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop'
  }
];

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
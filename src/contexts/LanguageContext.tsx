import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    services: 'الخدمات الطبية',
    aboutUs: 'عن التطبيق',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    areYouSupplier: 'هل أنت مورد؟',
    
    // Home
    appName: 'SMART',
    appTagline: 'نظام ذكي لإدارة عيادات الأسنان',
    areDoctorQuestion: 'هل أنت طبيب أسنان؟',
    emergencies: 'طوارئ',
    nearbyClinics: 'العيادات القريبة',
    viewAllArticles: 'مشاهدة جميع المقالات',
    
    // Services
    nearbyClinicService: 'عيادات قريبة',
    smartDiagnosis: 'التشخيص الذكي',
    educationalArticles: 'مقالات تعليمية',
    emergencyService: 'الطوارئ',
    bookNow: 'حجز الآن',
    call: 'اتصال',
    
    // Diagnosis
    aiDiagnosis: 'التشخيص بالذكاء الاصطناعي',
    traditionalDiagnosis: 'التشخيص التقليدي',
    uploadPhoto: 'رفع صورة',
    describeSymptoms: 'صف الأعراض',
    startDiagnosis: 'ابدأ التشخيص',
    
    // Auth
    doctorLogin: 'دخول الأطباء',
    supplierLogin: 'دخول الموردين',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب؟',
    
    // Doctor Center
    overview: 'نظرة عامة',
    myClinics: 'عياداتي',
    appointments: 'الحجوزات',
    patients: 'المرضى',
    staff: 'الموظفون',
    inventory: 'المخزون',
    finance: 'المالية',
    messages: 'الرسائل',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    community: 'المجتمع الطبي',
    store: 'المتجر',
    
    // Clinic Management
    manageStaff: 'إدارة الطاقم',
    permissions: 'الصلاحيات',
    settings: 'الإعدادات',
    enableOnMap: 'تفعيل على الخريطة',
    bookingLink: 'رابط الحجز',
    
    // Stats
    totalPatients: 'إجمالي المرضى',
    todayAppointments: 'حجوزات اليوم',
    totalRevenue: 'إجمالي الإيرادات',
    pendingAppointments: 'حجوزات معلقة',
    
    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    search: 'بحث',
    filter: 'تصفية',
    add: 'إضافة',
    view: 'عرض',
    close: 'إغلاق',
    submit: 'إرسال',
  },
  en: {
    // Navigation
    home: 'Home',
    services: 'Medical Services',
    aboutUs: 'About Us',
    login: 'Login',
    register: 'Register',
    areYouSupplier: 'Are you a supplier?',
    
    // Home
    appName: 'SMART',
    appTagline: 'Smart Dental Clinic Management System',
    areDoctorQuestion: 'Are you a dentist?',
    emergencies: 'Emergencies',
    nearbyClinics: 'Nearby Clinics',
    viewAllArticles: 'View All Articles',
    
    // Services
    nearbyClinicService: 'Nearby Clinics',
    smartDiagnosis: 'Smart Diagnosis',
    educationalArticles: 'Educational Articles',
    emergencyService: 'Emergency',
    bookNow: 'Book Now',
    call: 'Call',
    
    // Diagnosis
    aiDiagnosis: 'AI Diagnosis',
    traditionalDiagnosis: 'Traditional Diagnosis',
    uploadPhoto: 'Upload Photo',
    describeSymptoms: 'Describe Symptoms',
    startDiagnosis: 'Start Diagnosis',
    
    // Auth
    doctorLogin: 'Doctor Login',
    supplierLogin: 'Supplier Login',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    
    // Doctor Center
    overview: 'Overview',
    myClinics: 'My Clinics',
    appointments: 'Appointments',
    patients: 'Patients',
    staff: 'Staff',
    inventory: 'Inventory',
    finance: 'Finance',
    messages: 'Messages',
    notifications: 'Notifications',
    profile: 'Profile',
    community: 'Medical Community',
    store: 'Store',
    
    // Clinic Management
    manageStaff: 'Manage Staff',
    permissions: 'Permissions',
    settings: 'Settings',
    enableOnMap: 'Enable on Map',
    bookingLink: 'Booking Link',
    
    // Stats
    totalPatients: 'Total Patients',
    todayAppointments: "Today's Appointments",
    totalRevenue: 'Total Revenue',
    pendingAppointments: 'Pending Appointments',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    add: 'Add',
    view: 'View',
    close: 'Close',
    submit: 'Submit',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

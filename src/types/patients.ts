// أنواع البيانات الخاصة بالمرضى

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address?: string;
  nationalId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes?: string;
  };
  dentalHistory?: {
    lastVisit?: string;
    treatmentHistory: string[];
    currentTreatments: string[];
    notes?: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  registrationDate: string;
  lastVisit?: string;
  totalVisits: number;
  status: 'active' | 'inactive' | 'archived';
  notes?: string;
}

export interface PatientSearchResult {
  id: string;
  fullName: string;
  phone: string;
  lastVisit?: string;
  status: string;
}
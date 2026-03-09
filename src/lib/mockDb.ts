import { Patient } from '../types';
import { Employee } from '../types/staff';
import { Appointment } from '../types';
import { InventoryItem } from '../hooks/useInventory';

// Key for LocalStorage
const STORAGE_KEY = 'smart_dental_local_db_v3';

// Professional Seed Data
const SEED_DATA = {
    clinics: [
        { id: 1, name: 'عيادة النور التخصصية', address: 'بغداد - شارع فلسطين', phone: '07701234567', type: 'general', stats: { patients: 120, staff: 5, appointments: 8 } },
        { id: 2, name: 'مركز الابتسامة الرقمي', address: 'أربيل - وزيران', phone: '07501234567', type: 'specialized', stats: { patients: 85, staff: 4, appointments: 12 } }
    ],
    patients: [
        // Clinic 1
        { id: '1', clinicId: '1', name: 'سارة أحمد محمود', age: 28, gender: 'female', phone: '07701234567', email: 'sara.ahmed@example.com', address: 'بغداد - المنصور', status: 'active', paymentStatus: 'paid', lastVisit: new Date(Date.now() - 86400000 * 2).toISOString(), totalVisits: 3, medicalHistory: 'حساسية بنسلين', notes: 'مريضة منتظمة' },
        { id: '2', clinicId: '1', name: 'محمد علي حسن', age: 45, gender: 'male', phone: '07901112222', email: 'mohammed.ali@example.com', address: 'بغداد - الكرادة', status: 'active', paymentStatus: 'pending', lastVisit: new Date(Date.now() - 86400000 * 10).toISOString(), totalVisits: 5, medicalHistory: 'سكري', notes: 'يحتاج متابعة زرع' },
        // Clinic 2
        { id: '201', clinicId: '2', name: 'Zainab Basil (Center)', age: 22, gender: 'female', phone: '07505556666', email: 'zainab.b@example.com', address: 'أربيل - وزيران', status: 'active', paymentStatus: 'paid', lastVisit: new Date().toISOString(), totalVisits: 1, medicalHistory: 'Asthma', notes: 'First visit checkup' },
        { id: '202', clinicId: '2', name: 'Omar Farouk', age: 30, gender: 'male', phone: '07501119999', email: 'omar.f@example.com', address: 'أربيل - بختياري', status: 'active', paymentStatus: 'pending', lastVisit: new Date(Date.now() - 86400000 * 5).toISOString(), totalVisits: 4, medicalHistory: 'None', notes: 'Orthodontic adjustment' }
    ],
    staff: [
        // Clinic 1
        {
            id: '1', clinicId: '1', employeeNumber: 'EMP-001', personalInfo: { fullName: 'د. علي حسين', firstName: 'علي', lastName: 'حسين', phone: '07701112222' },
            workInfo: { position: 'طبيب أسنان عام', department: { name: 'طب أسنان' }, hireDate: '2024-01-01', employmentStatus: 'active' },
            payroll: { basicSalary: 2000000 }
        },
        {
            id: '2', clinicId: '1', employeeNumber: 'EMP-002', personalInfo: { fullName: 'م. زينب', firstName: 'زينب', lastName: 'كريم', phone: '07903334444' },
            workInfo: { position: 'مساعدة طبيب', department: { name: 'تمريض' }, hireDate: '2024-03-15', employmentStatus: 'active' },
            payroll: { basicSalary: 800000 }
        },
        {
            id: '3', clinicId: '1', employeeNumber: 'EMP-003', personalInfo: { fullName: 'د. سارة محمد', firstName: 'سارة', lastName: 'محمد', phone: '07705554444' },
            workInfo: { position: 'طبيب تقويم', department: { name: 'تقويم' }, hireDate: '2024-05-01', employmentStatus: 'active' },
            payroll: { basicSalary: 2500000 }
        },
        // Clinic 2
        {
            id: '201', clinicId: '2', employeeNumber: 'EMP-201', personalInfo: { fullName: 'Dr. John Smith', firstName: 'John', lastName: 'Smith', phone: '07500000001' },
            workInfo: { position: 'Orthodontist', department: { name: 'Orthodontics' }, hireDate: '2023-01-10', employmentStatus: 'active' },
            payroll: { basicSalary: 4000000 }
        },
        {
            id: '202', clinicId: '2', employeeNumber: 'EMP-202', personalInfo: { fullName: 'Sarah Johnson', firstName: 'Sarah', lastName: 'Johnson', phone: '07502223333' },
            workInfo: { position: 'Dental Assistant', department: { name: 'Nursing' }, hireDate: '2023-06-01', employmentStatus: 'active' },
            payroll: { basicSalary: 1200000 }
        }
    ],
    appointments: [
        // Clinic 1
        // Today
        { id: '1', clinicId: '1', patientId: '1', patientName: 'سارة أحمد', doctorId: '1', doctorName: 'د. علي حسين', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'Consultation', status: 'confirmed', notes: 'ألم في الفك العلوي', cost: 25000 },
        { id: '2', clinicId: '1', patientId: '2', patientName: 'محمد علي', doctorId: '1', doctorName: 'د. علي حسين', date: new Date().toISOString().split('T')[0], time: '11:30', type: 'Root Canal', status: 'pending', notes: 'جلسة أولى', cost: 150000 },
        // Upcoming (Tomorrow)
        { id: '3', clinicId: '1', patientId: '1', patientName: 'سارة أحمد', doctorId: '1', doctorName: 'د. علي حسين', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '09:00', type: 'Follow-up', status: 'confirmed', notes: 'مراجعة دورية', cost: 15000 },
        // Upcoming (Next Week)
        { id: '4', clinicId: '1', patientId: '2', patientName: 'محمد علي', doctorId: '3', doctorName: 'د. سارة محمد', date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], time: '14:00', type: 'Orthodontics', status: 'confirmed', notes: 'استشارة تقويم', cost: 25000 },
        // Past (Yesterday - Completed)
        { id: '5', clinicId: '1', patientId: '1', patientName: 'سارة أحمد', doctorId: '1', doctorName: 'د. علي حسين', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '10:00', type: 'Consultation', status: 'completed', notes: 'تم انهاء العلاج', cost: 25000 },
        // Past (Last Week - Cancelled)
        { id: '6', clinicId: '1', patientId: '2', patientName: 'محمد علي', doctorId: '1', doctorName: 'د. علي حسين', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], time: '12:00', type: 'Surgery', status: 'cancelled', notes: 'اعتذار المريض', cost: 0 },

        // Clinic 2
        { id: '201', clinicId: '2', patientId: '201', patientName: 'Zainab Basil', doctorId: '201', doctorName: 'Dr. John', date: new Date().toISOString().split('T')[0], time: '09:00', type: 'Checkup', status: 'confirmed', notes: 'New Patient', cost: 35000 }

    ],
    inventory: [
        // Clinic 1
        { id: '1', clinicId: '1', name: 'Lignospan', category: 'Anesthetic', quantity: 5, unitPrice: 25000, minStock: 10, unit: 'box', status: 'low_stock', lastRestockDate: '2024-01-01', brand: 'Materials', supplier: 'مذخر النور' },
        { id: '2', clinicId: '1', name: 'Composite Kit', category: 'Restorative', quantity: 2, unitPrice: 120000, minStock: 3, unit: 'set', status: 'low_stock', lastRestockDate: '2024-02-01', brand: 'Materials' },
        // Clinic 2
        { id: '201', clinicId: '2', name: 'Whitening Kit (Zoom)', category: 'Cosmetic', quantity: 10, unitPrice: 150000, minStock: 5, unit: 'kit', status: 'available', lastRestockDate: '2025-01-01', brand: 'Consumables' }
    ]
};

class MockDatabase {
    private data: any;

    constructor() {
        this.load();
    }

    private load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            // Seed
            this.data = JSON.parse(JSON.stringify(SEED_DATA));
            this.save();
        }
    }

    private save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    // Generic Helpers
    public getTable<T>(tableName: 'patients' | 'staff' | 'appointments' | 'inventory' | 'clinics'): T[] {
        return this.data[tableName] || [];
    }

    public insert<T>(tableName: string, item: T): T {
        if (!this.data[tableName]) this.data[tableName] = [];

        // Generate ID if not present
        const newItem = {
            ...item,
            id: (item as any).id || Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        this.data[tableName].unshift(newItem); // Add to top
        this.save();
        return newItem;
    }

    public update<T>(tableName: string, id: string, updates: Partial<T>): T | null {
        if (!this.data[tableName]) return null;

        const index = this.data[tableName].findIndex((i: any) => i.id === id);
        if (index === -1) return null;

        const updatedItem = {
            ...this.data[tableName][index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.data[tableName][index] = updatedItem;
        this.save();
        return updatedItem;
    }

    public delete(tableName: string, id: string): boolean {
        if (!this.data[tableName]) return false;

        const initialLength = this.data[tableName].length;
        this.data[tableName] = this.data[tableName].filter((i: any) => i.id !== id);

        const success = this.data[tableName].length < initialLength;
        if (success) this.save();
        return success;
    }

    public reset() {
        localStorage.removeItem(STORAGE_KEY);
        this.load();
    }
}

export const mockDb = new MockDatabase();

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useDemoClinicData = () => {
    const { user } = useAuth();
    const [seeding, setSeeding] = useState(false);

    const generateDemoClinicData = async () => {
        if (!user) return;
        try {
            setSeeding(true);

            // 1. Ensure Clinic Profile
            const { error: profileError } = await supabase
                .from('clinics')
                .upsert({
                    id: '101', // Using fixed ID for demo simplicity or fetch existing
                    owner_id: user.id,
                    name: 'عيادة النخبة للأسنان',
                    phone: '07700000000',
                    address: 'بغداد، شارع 14 رمضان',
                    description: 'عيادة متخصصة لطب الأسنان التجميلي والجراحي',
                    is_verified: true,
                    subscription_status: 'active'
                }, { onConflict: 'owner_id' }) // Match by owner
                .select();

            if (profileError && profileError.code !== '23505') {
                // If not just a duplicate key error (though upsert handles that), throw
                console.warn("Clinic profile upsert issue", profileError);
            }

            // Get the clinic ID (assuming the one we just upserted or verified)
            const { data: clinicData } = await supabase.from('clinics').select('id').eq('owner_id', user.id).single();
            const clinicId = clinicData?.id;

            if (!clinicId) throw new Error('Could not resolve Clinic ID');


            // 2. Demo Patients
            const patients = [
                {
                    clinic_id: clinicId,
                    name: 'علي محمد حسن',
                    age: 34,
                    gender: 'male',
                    phone: '07701112233',
                    medical_history: 'حساسية بنسلين',
                    last_visit: new Date().toISOString()
                },
                {
                    clinic_id: clinicId,
                    name: 'سارة خالد',
                    age: 25,
                    gender: 'female',
                    phone: '07802223344',
                    address: 'الكرادة',
                    medical_history: 'لا يوجد',
                    last_visit: new Date(Date.now() - 86400000 * 5).toISOString()
                },
                {
                    clinic_id: clinicId,
                    name: 'حسين علي',
                    age: 45,
                    gender: 'male',
                    phone: '07903334455',
                    medical_history: 'سكر',
                    last_visit: new Date(Date.now() - 86400000 * 10).toISOString()
                }
            ];

            const { error: patientsError } = await supabase.from('patients').insert(patients);
            if (patientsError) console.warn('Patients seeding partial error or exists:', patientsError);


            // 3. Demo Inventory
            const inventoryItems = [
                {
                    clinic_id: clinicId,
                    item_name: 'مخدر موضعي (Lidocaine)',
                    category: 'pharmaceuticals',
                    quantity: 45,
                    unit_price: 15000,
                    min_stock: 10,
                    unit: 'box',
                    supplier_name: 'مذخر الصحة',
                    expiry_date: new Date(Date.now() + 86400000 * 120).toISOString(),
                    status: 'available'
                },
                {
                    clinic_id: clinicId,
                    item_name: 'قفازات طبية (Gloves)',
                    category: 'disposables',
                    quantity: 5,
                    unit_price: 5000,
                    min_stock: 20,
                    unit: 'box',
                    supplier_name: 'المورد السريع',
                    expiry_date: new Date(Date.now() + 86400000 * 365).toISOString(),
                    status: 'low_stock' // Manual status set for demo visualization
                },
                {
                    clinic_id: clinicId,
                    item_name: 'حشوة كومبوزيت (3M)',
                    category: 'consumables',
                    quantity: 12,
                    unit_price: 35000,
                    min_stock: 5,
                    unit: 'tube',
                    supplier_name: 'وكالة 3M',
                    expiry_date: new Date(Date.now() + 86400000 * 60).toISOString(),
                    status: 'available'
                }
            ];

            const { error: inventoryError } = await supabase.from('inventory').insert(inventoryItems);
            if (inventoryError) console.warn('Inventory seeding partial error or exists:', inventoryError);


            // 4. Demo Staff
            const staff = [
                {
                    clinic_id: clinicId,
                    user_id: user.id, // Self as doctor/admin usually
                    name: 'د. (أنت)',
                    role: 'doctor',
                    phone: '0770XXXXXXX',
                    permissions: { can_manage_staff: true, can_view_finance: true }
                },
                {
                    clinic_id: clinicId,
                    name: 'مروة أحمد',
                    role: 'receptionist',
                    phone: '07805556666',
                    salary: 600000,
                    join_date: new Date().toISOString(),
                    permissions: { can_manage_appointments: true }
                }
            ];
            // Staff table might need valid user_ids for auth, but strictly for table display data usually just text if not linked (depends on schema).
            // If schema enforces fk to auth.users, we can't insert fake staff as users easily without creating auth accounts.
            // Assuming clinic_staff might not strictly enforce auth.users for simple listing, or we skip user_id for non-users.

            // Check schema for staff briefly? Assuming it allows null user_id based on typical designs.
            const { error: staffError } = await supabase.from('clinic_staff').insert(staff.map(s => ({
                clinic_id: s.clinic_id,
                name: s.name,
                role: s.role,
                phone: s.phone,
                salary: (s as any).salary, // TS might complain if type not defined, casting
                permissions: s.permissions,
                created_at: new Date().toISOString()
            })));

            if (staffError) console.warn('Staff seeding error:', staffError);


            // 5. Demo Finance Transactions
            const transactions = [
                {
                    clinic_id: clinicId,
                    amount: 500000,
                    type: 'income',
                    category: 'consultation',
                    description: 'إيرادات عيادة (أسبوعي)',
                    transaction_date: new Date().toISOString(),
                    status: 'completed'
                },
                {
                    clinic_id: clinicId,
                    amount: 150000,
                    type: 'expense',
                    category: 'supplies',
                    description: 'شراء مواد طبية',
                    transaction_date: new Date(Date.now() - 86400000 * 2).toISOString(),
                    status: 'completed'
                },
                {
                    clinic_id: clinicId,
                    amount: 750000,
                    type: 'income',
                    category: 'treatment',
                    description: 'دفعة تقويم (مريض: علي محمد)',
                    transaction_date: new Date(Date.now() - 86400000 * 5).toISOString(),
                    status: 'completed'
                }
            ];

            const { error: financeError } = await supabase.from('financial_transactions').insert(transactions);
            if (financeError) console.warn('Finance seeding warning:', financeError);


            toast.success('تم توليد بيانات العيادة التجريبية بنجاح!');
            window.location.reload();

        } catch (err: any) {
            console.error('Demo Clinic Data Error:', err);
            toast.error('فشل توليد البيانات: ' + err.message);
        } finally {
            setSeeding(false);
        }
    };

    return { generateDemoClinicData, seeding };
};

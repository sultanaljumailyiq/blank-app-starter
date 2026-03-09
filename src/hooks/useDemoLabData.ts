import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useDemoLabData = () => {
    const { user } = useAuth();
    const [seeding, setSeeding] = useState(false);

    const generateDemoUnidata = async () => {
        if (!user) return;
        try {
            setSeeding(true);

            // 1. Ensure Lab Profile Exists
            const { error: profileError } = await supabase
                .from('dental_laboratories')
                .upsert({
                    id: user.id,
                    user_id: user.id,
                    name: 'مختبر الابتسامة المتقدم',
                    owner_name: user.email?.split('@')[0] || 'المدير',
                    phone: '07701234567',
                    address: 'بغداد، شارع فلسطين',
                    price_list_url: null,
                    working_hours: '9:00 ص - 9:00 م',
                    response_time: '24 ساعة'
                });

            if (profileError) throw profileError;

            // 2. Create Demo Representatives
            const reps = [
                {
                    laboratory_id: user.id,
                    name: 'علي حسين',
                    phone: '07705554444',
                    status: 'available',
                    current_location: 'الكرادة'
                },
                {
                    laboratory_id: user.id,
                    name: 'محمد كاظم',
                    phone: '07809998888',
                    status: 'busy',
                    current_location: 'المنصور'
                }
            ];

            const { data: insertedReps, error: repsError } = await supabase
                .from('dental_lab_representatives')
                .upsert(reps, { onConflict: 'id' }) // Just insert, or upsert if we had IDs. For new data, insert is fine, user can clear DB if needed.
                .select();

            if (repsError) {
                // Ignore unique violation if just strictly adding
                console.warn('Representatives might already exist', repsError);
            }

            // 3. Create Services (Real Table)
            const services = [
                { lab_id: user.id, name: 'تاج زركون (Zirconia)', category: 'fixed', base_price: 45000, is_active: true },
                { lab_id: user.id, name: 'تاج E-Max', category: 'fixed', base_price: 65000, is_active: true },
                { lab_id: user.id, name: 'طقم جزئي مرن', category: 'removable', base_price: 150000, is_active: true },
                { lab_id: user.id, name: 'واقي ليلي (Night Guard)', category: 'ortho', base_price: 35000, is_active: true }
            ];

            const { error: servicesError } = await supabase.from('lab_services').insert(services);
            if (servicesError) console.warn('Services seeding warning:', servicesError);

            // Also keep profile update for legacy compatibility if needed
            await supabase.from('dental_laboratories').update({ specialties: ['Fixed', 'Removable'] }).eq('id', user.id);


            // 4. Create Fake Orders
            // We need valid clinic_id or patient_id often. For demo, we might skip relations or use a dummy ID.
            // Ideally, we insert into `dental_lab_orders`.

            const demoOrders = [
                {
                    laboratory_id: user.id,
                    clinic_id: user.id, // Self-referencing if acts as clinic too, or just mock
                    patient_name: 'سعاد أحمد',
                    service_name: 'تاج زركون (Zirconia)',
                    work_type: 'تاج',
                    shade: 'A2',
                    status: 'pending',
                    priority: 'normal',
                    order_date: new Date().toISOString(),
                    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
                    notes: 'يرجى الانتباه للحواف',
                    price: 45000
                },
                {
                    laboratory_id: user.id,
                    clinic_id: user.id,
                    patient_name: 'عمر فاروق',
                    service_name: 'طقم جزئي مرن',
                    work_type: 'طقم',
                    shade: 'Pink',
                    status: 'in_progress',
                    priority: 'high',
                    order_date: new Date(Date.now() - 86400000).toISOString(),
                    due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
                    notes: 'Upper Jaw',
                    price: 150000
                },
                {
                    laboratory_id: user.id,
                    clinic_id: user.id,
                    patient_name: 'نور الهدى',
                    service_name: 'تاج E-Max',
                    work_type: 'فينير',
                    shade: 'BL1',
                    status: 'completed',
                    priority: 'urgent',
                    order_date: new Date(Date.now() - 86400000 * 5).toISOString(),
                    due_date: new Date(Date.now() - 86400000).toISOString(),
                    notes: 'تجميلي',
                    price: 65000
                }
            ];

            const { error: ordersError } = await supabase
                .from('dental_lab_orders')
                .insert(demoOrders);

            if (ordersError) throw ordersError;

            toast.success('تم توليد بيانات المختبر التجريبية بنجاح!');
            window.location.reload();

        } catch (err: any) {
            console.error('Demo Lab Data Error:', err);
            toast.error('فشل توليد البيانات: ' + err.message);
        } finally {
            setSeeding(false);
        }
    };

    return { generateDemoUnidata, seeding };
};

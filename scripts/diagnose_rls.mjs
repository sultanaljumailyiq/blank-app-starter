import { createClient } from '@supabase/supabase-js';

const url = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const srKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';
const supabase = createClient(url, srKey);

async function diagnose() {
    // 1. Get an order
    const { data: orders } = await supabase.from('dental_lab_orders').select('*').limit(1).eq('status', 'pending');
    if (!orders?.length) return console.log('No pending orders');

    const order = orders[0];
    console.log('Order clinic_id:', order.clinic_id);

    // 2. See who owns this clinic
    const { data: clinics } = await supabase.from('clinics').select('owner_id').eq('id', order.clinic_id);
    console.log('Clinic owner_id:', clinics?.[0]?.owner_id);

    // 3. Check clinic members
    const { data: members } = await supabase.from('clinic_members').select('user_id').eq('clinic_id', order.clinic_id);
    console.log('Clinic members:', members?.map(m => m.user_id));

    // 4. Find the profile of the doctor who created it (if we have a doctor_id)
    console.log('Order doctor_id:', order.doctor_id);
}
diagnose();

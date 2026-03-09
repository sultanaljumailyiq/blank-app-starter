import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use Service Key for admin deletions

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedCleanDemo() {
    console.log('🌱 Starting Clean Seed for Clinics 101 & 102...');

    const clinics = [101, 102];

    for (const clinicId of clinics) {
        console.log(`\nProcessing Clinic ${clinicId}...`);

        // 1. Seed Patients
        console.log('   - Seeding Patients...');
        const patients = Array.from({ length: 8 }).map((_, i) => ({
            clinic_id: clinicId,
            full_name: `Patient ${clinicId}-${i + 1}`,
            phone: `0770${clinicId}${i.toString().padStart(4, '0')}`,
            age: 20 + i * 2,
            gender: i % 2 === 0 ? 'male' : 'female',
            teeth_condition: {},
            medical_history: []
        }));

        const { data: insertedPatients, error: patError } = await supabase
            .from('patients')
            .upsert(patients, { onConflict: 'phone' }) // Simple conflict avoid
            .select();

        if (patError) console.error('Error seeding patients:', patError);


        // 2. Seed Appointments (Past & Future)
        if (insertedPatients && insertedPatients.length > 0) {
            console.log('   - Seeding Appointments...');
            const appointments = insertedPatients.map((pat, i) => {
                const isPast = i < 4;
                const date = new Date();
                date.setDate(date.getDate() + (isPast ? -i : i)); // +/- days

                return {
                    clinic_id: clinicId,
                    patient_id: pat.id,
                    patient_name: pat.full_name,
                    date: date.toISOString().split('T')[0],
                    time: '10:00',
                    status: isPast ? 'completed' : 'scheduled',
                    type: 'checkup',
                    duration: 30
                };
            });

            const { error: aptError } = await supabase.from('appointments').insert(appointments);
            if (aptError) console.error('Error seeding appointments:', aptError);
        }

        // 3. Seed Transactions (Revenue)
        console.log('   - Seeding Transactions...');
        const transactions = Array.from({ length: 15 }).map((_, i) => ({
            clinic_id: clinicId,
            amount: (i + 1) * 25000,
            type: i % 3 === 0 ? 'expense' : 'income', // More income than expense
            category: i % 3 === 0 ? 'supplies' : 'treatment',
            date: new Date().toISOString().split('T')[0],
            description: i % 3 === 0 ? 'Purchase Supplies' : 'Dental Treatment'
        }));

        const { error: transError } = await supabase.from('financial_transactions').insert(transactions);
        if (transError) console.error('Error seeding transactions:', transError);
    }

    console.log('\n✅ Seeding Complete!');
}

seedCleanDemo().catch(console.error);

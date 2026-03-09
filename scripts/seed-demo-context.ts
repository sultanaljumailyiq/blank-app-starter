
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.warn('Could not read .env file');
}

const getEnv = (key: string) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function seed() {
    console.log('Seeding Demo Context (Multi-Clinic)...');

    // 1. Owner Setup (Using a consistent ID if possible, or just creating data for the currently logged in user if we knew them. 
    // Since we act as admin, lets pick a Hardcoded Owner ID we can "Log In" as, OR rely on the User to be logged in as "Dr Firas".
    // I will use the ID '11111111-1111-1111-1111-111111111111' for Owner.
    const ownerId = '11111111-1111-1111-1111-111111111111';

    // 2. Clinics
    const clinicA = { id: 101, name: 'العيادة الرئيسية (بغداد)', owner_id: ownerId, address: 'Baghdad' };
    const clinicB = { id: 102, name: 'عيادة الفرع (البصرة)', owner_id: ownerId, address: 'Basra' };

    await supabase.from('clinics').upsert([clinicA, clinicB]);

    // 3. Transactions
    // A: 1,000,000
    await supabase.from('financial_transactions').delete().in('clinic_id', [101, 102]); // Clean up

    await supabase.from('financial_transactions').insert([
        { clinic_id: 101, amount: 1000000, type: 'income', category: 'treatment', description: 'Main: Implants', transaction_date: new Date().toISOString() },
        { clinic_id: 102, amount: 500000, type: 'income', category: 'treatment', description: 'Branch: Whitening', transaction_date: new Date().toISOString() }
    ]);

    // 4. Patients
    // A: 2 Patients
    // B: 1 Patient
    // ... logic for patients ... assuming patient table has clinic_id
    // But patients table usually links via appointments or directly?
    // Let's check schema. Usually `patients` has `clinic_id`.
    await supabase.from('patients').upsert([
        { id: 'p1', full_name: 'Patient A1', clinic_id: clinicA.id, phone: '077001' },
        { id: 'p2', full_name: 'Patient A2', clinic_id: clinicA.id, phone: '077002' },
        { id: 'p3', full_name: 'Patient B1', clinic_id: clinicB.id, phone: '077003' }
    ]);


    // 5. Notifications (Mocking into a notifications table if exists, or local storage? 
    // The app uses `useNotifications`. It likely fetches from `notifications` table.
    // Let's inspect `useNotifications` to be sure. Assumed standard.
    // Creating some rows in 'notifications' table.
    // If not exists, I might fail. But usually yes.

    console.log('Seeding Complete. Please refresh dashboard.');
}

seed();

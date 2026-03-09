
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.warn('Could not read .env file, trying process.env');
}

const getEnv = (key: string) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting Phase 2 Seed...');

    // 1. Create Owner (Dr. Firas) - Assuming he exists or we use ID
    // Lets use a fixed ID for Owner
    const ownerId = '11111111-1111-1111-1111-111111111111'; // Mock ID
    // 2. Create Staff (Dr. Ali)
    const staffId = '22222222-2222-2222-2222-222222222222';

    // Ideally we register them properly, but for speed lets insert into profiles if they don't exist
    // Note: Inserting into auth.users is blocked via client. We must use SignUp.
    // So we will just print what to do, or rely on existing users.
    // Let's assume the user currently logged in is the OWNER.
    // And we will create a SECOND user for Staff if possible, but we can't switch easily.

    // Let's just create Data tied to "Clinic A" and "Clinic B".
    // Clinic A (Owner Only)
    const clinicA = {
        name: 'Smile Center (Owner Only)',
        owner_id: ownerId,
        address: 'Baghdad',
        phone: '07700000001'
    };

    // Clinic B (Shared)
    const clinicB = {
        name: 'Firas Dental (Shared)',
        owner_id: ownerId,
        address: 'Baghdad',
        phone: '07700000002'
    };

    const { data: cA } = await supabase.from('clinics').upsert(clinicA).select().single();
    const { data: cB } = await supabase.from('clinics').upsert(clinicB).select().single();

    if (!cA || !cB) {
        console.error('Failed to create clinics');
        return;
    }

    console.log(`Clinic A: ${cA.id} (Owner Only)`);
    console.log(`Clinic B: ${cB.id} (Shared)`);

    // Add Staff to Clinic B
    // We need a valid 'staff' user. 
    // Since we can't create one easily without email/pass workflow, 
    // WE WILL JUST INSERT DATA and ask user to test with their current account acting as Owner.
    // Then hypothetically if they have a staff account, they could test.

    // 3. Transactions
    // Clinic A: 1,000,000
    await supabase.from('financial_transactions').insert({
        clinic_id: cA.id,
        amount: 1000000,
        type: 'income',
        category: 'treatment',
        description: 'Implants',
        transaction_date: new Date().toISOString()
    });

    // Clinic B: 500,000
    await supabase.from('financial_transactions').insert({
        clinic_id: cB.id,
        amount: 500000,
        type: 'income',
        category: 'treatment',
        description: 'Cleaning',
        transaction_date: new Date().toISOString()
    });

    console.log('Transactions created.');
    console.log('Owner should see Total: 1,500,000');
    console.log('Staff of Clinic B should see Total: 500,000');
}

seed();

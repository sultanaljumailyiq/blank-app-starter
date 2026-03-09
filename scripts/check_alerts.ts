
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlerts() {
    // Check patient with ID 1 as requested or just list some patients to find one with alerts
    const { data, error } = await supabase
        .from('patients')
        .select('id, medical_history')
        .limit(5);

    if (error) {
        console.error('Error fetching patients:', error);
        return;
    }

    console.log('Patients Medical History Data:');
    data.forEach(p => {
        console.log(`Patient ID: ${p.id}`);
        console.log(JSON.stringify(p.medical_history, null, 2));
    });
}

checkAlerts();


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

async function verifySchema() {
    console.log('Verifying Schema...');

    // 1. Check Clinics Table Columns
    const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('id, is_featured, is_digital_booking, settings, latitude, longitude')
        .limit(1);

    if (clinicError) {
        console.error('❌ Error assessing clinics table:', clinicError.message);
    } else {
        console.log('✅ Clinics table has required columns (is_featured, is_digital_booking, settings, latitude, longitude)');
    }

    // 2. Check Activity Logs Table Columns
    const { data: logData, error: logError } = await supabase
        .from('activity_logs')
        .select('id, clinic_id')
        .limit(1);

    if (logError) {
        // If error is "column does not exist", it will show here
        console.error('❌ Error assessing activity_logs table:', logError.message);
    } else {
        console.log('✅ Activity_logs table has required columns (clinic_id)');
    }
}

verifySchema();

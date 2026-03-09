
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Checking Financial Transactions ---');
    const { data: trans, error: transError } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (transError) console.error('Error fetching transactions:', transError);
    else console.table(trans);

    console.log('\n--- Checking Appointments ---');
    const { data: apts, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (aptError) console.error('Error fetching appointments:', aptError);
    else console.table(apts);
}

checkData();

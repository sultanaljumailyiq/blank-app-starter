const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectForeignKeys() {
    console.log('Inspecting foreign keys for financial_transactions...');

    // Query to get foreign key information from information_schema
    // Note: Standard Postgres query via RPC would be ideal, but we might not have a helper.
    // We can try to infer from a failed query or just list columns.

    // Let's try to just select from information_schema via a raw query if possible, 
    // but supabase-js client doesn't support raw SQL easily without RPC.

    // Alternative: List all columns and try to guess.
    const { data: columns, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching columns:', error);
    } else if (columns && columns.length > 0) {
        console.log('Columns in financial_transactions:', Object.keys(columns[0]));
        // Verify if there are multiple columns looking like patient_id
    } else {
        console.log('No rows found, cannot inspect columns easily this way.');
    }

    // Checking if we can just trigger the error again to see details?
    // The error message was: "more than one relationship found for 'financial_transactions' and 'patients'"

    // Attempting to replicate the error to see if we can get more info (or just testing fixes)
    // One common cause is having both 'patient_id' and another FK to patients.

    console.log('Checking for multiple patient relationships...');
    // We suspect 'patient_id' is one. Is there another? 
    // Maybe 'bill_to_patient_id' or similar?
    // Or maybe a legacy column?
}

inspectForeignKeys();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        // Check columns of tooth_treatment_plans
        const { data, error } = await supabase
            .from('tooth_treatment_plans')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error fetching tooth_treatment_plans:", error);
        } else {
            console.log("Columns in 'tooth_treatment_plans':", data.length > 0 ? Object.keys(data[0]) : "No data to infer columns (need to query information_schema if empty)");
        }

        // Fallback: query via RPC or just attempt a dummy insert to get schema error, or we can just use the known structure if valid.
        // Let's try to get it from information_schema via a postgres function if it exists, or just print the first row keys.
    } catch (err) {
        console.error("Exception:", err);
    }
}

checkSchema();

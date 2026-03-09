
import { createClient } from '@supabase/supabase-js';

// Hardcoded for debugging
const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRelations() {
    console.log('--- Checking Lab ID Relations ---');

    // 1. Get the lab
    const { data: labs } = await supabase.from('dental_laboratories').select('*').limit(1);
    if (!labs || labs.length === 0) {
        console.log('No labs found to check.');
        return;
    }
    const lab = labs[0];
    console.log('Lab ID:', lab.id);
    console.log('Lab User ID:', lab.user_id);

    // 2. Check if Lab ID exists in Profiles
    // Note: we can't query profiles easily if RLS is strict, but we can try count
    const { count: profileCountVals } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('id', lab.id);
    console.log(`Does Lab ID (${lab.id}) exist in Profiles?`, profileCountVals ? 'Yes' : 'No (or RLS hidden)');

    // 3. Check if Lab User ID exists in Profiles
    if (lab.user_id) {
        const { count: userProfileCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('id', lab.user_id);
        console.log(`Does Lab User ID (${lab.user_id}) exist in Profiles?`, userProfileCount ? 'Yes' : 'No (or RLS hidden)');
    }

    // 4. Check doctor_saved_labs definition (infer from error on insert)
    // We can't insert without auth, so we just inferred from migration file earlier.
    // Migration 012 said: lab_id UUID REFERENCES profiles(id)
}

checkRelations();

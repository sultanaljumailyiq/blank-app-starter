
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking Schema Types ---');

    // Try filtering clinic_members by INTEGER 1
    const { error: intError } = await supabase.from('clinic_members').select('*').eq('clinic_id', 1).limit(1);
    if (intError) {
        console.log('Filter by INT failed:', intError.message);
    } else {
        console.log('Filter by INT succeeded -> clinic_id is likely INTEGER');
    }

    // Try filtering by UUID
    const { error: uuidError } = await supabase.from('clinic_members').select('*').eq('clinic_id', '00000000-0000-0000-0000-000000000000').limit(1);
    if (uuidError) {
        console.log('Filter by UUID failed:', uuidError.message);
    } else {
        console.log('Filter by UUID succeeded -> clinic_id is likely UUID (or text)');
    }
}

checkSchema();


import { createClient } from '@supabase/supabase-js';

// Hardcoded for debugging purposes
const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyLabs() {
    console.log('--- Verifying dental_laboratories Access (Anon/Default) ---');

    // 1. Check if we can select any lab
    const { data, error, count } = await supabase
        .from('dental_laboratories')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('ERROR fetching dental_laboratories:', error);
    } else {
        console.log(`SUCCESS: Fetched ${count} dental_laboratories.`);
        if (data && data.length > 0) {
            console.log('--- RAW LAB DATA ---');
            console.log(JSON.stringify(data[0], null, 2));
            console.log('--------------------');
        } else {
            console.log('WARNING: Request succeeded but returned 0 labs.');
        }
    }
}

verifyLabs();

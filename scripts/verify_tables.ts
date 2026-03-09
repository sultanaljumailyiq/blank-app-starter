
import { createClient } from '@supabase/supabase-js';

// Hardcoded for debugging
const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
    console.log('--- Verifying Tables ---');

    // 1. Check clinic_custom_labs
    const { error: error1 } = await supabase.from('clinic_custom_labs').select('id').limit(1);
    if (error1) console.error('clinic_custom_labs MISSING or Error:', error1.message);
    else console.log('clinic_custom_labs: OK');

    // 2. Check clinic_lab_favorites
    const { error: error2 } = await supabase.from('clinic_lab_favorites').select('id').limit(1);
    if (error2) console.error('clinic_lab_favorites MISSING or Error:', error2.message);
    else console.log('clinic_lab_favorites: OK');

    // 3. Check dental_lab_orders columns
    const { data: orderSample, error: error3 } = await supabase.from('dental_lab_orders').select('*').limit(1);
    if (error3) {
        console.error('dental_lab_orders Error:', error3.message);
    } else if (orderSample && orderSample.length > 0) {
        const keys = Object.keys(orderSample[0]);
        console.log('dental_lab_orders columns:', keys.join(', '));
        const hasCustomLabId = keys.includes('custom_lab_id');
        console.log('Has custom_lab_id?', hasCustomLabId ? 'YES' : 'NO');
    } else {
        console.log('dental_lab_orders: OK (Empty table, cannot check columns easily via SELECT *)');
    }
}

verifyTables();

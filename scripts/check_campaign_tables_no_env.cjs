const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = ['promotional_cards', 'deal_requests', 'store_coupons', 'products'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.log(`Table '${table}': ERROR - ${error.message}`);
        } else {
            console.log(`Table '${table}': EXISTS`);
        }
    }

    // Check default promo cards count
    const { count } = await supabase.from('promotional_cards').select('*', { count: 'exact', head: true });
    console.log(`Promo Cards Count: ${count}`);
}

checkTables();

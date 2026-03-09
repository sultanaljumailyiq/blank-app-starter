const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking tables...');
    const tables = ['store_orders', 'orders', 'messages', 'favorites'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        // Note: RLS might cause error or empty data. Error 404/PGRST205 means table missing/not exposed.
        if (error) {
            console.log(`Table '${table}': ERROR - ${error.message} (Code: ${error.code})`);
        } else {
            console.log(`Table '${table}': EXISTS`);
        }
    }
}

checkTables();

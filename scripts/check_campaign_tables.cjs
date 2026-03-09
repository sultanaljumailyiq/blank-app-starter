const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

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

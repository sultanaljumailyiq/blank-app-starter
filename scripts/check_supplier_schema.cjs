const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.from('suppliers').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Supplier Record Sample:', data[0]);
        if (data[0]) {
            console.log('Keys:', Object.keys(data[0]));
        }
    }
}

checkSchema();


const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const client = createClient(supabaseUrl, supabaseKey);

async function checkOrtho() {
    const { data, error } = await client
        .from('treatments')
        .select('*')
        .ilike('name', '%تقويم%');

    if (error) console.error(error);
    else console.log('Ortho Treatments:', data);
}

checkOrtho();

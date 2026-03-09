const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try { envContent = fs.readFileSync(envPath, 'utf-8'); } catch (e) { }
const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY'));

async function checkProductFlags() {
    console.log('--- Checking Product Flags ---');
    const { data: products } = await supabase.from('products').select('*');
    if (!products) return;

    products.forEach(p => {
        console.log(`[${p.name}] featured: ${p.is_featured}, discount: ${p.discount}`);
    });
}
checkProductFlags();

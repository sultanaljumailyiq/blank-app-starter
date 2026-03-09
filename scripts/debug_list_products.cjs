const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try { envContent = fs.readFileSync(envPath, 'utf-8'); } catch (e) { }
const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY'));

async function listProducts() {
    console.log('--- Listing All Products in DB ---');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, is_active, supplier_id, created_at');

    if (error) {
        console.error('Error fetching products:', error.message);
        return;
    }

    if (!products || products.length === 0) {
        console.log('NO PRODUCTS FOUND IN DATABASE.');
    } else {
        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`- [${p.id}] ${p.name} (Active: ${p.is_active})`);
        });
    }
}

listProducts();

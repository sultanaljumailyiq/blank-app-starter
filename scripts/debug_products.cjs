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

async function checkProduct() {
    const productId = 'a196f4e8-7d2f-47e7-b87d-47bf68b8f234';
    console.log(`--- Checking Product ${productId} (ANON ROLE) ---`);

    // 1. Check specific product
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching product:', error);
    } else if (!product) {
        console.error('Product NOT FOUND with Anon Key.');
    } else {
        console.log('Product Found:');
        console.log(`- Name: ${product.name}`);
        console.log(`- Active: ${product.is_active}`);
        console.log(`- Supplier ID: ${product.supplier_id}`);
    }

    // 2. Count all visible products
    const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    console.log(`Total Visible Products (Anon): ${count}`);
}

checkProduct();

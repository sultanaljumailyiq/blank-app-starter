
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env to avoid dotenv dependency
const envPath = path.resolve(__dirname, '.env');
let envConfig = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envConfig[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
        }
    });
} catch (e) {
    console.warn('Could not read .env file');
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking store_orders ---');
    const { data: orders, error: oError } = await supabase.from('store_orders').select('*').limit(1);
    if (oError) console.error('Error fetching store_orders:', oError);
    else if (orders && orders.length > 0) console.log('Sample store_order keys:', Object.keys(orders[0]));
    else console.log('store_orders is empty.');

    console.log('\n--- Checking financial_transactions ---');
    const { data: txs, error: tError } = await supabase.from('financial_transactions').select('*').limit(1);
    if (tError) console.error('Error fetching financial_transactions:', tError);
    else if (txs && txs.length > 0) console.log('Sample transaction keys:', Object.keys(txs[0]));
    else console.log('financial_transactions is empty.');

    console.log('\n--- Checking total_sales in suppliers ---');
    const { data: supps, error: sError } = await supabase.from('suppliers').select('id, total_sales, pending_commission').limit(3);
    if (sError) console.error(sError);
    else console.table(supps);
}

checkSchema();

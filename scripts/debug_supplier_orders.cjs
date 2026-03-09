
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(__dirname, '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const envVars = envConfig.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
        acc[key.trim()] = value.trim();
    }
    return acc;
}, {});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Checking store_order_items schema...');
    // We can't easily check schema via JS client without inspection, but we can try to select item_status

    // Check orders count
    const { count, error: countError } = await supabase
        .from('store_orders')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('Error counting orders:', countError);
    else console.log('Total Store Orders:', count);

    // Try fetching one order with items including item_status
    console.log('Attempting to fetch one order with items...');
    const { data, error } = await supabase
        .from('store_orders')
        .select(`
            id,
            items:store_order_items (
                id,
                item_status
            )
        `)
        .limit(1);

    if (error) {
        console.error('Error fetching orders:', error);
        if (error.message.includes('item_status')) {
            console.error('LIKELY CAUSE: item_status column missing!');
        }
    } else {
        console.log('Successfully fetched order:', JSON.stringify(data, null, 2));
    }
}

run();

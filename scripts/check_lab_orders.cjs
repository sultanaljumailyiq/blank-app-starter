const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.join(__dirname, '../.env');
let env = {};
if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/["\r]/g, '');
            env[key] = val;
        }
    });
}

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'your-key';
console.log('Using Supabase URL:', supabaseUrl); // Debug
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    console.log('Checking dental_lab_orders...');

    const { data, error } = await supabase
        .from('dental_lab_orders')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} orders.`);
    if (data.length > 0) {
        console.log('First order sample:', JSON.stringify(data[0], null, 2));
        console.log('All IDs/Clinics:', data.map(o => ({ id: o.id, clinic: o.clinic_id, status: o.status })));
    } else {
        console.log('Table is empty.');
    }
}

checkOrders();

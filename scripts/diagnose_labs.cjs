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
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLabData() {
    console.log('--- Checking Labs ---');
    const { data: labs, error: labError } = await supabase
        .from('dental_laboratories')
        .select('id, name, user_id');

    if (labError) console.error('Lab Error:', labError);
    else console.table(labs);

    console.log('\n--- Checking Orders ---');
    const { data: orders, error: orderError } = await supabase
        .from('dental_lab_orders')
        .select('id, order_number, laboratory_id, status, created_at');

    if (orderError) console.error('Order Error:', orderError);
    else console.table(orders);

    console.log('\n--- Analysis ---');
    if (labs && orders) {
        orders.forEach(o => {
            const targetLab = labs.find(l => l.id === o.laboratory_id);
            if (targetLab) {
                console.log(`Order ${o.order_number} is sent to Lab: "${targetLab.name || targetLab.lab_name}" (Owner: ${targetLab.user_id})`);
            } else {
                console.log(`Order ${o.order_number} is sent to UNKNOWN Lab ID: ${o.laboratory_id}`);
            }
        });
    }
}

checkLabData();

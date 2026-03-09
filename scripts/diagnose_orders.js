
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env reader
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf-8').split('\n').reduce((acc, line) => {
        const [key, val] = line.split('=');
        if (key && val) acc[key.trim()] = val.trim();
        return acc;
    }, {})
    : {};

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const anonKey = envConfig.VITE_SUPABASE_ANON_KEY;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error('Missing keys');
    process.exit(1);
}

// Clients
const serviceClient = createClient(supabaseUrl, serviceKey);
const anonClient = createClient(supabaseUrl, anonKey);

async function check() {
    console.log("--- DIAGNOSIS START ---");

    // 1. Get a Supplier
    const { data: suppliers } = await serviceClient.from('suppliers').select('id, company_name').limit(1);
    const supplier = suppliers[0];

    if (!supplier) {
        console.log("No suppliers found.");
        return;
    }
    console.log(`Checking for Supplier: ${supplier.company_name} (${supplier.id})`);

    // 2. Fetch Orders via Service Role
    const { data: serviceOrders, error: sErr } = await serviceClient
        .from('store_orders')
        .select('id, supplier_id')
        .eq('supplier_id', supplier.id);

    if (sErr) console.error("Service Fetch Error:", sErr);
    else console.log(`Service Role found ${serviceOrders.length} orders.`);

    // 3. Fetch Orders via Anon Role
    const { data: anonOrders, error: aErr } = await anonClient
        .from('store_orders')
        .select('id, supplier_id')
        .eq('supplier_id', supplier.id);

    if (aErr) console.error("Anon Fetch Error:", aErr);
    else console.log(`Anon Role found ${anonOrders.length} orders.`);

    // 4. Conclusion
    if (serviceOrders.length > 0 && anonOrders.length === 0) {
        console.log("conclusion: RLS_Blocking_Anon");
    } else if (serviceOrders.length === 0) {
        console.log("conclusion: No_Orders_In_DB");
    } else {
        console.log("conclusion: Visible_To_All");
    }
}

check();

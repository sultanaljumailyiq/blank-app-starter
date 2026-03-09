
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
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- SUPPLIERS ---');
    const { data: suppliers, error: sError } = await supabase.from('suppliers').select('id, company_name');
    if (sError) console.error(sError);
    else console.table(suppliers);

    console.log('--- ORDERS ---');
    const { data: orders, error: oError } = await supabase.from('store_orders').select('id, order_number, supplier_id, total_amount');
    if (oError) console.error(oError);
    else console.table(orders);

    // Check mismatch
    if (suppliers && orders) {
        const supplierIds = new Set(suppliers.map(s => s.id));
        const mismatch = orders.filter(o => !supplierIds.has(o.supplier_id));
        if (mismatch.length > 0) {
            console.log('--- MISMATCHED ORDERS (supplier_id not in suppliers table) ---');
            console.table(mismatch);

            // Attempt to fix mismatch if there is only 1 supplier
            if (suppliers.length === 1 && mismatch.length > 0) {
                console.log(`Fixing ${mismatch.length} mismatched orders to link to supplier ${suppliers[0].id}...`);
                const { error: fixError } = await supabase
                    .from('store_orders')
                    .update({ supplier_id: suppliers[0].id })
                    .in('id', mismatch.map(o => o.id));

                if (fixError) console.error('Fix failed:', fixError);
                else console.log('✅ Fix successful! Orders re-linked.');
            }
        } else {
            console.log('✅ All orders have valid supplier_ids.');
        }
    }
}

checkData();

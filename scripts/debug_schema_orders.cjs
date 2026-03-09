
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking store_orders ---');
    const { data: orders, error: oError } = await supabase.from('store_orders').select('*').limit(3);
    if (oError) console.error('Error fetching store_orders:', oError);
    else if (orders && orders.length > 0) {
        console.log('Sample store_order keys:', Object.keys(orders[0]));
        console.log('Sample store_order supplier_id:', orders[0].supplier_id);
    } else console.log('store_orders is empty.');

    console.log('\n--- Checking financial_transactions ---');
    const { data: txs, error: tError } = await supabase.from('financial_transactions').select('*').limit(3);
    if (tError) console.error('Error fetching financial_transactions:', tError);
    else if (txs && txs.length > 0) {
        console.log('Sample transaction keys:', Object.keys(txs[0]));
        console.log('Sample transaction clinic_id:', txs[0].clinic_id);
    } else console.log('financial_transactions is empty.');

    console.log('\n--- Checking suppliers ---');
    const { data: supps, error: sError } = await supabase.from('suppliers').select('id, company_name').limit(3);
    if (sError) console.error(sError);
    else {
        console.log('Found suppliers:', supps.length);
        if (supps.length > 0) console.log('Sample supplier ID:', supps[0].id);
    }
}

checkSchema();

import { createClient } from '@supabase/supabase-js';

const url = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const srKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';

const supabase = createClient(url, srKey);

async function inspectDb() {
    // Try to find ANY delete policy
    console.log('Fetching policies directly...');
    try {
        const { data, error } = await supabase.from('dental_lab_orders').select('*').limit(1);
        console.log('Sample order exists?', !!data?.length);
    } catch (e) {
        console.log('err', e)
    }
}
inspectDb();

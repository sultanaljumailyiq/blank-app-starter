import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (key) {
    const supabase = createClient(url, key[1].trim());

    async function checkPolicies() {
        const { data, error } = await supabase.rpc('get_policies', { table_name: 'dental_lab_orders' });
        console.log('RPC Policies:', data, error);
    }
    checkPolicies();
} else {
    console.log('No service key, cannot read pg_policies directly easily via JS.');
}

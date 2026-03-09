import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);
async function run() {
    console.log("Fetching lab_services schema...");
    const { data, error } = await supabase.from('lab_services').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
    } else {
        if (data && data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("Table is empty, trying to insert a dummy record to get schema error details, or we can use RPC if available.");
        }
    }
}
run();

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function testDelete() {
    console.log('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'smart.dental2024@gmail.com',
        password: 'password'
    });

    if (authError) {
        console.error('Auth error:', authError.message);
        return;
    }

    console.log('Logged in as:', authData.user.id);

    // Find a pending order to delete
    const { data: orders, error: fetchErr } = await supabase
        .from('dental_lab_orders')
        .select('*')
        .eq('status', 'pending')
        .limit(1);

    if (fetchErr || !orders || orders.length === 0) {
        console.log('No pending orders found to test delete.');
        return;
    }

    const order = orders[0];
    console.log('Found order to delete:', order.id);

    // Attempt delete
    const { data: delData, error: delErr } = await supabase
        .from('dental_lab_orders')
        .delete()
        .eq('id', order.id)
        .select();

    console.log('Delete result data:', delData);
    console.log('Delete result error:', delErr);
}

testDelete();

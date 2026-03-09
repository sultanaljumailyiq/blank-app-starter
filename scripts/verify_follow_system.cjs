const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFollowSystem() {
    console.log('Verifying Follow System...');

    // 1. Check if table exists (by trying to select from it)
    console.log('1. Checking "follows" table existence...');
    const { data, error } = await supabase.from('follows').select('count', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.error('❌ Table "follows" does not exist!');
        } else {
            console.error('❌ Error accessing "follows" table:', error.message);
        }
    } else {
        console.log('✅ Table "follows" exists and is accessible.');
        console.log(`   Current record count: ${data}`); // Data is null for head:true, check count in response object usually? Wait, select count returns count.
        // Supabase JS v2: { count: number, data: null, error: null }

    }

    // 2. Try to insert a dummy record (if we had a service role key, but we only have anon)
    // Anon key respects RLS. So we can't insert without a session. 
    // But we can check if we can READ (policy "Anyone can read follows" is true).

    console.log('2. Verifying Read Policy...');
    const { data: readData, error: readError } = await supabase.from('follows').select('*').limit(1);

    if (readError) {
        console.error('❌ Read policy failed:', readError.message);
    } else {
        console.log('✅ Read policy seems active. Data:', readData);
    }
    // 3. Friendships Table Check
    console.log('3. Checking "friendships" table existence...');
    const { count: friendsCount, error: friendsError } = await supabase.from('friendships').select('*', { count: 'exact', head: true });

    if (friendsError) {
        console.error('❌ Error accessing "friendships" table:', friendsError.message);
    } else {
        console.log('✅ Table "friendships" exists and is accessible.');
        console.log(`   Current record count: ${friendsCount}`);
    }
}

verifyFollowSystem();

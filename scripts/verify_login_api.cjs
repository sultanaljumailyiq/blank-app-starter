const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.warn('Could not read .env file');
}

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const anonKey = getEnv('VITE_SUPABASE_ANON_KEY'); // Using ANON KEY to simulate frontend

console.log('Testing Login Flow with ANON KEY...');
const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
    const email = 'doctor.demo@smartdental.com';
    const password = 'Password123!';

    console.log(`1. Logging in as ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError) {
        console.error('❌ Login Failed:', authError.message);
        return;
    }

    console.log('✅ Login Successful.');
    console.log('User ID:', authData.user.id);
    console.log('Token:', authData.session.access_token.substring(0, 20) + '...');

    console.log('\n2. Fetching Profile (Simulating RLS Check)...');

    // Create new client with the USER TOKEN to respect RLS
    // (Wait, supbase-js auto-persists in the client instance usually, but let's be sure)

    const startTime = Date.now();
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    const endTime = Date.now();
    console.log(`⏱️ Query took ${endTime - startTime}ms`);

    if (profileError) {
        console.error('❌ Profile Fetch Failed:', profileError.message);
        if (endTime - startTime > 2000) {
            console.error('⚠️  QUERY TOOK TOO LONG - LIKELY INFINITE RECURSION!');
        }
    } else {
        console.log('✅ Profile Fetched Successfully:', profile.full_name);
    }
}

testLogin();

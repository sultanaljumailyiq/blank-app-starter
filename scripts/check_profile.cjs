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
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

// Log credentials presence (masked)
console.log(`URL: ${supabaseUrl ? 'Found' : 'Missing'}`);
console.log(`Key: ${serviceRoleKey ? 'Found' : 'Missing'}`);

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Credentials missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
    console.log('Checking profile for ID: be2ef51d-98c9-440a-a627-71c647a34f91');
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'be2ef51d-98c9-440a-a627-71c647a34f91')
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
    } else if (!profile) {
        console.error('PROFILE NOT FOUND! The trigger likely failed or did not run.');

        // Attempt manual fix
        console.log('Attempting to create profile manually...');
        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: 'be2ef51d-98c9-440a-a627-71c647a34f91',
                email: 'doctor.demo@smartdental.com',
                full_name: 'د. أحمد علي (تجريبي)',
                role: 'doctor'
            });

        if (insertError) {
            console.error('Manual creation failed:', insertError);
        } else {
            console.log('Manual profile creation SUCCESSFUL.');
        }

    } else {
        console.log('Profile found:', profile);
    }
}

check();

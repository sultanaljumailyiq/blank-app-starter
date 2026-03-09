import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.warn('Could not read .env file');
}

const getEnv = (key: string) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, serviceRoleKey!);

async function check() {
    console.log('Checking profile for ID: be2ef51d-98c9-440a-a627-71c647a34f91');
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'be2ef51d-98c9-440a-a627-71c647a34f91') // The ID from user's JSON
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
    } else if (!profile) {
        console.error('PROFILE NOT FOUND! The trigger likely failed or did not run.');
    } else {
        console.log('Profile found:', profile);
    }
}

check();

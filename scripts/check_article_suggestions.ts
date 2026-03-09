
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.warn('Could not read .env file, trying process.env');
}

const getEnv = (key: string) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkSuggestions() {
    console.log('Checking clinics for articleSuggestions flag...');

    const { data: clinics, error } = await supabase
        .from('clinics')
        .select('id, name, settings');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const enabled = clinics.filter((c: any) => c.settings?.articleSuggestions === true);

    console.log(`Total clinics: ${clinics.length}`);
    console.log(`Clinics with articleSuggestions=true: ${enabled.length}`);

    if (enabled.length > 0) {
        console.log('Enabled clinics:', enabled.map((c: any) => c.name));
    } else {
        console.log('No clinics have this feature enabled.');
        console.log('Sample settings from first clinic:', clinics[0]?.settings);
    }
}

checkSuggestions();

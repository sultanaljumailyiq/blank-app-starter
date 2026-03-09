
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

async function enableSuggestions() {
    console.log('Enabling articleSuggestions for the first clinic...');

    const { data: clinics, error } = await supabase
        .from('clinics')
        .select('*')
        .limit(1);

    if (error || !clinics || clinics.length === 0) {
        console.error('Error fetching clinic:', error);
        return;
    }

    const clinic = clinics[0];
    const newSettings = {
        ...clinic.settings,
        articleSuggestions: true
    };

    const { error: updateError } = await supabase
        .from('clinics')
        .update({ settings: newSettings })
        .eq('id', clinic.id);

    if (updateError) {
        console.error('Error updating clinic:', updateError);
    } else {
        console.log(`✅ Successfully enabled articleSuggestions for clinic: ${clinic.name} (${clinic.id})`);
    }
}

enableSuggestions();

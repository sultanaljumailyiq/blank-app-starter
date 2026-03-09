
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlerts() {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching patients:', error);
        return;
    }

    console.log('Patients Data Sample:');
    data.forEach(p => {
        console.log(`Patient ID: ${p.id}`);
        console.log('Medical History:', p.medical_history);
        // Also check if there's a separate 'medical_alerts' column
        if (p.medical_alerts) {
            console.log('Medical Alerts Column:', p.medical_alerts);
        }
    });
}

checkAlerts();

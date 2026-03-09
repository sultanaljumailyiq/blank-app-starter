
const { createClient } = require('@supabase/supabase-js');

// Hardcoding for this script ONLY to bypass dotenv issue in this environment
// Note: In production code, always use env vars.
const supabaseUrl = 'https://uolwxmpwugtvrswpheiy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Since we can't easily get env vars in this script execution context without dotenv,
// let's try to read the .env file manually if possible, or just rely on the user having them set.
// Actually, let's just use a simple fetch if we can't use the client.
// But better: Let's simple use the existing code but try to load .env manually.

const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(__dirname, '../.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) envVars[key.trim()] = value.trim();
    });

    const client = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

    async function checkTreatments() {
        console.log("Checking for Ortho...");
        const { data, error } = await client
            .from('treatments')
            .select('*')
            .ilike('name', '%Ortho%'); // Check English too

        const { data: dataAr, error: errorAr } = await client
            .from('treatments')
            .select('*')
            .ilike('name', '%تقويم%');

        console.log('Ortho (En):', data?.length);
        console.log('Ortho (Ar):', dataAr?.length);

        if (dataAr && dataAr.length > 0) console.log(dataAr[0]);
    }

    checkTreatments();
} catch (e) {
    console.error("Error reading env or connecting:", e);
}

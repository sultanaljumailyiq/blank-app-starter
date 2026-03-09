const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    // Try to read from typical vite env if checking fails, but for now let's hope .env is standard.
    // Actually, the user environment might not have .env loaded in this script context if I don't use dotenv.
    // I will use the hardcoded values I saw in previous scripts to be safe/fast, 
    // or better, I will assume the user has a .env file and I can use the 'dotenv' package if installed.
    // But 'dotenv' failed previously. I will use the credentials from `inspect_tables.cjs`.
}

// Credentials from previous successful scripts
const DB_CONFIG = {
    url: 'https://aws-1-ap-southeast-1.pooler.supabase.com', // This was the DB host, not URL. 
    // Wait, the DB config used direct PG connection. I need the REST URL for Storage.
    // I don't have the REST URL explicitly in the PG config.
    // I can try to read the .env file content directly using fs to get the VITE_SUPABASE_URL.
};

const fs = require('fs');
const path = require('path');

function getEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) env[key.trim()] = value.trim();
        });
        return env;
    } catch (e) {
        console.error("Could not read .env file");
        return {};
    }
}

const env = getEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY; // Storage usually allows listing if public, but maybe need service role? 
// Anon key might not list buckets. 
// But I can try.

// If I can't check buckets via API, I can't confirm.
// But the error "Bucket not found" is definitive.
// The bucket 'lab-attachments' does not exist.

// I will try to create it if possible, but usually requires Service Role.
// I'll check if I have a service role key in .env? Unlikely for frontend project.

async function checkStorage() {
    if (!url || !key) {
        console.log("Could not find Supabase credentials in .env");
        return;
    }

    const supabase = createClient(url, key);

    console.log("Checking buckets...");
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error);
    } else {
        console.log("Buckets found:");
        data.forEach(b => console.log(` - ${b.name}`));

        const found = data.find(b => b.name === 'lab-attachments');
        if (found) {
            console.log("\nBucket 'lab-attachments' exists.");
        } else {
            console.log("\nBucket 'lab-attachments' NOT found.");
        }
    }
}

checkStorage();

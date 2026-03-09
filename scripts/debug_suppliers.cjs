const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.resolve(__dirname, '../.env');
console.log('Reading .env from:', envPath);

let envConfig = {};
if (fs.existsSync(envPath)) {
    const fileContent = fs.readFileSync(envPath, 'utf8');
    fileContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key && value) {
                envConfig[key] = value;
            }
        }
    });
} else {
    console.error('.env file not found!');
    process.exit(1);
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSuppliers() {
    console.log('--- Debugging Suppliers Table ---');

    // 1. Fetch 1 row to see columns
    const { data: row, error: rowError } = await supabase
        .from('suppliers')
        .select('*')
        .limit(1);

    if (rowError) {
        console.error('Error fetching row:', rowError);
    } else {
        // console.log('Full Row:', row);
        console.log('Column Names:', row.length > 0 ? Object.keys(row[0]) : 'No data found');
        if (row.length > 0) {
            console.log('Sample ID:', row[0].id);
            console.log('Sample UserID:', row[0].user_id);
        }
    }

    // 2. Test Relationship
    console.log('\n--- Testing Products Relationship ---');
    // Try simple relationship: 'products'
    const { data: relData, error: relError } = await supabase
        .from('suppliers')
        .select('id, products(count)')
        .limit(1);

    if (relError) {
        console.error('Error with relationship (products):', relError.message);
    } else {
        console.log('Relationship fetch (products) successful');
    }

    // 3. Test Users Manager Logic
    console.log('\n--- Testing Users Manager Logic ---');
    if (row && row.length > 0) {
        const testId = row[0].id;
        const testUserId = row[0].user_id; // Check if this exists

        console.log(`Testing fetch by ID: ${testId}`);
        const { data: byId } = await supabase.from('suppliers').select('*').eq('id', testId).maybeSingle();
        console.log(`Fetch by ID result: ${!!byId}`);

        if (testUserId) {
            console.log(`Testing fetch by user_id: ${testUserId}`);
            const { data: byUserId } = await supabase.from('suppliers').select('*').eq('user_id', testUserId).maybeSingle();
            console.log(`Fetch by user_id result: ${!!byUserId}`);
        } else {
            console.log('No user_id found in sample row to test.');
        }
    }
}

debugSuppliers();

const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const client = new Client(DB_CONFIG);

async function checkPremiumLimits() {
    try {
        await client.connect();

        console.log("Fetching Premium Plan Limits...");
        const res = await client.query("SELECT id, name, name_en, limits FROM public.subscription_plans WHERE name_en LIKE '%Premium%' OR name LIKE '%ميزة%'");

        res.rows.forEach(row => {
            console.log(`Plan: ${row.name_en} (${row.name})`);
            console.log("Limits:", JSON.stringify(row.limits, null, 2));
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkPremiumLimits();

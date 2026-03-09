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

async function findFreePlan() {
    try {
        await client.connect();

        console.log("Searching for Free/Basic Plan...");
        // Ensure price is treated as numeric or check name only if price fails
        const res = await client.query(`
            SELECT id, name, name_en, price, limits 
            FROM public.subscription_plans 
            WHERE name_en ILIKE '%free%' OR name_en ILIKE '%basic%'
        `);

        if (res.rows.length > 0) {
            res.rows.forEach(row => {
                console.log(`FOUND: ${row.name_en} (${row.name})`);
                console.log("Price:", row.price);
                console.log("Limits:", JSON.stringify(row.limits, null, 2));
                console.log("ID:", row.id);
            });
        } else {
            console.log("No free plan found by name.");
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

findFreePlan();

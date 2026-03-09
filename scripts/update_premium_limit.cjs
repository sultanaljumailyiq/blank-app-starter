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

async function updatePremiumLimit() {
    try {
        await client.connect();

        console.log("Updating Premium Plan Limits...");

        // Fetch current Premium plan to preserve other limits
        const res = await client.query("SELECT id, limits FROM public.subscription_plans WHERE name_en LIKE '%Premium%' OR name LIKE '%ميزة%' LIMIT 1");

        if (res.rows.length === 0) {
            console.log("No Premium plan found.");
            return;
        }

        const plan = res.rows[0];
        const currentLimits = plan.limits || {};

        // Update max_ai to 10000 (Unlimited concept)
        const newLimits = { ...currentLimits, max_ai: 10000 };

        await client.query("UPDATE public.subscription_plans SET limits = $1 WHERE id = $2", [newLimits, plan.id]);

        console.log("SUCCESS: Updated Premium Plan max_ai to 10000.");

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

updatePremiumLimit();

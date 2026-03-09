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

const DEMO_USER_ID = '8118872f-aaa2-4322-a0d1-245b2c3bc366';

async function fixDemoSubscription() {
    try {
        await client.connect();

        // 1. Get Premium Plan ID
        console.log("Fetching Premium Plan ID...");
        const resPlan = await client.query("SELECT id FROM public.subscription_plans WHERE name LIKE '%ميزة%' OR name_en LIKE '%Premium%' LIMIT 1");

        if (resPlan.rows.length === 0) {
            console.error("No Premium plan found!");
            return;
        }

        const planId = resPlan.rows[0].id;
        console.log("Found Plan ID:", planId);

        // 2. Check if subscription already exists
        const resExist = await client.query("SELECT * FROM public.user_subscriptions WHERE user_id = $1", [DEMO_USER_ID]);
        if (resExist.rows.length > 0) {
            console.log("Subscription already exists. Updating to Premium...");
            await client.query("UPDATE public.user_subscriptions SET plan_id = $1, status = 'active' WHERE user_id = $2", [planId, DEMO_USER_ID]);
        } else {
            console.log("Creating new Premium Subscription...");
            await client.query(`
                INSERT INTO public.user_subscriptions (user_id, plan_id, status, start_date, created_at)
                VALUES ($1, $2, 'active', NOW(), NOW())
            `, [DEMO_USER_ID, planId]);
        }

        console.log("SUCCESS: Demo user subscription fixed.");

    } catch (err) {
        console.error('Error fixing subscription:', err);
    } finally {
        await client.end();
    }
}

fixDemoSubscription();

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

const TARGET_USER_ID = '8118872f-aaa2-4322-a0d1-245b2c3bc366';

async function debugUserLimits() {
    try {
        await client.connect();

        console.log("--- User Subscription ---");
        const resSub = await client.query(`
            SELECT 
                us.user_id, 
                us.plan_id,
                sp.name,
                sp.name_en,
                sp.limits
            FROM public.user_subscriptions us
            JOIN public.subscription_plans sp ON us.plan_id = sp.id
            WHERE us.user_id = $1
        `, [TARGET_USER_ID]);

        if (resSub.rows.length > 0) {
            console.log(JSON.stringify(resSub.rows[0], null, 2));
        } else {
            console.log("No active subscription found for this user.");
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

debugUserLimits();

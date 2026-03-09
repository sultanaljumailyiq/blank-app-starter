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

const TARGET_OWNER_ID = '8118872f-aaa2-4322-a0d1-245b2c3bc366'; // From previous log

async function debugOwner() {
    try {
        await client.connect();

        // 1. Fetch Profile (for name)
        console.log("--- Profile ---");
        const resProfile = await client.query('SELECT id, full_name, email FROM public.profiles WHERE id = $1', [TARGET_OWNER_ID]);
        console.log(resProfile.rows[0]);

        // 2. Fetch Subscription (for plan)
        console.log("\n--- Subscription ---");
        const resSub = await client.query(`
            SELECT 
                us.user_id, 
                us.status, 
                us.plan_id,
                sp.name as plan_name_ar,
                sp.name_en as plan_name_en
            FROM public.user_subscriptions us
            LEFT JOIN public.subscription_plans sp ON us.plan_id = sp.id
            WHERE us.user_id = $1
        `, [TARGET_OWNER_ID]);

        console.log(resSub.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

debugOwner();

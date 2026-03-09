const { Client } = require('pg');

const client = new Client({
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        await client.connect();
        const res = await client.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'dental_lab_orders' AND column_name = 'id'");
        console.log('Order ID Type:', res.rows[0]?.data_type);

        // Let's also check what arguments the RPC actually takes in the DB right now
        const rpcRes = await client.query(`
            SELECT pg_get_function_arguments(p.oid)
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE p.proname = 'create_conversation_for_order'
        `);
        console.log('RPC Args:', rpcRes.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

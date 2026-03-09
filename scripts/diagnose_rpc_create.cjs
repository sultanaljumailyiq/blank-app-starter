const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const runQuery = async () => {
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();

        console.log('\n--- Checking RPC functions ---');
        const rpcRes = await client.query(`
            SELECT proname, prosrc, pg_get_function_arguments(oid) as args
            FROM pg_proc
            WHERE proname = 'create_conversation_for_order'
        `);
        console.log(rpcRes.rows);

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runQuery();

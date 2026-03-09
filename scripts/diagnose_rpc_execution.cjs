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

        console.log('\n--- Calling the RPC function directly ---');
        // We use the ID that was found in diagnose_chat.cjs for the lab/doctor
        const rpcRes = await client.query(`
            SELECT get_lab_conversations('cde7177b-c690-42a8-b6b7-11953bf83819'::uuid);
        `);
        console.log(rpcRes.rows);

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runQuery();

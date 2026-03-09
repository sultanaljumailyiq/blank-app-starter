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

        console.log('\n--- Checking RLS Policies ---');
        const rpcRes = await client.query(`
            SELECT tablename, policyname, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename IN ('lab_chat_conversations', 'lab_chat_messages')
        `);
        console.log(JSON.stringify(rpcRes.rows, null, 2));

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runQuery();

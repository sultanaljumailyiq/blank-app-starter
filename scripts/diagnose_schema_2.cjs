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

        console.log('\n--- Checking column types ---');
        const schemaRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'lab_chat_conversations'
            ORDER BY ordinal_position
        `);
        console.log(schemaRes.rows);

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runQuery();

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

        console.log('\n--- Reloading PostgREST Cache ---');
        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('✅ Success! Cache reloaded.');

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runQuery();

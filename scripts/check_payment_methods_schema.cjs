const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const checkSchema = async () => {
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();

        console.log('\n--- Checking payment_methods Table Columns ---');
        const { rows } = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'payment_methods'
        `);

        console.log(rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error('❌ CHECK FAILED:', err.message);
    } finally {
        await client.end();
    }
};

checkSchema();

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const runMigration = async () => {
    console.log('🚀 Connecting to Supabase...');
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();

        const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20260223_unified_clinic_chat.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('✨ Success! Migration Applied.');

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runMigration();

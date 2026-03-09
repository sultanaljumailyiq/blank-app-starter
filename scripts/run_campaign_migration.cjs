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

const runCampaignMigration = async () => {
    console.log('🚀 Connecting to Supabase...');
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();
        console.log('✅ Connected.');

        // Read SQL from file
        const migrationPath = path.join(__dirname, 'create_campaign_tables.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log(`Executing Migration: create_campaign_tables.sql`);
        try {
            const res = await client.query(sql);
            console.log(`✨ Success! Query Result Command:`, res.command);
        } catch (queryErr) {
            console.error('❌ Query execution failed:', queryErr);
        }

    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runCampaignMigration();

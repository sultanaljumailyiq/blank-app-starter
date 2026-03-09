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

const runUpdates = async () => {
    console.log('🚀 Connecting to Supabase...');
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();
        console.log('✅ Connected.');

        const migrations = [
            '20260125_fix_activation_logic.sql',
            '20260125_fix_lab_services_key.sql'
        ];

        for (const file of migrations) {
            const migrationPath = path.join(__dirname, '../supabase/migrations', file);
            if (!fs.existsSync(migrationPath)) {
                console.error(`❌ File not found: ${file}`);
                continue;
            }

            const sql = fs.readFileSync(migrationPath, 'utf8');
            console.log(`\n📄 Executing: ${file}`);
            try {
                await client.query(sql);
                console.log(`✅ Success!`);
            } catch (queryErr) {
                console.error(`❌ Failed: ${queryErr.message}`);
            }
        }

        console.log('\n🎉 All updates finished.');

    } catch (err) {
        console.error('\n❌ Connection Error:', err.message);
    } finally {
        await client.end();
    }
};

runUpdates();

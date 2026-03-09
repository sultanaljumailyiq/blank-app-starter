const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Only the new migration
const SQL_FILES = [
    'supabase/migrations/20260209_add_item_return_requested.sql'
];

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

console.log('\n🚀 Running Single Migration...');

const client = new Client(DB_CONFIG);

const runMigration = async () => {
    try {
        await client.connect();
        console.log('Connected!');

        for (const file of SQL_FILES) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                console.log(`Running ${file}...`);
                const sql = fs.readFileSync(filePath, 'utf-8');
                await client.query(sql);
                console.log(`✅ Done!`);
            } else {
                console.warn(`⚠️ File not found: ${file}`);
            }
        }
        console.log('\n🎉 Migration complete!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
        process.exit(0);
    }
};

runMigration();

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration Object - Safest way to handle special characters in passwords
const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const SQL_FILES = [
    '20260124_fix_admin_rls.sql',
    '20260124_add_supplier_id_to_tx.sql',
    '20260124_create_product_views.sql',
    '20260124_add_item_status.sql',
    '20260126_comprehensive_lab_setup.sql'
];

const runMigrations = async () => {
    console.log('🚀 Connecting to Supabase (Port 6543)...');

    const client = new Client(DB_CONFIG);

    try {
        await client.connect();
        console.log('✅ Connected successfully!');

        for (const file of SQL_FILES) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                console.log(`\n📄 Executing ${file}...`);
                const sql = fs.readFileSync(filePath, 'utf-8');
                await client.query(sql);
                console.log(`✨ Success.`);
            } else {
                console.warn(`⚠️ Skipped missing file: ${file}`);
            }
        }

        console.log('\n🎉 ALL DONE! Database is updated.');

    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        if (err.message.includes('password')) {
            console.log('💡 Hint: Double check the password.');
        }
    } finally {
        await client.end();
        process.exit(0);
    }
};

runMigrations();

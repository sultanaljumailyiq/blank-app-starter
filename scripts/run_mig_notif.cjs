const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Files to run (in order)
const SQL_FILES = [
    // 'supabase/migrations/20260128000000_fix_clinics_and_notifications.sql',
    // 'supabase/migrations/20260128001000_add_specialties_to_clinics.sql',
    // 'supabase/migrations/20260128005500_add_type_to_appointments.sql',
    // 'supabase/migrations/20260128014500_relax_appointments_constraints.sql',
    // 'supabase/migrations/20260128015500_relax_treatment_type.sql',
    // 'supabase/migrations/20260128023000_platform_branding.sql',
    'supabase/migrations/20260128030000_activity_logs_and_featured.sql'
];

// Hardcoded Credentials for Automation
const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

// Main Execution
console.log('\n🚀 Automatic Database Migration Tool');
console.log('Connecting automatically using stored credentials...');

const client = new Client(DB_CONFIG);
client.on('notice', (msg) => console.log('NOTICE:', msg.message));

const runMigrations = async () => {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully!');

        for (const file of SQL_FILES) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                console.log(`\n--- Running ${file} ---`);
                const sql = fs.readFileSync(filePath, 'utf-8');
                const result = await client.query(sql);
                if (result.rows && result.rows.length > 0) {
                    console.log(JSON.stringify(result.rows, null, 2));
                }
                console.log(`✅ ${file} executed successfully.`);
            } else {
                console.warn(`⚠️ File not found: ${file}`);
            }
        }

        console.log('\n🎉 All migrations completed successfully!');

    } catch (err) {
        console.error('\n❌ Error executing migrations:', err);
    } finally {
        await client.end();
        process.exit(0);
    }
};

runMigrations();

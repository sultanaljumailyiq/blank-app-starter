const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const client = new Client(DB_CONFIG);

async function runMigration() {
    const migrationFile = process.argv[2];
    if (!migrationFile) {
        console.log("Usage: node run_migration.cjs <path_to_sql_file>");
        process.exit(1);
    }

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log(`Applying migration: ${migrationFile}`);

        await client.connect();
        await client.query(sql);
        console.log("Migration applied successfully!");
    } catch (err) {
        console.error('Error applying migration:');
        console.error('Error applying migration:');
        console.log('ERROR DETAIL:', err.message || err);
        if (err.stack) console.log(err.stack);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();

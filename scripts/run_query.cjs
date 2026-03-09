const { Client } = require('pg');
const fs = require('fs');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const client = new Client(DB_CONFIG);

async function run() {
    try {
        await client.connect();
        const FILE = process.argv[2];
        if (!FILE) {
            console.error('Usage: node scripts/run_query.cjs <file.sql>');
            process.exit(1);
        }

        const sql = fs.readFileSync(FILE, 'utf8');

        // Split by semicolon simple logic
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

        for (const stmt of statements) {
            console.log(`\n--- Running Query ---`);
            console.log(stmt.substring(0, 50) + '...');

            try {
                const res = await client.query(stmt);
                if (res.rows && res.rows.length > 0) {
                    console.table(res.rows);
                } else {
                    console.log('No rows returned or empty result.');
                }
            } catch (qErr) {
                console.error('Query Failed:', qErr.message);
            }
        }

    } catch (err) {
        console.error('Connection Error:', err);
    } finally {
        await client.end();
    }
}

run();

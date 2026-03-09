const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const client = new Client(DB_CONFIG);

async function inspectSchema() {
    const tables = process.argv.slice(2);
    if (tables.length === 0) {
        console.log("Usage: node inspect_schema.cjs <table1> <table2> ...");
        process.exit(1);
    }

    try {
        await client.connect();

        for (const tableName of tables) {
            console.log(`\n--- Schema for table: ${tableName} ---`);

            // Get columns
            const res = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [tableName]);

            if (res.rows.length === 0) {
                console.log(`Table '${tableName}' not found or has no columns.`);
            } else {
                res.rows.forEach(row => {
                    console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(15)} | ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} | ${row.column_default || ''}`);
                });
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

inspectSchema();

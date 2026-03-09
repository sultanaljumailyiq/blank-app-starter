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

const checkSchema = async () => {
    try {
        await client.connect();
        console.log('Connected!');

        const tables = ['notifications', 'follows'];
        for (const table of tables) {
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}';
            `);
            console.log(`\n--- ${table} Columns ---`);
            res.rows.forEach(row => console.log(`${row.column_name} (${row.data_type})`));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
};

checkSchema();

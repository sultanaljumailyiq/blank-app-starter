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

async function inspect() {
    try {
        await client.connect();

        console.log(`\n--- COLUMNS for clinics ---`);
        const cols = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'clinics'
            ORDER BY ordinal_position;
        `);
        cols.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log(`\n--- COLUMNS for medical_records ---`); // Checking this too as it might be relevant for patients
        const cols2 = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'medical_records'
            ORDER BY ordinal_position;
        `);
        cols2.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspect();

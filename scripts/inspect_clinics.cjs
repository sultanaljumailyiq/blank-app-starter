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
        const res = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'clinics';
        `);
        console.log("COLUMNS:");
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        const constraints = await client.query(`
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'clinics';
        `);
        console.log("\nCONSTRAINTS:");
        constraints.rows.forEach(r => console.log(`${r.constraint_name} (${r.constraint_type})`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspect();

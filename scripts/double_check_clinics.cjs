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

async function checkClinicsAgain() {
    try {
        await client.connect();

        console.log("--- Clinics Columns ---");
        const resClinics = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'clinics'
        `);
        console.log(resClinics.rows);

        console.log("\n--- Full Row for Target Owner ---");
        const resRow = await client.query(`
            SELECT * FROM public.clinics WHERE owner_id = '8118872f-aaa2-4322-a0d1-245b2c3bc366'
        `);
        if (resRow.rows.length > 0) {
            console.log(JSON.stringify(resRow.rows[0], null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkClinicsAgain();

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

async function checkData() {
    try {
        await client.connect();
        console.log("Connected. Fetching one patient...");
        const res = await client.query('SELECT id, medical_history_data, medical_history, allergies FROM patients LIMIT 1');
        if (res.rows.length > 0) {
            console.log(JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log("No patients found.");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

checkData();

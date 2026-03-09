const { Client } = require('pg');

const client = new Client({
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        await client.connect();

        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clinics'");
        const columns = res.rows.map(r => r.column_name);

        console.log("Clinic tables columns:", columns);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
};

run();

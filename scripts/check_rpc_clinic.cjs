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
        const res = await client.query("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'get_clinic_lab_conversation'");
        console.log(res.rows[0]?.routine_definition);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

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

        // Check dental_laboratories id type and sample data
        const r1 = await client.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'dental_laboratories' AND column_name = 'id'");
        console.log('dental_laboratories.id type:', r1.rows[0]?.data_type);

        const r2 = await client.query("SELECT id, name, user_id FROM dental_laboratories LIMIT 5");
        console.log('Sample labs:', JSON.stringify(r2.rows, null, 2));

        // Check the get_clinic_lab_conversation RPC signature
        const r3 = await client.query(`
            SELECT pg_get_function_arguments(p.oid)
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE p.proname = 'get_clinic_lab_conversation'
        `);
        console.log('get_clinic_lab_conversation Args:', r3.rows);

        // Check get_clinic_lab_conversation body
        const r4 = await client.query("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'get_clinic_lab_conversation'");
        console.log('RPC definition:', r4.rows[0]?.routine_definition);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

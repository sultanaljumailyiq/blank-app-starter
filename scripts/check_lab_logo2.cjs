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

        // Get actual logo_url and profile data
        const r1 = await client.query("SELECT id, name, logo_url, cover_image_url, user_id FROM dental_laboratories LIMIT 10");
        console.log('Lab data:', JSON.stringify(r1.rows, null, 2));

        // Also check the dental_lab_profile table if exists
        const r2 = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name ILIKE '%lab%profile%' OR table_name ILIKE '%laboratory%profile%'");
        console.log('\nRelated profile tables:', r2.rows);

        // Check if a lab profile view exists
        const r3 = await client.query("SELECT table_name FROM information_schema.views WHERE table_name ILIKE '%lab%'");
        console.log('\nLab-related views:', r3.rows);

    } catch (err) {
        console.error(err.message);
    } finally {
        await client.end();
    }
};

run();

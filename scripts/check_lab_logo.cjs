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

        // Get all columns in dental_laboratories
        const r1 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'dental_laboratories' ORDER BY ordinal_position");
        console.log('dental_laboratories columns:');
        r1.rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type));

        // Sample data to see logo values
        const r2 = await client.query("SELECT id, name, logo_url, image_url FROM dental_laboratories LIMIT 5");
        console.log('\nSample lab data:', JSON.stringify(r2.rows, null, 2));

    } catch (err) {
        // Try without logo columns if they don't exist
        try {
            const r3 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'dental_laboratories' AND column_name ILIKE '%logo%' OR column_name ILIKE '%image%' OR column_name ILIKE '%avatar%' OR column_name ILIKE '%photo%'");
            console.log('Logo-related columns:', r3.rows);
        } catch (e) {
            console.error('Error:', err.message);
        }
    } finally {
        await client.end();
    }
};

run();

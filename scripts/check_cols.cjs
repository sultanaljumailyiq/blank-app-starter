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
const run = async () => {
    try {
        await client.connect();
        // Check dental_laboratories columns
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'dental_laboratories'
            ORDER BY ordinal_position;
        `);
        console.log('=== dental_laboratories columns ===');
        res.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

        // Check RLS policies
        console.log('\n=== RLS POLICIES on dental_laboratories ===');
        const rlsEnabled = await client.query(`
            SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'dental_laboratories';
        `);
        console.log(`  RLS enabled: ${rlsEnabled.rows[0]?.relrowsecurity}`);

        const policies = await client.query(`
            SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'dental_laboratories';
        `);
        policies.rows.forEach(p => {
            console.log(`\n  Policy: "${p.policyname}"`);
            console.log(`     Command: ${p.cmd}`);
            console.log(`     USING: ${p.qual || 'none'}`);
        });

        // Check sample data
        console.log('\n=== Sample Lab Data ===');
        const labs = await client.query(`SELECT id, lab_name, user_id, avatar_url, logo_url FROM dental_laboratories LIMIT 5;`);
        labs.rows.forEach(l => {
            console.log(`  ${l.lab_name}: user_id=${l.user_id || 'NULL'}, avatar_url=${l.avatar_url || 'NULL'}, logo_url=${l.logo_url || 'NULL'}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
};
run();

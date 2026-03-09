const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const run = async () => {
    const client = new Client(DB_CONFIG);
    await client.connect();

    console.log('\n=== LAB RECORD (id=39e5ca0e) ===');
    const { rows: labRows } = await client.query(`
        SELECT id, name, email, phone, address, logo_url, description, is_active, account_status, user_id
        FROM dental_laboratories
        WHERE id = '39e5ca0e-cd81-4f45-becb-020a13041543'
    `);
    console.log(JSON.stringify(labRows[0], null, 2));

    console.log('\n=== PROFILES RECORD (user_id=cde7177b) ===');
    const { rows: profRows } = await client.query(`
        SELECT id, full_name, email, phone, avatar_url, bio, city, address
        FROM profiles
        WHERE id = 'cde7177b-c690-42a8-b6b7-11953bf83819'
    `);
    console.log(JSON.stringify(profRows[0], null, 2));

    console.log('\n=== ALL LABS ===');
    const { rows: allLabs } = await client.query(`
        SELECT id, name, address, phone, email, user_id FROM dental_laboratories ORDER BY created_at DESC LIMIT 10
    `);
    allLabs.forEach(r => console.log(`  [${r.id}] "${r.name}" | addr: "${r.address}" | phone: ${r.phone} | email: ${r.email} | user: ${r.user_id}`));

    console.log('\n=== CHECK RLS POLICIES on dental_laboratories ===');
    const { rows: policies } = await client.query(`
        SELECT policyname, cmd, qual, with_check
        FROM pg_policies
        WHERE tablename = 'dental_laboratories'
    `);
    policies.forEach(p => console.log(`  ${p.policyname} (${p.cmd}): ${p.qual}`));

    await client.end();
};

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

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

    console.log('=== FINAL VERIFICATION ===\n');

    // 1. Check RLS policies
    const { rows: policies } = await client.query(
        `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'dental_laboratories' ORDER BY cmd`
    );
    console.log('RLS Policies on dental_laboratories:');
    policies.forEach(p => console.log(`  ✅ ${p.policyname} (${p.cmd})`));

    // 2. Check columns
    const { rows: cols } = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'dental_laboratories' AND column_name IN ('address','governorate','phone','email','logo_url')`
    );
    console.log('\nRequired columns present:', cols.map(c => c.column_name).join(', '));

    // 3. Check lab record
    const { rows: lab } = await client.query(
        `SELECT id, name, email, phone, address, governorate, logo_url FROM dental_laboratories WHERE user_id = 'cde7177b-c690-42a8-b6b7-11953bf83819'`
    );
    console.log('\ndental_laboratories record:', JSON.stringify(lab[0], null, 2));

    // 4. Check profiles record
    const { rows: prof } = await client.query(
        `SELECT id, full_name, email, phone, city, address, governorate, avatar_url FROM profiles WHERE id = 'cde7177b-c690-42a8-b6b7-11953bf83819'`
    );
    console.log('\nprofiles record:', JSON.stringify(prof[0], null, 2));

    await client.end();
};

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

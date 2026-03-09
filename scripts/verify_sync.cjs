const { Client } = require('pg');

const client = new Client({
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
    // Check suppliers after migration
    const sup = await client.query(`
    SELECT id, name, email, phone, logo, is_verified
    FROM suppliers LIMIT 5
  `);
    console.log('=== SUPPLIERS AFTER MIGRATION ===');
    sup.rows.forEach(r => {
        console.log(`  Name:  ${r.name}`);
        console.log(`  Email: ${r.email ?? 'NULL'}`);
        console.log(`  Phone: ${r.phone ?? 'NULL'}`);
        console.log(`  Logo:  ${r.logo ? 'HAS IMAGE' : 'NULL'}`);
        console.log(`  Verified: ${r.is_verified}`);
        console.log('---');
    });

    // Check profiles after migration
    const prof = await client.query(`
    SELECT id, full_name, email, phone, avatar_url, role
    FROM profiles
    WHERE role = 'supplier'
  `);
    console.log('\n=== SUPPLIER PROFILES AFTER MIGRATION ===');
    prof.rows.forEach(r => {
        console.log(`  Name:       ${r.full_name}`);
        console.log(`  Email:      ${r.email ?? 'NULL'}`);
        console.log(`  Phone:      ${r.phone ?? 'NULL'}`);
        console.log(`  Avatar URL: ${r.avatar_url ? 'HAS IMAGE' : 'NULL'}`);
        console.log('---');
    });

    console.log('\n✅ Verification complete!');
}).catch(e => console.error('Error:', e.message))
    .finally(() => client.end());

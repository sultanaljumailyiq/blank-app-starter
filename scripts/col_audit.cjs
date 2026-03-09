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
    const tables = ['clinics', 'profiles', 'suppliers', 'dental_laboratories'];
    for (const t of tables) {
        const { rows } = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='${t}' AND column_name IN ('city','location','address','governorate','name','full_name','phone','email') ORDER BY column_name`);
        console.log(`\n=== ${t} ===`);
        rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
    }
    await client.end();
};
run().catch(e => console.error(e.message));

const { Client } = require('pg');

const client = new Client({
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='suppliers' ORDER BY ordinal_position`);
}).then(r => {
    console.log('SUPPLIERS COLUMNS:');
    r.rows.forEach(c => console.log(' -', c.column_name, ':', c.data_type));
}).catch(e => console.error('Error:', e.message)).finally(() => client.end());

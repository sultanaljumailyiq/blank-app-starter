const { Client } = require('pg');
const client = new Client({
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query("SELECT pg_get_functiondef('get_lab_conversations'::regproc)");
}).then(res => {
    console.log(res.rows[0].pg_get_functiondef);
    client.end();
}).catch(err => {
    console.error(err);
    client.end();
});

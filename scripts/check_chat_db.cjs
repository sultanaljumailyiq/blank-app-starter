const { Client } = require('pg');

const client = new Client({
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    const convs = await client.query('SELECT id, doctor_id, lab_id, clinic_id FROM lab_chat_conversations ORDER BY created_at DESC LIMIT 5');
    console.log('CONVS:', convs.rows);
    const msgs = await client.query('SELECT id, conversation_id, sender_id, staff_record_id, content FROM lab_chat_messages ORDER BY created_at DESC LIMIT 10');
    console.log('MSGS:', msgs.rows);
    await client.end();
}
run().catch(console.error);

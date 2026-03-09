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
    try {
        await client.connect();
        const res = await client.query(`
            SELECT id, conversation_id, sender_id, staff_record_id, content, created_at
            FROM lab_chat_messages
            ORDER BY created_at DESC
            LIMIT 5;
        `);
        console.log("Recent messages:", res.rows);

        const convRes = await client.query(`
            SELECT id, clinic_id, lab_id, doctor_id, order_id
            FROM lab_chat_conversations
            ORDER BY created_at DESC
            LIMIT 5;
        `);
        console.log("Recent conversations:", convRes.rows);
    } finally {
        await client.end();
    }
};

run();

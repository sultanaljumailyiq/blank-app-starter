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

        // What is actually in lab_chat_conversations?
        const r1 = await client.query("SELECT id, lab_id, clinic_id, doctor_id, conversation_type FROM lab_chat_conversations ORDER BY id DESC LIMIT 10");
        console.log('Conversations:', JSON.stringify(r1.rows, null, 2));

        // What clinics exist?
        const r2 = await client.query("SELECT id, name FROM clinics LIMIT 5");
        console.log('Clinics:', JSON.stringify(r2.rows, null, 2));

        // What lab.user_id is in conversations?
        const labUserId = 'cde7177b-c690-42a8-b6b7-11953bf83819'; // from above
        const r3 = await client.query(`SELECT * FROM lab_chat_conversations WHERE lab_id = $1`, [labUserId]);
        console.log('Conversations for lab user_id:', JSON.stringify(r3.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

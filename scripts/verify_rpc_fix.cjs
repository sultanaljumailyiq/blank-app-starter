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

        // Simulate the direct RPC call with the known values
        const userId = '8118872f-aaa2-4322-a0d1-245b2c3bc366'; // clinic doctor
        const labTableId = '39e5ca0e-cd81-4f45-becb-020a13041543'; // dental_laboratories.id

        const res = await client.query(`SELECT public.get_clinic_lab_conversation($1, $2)`, [labTableId, userId]);
        console.log('Result conversation ID:', res.rows[0]?.get_clinic_lab_conversation);

        // Verify messages in that conversation
        if (res.rows[0]?.get_clinic_lab_conversation) {
            const convId = res.rows[0].get_clinic_lab_conversation;
            const msgs = await client.query(`SELECT id, sender_id, content FROM lab_chat_messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 5`, [convId]);
            console.log(`Messages in conv ${convId}:`, JSON.stringify(msgs.rows, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

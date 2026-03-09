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

        // Find broken conversations where doctor_id == lab_id
        const res = await client.query(`
            SELECT id FROM lab_chat_conversations 
            WHERE doctor_id = lab_id
        `);

        const brokenIds = res.rows.map(r => r.id);

        if (brokenIds.length > 0) {
            console.log('Found broken conversations:', brokenIds);

            // Delete messages in broken conversations first
            await client.query(`
                DELETE FROM lab_chat_messages 
                WHERE conversation_id = ANY($1)
            `, [brokenIds]);

            // Delete the broken conversations
            await client.query(`
                DELETE FROM lab_chat_conversations 
                WHERE id = ANY($1)
            `, [brokenIds]);

            console.log(`Deleted ${brokenIds.length} broken conversations.`);
        } else {
            console.log('No broken conversations found.');
        }

    } catch (err) {
        console.error('Error cleaning up:', err);
    } finally {
        await client.end();
    }
};

run();

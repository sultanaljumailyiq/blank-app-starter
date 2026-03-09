const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const runMigration = async () => {
    console.log('🚀 Connecting to Supabase...');
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();

        const sql = `
-- Fix PGRST200 by adding foreign key constraint
ALTER TABLE lab_chat_messages 
DROP CONSTRAINT IF EXISTS lab_chat_messages_staff_record_id_fkey;

ALTER TABLE lab_chat_messages 
ADD CONSTRAINT lab_chat_messages_staff_record_id_fkey
FOREIGN KEY (staff_record_id) REFERENCES staff(id) ON DELETE SET NULL;
        `;

        await client.query(sql);
        console.log('✨ Success! Foreign Key added.');

        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('✅ Success! Cache reloaded.');

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runMigration();

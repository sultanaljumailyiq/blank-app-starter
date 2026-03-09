const { Client } = require('pg');
const fs = require('fs');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const sql = `
CREATE OR REPLACE FUNCTION get_lab_conversations(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT COALESCE(jsonb_agg(row_to_json(c.*)), '[]'::jsonb)
        FROM (
            SELECT 
                lc.id AS conversation_id,
                cl.name AS clinic_name,
                COALESCE(p.full_name, d.doctor_name) AS doctor_name,
                d.order_number,
                lc.last_message AS last_message_content,
                lc.last_message_date,
                (
                    SELECT COUNT(*)
                    FROM lab_chat_messages msg
                    WHERE msg.conversation_id = lc.id
                      AND msg.sender_id != p_user_id
                      AND msg.is_read = FALSE
                ) AS unread_count,
                'clinic' AS type
            FROM lab_chat_conversations lc
            LEFT JOIN dental_lab_orders d ON lc.order_id = d.id
            LEFT JOIN clinics cl ON d.clinic_id = cl.id
            LEFT JOIN profiles p ON lc.doctor_id = p.id
            WHERE lc.lab_id = p_user_id OR lc.doctor_id = p_user_id
            ORDER BY lc.last_message_date DESC NULLS LAST
        ) c
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

const runSingleMigration = async () => {
    console.log('🚀 Connecting to Supabase...');
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();
        console.log('✅ Connected.');
        const res = await client.query(sql);
        console.log(`✨ Success! Query Result Command:`, res.command);
    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runSingleMigration();

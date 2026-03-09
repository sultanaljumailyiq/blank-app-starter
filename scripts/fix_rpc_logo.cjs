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

        const sql = `
CREATE OR REPLACE FUNCTION public.get_lab_conversations(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT COALESCE(jsonb_agg(row_to_json(c.*)), '[]'::jsonb)
        FROM (
            SELECT 
                lc.id AS conversation_id,
                lc.doctor_id,
                lc.lab_id,
                lc.clinic_id,
                lc.conversation_type,
                lc.created_at,
                cl.name AS clinic_name,
                cl.image_url AS clinic_logo,
                pr.full_name AS doctor_name,
                (
                    SELECT content
                    FROM lab_chat_messages
                    WHERE conversation_id = lc.id
                    ORDER BY created_at DESC
                    LIMIT 1
                ) AS last_message_content,
                (
                    SELECT created_at
                    FROM lab_chat_messages
                    WHERE conversation_id = lc.id
                    ORDER BY created_at DESC
                    LIMIT 1
                ) AS last_message_date,
                (
                    SELECT count(*)
                    FROM lab_chat_messages
                    WHERE conversation_id = lc.id 
                    AND is_read = false 
                    AND sender_id != p_user_id
                ) AS unread_count
            FROM lab_chat_conversations lc
            LEFT JOIN clinics cl ON lc.clinic_id = cl.id
            LEFT JOIN profiles pr ON lc.doctor_id = pr.id
            WHERE 
                lc.lab_id = p_user_id
                OR (lc.clinic_id IN (SELECT clinic_id FROM staff WHERE auth_user_id = p_user_id))
            ORDER BY last_message_date DESC NULLS LAST
        ) c
    );
END;
$function$;
        `;

        await client.query(sql);
        console.log('Fixed RPC get_lab_conversations! (Added clinic_logo image query)');

        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('Cache reloaded');

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

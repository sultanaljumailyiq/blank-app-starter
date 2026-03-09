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
CREATE OR REPLACE FUNCTION public.get_clinic_lab_conversation(p_dental_lab_id uuid, p_user_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_clinic_id INTEGER;
    v_lab_user_id UUID;
    v_conv_id BIGINT;
BEGIN
    -- Get lab's user_id from dental_laboratories table
    SELECT user_id INTO v_lab_user_id
    FROM dental_laboratories
    WHERE id = p_dental_lab_id;

    -- Try to get clinic from staff table first
    SELECT clinic_id INTO v_clinic_id
    FROM staff
    WHERE auth_user_id = p_user_id
    LIMIT 1;

    -- If not found in staff, try to find existing conversation by doctor_id directly
    IF v_clinic_id IS NULL THEN
        SELECT id INTO v_conv_id
        FROM lab_chat_conversations
        WHERE doctor_id = p_user_id AND lab_id = v_lab_user_id
        ORDER BY id ASC
        LIMIT 1;

        IF v_conv_id IS NOT NULL THEN
            RETURN v_conv_id;
        END IF;

        -- Also try to get clinic_id from existing order
        SELECT clinic_id INTO v_clinic_id
        FROM dental_lab_orders
        WHERE doctor_id = p_user_id
        ORDER BY id DESC
        LIMIT 1;
    END IF;

    -- If we still have clinic_id, search by it
    IF v_clinic_id IS NOT NULL THEN
        SELECT id INTO v_conv_id
        FROM lab_chat_conversations
        WHERE clinic_id = v_clinic_id AND lab_id = v_lab_user_id
        ORDER BY id ASC
        LIMIT 1;
    END IF;

    -- If nothing found, create a new conversation
    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, clinic_id, conversation_type)
        VALUES (p_user_id, v_lab_user_id, v_clinic_id, 'clinic_general')
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$function$;
        `;

        await client.query(sql);
        console.log('Fixed RPC get_clinic_lab_conversation!');
        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('Schema reloaded');

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

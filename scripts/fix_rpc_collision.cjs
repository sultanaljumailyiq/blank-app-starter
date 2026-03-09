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

        // Drop the duplicate one taking (text, uuid)
        await client.query(`DROP FUNCTION IF EXISTS public.create_conversation_for_order(text, uuid)`);
        console.log('Dropped text override');

        // Rebuild the final correct one using UUID
        const sql = `
CREATE OR REPLACE FUNCTION public.create_conversation_for_order(p_order_id uuid, p_doctor_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_lab_id UUID;
    v_lab_user_id UUID;
    v_clinic_id INTEGER;
    v_real_doctor_id UUID;
    v_conv_id BIGINT;
BEGIN
    SELECT laboratory_id, clinic_id INTO v_lab_id, v_clinic_id
    FROM dental_lab_orders
    WHERE id = p_order_id;
    
    SELECT user_id INTO v_lab_user_id
    FROM dental_laboratories
    WHERE id = v_lab_id;

    SELECT id INTO v_conv_id
    FROM lab_chat_conversations
    WHERE clinic_id = v_clinic_id AND lab_id = v_lab_user_id
    ORDER BY id ASC
    LIMIT 1;

    IF v_conv_id IS NULL THEN
        SELECT auth_user_id INTO v_real_doctor_id
        FROM staff 
        WHERE clinic_id = v_clinic_id
        ORDER BY id ASC 
        LIMIT 1;
        
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, clinic_id, conversation_type)
        VALUES (v_real_doctor_id, v_lab_user_id, v_clinic_id, 'clinic_general')
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$function$;
        `;

        await client.query(sql);
        console.log('Deployed uuid typed create_conversation_for_order');
        await client.query(`NOTIFY pgrst, 'reload schema'`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

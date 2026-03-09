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
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();

        const sql = `
-- 1. Create a function that initiates chat purely from a dental_lab_id (for the Clinic)
CREATE OR REPLACE FUNCTION get_clinic_lab_conversation(p_dental_lab_id UUID, p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_clinic_id INTEGER;
    v_lab_user_id UUID;
    v_conv_id BIGINT;
BEGIN
    SELECT clinic_id INTO v_clinic_id
    FROM staff
    WHERE auth_user_id = p_user_id
    LIMIT 1;

    SELECT user_id INTO v_lab_user_id
    FROM dental_laboratories
    WHERE id = p_dental_lab_id;

    SELECT id INTO v_conv_id
    FROM lab_chat_conversations
    WHERE clinic_id = v_clinic_id AND lab_id = v_lab_user_id
    ORDER BY id DESC
    LIMIT 1;

    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, clinic_id, conversation_type)
        VALUES (p_user_id, v_lab_user_id, v_clinic_id, 'clinic_general')
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Modify create_conversation_for_order (used by Lab to grab clinic_id via order)
-- Make sure it doesn't try to use order_id
CREATE OR REPLACE FUNCTION create_conversation_for_order(p_order_id UUID, p_doctor_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_lab_id UUID;
    v_lab_user_id UUID;
    v_clinic_id INTEGER;
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
    ORDER BY id DESC
    LIMIT 1;

    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, clinic_id, conversation_type)
        VALUES (p_doctor_id, v_lab_user_id, v_clinic_id, 'clinic_general')
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DROP the order_id column from conversations to ensure it's NEVER used anymore.
ALTER TABLE lab_chat_conversations DROP COLUMN IF EXISTS order_id;
        `;

        await client.query(sql);
        console.log('✨ Success! SQL Migration applied.');

        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('✅ Success! Cache reloaded.');

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runMigration();

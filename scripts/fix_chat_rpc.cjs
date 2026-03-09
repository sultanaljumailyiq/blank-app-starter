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
-- Fix the RPC to use user_id instead of owner_id
-- We will keep the name create_conversation_for_order so the frontend doesn't break,
-- but internally it will act as a clinic-level conversation finder/creator.

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
    
    -- Check if a conversation between this clinic and this lab already exists
    SELECT id INTO v_conv_id
    FROM lab_chat_conversations
    WHERE clinic_id = v_clinic_id AND lab_id = v_lab_user_id
    ORDER BY created_at ASC
    LIMIT 1;

    -- If not, create a shared one
    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, clinic_id, conversation_type)
        VALUES (p_doctor_id, v_lab_user_id, v_clinic_id, 'clinic_general')
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
        `;

        await client.query(sql);
        console.log('✨ Success! RPC Fixed.');

        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('✅ Success! Cache reloaded.');

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runMigration();

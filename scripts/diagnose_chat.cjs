const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const runQuery = async () => {
    console.log('🚀 Connecting to Supabase for Diagnostics...');
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();

        console.log('\n--- Checking dental_lab_orders ---');
        const orderRes = await client.query('SELECT id, order_number, clinic_id, laboratory_id, doctor_id FROM dental_lab_orders LIMIT 5');
        console.log(orderRes.rows);

        console.log('\n--- Checking get_lab_conversations output for a matching user ---');
        // Let's just run the view query logic without the function constraint
        const viewRes = await client.query(`
            SELECT 
                lc.id AS conversation_id,
                cl.name AS clinic_name,
                COALESCE(p.full_name, d.doctor_name) AS doctor_name,
                d.order_number,
                lc.last_message AS last_message_content,
                lc.last_message_date,
                lc.lab_id,
                lc.doctor_id
            FROM lab_chat_conversations lc
            LEFT JOIN dental_lab_orders d ON lc.order_id = d.id
            LEFT JOIN clinics cl ON d.clinic_id = cl.id
            LEFT JOIN profiles p ON lc.doctor_id = p.id
            LIMIT 5
        `);
        console.log(viewRes.rows);

    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
    } finally {
        await client.end();
    }
};

runQuery();

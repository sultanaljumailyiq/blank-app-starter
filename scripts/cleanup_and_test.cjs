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

        console.log('=== Step 1: Delete duplicate empty conversations (keep only id=9 which has clinic_id) ===');
        // Remove the broken ones with no clinic_id
        const res = await client.query(`
            DELETE FROM lab_chat_conversations 
            WHERE id IN (10, 11, 12, 13, 14)
            RETURNING id
        `);
        console.log('Deleted:', res.rows.map(r => r.id));

        console.log('\n=== Step 2: Check staff records for user 8118872f ===');
        const r2 = await client.query(`SELECT id, auth_user_id, clinic_id, full_name FROM staff WHERE auth_user_id = '8118872f-aaa2-4322-a0d1-245b2c3bc366'`);
        console.log('Staff record:', JSON.stringify(r2.rows, null, 2));

        console.log('\n=== Step 3: Simulate get_clinic_lab_conversation lookup ===');
        const userId = '8118872f-aaa2-4322-a0d1-245b2c3bc366';
        const labTableId = '39e5ca0e-cd81-4f45-becb-020a13041543'; // dental_laboratories.id

        const r3 = await client.query(`SELECT clinic_id FROM staff WHERE auth_user_id = $1 LIMIT 1`, [userId]);
        console.log('clinic_id from staff:', r3.rows[0]);

        const r4 = await client.query(`SELECT user_id FROM dental_laboratories WHERE id = $1`, [labTableId]);
        console.log('lab user_id:', r4.rows[0]);

        if (r3.rows[0] && r4.rows[0]) {
            const clinicIdResult = r3.rows[0].clinic_id;
            const labUserId = r4.rows[0].user_id;

            const r5 = await client.query(`SELECT id FROM lab_chat_conversations WHERE clinic_id = $1 AND lab_id = $2 ORDER BY id ASC LIMIT 1`, [clinicIdResult, labUserId]);
            console.log('Found conversation:', r5.rows);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

run();

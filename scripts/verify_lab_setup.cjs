const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const verify = async () => {
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();
        console.log('Connected.');

        // Check lab_disputes
        try {
            const res = await client.query('SELECT count(*) FROM lab_disputes');
            console.log('✅ lab_disputes table exists. Count:', res.rows[0].count);
        } catch (e) {
            console.error('❌ lab_disputes table missing or error:', e.message);
        }

        // Check dental_laboratories columns
        try {
            const res = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'dental_lab_orders' 
            `);
            console.log('✅ dental_lab_orders columns:', res.rows.map(r => r.column_name));
        } catch (e) {
            console.error('❌ Column check error:', e.message);
        }

        // Check lab_services
        try {
            const res = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'lab_services'");
            console.log('✅ lab_services exists:', parseInt(res.rows[0].count) > 0);
        } catch (e) {
            console.log('❌ lab_services check failed:', e.message);
        }

    } catch (err) {
        console.error('Connection error:', err);
    } finally {
        await client.end();
    }
};

verify();

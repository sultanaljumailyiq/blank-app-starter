const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const client = new Client(DB_CONFIG);

async function inspectFunction() {
    try {
        await client.connect();
        // Query to get function definition
        const res = await client.query(`
      SELECT prosrc
      FROM pg_proc 
      WHERE proname = 'get_orders_by_status';
    `);

        if (res.rows.length > 0) {
            console.log('Function Definition:');
            console.log(res.rows[0].prosrc);
        } else {
            console.log('Function not found.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

inspectFunction();

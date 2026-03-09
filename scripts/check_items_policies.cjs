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

const checkItemsPolicies = async () => {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT policyname, cmd, roles, qual, with_check 
            FROM pg_policies 
            WHERE tablename = 'store_order_items';
        `);
        console.log('--- store_order_items Policies ---');
        res.rows.forEach(r => console.log(`${r.policyname} (${r.cmd}): Roles=${r.roles}`));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

checkItemsPolicies();

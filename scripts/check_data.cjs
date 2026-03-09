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

const checkData = async () => {
    try {
        await client.connect();

        console.log('--- Suppliers ---');
        const suppliers = await client.query('SELECT id, name, is_verified, email FROM suppliers');
        suppliers.rows.forEach(r => console.log(`${r.name} (${r.email}): is_verified=${r.is_verified}`));

        console.log('\n--- Products Count ---');
        const productsParams = await client.query('SELECT count(*) FROM products WHERE is_active = true');
        console.log(`Active Products: ${productsParams.rows[0].count}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

checkData();

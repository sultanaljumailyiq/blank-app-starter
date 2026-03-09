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

const checkPolicies = async () => {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT tablename, policyname, roles, cmd 
            FROM pg_policies 
            WHERE tablename IN ('products', 'suppliers') AND cmd = 'SELECT';
        `);
        console.log('--- SELECT Policies ---');
        res.rows.forEach(r => console.log(`${r.tablename}: ${r.policyname} (Roles: ${r.roles})`));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

checkPolicies();

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

const checkConfig = async () => {
    try {
        await client.connect();

        // Check Policies
        console.log('\n--- RLS Policies (suppliers, products, store_orders) ---');
        const policies = await client.query(`
            SELECT tablename, policyname, cmd, roles 
            FROM pg_policies 
            WHERE tablename IN ('suppliers', 'products', 'store_orders');
        `);
        policies.rows.forEach(r => console.log(`${r.tablename}: ${r.policyname} (${r.cmd}) - Roles: ${r.roles}`));

        // Check FK Constraints
        console.log('\n--- Foreign Keys (products -> suppliers) ---');
        const fks = await client.query(`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'products';
        `);
        fks.rows.forEach(r => console.log(`${r.table_name}.${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

checkConfig();

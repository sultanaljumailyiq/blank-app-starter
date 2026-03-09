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

async function inspect() {
    try {
        await client.connect();

        console.log("--- COLUMNS ---");
        const cols = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'financial_transactions'
            ORDER BY ordinal_position;
        `);
        cols.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log("\n--- CONSTRAINTS ---");
        const constraints = await client.query(`
            SELECT
                tc.constraint_name, 
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
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='financial_transactions';
        `);

        console.log("\n--- CONSTRAINTS INVOLVING PATIENTS ---");
        constraints.rows.forEach(r => {
            if (r.foreign_table_name === 'patients' || r.table_name === 'patients') {
                console.log(`${r.constraint_name}: ${r.table_name}.${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`);
            }
        });

        console.log("\n--- ALL FINANCIAL TRANSACTIONS FKs ---");
        constraints.rows.forEach(r => {
            console.log(`${r.constraint_name}: ${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspect();

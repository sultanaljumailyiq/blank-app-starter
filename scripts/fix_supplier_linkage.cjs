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

const run = async () => {
    try {
        await client.connect();
        console.log('Connected');

        // Link the supplier to the supplier-role user
        const result = await client.query(
            "UPDATE suppliers SET user_id = '64c72ad9-fa3a-4aaf-84b8-513ab96d6cdc', profile_id = '64c72ad9-fa3a-4aaf-84b8-513ab96d6cdc' WHERE user_id IS NULL RETURNING id, name"
        );
        console.log('Updated:', JSON.stringify(result.rows));

        // Verify
        const verify = await client.query('SELECT id, name, user_id, profile_id FROM suppliers');
        console.log('Final:', JSON.stringify(verify.rows));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
};

run();

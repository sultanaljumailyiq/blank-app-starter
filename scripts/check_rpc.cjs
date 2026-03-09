const { Client } = require('pg');

const client = new Client({
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        // Let's test the RPC manually
        const res = await client.query("SELECT public.get_lab_conversations('cde7177b-c690-42a8-b6b7-11953bf83819'::uuid)");
        console.log("RPC Output:", JSON.stringify(res.rows[0], null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

run();

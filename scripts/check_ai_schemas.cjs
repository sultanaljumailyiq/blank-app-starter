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

async function checkSchemas() {
    try {
        await client.connect();

        console.log("--- ai_usage_logs Columns ---");
        const resLogs = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ai_usage_logs'
        `);
        resLogs.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));

        console.log("\n--- ai_agents Columns ---");
        const resAgents = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ai_agents'
        `);
        resAgents.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSchemas();

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

async function checkAIConfig() {
    try {
        await client.connect();

        console.log("--- Current AI Agent Configuration ---");
        const res = await client.query(`
            SELECT id, name, provider, model, is_active, temperature 
            FROM public.ai_agents
        `);

        if (res.rows.length > 0) {
            res.rows.forEach(row => {
                console.log(`\nID: ${row.id}`);
                console.log(`Name: ${row.name}`);
                console.log(`Provider: ${row.provider}`);
                console.log(`Model: ${row.model}`);
                console.log(`Active: ${row.is_active}`);
                console.log(`Temp: ${row.temperature}`);
            });
        } else {
            console.log("No AI agents found in DB.");
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkAIConfig();

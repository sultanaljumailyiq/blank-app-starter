const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const verifyData = async () => {
    const client = new Client(DB_CONFIG);
    await client.connect();

    try {
        console.log('--- Subscription Plans ---');
        const plans = await client.query('SELECT name, name_en, price FROM subscription_plans');
        plans.rows.forEach(r => console.log(`- ${r.name} (${r.name_en}): ${JSON.stringify(r.price)}`));

        console.log('\n--- Payment Methods ---');
        const methods = await client.query('SELECT name, type, is_active FROM payment_methods');
        methods.rows.forEach(r => console.log(`- ${r.name} (${r.type}): ${r.is_active ? 'Active' : 'Inactive'}`));

        console.log('\n--- Agents ---');
        const agents = await client.query('SELECT name, code, status FROM agents');
        if (agents.rows.length === 0) console.log('No agents found (Table exists).');
        else agents.rows.forEach(r => console.log(`- ${r.name} (${r.code}): ${r.status}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
};

verifyData();

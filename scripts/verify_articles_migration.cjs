const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const checkArticles = async () => {
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();
        const res = await client.query('SELECT count(*) FROM public.articles');
        console.log('✅ Article count:', res.rows[0].count);

        const single = await client.query('SELECT * FROM public.articles LIMIT 1');
        console.log('✅ Example article:', JSON.stringify(single.rows[0], null, 2));
    } catch (err) {
        console.error('❌ Error checking articles:', err.message);
    } finally {
        await client.end();
    }
};

checkArticles();

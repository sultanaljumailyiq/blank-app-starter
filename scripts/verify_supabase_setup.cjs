const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const verifySetup = async () => {
    console.log('🚀 Connecting to Supabase for Verification...');
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();

        console.log('\n--- Checking Tables ---');
        const tablesToCheck = ['subscription_plans', 'agents', 'payment_methods', 'subscription_requests', 'coupons'];
        const { rows: tables } = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ANY($1::text[])
        `, [tablesToCheck]);

        const foundTables = tables.map(t => t.table_name);
        tablesToCheck.forEach(t => {
            if (foundTables.includes(t)) console.log(`✅ Table '${t}' exists.`);
            else console.log(`❌ Table '${t}' MISSING.`);
        });


        console.log('\n--- Checking Storage Buckets ---');
        const bucketsToCheck = ['platform-assets', 'documents'];
        const { rows: buckets } = await client.query(`
            SELECT id, public 
            FROM storage.buckets 
            WHERE id = ANY($1::text[])
        `, [bucketsToCheck]);

        const foundBuckets = buckets.map(b => b.id);
        bucketsToCheck.forEach(b => {
            const bucket = buckets.find(x => x.id === b);
            if (bucket) console.log(`✅ Bucket '${b}' exists (Public: ${bucket.public}).`);
            else console.log(`❌ Bucket '${b}' MISSING.`);
        });

    } catch (err) {
        console.error('❌ CHECK FAILED:', err.message);
    } finally {
        await client.end();
    }
};

verifySetup();

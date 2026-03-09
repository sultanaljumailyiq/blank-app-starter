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

const sql = `
DO $$ 
BEGIN 
    -- Add priority column to appointments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'priority') THEN
        ALTER TABLE appointments ADD COLUMN priority TEXT DEFAULT 'normal';
        RAISE NOTICE 'Added priority column';
    ELSE
        RAISE NOTICE 'priority column already exists';
    END IF;

    -- Add type column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'type') THEN
        ALTER TABLE appointments ADD COLUMN type TEXT DEFAULT 'consultation';
        RAISE NOTICE 'Added type column';
    ELSE
        RAISE NOTICE 'type column already exists';
    END IF;
END $$;
`;

async function applyMigration() {
    console.log('Connecting...');
    try {
        await client.connect();
        console.log('Connected. Applying migration...');
        await client.query(sql);
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();

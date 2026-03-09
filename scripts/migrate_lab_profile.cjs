const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const run = async () => {
    const client = new Client(DB_CONFIG);
    await client.connect();
    console.log('Connected to Supabase ✓\n');

    const steps = [
        {
            name: 'Add governorate column to dental_laboratories',
            sql: `ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS governorate text;`
        },
        {
            name: 'Add governorate column to profiles',
            sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS governorate text;`
        },
        {
            name: 'Migrate existing address data: split Governorate - Street',
            sql: `
                UPDATE dental_laboratories
                SET
                    governorate = TRIM(SPLIT_PART(address, ' - ', 1)),
                    address = TRIM(SUBSTRING(address FROM POSITION(' - ' IN address) + 3))
                WHERE address LIKE '% - %';
            `
        },
        {
            name: 'Drop old UPDATE policies if any exist',
            sql: `
                DO $$
                BEGIN
                    DROP POLICY IF EXISTS "Lab owner can update their lab" ON dental_laboratories;
                    DROP POLICY IF EXISTS "Lab owner can insert their lab" ON dental_laboratories;
                EXCEPTION WHEN OTHERS THEN NULL;
                END $$;
            `
        },
        {
            name: 'Create UPDATE RLS policy: lab owner can update their own row',
            sql: `
                CREATE POLICY "Lab owner can update their lab"
                ON dental_laboratories
                FOR UPDATE
                USING (auth.uid() = user_id)
                WITH CHECK (auth.uid() = user_id);
            `
        },
        {
            name: 'Create INSERT RLS policy: lab owner can insert',
            sql: `
                CREATE POLICY "Lab owner can insert their lab"
                ON dental_laboratories
                FOR INSERT
                WITH CHECK (auth.uid() = user_id);
            `
        },
        {
            name: 'Sync profiles.full_name → dental_laboratories.name for lab cde7177b',
            sql: `
                UPDATE profiles
                SET full_name = (
                    SELECT name FROM dental_laboratories
                    WHERE user_id = 'cde7177b-c690-42a8-b6b7-11953bf83819'
                    LIMIT 1
                )
                WHERE id = 'cde7177b-c690-42a8-b6b7-11953bf83819'
                AND EXISTS (
                    SELECT 1 FROM dental_laboratories
                    WHERE user_id = 'cde7177b-c690-42a8-b6b7-11953bf83819'
                    AND name IS NOT NULL
                );
            `
        }
    ];

    for (const step of steps) {
        try {
            await client.query(step.sql);
            console.log(`✅ ${step.name}`);
        } catch (err) {
            console.error(`❌ ${step.name}: ${err.message}`);
        }
    }

    // Verify
    console.log('\n=== VERIFICATION ===');
    const { rows: policies } = await client.query(`
        SELECT policyname, cmd FROM pg_policies WHERE tablename = 'dental_laboratories'
    `);
    console.log('RLS Policies:', policies.map(p => `${p.policyname} (${p.cmd})`).join(', '));

    const { rows: cols } = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'dental_laboratories' AND column_name IN ('address', 'governorate', 'phone', 'email')
    `);
    console.log('Columns:', cols.map(c => c.column_name).join(', '));

    await client.end();
    console.log('\nDone ✓');
};

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

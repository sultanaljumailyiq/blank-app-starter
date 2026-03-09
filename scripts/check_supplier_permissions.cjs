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

const check = async () => {
    try {
        await client.connect();
        console.log('✅ Connected to Supabase DB\n');

        // 1. Check if 'logo' column exists in suppliers table
        console.log('=== 1. SUPPLIERS TABLE - logo column ===');
        const logoCol = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'suppliers'
            AND column_name IN ('logo', 'logo_url', 'image_url', 'avatar');
        `);
        if (logoCol.rows.length > 0) {
            logoCol.rows.forEach(r => console.log(`  ✅ ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`));
        } else {
            console.log('  ❌ No logo/image column found! Need to add one.');
        }

        // 2. Check if 'logo' column exists in profiles table (for community profile)
        console.log('\n=== 2. PROFILES TABLE - avatar column ===');
        const profileCols = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'profiles'
            AND column_name IN ('avatar', 'avatar_url', 'logo', 'image_url', 'photo_url');
        `);
        if (profileCols.rows.length > 0) {
            profileCols.rows.forEach(r => console.log(`  ✅ ${r.column_name} (${r.data_type})`));
        } else {
            console.log('  ❌ No avatar/image column found in profiles!');
        }

        // 3. Check RLS policies on suppliers table
        console.log('\n=== 3. RLS POLICIES on suppliers ===');
        const rlsEnabled = await client.query(`
            SELECT relname, relrowsecurity
            FROM pg_class WHERE relname = 'suppliers';
        `);
        if (rlsEnabled.rows.length > 0) {
            console.log(`  RLS enabled: ${rlsEnabled.rows[0].relrowsecurity}`);
        }

        const policies = await client.query(`
            SELECT policyname, cmd, qual, with_check
            FROM pg_policies
            WHERE tablename = 'suppliers';
        `);
        if (policies.rows.length > 0) {
            policies.rows.forEach(p => {
                console.log(`\n  📜 Policy: "${p.policyname}"`);
                console.log(`     Command: ${p.cmd}`);
                console.log(`     USING: ${p.qual || 'none'}`);
                console.log(`     WITH CHECK: ${p.with_check || 'none'}`);
            });
        } else {
            console.log('  ❌ No RLS policies found on suppliers table!');
        }

        // 4. Check RLS policies on profiles table  
        console.log('\n=== 4. RLS POLICIES on profiles ===');
        const profilePolicies = await client.query(`
            SELECT policyname, cmd, qual, with_check
            FROM pg_policies
            WHERE tablename = 'profiles';
        `);
        if (profilePolicies.rows.length > 0) {
            profilePolicies.rows.forEach(p => {
                console.log(`\n  📜 Policy: "${p.policyname}"`);
                console.log(`     Command: ${p.cmd}`);
            });
        } else {
            console.log('  ❌ No RLS policies found on profiles table!');
        }

        // 5. Check storage buckets
        console.log('\n=== 5. STORAGE BUCKETS ===');
        const buckets = await client.query(`
            SELECT id, name, public
            FROM storage.buckets;
        `);
        if (buckets.rows.length > 0) {
            buckets.rows.forEach(b => {
                console.log(`  📦 Bucket: "${b.name}" (id: ${b.id}, public: ${b.public})`);
            });
        } else {
            console.log('  ❌ No storage buckets found!');
        }

        // 6. Check storage policies for avatar bucket
        console.log('\n=== 6. STORAGE POLICIES ===');
        const storagePolicies = await client.query(`
            SELECT policyname, cmd, qual, with_check
            FROM pg_policies
            WHERE tablename = 'objects' AND schemaname = 'storage';
        `);
        if (storagePolicies.rows.length > 0) {
            storagePolicies.rows.forEach(p => {
                console.log(`\n  📜 Policy: "${p.policyname}"`);
                console.log(`     Command: ${p.cmd}`);
            });
        } else {
            console.log('  ❌ No storage policies found!');
        }

        // 7. Check if a specific supplier has logo data
        console.log('\n=== 7. SAMPLE SUPPLIER DATA ===');
        const sample = await client.query(`
            SELECT id, name, logo, user_id, profile_id
            FROM suppliers LIMIT 3;
        `);
        sample.rows.forEach(s => {
            console.log(`  👤 ${s.name}: logo=${s.logo || 'NULL'}, user_id=${s.user_id || 'NULL'}, profile_id=${s.profile_id || 'NULL'}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
};

check();

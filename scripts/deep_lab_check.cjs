const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

async function deepLabCheck() {
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // 1. Check dental_lab_orders columns
        console.log('='.repeat(80));
        console.log('1. dental_lab_orders TABLE SCHEMA');
        console.log('='.repeat(80));
        const ordersSchema = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'dental_lab_orders'
            ORDER BY ordinal_position
        `);
        if (ordersSchema.rows.length === 0) {
            console.log('❌ Table dental_lab_orders does NOT exist');
        } else {
            ordersSchema.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | nullable: ${r.is_nullable} | default: ${r.column_default || 'none'}`));
            console.log(`\n  Total columns: ${ordersSchema.rows.length}`);
        }

        // 2. Check dental_lab_orders_backup columns
        console.log('\n' + '='.repeat(80));
        console.log('2. dental_lab_orders_backup TABLE SCHEMA');
        console.log('='.repeat(80));
        const backupSchema = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'dental_lab_orders_backup'
            ORDER BY ordinal_position
        `);
        if (backupSchema.rows.length === 0) {
            console.log('❌ Table dental_lab_orders_backup does NOT exist');
        } else {
            backupSchema.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | nullable: ${r.is_nullable} | default: ${r.column_default || 'none'}`));
            console.log(`\n  Total columns: ${backupSchema.rows.length}`);
        }

        // 3. Compare dental_lab_orders vs dental_lab_orders_backup
        console.log('\n' + '='.repeat(80));
        console.log('3. COMPARISON: dental_lab_orders vs dental_lab_orders_backup');
        console.log('='.repeat(80));
        const orderCols = new Set(ordersSchema.rows.map(r => r.column_name));
        const backupCols = new Set(backupSchema.rows.map(r => r.column_name));
        const onlyInOrders = [...orderCols].filter(c => !backupCols.has(c));
        const onlyInBackup = [...backupCols].filter(c => !orderCols.has(c));
        const common = [...orderCols].filter(c => backupCols.has(c));
        console.log(`  Common columns (${common.length}): ${common.join(', ')}`);
        console.log(`  Only in dental_lab_orders (${onlyInOrders.length}): ${onlyInOrders.join(', ') || 'none'}`);
        console.log(`  Only in dental_lab_orders_backup (${onlyInBackup.length}): ${onlyInBackup.join(', ') || 'none'}`);

        // 4. Row counts
        console.log('\n' + '='.repeat(80));
        console.log('4. ROW COUNTS');
        console.log('='.repeat(80));
        const tables = [
            'dental_lab_orders', 'dental_lab_orders_backup',
            'dental_lab_representatives', 'lab_delegates',
            'lab_chat_conversations', 'lab_chat_messages',
            'lab_conversation_messages', 'lab_conversations',
            'dental_laboratories'
        ];
        for (const t of tables) {
            try {
                const res = await client.query(`SELECT COUNT(*) as cnt FROM public."${t}"`);
                console.log(`  ${t}: ${res.rows[0].cnt} rows`);
            } catch (e) {
                console.log(`  ${t}: ❌ Table does not exist or access denied`);
            }
        }

        // 5. dental_lab_representatives schema
        console.log('\n' + '='.repeat(80));
        console.log('5. dental_lab_representatives TABLE SCHEMA');
        console.log('='.repeat(80));
        const repSchema = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'dental_lab_representatives'
            ORDER BY ordinal_position
        `);
        if (repSchema.rows.length === 0) {
            console.log('❌ Table dental_lab_representatives does NOT exist');
        } else {
            repSchema.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | nullable: ${r.is_nullable} | default: ${r.column_default || 'none'}`));
        }

        // 6. lab_delegates schema
        console.log('\n' + '='.repeat(80));
        console.log('6. lab_delegates TABLE SCHEMA');
        console.log('='.repeat(80));
        const delSchema = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'lab_delegates'
            ORDER BY ordinal_position
        `);
        if (delSchema.rows.length === 0) {
            console.log('❌ Table lab_delegates does NOT exist');
        } else {
            delSchema.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | nullable: ${r.is_nullable} | default: ${r.column_default || 'none'}`));
        }

        // 7. Chat tables schemas
        const chatTables = ['lab_chat_conversations', 'lab_chat_messages', 'lab_conversation_messages', 'lab_conversations'];
        for (const t of chatTables) {
            console.log('\n' + '='.repeat(80));
            console.log(`7. ${t} TABLE SCHEMA`);
            console.log('='.repeat(80));
            const chatSchema = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = '${t}'
                ORDER BY ordinal_position
            `);
            if (chatSchema.rows.length === 0) {
                console.log(`  ❌ Table ${t} does NOT exist`);
            } else {
                chatSchema.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | nullable: ${r.is_nullable} | default: ${r.column_default || 'none'}`));
            }
        }

        // 8. Check for missing columns in dental_lab_orders
        console.log('\n' + '='.repeat(80));
        console.log('8. MISSING COLUMNS CHECK in dental_lab_orders');
        console.log('='.repeat(80));
        const neededCols = ['delegate_id', 'delegate_name', 'is_return_cycle', 'return_reason', 'paid_amount', 'delivery_date', 'files', 'description', 'staff_id'];
        for (const col of neededCols) {
            const exists = orderCols.has(col);
            console.log(`  ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        }
        // Check doctor_id / doctor_name (should be renamed)
        console.log(`  doctor_id (should be staff_id): ${orderCols.has('doctor_id') ? '⚠️ EXISTS (needs rename)' : '✅ Already renamed or missing'}`);
        console.log(`  doctor_name (should be staff_name): ${orderCols.has('doctor_name') ? '⚠️ EXISTS (needs rename)' : '✅ Already renamed or missing'}`);

        // 9. Check foreign keys on dental_lab_orders
        console.log('\n' + '='.repeat(80));
        console.log('9. FOREIGN KEYS on dental_lab_orders');
        console.log('='.repeat(80));
        const fkeys = await client.query(`
            SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'dental_lab_orders'
        `);
        if (fkeys.rows.length === 0) {
            console.log('  No foreign keys found');
        } else {
            fkeys.rows.forEach(r => console.log(`  ${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name} (${r.constraint_name})`));
        }

        // 10. Check RLS policies on dental_lab_orders
        console.log('\n' + '='.repeat(80));
        console.log('10. RLS POLICIES on dental_lab_orders');
        console.log('='.repeat(80));
        const policies = await client.query(`
            SELECT policyname, permissive, roles, cmd, qual
            FROM pg_policies
            WHERE tablename = 'dental_lab_orders'
        `);
        if (policies.rows.length === 0) {
            console.log('  No RLS policies found');
        } else {
            policies.rows.forEach(r => console.log(`  Policy: ${r.policyname} | cmd: ${r.cmd} | permissive: ${r.permissive} | roles: ${r.roles}`));
        }

        // 11. Check RLS enabled
        console.log('\n' + '='.repeat(80));
        console.log('11. RLS ENABLED STATUS for lab tables');
        console.log('='.repeat(80));
        const rlsCheck = await client.query(`
            SELECT relname, relrowsecurity, relforcerowsecurity
            FROM pg_class
            WHERE relname IN ('dental_lab_orders', 'dental_lab_orders_backup', 'dental_lab_representatives', 'lab_delegates',
                              'lab_chat_conversations', 'lab_chat_messages', 'lab_conversation_messages', 'lab_conversations')
            ORDER BY relname
        `);
        rlsCheck.rows.forEach(r => console.log(`  ${r.relname}: RLS=${r.relrowsecurity}, Force=${r.relforcerowsecurity}`));

        // 12. Sample data from dental_lab_orders (last 3)
        console.log('\n' + '='.repeat(80));
        console.log('12. SAMPLE DATA: Last 3 rows from dental_lab_orders');
        console.log('='.repeat(80));
        try {
            const sample = await client.query(`SELECT * FROM dental_lab_orders ORDER BY created_at DESC LIMIT 3`);
            sample.rows.forEach((r, i) => {
                console.log(`  --- Row ${i + 1} ---`);
                Object.entries(r).forEach(([k, v]) => {
                    const val = v === null ? 'NULL' : (typeof v === 'object' ? JSON.stringify(v) : String(v).substring(0, 100));
                    console.log(`    ${k}: ${val}`);
                });
            });
        } catch (e) {
            console.log('  ❌ Could not fetch sample data:', e.message);
        }

        // 13. Check indexes on dental_lab_orders
        console.log('\n' + '='.repeat(80));
        console.log('13. INDEXES on dental_lab_orders');
        console.log('='.repeat(80));
        const indexes = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'dental_lab_orders'
        `);
        if (indexes.rows.length === 0) {
            console.log('  No indexes found');
        } else {
            indexes.rows.forEach(r => console.log(`  ${r.indexname}: ${r.indexdef}`));
        }

        // 14. All lab-related tables
        console.log('\n' + '='.repeat(80));
        console.log('14. ALL LAB-RELATED TABLES IN DATABASE');
        console.log('='.repeat(80));
        const allLabTables = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND (table_name LIKE '%lab%' OR table_name LIKE '%dental%')
            ORDER BY table_name
        `);
        allLabTables.rows.forEach(r => console.log(`  ${r.table_name}`));

        // 15. Check RLS policies on chat tables
        for (const t of chatTables) {
            console.log('\n' + '='.repeat(80));
            console.log(`15. RLS POLICIES on ${t}`);
            console.log('='.repeat(80));
            const chatPolicies = await client.query(`
                SELECT policyname, permissive, roles, cmd, qual
                FROM pg_policies
                WHERE tablename = '${t}'
            `);
            if (chatPolicies.rows.length === 0) {
                console.log(`  No RLS policies found for ${t}`);
            } else {
                chatPolicies.rows.forEach(r => console.log(`  Policy: ${r.policyname} | cmd: ${r.cmd} | permissive: ${r.permissive}`));
            }
        }

        // 16. Sample data from chat tables
        for (const t of chatTables) {
            console.log('\n' + '='.repeat(80));
            console.log(`16. SAMPLE DATA from ${t} (last 2 rows)`);
            console.log('='.repeat(80));
            try {
                const sample = await client.query(`SELECT * FROM "${t}" ORDER BY created_at DESC LIMIT 2`);
                if (sample.rows.length === 0) {
                    console.log('  No data');
                } else {
                    sample.rows.forEach((r, i) => {
                        console.log(`  --- Row ${i + 1} ---`);
                        Object.entries(r).forEach(([k, v]) => {
                            const val = v === null ? 'NULL' : (typeof v === 'object' ? JSON.stringify(v) : String(v).substring(0, 150));
                            console.log(`    ${k}: ${val}`);
                        });
                    });
                }
            } catch (e) {
                console.log(`  ❌ Could not fetch: ${e.message}`);
            }
        }

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await client.end();
        console.log('\n✅ Done.');
    }
}

deepLabCheck();

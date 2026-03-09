const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

async function runMigration() {
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();
        console.log('Connected. Running migrations...\n');

        // ====================================================
        // 1. dental_lab_orders - Add missing columns
        // ====================================================
        console.log('1. Adding missing columns to dental_lab_orders...');

        const orderColumns = [
            `ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS delegate_id uuid`,
            `ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS delegate_name text`,
            `ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS is_return_cycle boolean DEFAULT false`,
            `ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS return_reason text`,
            `ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0`,
            `ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS delivery_date date`,
            `ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'`,
            `ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS description text`,
        ];

        for (const sql of orderColumns) {
            try {
                await client.query(sql);
                const col = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
                console.log(`  ✅ dental_lab_orders.${col}`);
            } catch (e) {
                console.log(`  ⚠️  ${sql.substring(0, 60)}... -> ${e.message}`);
            }
        }

        // ====================================================
        // 2. lab_chat_conversations - Add missing columns
        // ====================================================
        console.log('\n2. Adding missing columns to lab_chat_conversations...');

        const convColumns = [
            `ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS clinic_id integer`,
            `ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS clinic_name text`,
            `ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS lab_name text`,
            `ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS conversation_type text DEFAULT 'order'`,
            `ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS last_message text`,
            `ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS unread_count_lab integer DEFAULT 0`,
            `ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS unread_count_clinic integer DEFAULT 0`,
        ];

        for (const sql of convColumns) {
            try {
                await client.query(sql);
                const col = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
                console.log(`  ✅ lab_chat_conversations.${col}`);
            } catch (e) {
                console.log(`  ⚠️  ${sql.substring(0, 60)}... -> ${e.message}`);
            }
        }

        // ====================================================
        // 3. lab_chat_messages - Add missing columns
        // ====================================================
        console.log('\n3. Adding missing columns to lab_chat_messages...');

        const msgColumns = [
            `ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS sender_name text`,
            `ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text'`,
            `ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS file_url text`,
            `ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS order_id uuid`,
            `ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS staff_record_id integer`,
        ];

        for (const sql of msgColumns) {
            try {
                await client.query(sql);
                const col = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
                console.log(`  ✅ lab_chat_messages.${col}`);
            } catch (e) {
                console.log(`  ⚠️  ${sql.substring(0, 60)}... -> ${e.message}`);
            }
        }

        // ====================================================
        // 4. clinic_lab_favorites - Add custom_lab_id support if missing
        // ====================================================
        console.log('\n4. Ensuring clinic_lab_favorites supports custom labs...');
        try {
            await client.query(`
                ALTER TABLE clinic_lab_favorites 
                ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false
            `);
            console.log('  ✅ clinic_lab_favorites.is_custom');
        } catch (e) {
            console.log(`  ⚠️  is_custom -> ${e.message}`);
        }

        // ====================================================
        // 5. Verify final shapes
        // ====================================================
        console.log('\n5. Verifying column counts...');
        for (const table of ['dental_lab_orders', 'lab_chat_conversations', 'lab_chat_messages', 'clinic_lab_favorites']) {
            const res = await client.query(
                `SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
                [table]
            );
            console.log(`  ${table}: ${res.rows[0].cnt} columns`);
        }

        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('FATAL ERROR:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();

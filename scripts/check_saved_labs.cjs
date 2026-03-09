const { Client } = require('pg');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

async function checkSavedLabs() {
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();

        // 1. clinic_lab_favorites schema
        console.log('=== clinic_lab_favorites SCHEMA ===');
        const fav = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'clinic_lab_favorites'
            ORDER BY ordinal_position
        `);
        if (fav.rows.length === 0) console.log('TABLE NOT FOUND');
        else fav.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | ${r.is_nullable} | ${r.column_default || '-'}`));

        // 2. clinic_saved_labs schema
        console.log('\n=== clinic_saved_labs SCHEMA ===');
        const saved = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'clinic_saved_labs'
            ORDER BY ordinal_position
        `);
        if (saved.rows.length === 0) console.log('TABLE NOT FOUND');
        else saved.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | ${r.is_nullable} | ${r.column_default || '-'}`));

        // 3. clinic_custom_labs schema
        console.log('\n=== clinic_custom_labs SCHEMA ===');
        const custom = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'clinic_custom_labs'
            ORDER BY ordinal_position
        `);
        if (custom.rows.length === 0) console.log('TABLE NOT FOUND');
        else custom.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | ${r.is_nullable} | ${r.column_default || '-'}`));

        // 4. Row counts
        console.log('\n=== ROW COUNTS ===');
        for (const t of ['clinic_lab_favorites', 'clinic_saved_labs', 'clinic_custom_labs']) {
            try {
                const res = await client.query(`SELECT COUNT(*) as cnt FROM public."${t}"`);
                console.log(`  ${t}: ${res.rows[0].cnt} rows`);
            } catch (e) {
                console.log(`  ${t}: ERROR - ${e.message}`);
            }
        }

        // 5. Sample data
        for (const t of ['clinic_lab_favorites', 'clinic_saved_labs', 'clinic_custom_labs']) {
            console.log(`\n=== SAMPLE: ${t} ===`);
            try {
                const res = await client.query(`SELECT * FROM "${t}" LIMIT 3`);
                if (res.rows.length === 0) console.log('  (empty)');
                else res.rows.forEach((r, i) => {
                    console.log(`  Row ${i + 1}:`);
                    Object.entries(r).forEach(([k, v]) => {
                        const val = v === null ? 'NULL' : (typeof v === 'object' ? JSON.stringify(v) : String(v).substring(0, 100));
                        console.log(`    ${k}: ${val}`);
                    });
                });
            } catch (e) {
                console.log(`  ERROR: ${e.message}`);
            }
        }

        // 6. Compare columns
        console.log('\n=== COMPARISON: clinic_lab_favorites vs clinic_saved_labs ===');
        const favCols = new Set(fav.rows.map(r => r.column_name));
        const savedCols = new Set(saved.rows.map(r => r.column_name));
        console.log(`  Only in favorites: ${[...favCols].filter(c => !savedCols.has(c)).join(', ') || 'none'}`);
        console.log(`  Only in saved_labs: ${[...savedCols].filter(c => !favCols.has(c)).join(', ') || 'none'}`);
        console.log(`  Common: ${[...favCols].filter(c => savedCols.has(c)).join(', ')}`);

        // 7. Check lab_chat_conversations columns - for staff tracking
        console.log('\n=== lab_chat_conversations - full details ===');
        const chatConv = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'lab_chat_conversations'
            ORDER BY ordinal_position
        `);
        chatConv.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type}`));

        console.log('\n=== lab_chat_messages - full details ===');
        const chatMsg = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'lab_chat_messages'
            ORDER BY ordinal_position
        `);
        chatMsg.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type}`));

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await client.end();
        console.log('\nDone.');
    }
}

checkSavedLabs();

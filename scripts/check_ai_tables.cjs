const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking AI Tables...');

    const tables = ['ai_agents', 'ai_usage_logs'];

    for (const table of tables) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

        if (error) {
            console.error(`Error checking table '${table}':`, error.message);
        } else {
            console.log(`Table '${table}' exists. Rows found: ${data.length}`);

            // Check seeds for ai_agents
            if (table === 'ai_agents') {
                const { data: agents } = await supabase.from('ai_agents').select('id, provider, model');
                console.log('Agents found:', agents);
            }
        }
    }
}

checkTables();

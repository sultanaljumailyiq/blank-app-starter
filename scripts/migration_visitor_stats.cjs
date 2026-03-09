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

async function runMigration() {
    try {
        await client.connect();

        console.log("Running Migration...");

        // 1. Add session_id to ai_usage_logs
        console.log("Adding session_id to ai_usage_logs...");
        await client.query(`
            ALTER TABLE public.ai_usage_logs 
            ADD COLUMN IF NOT EXISTS session_id text;
        `);

        // 2. Ensure ai_agents table exists and has is_active
        console.log("Checking/Creating ai_agents table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.ai_agents (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                name text NOT NULL,
                slug text UNIQUE NOT NULL,
                description text,
                is_active boolean DEFAULT true,
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
            );
        `);

        // Ensure is_active column exists if table already existed
        await client.query(`
            ALTER TABLE public.ai_agents 
            ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
        `);

        // Seed default agents if empty
        const agents = [
            { name: 'Patient Care', slug: 'patient-care', description: 'المساعد الذكي للمرضى' },
            { name: 'Diagnosis Assistant', slug: 'diagnosis-assistant', description: 'مساعد التشخيص الطبي' }
        ];

        for (const agent of agents) {
            await client.query(`
                INSERT INTO public.ai_agents (name, slug, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (slug) DO UPDATE 
                SET description = EXCLUDED.description;
            `, [agent.name, agent.slug, agent.description]);
        }

        console.log("Migration Complete!");

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

runMigration();

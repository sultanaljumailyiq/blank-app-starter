const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf-8').split('\n').reduce((acc, line) => {
        const [key, val] = line.split('=');
        if (key && val) acc[key.trim()] = val.trim();
        return acc;
    }, {})
    : {};

const connectionString = process.env.DATABASE_URL || envConfig.DATABASE_URL || envConfig.VITE_DATABASE_URL;

if (!connectionString) {
    console.error("❌ Error: No DATABASE_URL found in .env or environment variables.");
    console.error("Please add DATABASE_URL=postgres://... to your .env file.");
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function runUpdates() {
    try {
        console.log("🔌 Connecting to Database...");
        await client.connect();
        console.log("✅ Connected.");

        const migrations = [
            'supabase/migrations/20260125_fix_activation_logic.sql',
            'supabase/migrations/20260125_fix_lab_services_key.sql'
        ];

        for (const file of migrations) {
            const filePath = path.resolve(process.cwd(), file);
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️ Warning: Migration file not found: ${file}`);
                continue;
            }

            console.log(`\n📄 Applying: ${file}...`);
            const sql = fs.readFileSync(filePath, 'utf-8');

            await client.query(sql);
            console.log("✅ Applied successfully.");
        }

        console.log("\n🎉 All updates transferred to database successfully!");

    } catch (err) {
        console.error("❌ Error executing updates:", err);
    } finally {
        await client.end();
    }
}

runUpdates();

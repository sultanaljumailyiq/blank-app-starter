
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

// Manual .env reader
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf-8').split('\n').reduce((acc, line) => {
        const [key, val] = line.split('=');
        if (key && val) acc[key.trim()] = val.trim();
        return acc;
    }, {})
    : {};

const connectionString = envConfig.DATABASE_URL || envConfig.VITE_DATABASE_URL;

if (!connectionString) {
    console.error("No DATABASE_URL found in .env");
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to DB via pg");

        const sql = `
        -- Enable read access for all authenticated users on store_orders
        DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."store_orders";
        CREATE POLICY "Enable read access for all users" ON "public"."store_orders" FOR SELECT USING (true);

        -- Enable read access for all authenticated users on store_order_items
        DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."store_order_items";
        CREATE POLICY "Enable read access for all users" ON "public"."store_order_items" FOR SELECT USING (true);
        `;

        await client.query(sql);
        console.log("✅ RLS Policies Updated Successfully!");

    } catch (err) {
        console.error("Error executing SQL:", err);
    } finally {
        await client.end();
    }
}

run();

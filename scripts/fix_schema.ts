
import pkg from 'pg';
const { Client } = pkg;
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.warn('Could not read .env file');
}

const getEnv = (key: string) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const connectionString = getEnv('DATABASE_URL');

if (!connectionString) {
    console.error('Missing DATABASE_URL in .env');
    process.exit(1);
}

async function fixSchema() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase/Neon? Usually yes.
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Check is_featured
        const checkFeatured = await client.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'is_featured'"
        );

        if (checkFeatured.rows.length === 0) {
            console.log('Adding is_featured column...');
            await client.query("ALTER TABLE clinics ADD COLUMN is_featured BOOLEAN DEFAULT false;");
            console.log('Added is_featured.');
        } else {
            console.log('is_featured already exists.');
        }

        // 2. Check is_digital_booking
        const checkDigital = await client.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'is_digital_booking'"
        );

        if (checkDigital.rows.length === 0) {
            console.log('Adding is_digital_booking column...');
            await client.query("ALTER TABLE clinics ADD COLUMN is_digital_booking BOOLEAN DEFAULT false;");
            console.log('Added is_digital_booking.');
        } else {
            console.log('is_digital_booking already exists.');
        }

        // 3. Check settings
        const checkSettings = await client.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'settings'"
        );

        if (checkSettings.rows.length === 0) {
            console.log('Adding settings column...');
            await client.query("ALTER TABLE clinics ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;");
            console.log('Added settings.');
        } else {
            console.log('settings already exists.');
        }

        console.log('Schema fix completed.');

    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        await client.end();
    }
}

fixSchema();

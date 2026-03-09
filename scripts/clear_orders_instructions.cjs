const { createClient } = require('@supabase/supabase-js');

// Hardcoded Credentials just for this script (Local/Dev)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://aws-1-ap-southeast-1.pooler.supabase.com'; // Placeholder
// Actually I need the service role key to bypass RLS for truncation, or just use the user's client if they have delete rights.
// Since I don't have the service key easily, I'll allow the user to run a migration or SQL.

console.log("Please run the following SQL in your Supabase SQL Editor to clear orders:");
console.log("TRUNCATE TABLE store_order_items CASCADE;");
console.log("TRUNCATE TABLE store_orders CASCADE;");

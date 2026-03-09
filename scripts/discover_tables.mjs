
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function discoverTables() {
    console.log('Discovering available tables...\n');

    // Try common table names
    const tablesToTry = ['profiles', 'users', 'user_profiles', 'accounts', 'members'];

    for (const table of tablesToTry) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

        if (!error) {
            console.log(`✓ Table '${table}' exists!`);
            if (data && data.length > 0) {
                console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
            }
        } else {
            console.log(`✗ Table '${table}' - ${error.message}`);
        }
    }

    // Also check the suppliers table structure
    console.log('\n--- Checking suppliers table structure ---');
    const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .limit(1);

    if (supplierError) {
        console.log('Suppliers table error:', supplierError.message);
    } else if (supplierData && supplierData.length > 0) {
        console.log('Suppliers columns:', Object.keys(supplierData[0]).join(', '));
    } else {
        console.log('Suppliers table exists but is empty. Trying to insert a test record to discover columns...');

        // Use RPC or raw SQL to get table info if needed
        // For now just try a basic insert and see error
        const { error: testInsertError } = await supabase
            .from('suppliers')
            .insert({ test: 'value' }); // This will fail but reveal acceptable columns

        if (testInsertError) {
            console.log('Insert test error (reveals info):', testInsertError.message);
        }
    }
}

discoverTables();

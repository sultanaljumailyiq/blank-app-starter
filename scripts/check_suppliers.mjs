
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSuppliers() {
    console.log('Fetching all suppliers from database (using SELECT *)...');

    // Just get everything
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${data?.length || 0} suppliers.`);
    if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]).join(', '));
        console.log('\nFirst supplier data:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('No suppliers found in the database.');
    }
}

checkSuppliers();

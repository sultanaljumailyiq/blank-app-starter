
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';

const supabase = createClient(supabaseUrl, supabaseKey);

const suppliersToDelete = [
    'شركة الأدوات الطبية العراقية',
    'مؤسسة الرعاية الطبية العراقية',
    'مركز التقنيات الطبية',
    'شركة النجاح للمستلزمات الطبية',
    'مؤسسة الشفاء الطبية'
];

async function deleteFakeSuppliers() {
    console.log('Starting deletion process...');

    for (const name of suppliersToDelete) {
        // Try by company_name
        let { data, error } = await supabase
            .from('suppliers')
            .delete()
            .eq('company_name', name)
            .select();

        if (error) {
            // If column doesn't exist or error, log it but don't stop
            // console.error(`Error deleting ${name} (company_name):`, error.message);
        }

        if (data && data.length > 0) {
            console.log(`Deleted ${name}: ${data.length} record(s) removed.`);
        } else {
            // Try deleting by 'name' column if 'company_name' didn't match (some schema variations use 'name')
            const { data: dataByName, error: errorByName } = await supabase
                .from('suppliers')
                .delete()
                .eq('name', name)
                .select();

            if (errorByName) {
                // console.error(`Error deleting ${name} (by name):`, errorByName.message);
            } else if (dataByName && dataByName.length > 0) {
                console.log(`Deleted ${name} (by name): ${dataByName.length} record(s) removed.`);
            } else {
                console.log(`Supplier not found or already deleted: ${name}`);
            }
        }
    }

    console.log('Cleanup complete.');
}

deleteFakeSuppliers();

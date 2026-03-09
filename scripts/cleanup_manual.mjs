
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
// Using Service Role Key to bypass RLS and delete users without being logged in as admin
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';

// Use the correct variable structure
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const suppliersToDelete = [
    'شركة الأدوات الطبية العراقية', // Iraqi Medical Instruments Company
    'مؤسسة الرعاية الطبية العراقية', // My Medical Care Foundation
    'مركز التقنيات الطبية', // Medical Technology Center
    'شركة النجاح للمستلزمات الطبية', // Success Company for Medical Supplies
    'مؤسسة الشفاء الطبية' // Al-Shifa Medical Foundation
];

async function deleteFakeSuppliers() {
    console.log('Searching for fake suppliers to delete...');

    for (const name of suppliersToDelete) {
        // 1. Find the supplier record(s) first
        // Some might be in 'company_name', some might be in 'name' depending on schema evolution
        let { data: foundByCompany, error: findError } = await supabase
            .from('suppliers')
            .select('id, user_id, company_name')
            .eq('company_name', name);

        if (findError) {
            console.error(`Error finding ${name} (company_name):`, findError.message);
        }

        if (!foundByCompany || foundByCompany.length === 0) {
            // try searching by 'name' column if 'company_name' yields nothing
            const { data: foundByName, error: findByNameError } = await supabase
                .from('suppliers')
                .select('id, user_id, name')
                .eq('name', name);

            if (findByNameError) {
                // console.error(`Error finding ${name} (name):`, findByNameError.message);
            } else if (foundByName && foundByName.length > 0) {
                foundByCompany = foundByName;
            }
        }

        if (foundByCompany && foundByCompany.length > 0) {
            console.log(`Found ${foundByCompany.length} record(s) for "${name}". Deleting...`);

            const idsToDelete = foundByCompany.map(s => s.id);

            // Delete from 'suppliers' table
            const { error: deleteError } = await supabase
                .from('suppliers')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) {
                console.error(`Failed to delete suppliers: ${deleteError.message}`);
            } else {
                console.log(`Successfully deleted supplier record(s) for "${name}".`);
            }

            // Ideally we would also delete from auth.users if we had user_id and admin privilege,
            // but usually the main annoyance is the public record.
            // If user_id exists, launch a separate delete call to auth.admin if available in client sdk (usually server-side only in node)
            // The supabase-js client with service role key HAS admin access.
            for (const record of foundByCompany) {
                if (record.user_id) {
                    try {
                        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(record.user_id);
                        if (deleteUserError) {
                            console.log(`Note: Could not delete associated auth user ${record.user_id}: ${deleteUserError.message}`);
                        } else {
                            console.log(`Also deleted associated auth user ${record.user_id}.`);
                        }
                    } catch (e) {
                        // Ignore auth delete errors as user might not exist or already deleted
                    }
                }
            }

        } else {
            console.log(`No records found for "${name}".`);
        }
    }

    console.log('Cleanup complete.');
}

deleteFakeSuppliers();

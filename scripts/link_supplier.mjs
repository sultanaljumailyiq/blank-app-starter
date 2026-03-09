
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkSupplierFromProfiles() {
    console.log('Looking for supplier user in profiles table...\n');

    // Find the supplier user by email or role
    const { data: supplierUsers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'supplier');

    if (error) {
        console.error('Error finding supplier profiles:', error.message);
        return;
    }

    console.log(`Found ${supplierUsers?.length || 0} supplier profiles:`);

    if (!supplierUsers || supplierUsers.length === 0) {
        console.log('No supplier profiles found. Trying to find by email...');

        const { data: byEmail, error: emailError } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', '%supplier%');

        if (emailError) {
            console.error('Error:', emailError.message);
        } else if (byEmail && byEmail.length > 0) {
            console.log(`Found ${byEmail.length} profiles with 'supplier' in email:`);
            byEmail.forEach(u => {
                console.log(`- ID: ${u.id} | Name: ${u.full_name} | Email: ${u.email} | Role: ${u.role}`);
            });
        }
        return;
    }

    // Display and process supplier users
    for (const user of supplierUsers) {
        console.log(`- ID: ${user.id}`);
        console.log(`  Name: ${user.full_name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  City: ${user.city}`);
        console.log(`  Role: ${user.role}`);
        console.log('');

        // Check if supplier record exists
        const { data: existingSupplier } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', user.id)
            .single();

        if (existingSupplier) {
            console.log('  -> Supplier record already exists!');
        } else {
            console.log('  -> No supplier record found. Creating one...');

            // Create supplier record
            const { error: insertError } = await supabase
                .from('suppliers')
                .insert({
                    id: user.id,
                    name: user.full_name || 'شركة المورد (تجريبي)',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.city || user.location || 'العراق',
                    rating: 5,
                    created_at: new Date().toISOString()
                });

            if (insertError) {
                console.log('  -> Insert error:', insertError.message);
                console.log('  -> Trying minimal insert...');

                // Try even more minimal
                const { error: minError } = await supabase
                    .from('suppliers')
                    .insert({
                        id: user.id,
                        name: user.full_name || 'Supplier'
                    });

                if (minError) {
                    console.log('  -> Minimal insert failed:', minError.message);
                } else {
                    console.log('  -> Supplier record created (minimal)!');
                }
            } else {
                console.log('  -> Supplier record created successfully!');
            }
        }
    }
}

linkSupplierFromProfiles();

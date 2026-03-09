const { createClient } = require('@supabase/supabase-js');

// Hardcoded for debug script (copied from verify_tables.cjs)
const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserClinics() {
    console.log('--- Checking User Clinics ---');

    // 1. Get ALL users (via auth.users is not possible with anon key usually, but let's try or just check specific known email if possible)
    // Actually, we can't list users with anon key. We need service_role key for that.
    // BUT, we can check 'profiles' table if it exists and is public/readable.

    console.log('Fetching profiles...');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

    if (profileError) {
        console.error('Error fetching profiles:', profileError.message);
    } else {
        console.log(`Found ${profiles.length} profiles.`);

        for (const profile of profiles) {
            console.log(`\nChecking Profile: ${profile.email || profile.full_name} (${profile.id})`);

            // Check ownership
            const { data: ownedClinics, error: ownerError } = await supabase
                .from('clinics')
                .select('id, name, owner_id')
                .eq('owner_id', profile.id);

            if (ownerError) console.error('Owner Check Error:', ownerError.message);
            else console.log('Owned Clinics:', ownedClinics);

            // Check membership
            const { data: memberships, error: memberError } = await supabase
                .from('clinic_members')
                .select('clinic_id, role, clinics(name)')
                .eq('user_id', profile.id);

            if (memberError) console.error('Member Check Error:', memberError.message);
            else console.log('Memberships:', memberships);
        }
    }
}

checkUserClinics();

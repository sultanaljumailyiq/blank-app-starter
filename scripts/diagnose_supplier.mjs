import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://nhueyaeyutfmadbgghfe.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw'
);

async function diagnose() {
    console.log('\n========================================');
    console.log('=== SECTION 1: ALL SUPPLIERS ===');
    console.log('========================================');
    const { data: suppliers, error: sErr } = await supabase
        .from('suppliers')
        .select('*');

    if (sErr) {
        console.log('ERROR fetching suppliers:', sErr.message);
    } else {
        console.log('Total supplier rows:', suppliers.length);
        for (const s of suppliers) {
            console.log('\n--- Supplier ---');
            console.log('  id:          ', s.id);
            console.log('  name:        ', s.name);
            console.log('  user_id:     ', s.user_id);
            console.log('  profile_id:  ', s.profile_id);
            console.log('  email:       ', s.email ?? 'NULL');
            console.log('  phone:       ', s.phone ?? 'NULL');
            console.log('  logo:        ', s.logo ? 'HAS_LOGO' : 'NULL');
            console.log('  logo_url:    ', s.logo_url ? 'HAS_LOGO_URL' : 'NULL');
            console.log('  contact_email:', s.contact_email ?? 'NULL');
            console.log('  is_verified: ', s.is_verified);
            console.log('  city:        ', s.city ?? 'NULL');
            console.log('  governorate: ', s.governorate ?? 'NULL');
        }
    }

    console.log('\n========================================');
    console.log('=== SECTION 2: ALL PROFILES ===');
    console.log('========================================');
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url, phone, created_at');

    if (pErr) {
        console.log('ERROR fetching profiles:', pErr.message);
    } else {
        console.log('Total profile rows:', profiles.length);
        for (const p of profiles) {
            console.log('\n--- Profile ---');
            console.log('  id:         ', p.id);
            console.log('  full_name:  ', p.full_name);
            console.log('  email:      ', p.email ?? 'NULL');
            console.log('  role:       ', p.role);
            console.log('  phone:      ', p.phone ?? 'NULL');
            console.log('  avatar_url: ', p.avatar_url ? 'HAS_AVATAR' : 'NULL');
            console.log('  created_at: ', p.created_at);
        }
    }

    console.log('\n========================================');
    console.log('=== SECTION 3: SUPPLIER <-> PROFILE LINK ===');
    console.log('========================================');
    if (suppliers && profiles) {
        for (const s of suppliers) {
            const matchByUserId = profiles.find(p => p.id === s.user_id);
            const matchByProfileId = profiles.find(p => p.id === s.profile_id);
            console.log('\nSupplier:', s.name, '(id:', s.id + ')');
            console.log('  user_id:', s.user_id, '->', matchByUserId ? 'PROFILE FOUND: ' + matchByUserId.email : 'NO PROFILE MATCH');
            console.log('  profile_id:', s.profile_id, '->', matchByProfileId ? 'PROFILE FOUND: ' + matchByProfileId.email : 'NO PROFILE MATCH');
            if (matchByProfileId) {
                console.log('  supplier.email:', s.email ?? 'NULL', '  profile.email:', matchByProfileId.email ?? 'NULL');
                console.log('  supplier.phone:', s.phone ?? 'NULL', '  profile.phone:', matchByProfileId.phone ?? 'NULL');
                console.log('  supplier.logo:', s.logo ? 'HAS' : 'NULL', ' profile.avatar_url:', matchByProfileId.avatar_url ? 'HAS' : 'NULL');
                const emailMismatch = s.email !== matchByProfileId.email;
                const phoneMismatch = s.phone !== matchByProfileId.phone;
                const logoMismatch = !s.logo && !s.logo_url;
                if (emailMismatch) console.log('  ⚠️  EMAIL MISMATCH!');
                if (phoneMismatch) console.log('  ⚠️  PHONE MISMATCH!');
                if (logoMismatch) console.log('  ⚠️  LOGO IS NULL in suppliers table!');
            }
        }
    }

    console.log('\n========================================');
    console.log('=== SECTION 4: ADMIN UsersManager QUERY SIMULATION ===');
    console.log('========================================');
    console.log('Simulating what UsersManager fetches (all profiles + all suppliers)...');
    const supplierProfiles = profiles ? profiles.filter(p => p.role === 'supplier') : [];
    console.log('Profiles with role=supplier:', supplierProfiles.length);
    supplierProfiles.forEach(p => {
        console.log('  Profile:', p.full_name, '(', p.email, ') id:', p.id);
        const linkedSupplier = suppliers ? suppliers.find(s => s.profile_id === p.id || s.user_id === p.id) : null;
        console.log('  Linked supplier record:', linkedSupplier ? 'YES - id:' + linkedSupplier.id : 'NONE');
    });

    console.log('\n=== DONE ===');
}

diagnose().catch(console.error);

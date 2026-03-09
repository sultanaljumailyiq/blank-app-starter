const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try { envContent = fs.readFileSync(envPath, 'utf-8'); } catch (e) { }
const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

async function checkLab() {
    console.log('--- Checking Lab User Status ---');

    // 1. Get Auth User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const labUser = users.find(u => u.email === 'lab.demo@smartdental.com');

    if (!labUser) {
        console.error('❌ Auth User "lab.demo@smartdental.com" NOT FOUND.');
        return;
    }
    console.log(`✅ Auth User Found: ${labUser.id}`);

    // 2. Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', labUser.id)
        .maybeSingle();

    if (!profile) {
        console.error('❌ Profile Row NOT FOUND. Creating it now...');
        const { error: insertError } = await supabase.from('profiles').insert({
            id: labUser.id,
            email: labUser.email,
            full_name: 'مختبر بابل (تجريبي)',
            role: 'laboratory'
        });
        if (insertError) console.error('  Failed to create profile:', insertError.message);
        else console.log('  ✅ Profile Created.');
    } else {
        console.log(`✅ Profile Found: ${profile.full_name} (${profile.role})`);
    }

    // 3. Check Dental Laboratory Entity
    const { data: labEntity, error: labError } = await supabase
        .from('dental_laboratories')
        .select('*')
        .eq('user_id', labUser.id)
        .maybeSingle();

    if (!labEntity) {
        console.error('❌ Dental Laboratory Entity NOT FOUND. Creating it now...');
        const { error: insertLabError } = await supabase.from('dental_laboratories').insert({
            user_id: labUser.id,
            name: 'مختبر بابل الرقمي'
        });
        if (insertLabError) console.error('  Failed to create lab entity:', insertLabError.message);
        else console.log('  ✅ Dental Laboratory Entity Created.');
    } else {
        console.log(`✅ Dental Laboratory Found: ${labEntity.name}`);
    }
}

checkLab();

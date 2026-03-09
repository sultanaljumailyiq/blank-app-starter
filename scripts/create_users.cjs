const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error('Could not read .env file');
    process.exit(1);
}

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials (URL or SERVICE_ROLE_KEY) in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const users = [
    { email: 'doctor.demo@smartdental.com', password: 'Password123!', role: 'doctor', name: 'د. أحمد علي (تجريبي)' },
    { email: 'supplier.demo@smartdental.com', password: 'Password123!', role: 'supplier', name: 'شركة المورد (تجريبي)' },
    { email: 'lab.demo@smartdental.com', password: 'Password123!', role: 'laboratory', name: 'مختبر بابل (تجريبي)' },
    { email: 'admin.demo@smartdental.com', password: 'Password123!', role: 'admin', name: 'مدير النظام (تجريبي)' }
];

async function refreshUsers() {
    console.log('Refreshing demo users...');

    for (const user of users) {
        console.log(`Processing ${user.email}...`);

        // 1. Delete if exists (we don't have listUsers by email easily without pagination, but we can try deleteUser if we knew ID... 
        // actually admin.listUsers() is easiest).
        // OR try to create, if error "already exists", we must find the ID.

        // Let's iterate pages to find the user.
        let userId = null;
        let page = 1;
        let found = false;

        while (!found) {
            const { data: { users: list }, error } = await supabase.auth.admin.listUsers({ page: page, perPage: 100 });
            if (error || !list || list.length === 0) break;

            const existing = list.find(u => u.email === user.email);
            if (existing) {
                userId = existing.id;
                found = true;
            }
            page++;
        }

        if (userId) {
            console.log(`  Found existing user ${userId}, deleting...`);
            const { error: delError } = await supabase.auth.admin.deleteUser(userId);
            if (delError) {
                console.error(`  Failed to delete user: ${delError.message}`);
                continue;
            }
            console.log(`  Deleted.`);
        }

        // 2. Create fresh
        console.log(`  Creating new user...`);
        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
                full_name: user.name,
                role: user.role
            }
        });

        if (error) {
            console.log(`  Error creating user: ${error.message}`);
        } else {
            console.log(`  Success: Created user ${data.user.id} with role ${user.role}`);
        }
    }

    console.log('User refresh process completed.');
}

refreshUsers();

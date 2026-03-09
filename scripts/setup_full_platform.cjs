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

async function runSQL(filePath) {
    console.log(`Executing SQL from ${filePath}...`);
    const sql = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }); // Requires exec_sql function potentially

    // BUT checking if we have rpc 'exec_sql'. Likely not.
    // So we can't run DDL via JS Client easily unless we enable the postgres-meta API or have a helper.
    // Workaround: We ask user to run the SQL files. THEN we seed data.

    console.log('Skipping SQL execution via JS (Requires Dashboard). Please run SQL files manually.');
}

async function seedData() {
    console.log('--- SEEDING PLATFORM DATA ---');

    // 1. GET USERS to link data
    const { data: { users } } = await supabase.auth.admin.listUsers();

    const doctorUser = users.find(u => u.email === 'doctor.demo@smartdental.com');
    const supplierUser = users.find(u => u.email === 'supplier.demo@smartdental.com');
    const labUser = users.find(u => u.email === 'lab.demo@smartdental.com');

    if (!doctorUser || !supplierUser || !labUser) {
        console.error('❌ Missing Demo Users. Run create_users.cjs first.');
        return;
    }

    // 2. DOCTOR & CLINICS
    console.log('--- Seeding Doctor & Clinics ---');
    // Ensure 2 clinics linked to doctorUser
    await supabase.from('clinics').upsert([
        { id: 1, name: 'عيادة النور التخصصية', owner_id: doctorUser.id, city: 'بغداد', address: 'شارع فلسطين', phone: '07701111111' },
        { id: 2, name: 'مركز الابتسامة الرقمي', owner_id: doctorUser.id, city: 'بغداد', address: 'المنصور', phone: '07702222222' }
    ]);
    // Ensure Staff in Clinic 1
    await supabase.from('staff').insert([
        { clinic_id: 1, full_name: 'Dr. Sarah', role_title: 'Dentist', user_id: doctorUser.id, salary: 2000000, phone: '0770123' },
        { clinic_id: 1, full_name: 'Noor Ali', role_title: 'Receptionist', salary: 500000, phone: '0770124' }
    ]);

    // 3. SUPPLIER & PRODUCTS
    console.log('--- Seeding Supplier & Products ---');
    // Check/Create Supplier Entity
    let supplierId;
    const { data: existingSupp } = await supabase.from('suppliers').select('id').eq('user_id', supplierUser.id).maybeSingle();
    if (existingSupp) {
        supplierId = existingSupp.id;
    } else {
        const { data: newSupp } = await supabase.from('suppliers').insert({
            user_id: supplierUser.id,
            company_name: 'شركة المورد (تجريبي)',
            status: 'approved',
            description: 'تجهيز كافة مستلزمات طب الأسنان',
            contact_phone: '07801234567'
        }).select().single();
        supplierId = newSupp.id;
    }

    // Insert 6 Products
    if (supplierId) {
        const products = [
            { name: 'Composite Kit', price: 150000, category: 'materials', stock_quantity: 50 },
            { name: 'Bonding Agent', price: 45000, category: 'materials', stock_quantity: 100 },
            { name: 'Dental Chair Unit', price: 4500000, category: 'equipment', stock_quantity: 2 },
            { name: 'Curing Light', price: 120000, category: 'equipment', stock_quantity: 15 },
            { name: 'Endo Files', price: 35000, category: 'instruments', stock_quantity: 200 },
            { name: 'Anesthetic', price: 25000, category: 'pharmacy', stock_quantity: 500 }
        ];

        for (const p of products) {
            await supabase.from('products').insert({ ...p, supplier_id: supplierId });
        }
    }

    // 4. LABORATORY
    console.log('--- Seeding Laboratory ---');
    // Determine Lab ID from user_id
    let labId;
    const { data: existingLab } = await supabase.from('dental_laboratories').select('id').eq('user_id', labUser.id).maybeSingle();

    // We assume check_lab.cjs created it, but let's be safe
    if (!existingLab) {
        const { data: newLab } = await supabase.from('dental_laboratories').insert({
            user_id: labUser.id,
            name: 'مختبر بابل (تجريبي)'
        }).select().single();
        labId = newLab.id;
    } else {
        labId = existingLab.id;
    }

    if (labId) {
        // Insert Services
        await supabase.from('lab_services').insert([
            { laboratory_id: labId, name: 'Zirconia Crown', price: 80000, duration_days: 3 },
            { laboratory_id: labId, name: 'PFM Crown', price: 40000, duration_days: 4 },
            { laboratory_id: labId, name: 'E-Max Veneer', price: 120000, duration_days: 5 }
        ]);

        // Insert Delegates
        await supabase.from('lab_delegates').insert([
            { laboratory_id: labId, name: 'Ali Delivery', phone: '07709998877', area: 'Baghdad Clean' }
        ]);
    }

    // 5. COMMUNITY
    console.log('--- Seeding Community ---');
    // Admin creates a group
    const { data: adminGroup } = await supabase.from('community_groups').insert({
        name: 'General Dentistry Iraq',
        description: 'Official group for Iraqi Dentists',
        created_by: doctorUser.id // Doctor creates it
    }).select().single();

    // Doctor posts
    await supabase.from('community_posts').insert({
        user_id: doctorUser.id,
        content: 'Welcome to the new Smart Dental Platform! Excited to share cases here.',
        category: 'discussion',
        likes_count: 5
    });

    // 6. ADMIN & PLATFORM
    console.log('--- Seeding Admin & Platform ---');

    // Subscription Plans
    const plans = [
        { name: 'Basic Plan', slug: 'basic', price: 0, features: ['2 Clinics', 'Basic Support'] },
        { name: 'Pro Plan', slug: 'pro', price: 25000, features: ['Unlimited Clinics', 'Priority Support', 'Advanced Analytics'] },
        { name: 'Enterprise', slug: 'enterprise', price: 100000, features: ['Custom Solutions', 'Dedicated Manager'] }
    ];

    for (const plan of plans) {
        await supabase.from('subscription_plans').upsert(plan, { onConflict: 'slug' });
    }

    // Assign Pro Plan to Doctor
    const { data: proPlan } = await supabase.from('subscription_plans').select('id').eq('slug', 'pro').maybeSingle();
    if (proPlan) {
        await supabase.from('user_subscriptions').upsert({
            user_id: doctorUser.id,
            plan_id: proPlan.id,
            status: 'active',
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }, { onConflict: 'user_id' }); // Assuming unique user subscription or just insert
    }

    // Create Notification
    await supabase.from('system_notifications').insert({
        user_id: doctorUser.id,
        title: 'Welcome!',
        message: 'Your account has been fully verified.',
        type: 'success'
    });

    console.log('✅ Full Platform Data Seeded Successfully.');
}

seedData();

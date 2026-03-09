
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.warn('Could not read .env file, trying process.env');
}

const getEnv = (key: string) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

// Use Service Role Key if available for admin privileges (Verification/Seeding)
const adminClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed with REALISTIC DATA...');

    // If using Anon Key, try to sign in (though this might fail if user doesn't exist)
    if (!serviceRoleKey) {
        console.log('Using Anon Key - Attempting Admin Login...');
        const { error } = await adminClient.auth.signInWithPassword({
            email: 'admin.demo@smartdental.com',
            password: 'password123'
        });
        if (error) console.warn('Admin login failed (might need to create user first):', error.message);
    } else {
        console.log('Using Service Role Key - Bypassing Login...');
    }

    // ==========================================
    // 2. Insert Suppliers (Real Companies)
    // ==========================================
    const alNoorId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const baghdadId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';

    const suppliers = [
        {
            id: alNoorId,
            company_name: 'شركة النور للمستلزمات الطبية',
            contact_person: 'د. محمد النور',
            email: 'info@alnoor-med.com',
            phone: '07701234567',
            category: 'معدات وأدوات',
            address: 'بغداد - شارع السعدون',
            status: 'approved',
            rating: 4.9,
            description: 'وكيل حصري لشركات 3M و GC في العراق.',
            verified: true,
            logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
            cover_image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1200'
        },
        {
            id: baghdadId,
            company_name: 'مكتب بغداد العلمي',
            contact_person: 'د. علي حسين',
            email: 'sales@baghdad-scientific.com',
            phone: '07901112233',
            category: 'مستهلكات',
            address: 'بغداد - باب المعظم',
            status: 'approved',
            rating: 4.7,
            description: 'تجهيز كافة عيادات الأسنان بمواد ذات جودة عالية.',
            verified: true,
            logo: 'https://ui-avatars.com/api/?name=Baghdad+Sci&background=0D8ABC&color=fff',
            cover_image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200'
        }
    ];

    for (const s of suppliers) {
        const { error } = await adminClient.from('suppliers').upsert(s);
        if (error) console.error(`Error upserting supplier ${s.company_name}:`, error.message);
    }
    console.log('Suppliers seeded.');

    // ==========================================
    // 3. Insert Brands
    // ==========================================
    const brands = [
        { id: 'br-3m', supplier_id: alNoorId, name: '3M ESPE', country: 'USA', is_verified: true },
        { id: 'br-gc', supplier_id: alNoorId, name: 'GC Corp', country: 'Japan', is_verified: true },
        { id: 'br-dentsply', supplier_id: baghdadId, name: 'Dentsply Sirona', country: 'USA', is_verified: true },
        { id: 'br-septodont', supplier_id: baghdadId, name: 'Septodont', country: 'France', is_verified: true },
        { id: 'br-woodpecker', supplier_id: baghdadId, name: 'Woodpecker', country: 'China', is_verified: true }
    ];

    for (const b of brands) {
        await adminClient.from('brands').upsert(b);
    }
    console.log('Brands seeded.');

    // ==========================================
    // 4. Insert Products (REALISTIC LIST)
    // ==========================================
    const products = [
        // Consumables - Composite
        {
            supplier_id: alNoorId,
            brand_id: 'br-3m',
            name: 'Filtek Z350 XT Universal Restorative',
            description: 'حشوة تجميلية نانو كومبوزيت (Nano-Composite). متوفرة بعدة ألوان (A1, A2, A3). تمتاز بقوة عالية وجمالية فائقة.',
            price: 55000,
            category: 'حشوات',
            subCategory: 'Composite',
            stock: 120,
            is_new: false,
            is_featured: true,
            rating: 4.9,
            reviews_count: 240,
            images: ['https://m.media-amazon.com/images/I/61N+RjF9WXL._AC_UF1000,1000_QL80_.jpg']
        },
        {
            supplier_id: alNoorId,
            brand_id: 'br-gc',
            name: 'G-aenial Anterior',
            description: 'كومبوزيت مخصص للأسنان الأمامية، يعطي نتائج جمالية طبيعية جداً.',
            price: 60000,
            category: 'حشوات',
            subCategory: 'Composite',
            stock: 45,
            rating: 4.8,
            reviews_count: 85,
            images: ['https://www.gc.dental/america/sites/default/files/styles/product_full_image/public/2021-02/gaenial_anterior_syringe_0.jpg']
        },
        // Consumables - Bonding
        {
            supplier_id: alNoorId,
            brand_id: 'br-3m',
            name: 'Single Bond Universal Adhesive',
            description: 'لاصق (Bond) عالمي 5ml. يعمل مع جميع أنظمة الحفر (Total-Etch, Self-Etch).',
            price: 65000,
            category: 'مواد',
            subCategory: 'Bonding Agents',
            stock: 200,
            is_featured: true,
            rating: 4.9,
            reviews_count: 310,
            images: ['https://www.3m.com.sa/3m_images/v1/20210315/p1-single-bond-universal-adhesive-bottle-refill-41258.jpg']
        },
        // Equipment - Endo
        {
            supplier_id: baghdadId,
            brand_id: 'br-woodpecker',
            name: 'Ai-Motor (Brushless)',
            description: 'جهاز روتاري إندو لاسلكي مع رأس (Contra-angle) صغير. يدعم الحركة الترددية (Reciprocating).',
            price: 450000,
            category: 'أجهزة',
            subCategory: 'Endodontics',
            stock: 25,
            is_new: true,
            is_featured: true,
            rating: 4.6,
            reviews_count: 40,
            images: ['https://www.glwoodpecker.com/Public/Uploads/uploadfile/20210517/a47fa462b534604e76839352e6945a6c.jpg']
        },
        // Anesthetic
        {
            supplier_id: baghdadId,
            brand_id: 'br-septodont',
            name: 'Septanest 1:100,000',
            description: 'بنج أسنان (Articaine 4%) مع أدرينالين. العلبة تحتوي على 50 كاربول.',
            price: 45000,
            category: 'تخدير',
            subCategory: 'Anesthetic',
            stock: 500, // High stock
            rating: 5.0,
            reviews_count: 150,
            images: ['https://www.septodont.ca/sites/default/files/2019-09/Septanest_SP_0.png']
        },
        // Files
        {
            supplier_id: baghdadId,
            brand_id: 'br-dentsply',
            name: 'ProTaper Gold Files',
            description: 'فيلات روتاري ذهبية (SX-F3). مرونة عالية ومقاومة للكسر.',
            price: 35000,
            category: 'إندو',
            subCategory: 'Files',
            stock: 150,
            rating: 4.8,
            reviews_count: 90,
            images: ['https://www.dentsplysirona.com/content/dam/dentsplysirona/dtds/products/endodontics/files/protaper-gold/ProTaper-Gold-Files-Blister-Pack.png']
        }
    ];

    for (const p of products) {
        // Check existing by name
        const { data } = await adminClient.from('products').select('id').eq('name', p.name).maybeSingle();
        if (!data) {
            await adminClient.from('products').insert(p);
        }
    }
    console.log('Products seeded.');

    // ==========================================
    // 5. Insert Clinic Reports & Patients
    // ==========================================
    // Fetch a clinic to attach patients to
    const { data: clinic } = await adminClient.from('clinics').select('id').limit(1).single();

    if (clinic) {
        const patients = [
            {
                clinic_id: clinic.id,
                full_name: 'حسين علي طه',
                age: 35,
                gender: 'male',
                phone: '07705551001',
                email: 'hussain@example.com',
                address: 'بغداد - الكرادة',
                total_visits: 4,
                last_visit: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
                status: 'active',
                medical_history: { conditions: ['Diabetes'], allergies: ['Penicillin'] }
            },
            {
                clinic_id: clinic.id,
                full_name: 'زينب كاظم',
                age: 24,
                gender: 'female',
                phone: '07705551002',
                email: 'zainab@example.com',
                address: 'بغداد - زيونة',
                total_visits: 12,
                last_visit: new Date(Date.now() - 86400000 * 7).toISOString(),
                status: 'active',
                medical_history: { conditions: [], allergies: [] }
            },
            {
                clinic_id: clinic.id,
                full_name: 'عمر فاروق',
                age: 45,
                gender: 'male',
                phone: '07705551003',
                email: 'omar@example.com',
                address: 'بغداد - المنصور',
                total_visits: 1,
                last_visit: new Date(Date.now() - 86400000 * 30).toISOString(),
                status: 'active',
                medical_history: { conditions: ['Hypertension'], allergies: [] }
            }
        ];

        for (const p of patients) {
            const { data } = await adminClient.from('patients').select('id').eq('phone', p.phone).maybeSingle();
            if (!data) {
                await adminClient.from('patients').insert(p);
            }
        }
        console.log('Patients seeded.');
    }

    console.log('Seed completed successfully.');
}

seed().catch(err => {
    console.error('Seed execution failed:', err);
    process.exit(1);
});

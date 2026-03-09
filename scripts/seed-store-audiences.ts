
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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting Audience Seed...');

    // 1. Get or Create Supplier
    const alNoorId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // 2. Insert Test Products for Audiences
    const products = [
        {
            supplier_id: alNoorId,
            name: 'Lab Zirconia Block (Lab Only)',
            description: 'Exclusive Zirconia for Dental Labs.',
            price: 150000,
            category: 'معمل',
            stock: 50,
            images: ['https://via.placeholder.com/300/purple?text=Lab+Only'],
            target_audience: ['lab']
        },
        {
            supplier_id: alNoorId,
            name: 'Dental Chair Pro (Clinic Only)',
            description: 'Advanced chair for Clinics.',
            price: 2500000,
            category: 'أجهزة',
            stock: 5,
            images: ['https://via.placeholder.com/300/blue?text=Clinic+Only'],
            target_audience: ['clinic']
        },
        {
            supplier_id: alNoorId,
            name: 'Medical Gloves (Both)',
            description: 'Gloves for everyone.',
            price: 5000,
            category: 'مواد',
            stock: 1000,
            images: ['https://via.placeholder.com/300/green?text=Both'],
            target_audience: ['clinic', 'lab']
        }
    ];

    for (const p of products) {
        // Upsert based on name
        const { data: existing } = await supabase.from('products').select('id').eq('name', p.name).single();

        let result;
        if (existing) {
            result = await supabase.from('products').update(p).eq('id', existing.id);
        } else {
            result = await supabase.from('products').insert(p);
        }

        if (result.error) console.error(`Error upserting ${p.name}:`, result.error.message);
        else console.log(`Upserted: ${p.name} -> Audience: ${JSON.stringify(p.target_audience)}`);
    }

    console.log('Audience Seed completed.');
}

seed();

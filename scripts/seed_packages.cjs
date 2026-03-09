const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPackages() {
    console.log('Seeding default subscription packages...');

    const defaultPlans = [
        {
            name: 'مجانية',
            name_en: 'Free',
            price: {
                monthly: 0, yearly: 0, currency: 'د.ع', settings: {
                    maxClinics: 1, maxPatients: 50, maxServices: 5, aiRequestLimit: 0,
                    mapVisibility: false, isFeatured: false, digitalBooking: false
                }
            },
            features: [
                'إدارة عيادة واحدة',
                'إلدارة حتى 50 مريض',
                '5 خدمات طبية',
                'لا يدعم الذكاء الاصطناعي'
            ],
            is_popular: false
        },
        {
            name: 'أساسية',
            name_en: 'Basic',
            price: {
                monthly: 25000, yearly: 250000, currency: 'د.ع', settings: {
                    maxClinics: 2, maxPatients: 500, maxServices: 20, aiRequestLimit: 20,
                    mapVisibility: true, isFeatured: false, digitalBooking: true
                }
            },
            features: [
                'إدارة حتى 2 عيادات',
                'إدارة حتى 500 مريض',
                '20 خدمة طبية',
                'دعم الذكاء الاصطناعي (20 طلب/يوم)',
                'الظهور على الخريطة',
                'حجز رقمي'
            ],
            is_popular: true
        },
        {
            name: 'احترافية',
            name_en: 'Pro',
            price: {
                monthly: 50000, yearly: 500000, currency: 'د.ع', settings: {
                    maxClinics: 5, maxPatients: 999999, maxServices: 999, aiRequestLimit: -1,
                    mapVisibility: true, isFeatured: true, digitalBooking: true
                }
            },
            features: [
                'إدارة حتى 5 عيادات',
                'عدد مرضى غير محدود',
                'عدد خدمات غير محدود',
                'ذكاء اصطناعي غير محدود',
                'أولوية الظهور وعيادة مميزة',
                'دعم فني عاجل'
            ],
            is_popular: false
        }
    ];

    for (const plan of defaultPlans) {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('name', plan.name)
            .maybeSingle();

        if (data) {
            console.log(`Plan ${plan.name} already exists. Skipping.`);
        } else {
            const { error: insertError } = await supabase.from('subscription_plans').insert([plan]);
            if (insertError) console.error(`Error inserting ${plan.name}:`, insertError);
            else console.log(`inserted ${plan.name}`);
        }
    }
}

seedPackages();

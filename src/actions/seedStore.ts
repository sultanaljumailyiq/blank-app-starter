import { supabase } from '../lib/supabase';

// Seed Realistic Dental Products
export async function seedStoreData() {
    const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Clean existing
    if (error) console.error('Error clearing products', error);

    // 1. Suppliers (Mock if not existing)
    // Assume we have some supplier IDs or create one.
    // For demo, we will check if a supplier exists, or use a placeholder ID if foreign key requires it. 
    // In a real scenario, we'd fetch an existing supplier ID.
    const { data: suppliers } = await supabase.from('suppliers').select('id').limit(1);
    const supplierId = suppliers?.[0]?.id || '00000000-0000-0000-0000-000000000000'; // Fallback

    const products = [
        // Equipment
        {
            name: 'وحدة أسنان متكاملة A5',
            category: 'الأجهزة والمعدات الكبرى',
            price: 4500000,
            description: 'كرسي أسنان متكامل مع وحدة إضاءة LED وشاشة تحكم باللمس.',
            stock: 5,
            is_new: true,
            is_featured: true,
            image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop',
            supplier_id: supplierId,
            tags: ['كراسي الأسنان']
        },
        {
            name: 'جهاز أشعة محمول X-Ray Portable',
            category: 'الأجهزة والمعدات الكبرى',
            price: 850000,
            description: 'جهاز أشعة سينية محمول عالي الدقة وآمن.',
            stock: 10,
            image: 'https://m.media-amazon.com/images/I/51+uJcKkymL.jpg',
            supplier_id: supplierId,
            tags: ['أجهزة الأشعة']
        },
        // Endodontics
        {
            name: 'موتور إندو X-Smart',
            category: 'علاج العصب (Endodontics)',
            price: 350000,
            description: 'جهاز تحضير القنوات العصبية لاسلكي مع إضاءة.',
            stock: 15,
            image: 'https://m.media-amazon.com/images/I/51wXk-gC+vL._AC_SX679_.jpg',
            supplier_id: supplierId,
            tags: ['موتورات العصب']
        },
        {
            name: 'نظام مبارد روتاري ProTaper Gold',
            category: 'علاج العصب (Endodontics)',
            price: 45000,
            description: 'طقم مبارد روتاري عالي المرونة (6 قطع).',
            stock: 50,
            is_featured: true,
            image: 'https://www.dentsplysirona.com/content/dam/dentsply-sirona-global/en/products/endodontics/glide-path/proglider/ProGlider-Blister-Pack-web.jpg',
            supplier_id: supplierId,
            tags: ['مبارد روتاري']
        },
        // Consumables
        {
            name: 'قفازات لاتكس (علبة 100 قطعة)',
            category: 'المستهلكات اليومية',
            price: 5000,
            description: 'قفازات طبية عالية الجودة ومقاومة للتمزق.',
            stock: 300,
            discount_percentage: 10,
            image: 'https://m.media-amazon.com/images/I/71wM6+eQ+BL._AC_SX679_.jpg',
            supplier_id: supplierId,
            tags: ['القفازات']
        },
        {
            name: 'كمامات طبية 3 طبقات',
            category: 'المستهلكات اليومية',
            price: 3000,
            description: 'علبة كمامات طبية مع فلتر حماية (50 قطعة).',
            stock: 500,
            image: 'https://m.media-amazon.com/images/I/71xXXfXfXfL._AC_SX679_.jpg',
            supplier_id: supplierId,
            tags: ['الكمامات']
        },
        // Orthodontics
        {
            name: 'طقم حاصرات معدنية Roth 022',
            category: 'التقويم (Orthodontics)',
            price: 25000,
            description: 'طقم تقويم كامل للفكين العلوي والسفلي.',
            stock: 100,
            image: 'https://m.media-amazon.com/images/I/61+uJcKkymL.jpg',
            supplier_id: supplierId,
            tags: ['الحاصرات المعدنية']
        },
        // Implants
        {
            name: 'زرعة أسنان تيتانيوم',
            category: 'زراعة الأسنان',
            price: 150000,
            description: 'زرعة أسنان عالية الاندماج العظمي مع ملحقاتها.',
            stock: 40,
            is_new: true,
            image: 'https://www.straumann.com/content/dam/media-center/straumann/en/images/products/implants/tissue-level/sla-active/straumann-tissue-level-implant-sla-active-01.jpg',
            supplier_id: supplierId,
            tags: ['الزرعات']
        },
        // Instruments
        {
            name: 'طقم أدوات فحص (3 قطع)',
            category: 'الأدوات اليدوية',
            price: 15000,
            description: 'مِرآة، مسبار، وملقط مصنوع من الستانلس ستيل.',
            stock: 60,
            image: 'https://m.media-amazon.com/images/I/61+uJcKkymL.jpg',
            supplier_id: supplierId,
            tags: ['أطقم الفحص']
        }
    ];

    /* 
     * Note: This is an async operation that runs once.
     * I am using upsert to avoid duplicates if ID was specified, otherwise insert.
     * Since I am using insert, I'll let Supabase generate IDs.
     */

    const { error: insertError } = await supabase.from('products').insert(products);
    if (insertError) console.error('Error seeding products:', insertError);

    console.log('Seed completed');
}

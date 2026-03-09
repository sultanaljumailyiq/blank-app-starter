
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhueyaeyutfmadbgghfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzNzA1NiwiZXhwIjoyMDg0NDEzMDU2fQ.sk_hZ5mkw6aKg6_y4h5bOq3hH7t4E9KKNX8bL0kxkMw';

const supabase = createClient(supabaseUrl, supabaseKey);

const supplierId = '64c72ad9-fa3a-4aaf-84b8-513ab96d6cdc'; // شركة المورد (تجريبي)

// First delete old test product
async function cleanup() {
    await supabase.from('products').delete().eq('name', 'Test Product');
}

// Sample dental products - using discovered column names
const sampleProducts = [
    {
        name: 'جهاز تعقيم طبي - Autoclave',
        description: 'جهاز تعقيم بخاري عالي الجودة للعيادات الطبية، سعة 18 لتر، تعقيم سريع وفعال.',
        price: 1500000,
        original_price: 1500000,
        is_featured: true
    },
    {
        name: 'كرسي أسنان كهربائي',
        description: 'كرسي طبيب أسنان كهربائي متكامل مع إضاءة LED ووحدة تحكم رقمية.',
        price: 7650000, // 10% discount
        original_price: 8500000,
        is_featured: true
    },
    {
        name: 'جهاز أشعة بانوراما رقمي',
        description: 'جهاز أشعة بانورامية رقمي عالي الدقة لتصوير الفك الكامل.',
        price: 25000000,
        original_price: 25000000,
        is_featured: true
    },
    {
        name: 'مستلزمات حشوات ضوئية',
        description: 'مجموعة حشوات ضوئية متنوعة الألوان من 3M، عبوة 20 قطعة.',
        price: 127500, // 15% discount
        original_price: 150000,
        is_featured: false
    },
    {
        name: 'قفازات طبية (عبوة 100)',
        description: 'قفازات لاتكس طبية عالية الجودة، مقاسات متنوعة.',
        price: 25000,
        original_price: 25000,
        is_featured: false
    },
    {
        name: 'جهاز تبييض الأسنان بالليزر',
        description: 'جهاز تبييض أسنان احترافي بتقنية LED الباردة.',
        price: 2375000, // 5% discount
        original_price: 2500000,
        is_featured: true
    },
    {
        name: 'ماسح ضوئي داخل الفم',
        description: 'ماسح ضوئي 3D لأخذ طبعات رقمية دقيقة للأسنان.',
        price: 15000000,
        original_price: 15000000,
        is_featured: true
    },
    {
        name: 'مخدر موضعي (عبوة 50)',
        description: 'أمبولات مخدر موضعي Lidocaine 2% للإجراءات الفموية.',
        price: 75000,
        original_price: 75000,
        is_featured: false
    },
    {
        name: 'أدوات خلع الأسنان (طقم كامل)',
        description: 'طقم كامل من ملاقط وأدوات خلع الأسنان من الستانلس ستيل.',
        price: 315000, // 10% discount
        original_price: 350000,
        is_featured: false
    },
    {
        name: 'جهاز تنظيف الأسنان بالموجات فوق الصوتية',
        description: 'جهاز سكيلر بالموجات فوق الصوتية لإزالة الجير والترسبات.',
        price: 680000, // 20% discount
        original_price: 850000,
        is_featured: true
    }
];

async function createProducts() {
    await cleanup();

    console.log('Creating sample products for supplier...\n');

    let successCount = 0;

    for (const product of sampleProducts) {
        const productData = {
            supplier_id: supplierId,
            name: product.name,
            description: product.description,
            price: product.price,
            original_price: product.original_price,
            is_featured: product.is_featured
        };

        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select();

        if (error) {
            console.log(`✗ ${product.name.substring(0, 35)}... - ${error.message}`);
        } else {
            console.log(`✓ ${product.name}`);
            successCount++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Created: ${successCount} / ${sampleProducts.length} products`);

    // Verify
    const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('supplier_id', supplierId);

    console.log(`\nTotal products in DB: ${allProducts?.length || 0}`);
}

createProducts();

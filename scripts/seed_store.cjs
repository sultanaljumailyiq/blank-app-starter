const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- MOCK DATA (Extracted from src/data/mock/store.ts) ---

const mockSuppliers = [
    {
        id: 'SUP001',
        name: 'شركة الأدوات الطبية العراقية',
        description: 'رائدة في توفير الأجهزة والأدوات الطبية الحديثة لعيادات الأسنان في العراق منذ 1995',
        rating: 4.9,
        location: 'بغداد - المنصور',
        governorate: 'بغداد',
        phone: '+964 770 123 4567',
        email: 'info@iraqdental.com',
        is_verified: true
    },
    {
        id: 'SUP002',
        name: 'مؤسسة الرعاية الطبية العراقية',
        description: 'متخصصون في المستهلكات الطبية والمواد التجميلية عالية الجودة',
        rating: 4.8,
        location: 'البصرة - المعقل',
        governorate: 'البصرة',
        phone: '+964 771 234 5678',
        email: 'contact@caremedical.iq',
        is_verified: true
    },
    {
        id: 'SUP003',
        name: 'مركز التقنيات الطبية',
        description: 'نوفر أحدث التقنيات في مجال طب الأسنان الرقمي والأجهزة المتطورة',
        rating: 4.7,
        location: 'أربيل - 100 متر',
        governorate: 'أربيل',
        phone: '+964 750 345 6789',
        email: 'info@medtech.iq',
        is_verified: true
    },
    {
        id: 'SUP004',
        name: 'شركة النجاح للمستلزمات الطبية',
        description: 'وكيل معتمد لأشهر الماركات العالمية في مجال طب الأسنان',
        rating: 4.6,
        location: 'النجف - الكوفة',
        governorate: 'النجف',
        phone: '+964 781 456 7890',
        email: 'sales@najah-medical.com',
        is_verified: true
    },
    {
        id: 'SUP005',
        name: 'مؤسسة الشفاء الطبية',
        description: 'متخصصون في الأدوية ومواد التخدير الطبية',
        rating: 4.5,
        location: 'كربلاء - العباسية',
        governorate: 'كربلاء',
        phone: '+964 770 567 8901',
        email: 'info@shifaa-medical.iq',
        is_verified: true
    }
];

const mockBrands = [
    {
        id: 'BRD001',
        name: '3M',
        description: 'شركة أمريكية عالمية رائدة في مجال المنتجات الطبية والصناعية',
        country: 'الولايات المتحدة',
        website: 'https://www.3m.com',
        is_verified: true
    },
    {
        id: 'BRD002',
        name: 'Dentsply Sirona',
        description: 'أكبر شركة متخصصة في منتجات طب الأسنان في العالم',
        country: 'الولايات المتحدة',
        website: 'https://www.dentsplysirona.com',
        is_verified: true
    },
    {
        id: 'BRD003',
        name: 'GC Corporation',
        description: 'شركة يابانية رائدة في مواد طب الأسنان التجميلية',
        country: 'اليابان',
        website: 'https://www.gc.dental',
        is_verified: true
    },
    {
        id: 'BRD004',
        name: 'Ivoclar Vivadent',
        description: 'شركة عالمية متخصصة في مواد طب الأسنان التجميلية والترميمية',
        country: 'ليختنشتاين',
        website: 'https://www.ivoclarvivadent.com',
        is_verified: true
    },
    {
        id: 'BRD005',
        name: 'Planmeca',
        description: 'شركة فنلندية رائدة في أجهزة الأشعة والتصوير الرقمي',
        country: 'فنلندا',
        website: 'https://www.planmeca.com',
        is_verified: true
    },
    {
        id: 'BRD006',
        name: 'Carestream Dental',
        description: 'متخصصون في أنظمة التصوير الرقمي وبرامج إدارة العيادات',
        country: 'الولايات المتحدة',
        website: 'https://www.carestreamdental.com',
        is_verified: true
    },
    {
        id: 'BRD007',
        name: 'Septodont',
        description: 'شركة فرنسية متخصصة في أدوية ومواد التخدير الطبية',
        country: 'فرنسا',
        website: 'https://www.septodont.com',
        is_verified: true
    },
    {
        id: 'BRD008',
        name: 'Kerr Dental',
        description: 'شركة أمريكية رائدة في مواد الحشو والترميم',
        country: 'الولايات المتحدة',
        website: 'https://www.kerrdental.com',
        is_verified: true
    }
];

const mockProducts = [
    {
        id: 'PRD001',
        name: 'جهاز أشعة رقمي بانوراما ثلاثي الأبعاد',
        supplierId: 'SUP001',
        brandId: 'BRD005',
        category: 'أجهزة',
        price: 50625000,
        originalPrice: 67500000,
        discount: 25,
        description: 'جهاز أشعة رقمي عالي الدقة مع تقنية البانوراما ثلاثية الأبعاد من Planmeca',
        stock: 5,
        is_featured: true
    },
    {
        id: 'PRD002',
        name: 'قفازات طبية معقمة (100 قطعة)',
        supplierId: 'SUP002',
        category: 'مستهلكات',
        price: 135000,
        originalPrice: 225000,
        discount: 40,
        description: 'قفازات طبية معقمة مصنوعة من اللاتكس عالي الجودة - خصم الجمعة البيضاء',
        stock: 500
    },
    {
        id: 'PRD003',
        name: 'حشوات تجميلية من 3M - مجموعة كاملة',
        supplierId: 'SUP001',
        brandId: 'BRD001',
        category: 'مواد',
        price: 960000,
        originalPrice: 1200000,
        discount: 20,
        description: 'حشوات تجميلية عالية الجودة مطابقة للون الأسنان الطبيعي - عرض خاص 3M',
        stock: 50,
        is_featured: true
    },
    {
        id: 'PRD004',
        name: 'كرسي الأسنان الكهربائي المتطور',
        supplierId: 'SUP001',
        brandId: 'BRD002',
        category: 'أجهزة',
        price: 32500000,
        description: 'كرسي أسنان كهربائي متعدد الأوضاع مع إضاءة LED مدمجة من Dentsply Sirona',
        stock: 3,
        is_featured: true,
        is_new: true
    },
    {
        id: 'PRD005',
        name: 'جهاز تعقيم أوتوكلاف فئة B',
        supplierId: 'SUP002',
        category: 'أجهزة',
        price: 12750000,
        description: 'جهاز تعقيم بالبخار عالي الضغط فئة B سعة 18 لتر',
        stock: 8
    },
    {
        id: 'PRD006',
        name: 'أدوات جراحية - مجموعة كاملة من الفولاذ الجراحي',
        supplierId: 'SUP004',
        brandId: 'BRD002',
        category: 'أدوات',
        price: 4500000,
        description: 'مجموعة كاملة من الأدوات الجراحية المصنوعة من الفولاذ المقاوم للصدأ',
        stock: 15
    },
    {
        id: 'PRD007',
        name: 'معجون تبييض احترافي من GC',
        supplierId: 'SUP002',
        brandId: 'BRD003',
        category: 'مواد',
        price: 262500,
        originalPrice: 375000,
        discount: 30,
        description: 'معجون تبييض احترافي بتركيبة متقدمة من GC - عبوة 500 غرام',
        stock: 120
    },
    {
        id: 'PRD010',
        name: 'جهاز تنظيف الأسنان بالموجات فوق الصوتية',
        supplierId: 'SUP001',
        brandId: 'BRD002',
        category: 'أجهزة',
        price: 18750000,
        description: 'جهاز تنظيف بالموجات فوق الصوتية مع 5 رؤوس قابلة للتبديل',
        stock: 6,
        is_featured: true,
        is_new: true
    }
];

// Helper to escape strings for SQL
const escape = (str) => {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'boolean') return str ? 'TRUE' : 'FALSE';
    if (typeof str === 'number') return str;
    // Simple escape for single quotes
    return `'${str.toString().replace(/'/g, "''")}'`;
};

// --- MIGRATION GENERATION LOGIC ---

function generateSQL() {
    let sql = '-- Seed Data for Store\n\n';

    // 1. Suppliers
    const supplierMap = new Map(); // OldId -> NewUUID

    sql += '-- Suppliers\n';
    for (const sup of mockSuppliers) {
        const newId = crypto.randomUUID();
        supplierMap.set(sup.id, newId);

        sql += `INSERT INTO suppliers (id, name, description, rating, location, governorate, phone, email, is_verified) VALUES (
            '${newId}',
            ${escape(sup.name)},
            ${escape(sup.description)},
            ${sup.rating},
            ${escape(sup.location)},
            ${escape(sup.governorate)},
            ${escape(sup.phone)},
            ${escape(sup.email)},
            ${sup.is_verified}
        ) ON CONFLICT (id) DO NOTHING;\n`;
    }

    // 2. Brands
    const brandMap = new Map();
    sql += '\n-- Brands\n';
    for (const brd of mockBrands) {
        const newId = crypto.randomUUID();
        brandMap.set(brd.id, newId);

        sql += `INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            '${newId}',
            ${escape(brd.name)},
            ${escape(brd.description)},
            ${escape(brd.country)},
            ${escape(brd.website)},
            ${brd.is_verified}
        ) ON CONFLICT (id) DO NOTHING;\n`;
    }

    // 3. Products
    sql += '\n-- Products\n';
    for (const prd of mockProducts) {
        const newId = crypto.randomUUID();
        const supplierUUID = supplierMap.get(prd.supplierId);
        const brandUUID = prd.brandId ? brandMap.get(prd.brandId) : 'NULL';

        if (!supplierUUID) continue;

        sql += `INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            '${newId}',
            ${escape(prd.name)},
            ${escape(prd.description)},
            ${prd.price},
            ${prd.originalPrice || 'NULL'},
            ${prd.discount || 0},
            ${prd.stock || 0},
            ${escape(prd.category)},
            ${prd.is_featured || false},
            ${prd.is_new || false},
            '${supplierUUID}',
            ${brandUUID === 'NULL' ? 'NULL' : `'${brandUUID}'`}
        ) ON CONFLICT (id) DO NOTHING;\n`;
    }

    const outputPath = path.join(__dirname, '../supabase/migrations/seed_store_data.sql');
    fs.writeFileSync(outputPath, sql);
    console.log(`✅ SQL Seed file generated at: ${outputPath}`);
}

generateSQL();

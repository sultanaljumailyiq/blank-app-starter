-- Seed Data for Store

-- Suppliers
INSERT INTO suppliers (id, name, description, rating, location, governorate, phone, email, is_verified) VALUES (
            'b86fb099-08c1-4987-ac06-54163497dfcf',
            'شركة الأدوات الطبية العراقية',
            'رائدة في توفير الأجهزة والأدوات الطبية الحديثة لعيادات الأسنان في العراق منذ 1995',
            4.9,
            'بغداد - المنصور',
            'بغداد',
            '+964 770 123 4567',
            'info@iraqdental.com',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO suppliers (id, name, description, rating, location, governorate, phone, email, is_verified) VALUES (
            '781198dd-8813-4ae2-9dfe-3e2bc66132f2',
            'مؤسسة الرعاية الطبية العراقية',
            'متخصصون في المستهلكات الطبية والمواد التجميلية عالية الجودة',
            4.8,
            'البصرة - المعقل',
            'البصرة',
            '+964 771 234 5678',
            'contact@caremedical.iq',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO suppliers (id, name, description, rating, location, governorate, phone, email, is_verified) VALUES (
            'e31e19a9-c30e-449a-a4a7-ad1fe1bf0e81',
            'مركز التقنيات الطبية',
            'نوفر أحدث التقنيات في مجال طب الأسنان الرقمي والأجهزة المتطورة',
            4.7,
            'أربيل - 100 متر',
            'أربيل',
            '+964 750 345 6789',
            'info@medtech.iq',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO suppliers (id, name, description, rating, location, governorate, phone, email, is_verified) VALUES (
            'ce5655db-22f2-408d-9255-87c70284aba0',
            'شركة النجاح للمستلزمات الطبية',
            'وكيل معتمد لأشهر الماركات العالمية في مجال طب الأسنان',
            4.6,
            'النجف - الكوفة',
            'النجف',
            '+964 781 456 7890',
            'sales@najah-medical.com',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO suppliers (id, name, description, rating, location, governorate, phone, email, is_verified) VALUES (
            '0e51a171-f466-453a-8b0b-91dfd46d8c15',
            'مؤسسة الشفاء الطبية',
            'متخصصون في الأدوية ومواد التخدير الطبية',
            4.5,
            'كربلاء - العباسية',
            'كربلاء',
            '+964 770 567 8901',
            'info@shifaa-medical.iq',
            true
        ) ON CONFLICT (id) DO NOTHING;

-- Brands
INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            '1ef80175-76ba-4ed5-ad02-b4f125003ce1',
            '3M',
            'شركة أمريكية عالمية رائدة في مجال المنتجات الطبية والصناعية',
            'الولايات المتحدة',
            'https://www.3m.com',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            'ad771901-8a40-4e09-af42-32d3f99538f9',
            'Dentsply Sirona',
            'أكبر شركة متخصصة في منتجات طب الأسنان في العالم',
            'الولايات المتحدة',
            'https://www.dentsplysirona.com',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            '21d388d4-ecef-482e-aaa6-794bce4452af',
            'GC Corporation',
            'شركة يابانية رائدة في مواد طب الأسنان التجميلية',
            'اليابان',
            'https://www.gc.dental',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            '6153ea7e-cb81-49aa-82e9-eca34b554626',
            'Ivoclar Vivadent',
            'شركة عالمية متخصصة في مواد طب الأسنان التجميلية والترميمية',
            'ليختنشتاين',
            'https://www.ivoclarvivadent.com',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            '3f07b967-5905-4bb9-b570-3e381ce77b14',
            'Planmeca',
            'شركة فنلندية رائدة في أجهزة الأشعة والتصوير الرقمي',
            'فنلندا',
            'https://www.planmeca.com',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            'de7d18a0-318b-4e9a-b432-9255c9dd9285',
            'Carestream Dental',
            'متخصصون في أنظمة التصوير الرقمي وبرامج إدارة العيادات',
            'الولايات المتحدة',
            'https://www.carestreamdental.com',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            '82b336a4-be88-48ed-ba87-9e26678feb39',
            'Septodont',
            'شركة فرنسية متخصصة في أدوية ومواد التخدير الطبية',
            'فرنسا',
            'https://www.septodont.com',
            true
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO brands (id, name, description, country, website, is_verified) VALUES (
            '38b5dff8-41c8-4483-8f85-7edf061de184',
            'Kerr Dental',
            'شركة أمريكية رائدة في مواد الحشو والترميم',
            'الولايات المتحدة',
            'https://www.kerrdental.com',
            true
        ) ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            'e50b1213-17af-46bb-825b-18238ab2cf64',
            'جهاز أشعة رقمي بانوراما ثلاثي الأبعاد',
            'جهاز أشعة رقمي عالي الدقة مع تقنية البانوراما ثلاثية الأبعاد من Planmeca',
            50625000,
            67500000,
            25,
            5,
            'أجهزة',
            true,
            false,
            'b86fb099-08c1-4987-ac06-54163497dfcf',
            '3f07b967-5905-4bb9-b570-3e381ce77b14'
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            '0a6ab692-bd2f-4c86-acbc-54e2f4ea85c4',
            'قفازات طبية معقمة (100 قطعة)',
            'قفازات طبية معقمة مصنوعة من اللاتكس عالي الجودة - خصم الجمعة البيضاء',
            135000,
            225000,
            40,
            500,
            'مستهلكات',
            false,
            false,
            '781198dd-8813-4ae2-9dfe-3e2bc66132f2',
            NULL
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            'f8c8b8ad-2037-4e2c-a5bb-2deff2753c34',
            'حشوات تجميلية من 3M - مجموعة كاملة',
            'حشوات تجميلية عالية الجودة مطابقة للون الأسنان الطبيعي - عرض خاص 3M',
            960000,
            1200000,
            20,
            50,
            'مواد',
            true,
            false,
            'b86fb099-08c1-4987-ac06-54163497dfcf',
            '1ef80175-76ba-4ed5-ad02-b4f125003ce1'
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            '814767b7-89d3-43d6-9368-f151f93f9183',
            'كرسي الأسنان الكهربائي المتطور',
            'كرسي أسنان كهربائي متعدد الأوضاع مع إضاءة LED مدمجة من Dentsply Sirona',
            32500000,
            NULL,
            0,
            3,
            'أجهزة',
            true,
            true,
            'b86fb099-08c1-4987-ac06-54163497dfcf',
            'ad771901-8a40-4e09-af42-32d3f99538f9'
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            'e2c235ab-eb1e-4fd2-9919-14a1f6e43355',
            'جهاز تعقيم أوتوكلاف فئة B',
            'جهاز تعقيم بالبخار عالي الضغط فئة B سعة 18 لتر',
            12750000,
            NULL,
            0,
            8,
            'أجهزة',
            false,
            false,
            '781198dd-8813-4ae2-9dfe-3e2bc66132f2',
            NULL
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            'daf3d496-627e-4b63-99f2-ca4bba2ea710',
            'أدوات جراحية - مجموعة كاملة من الفولاذ الجراحي',
            'مجموعة كاملة من الأدوات الجراحية المصنوعة من الفولاذ المقاوم للصدأ',
            4500000,
            NULL,
            0,
            15,
            'أدوات',
            false,
            false,
            'ce5655db-22f2-408d-9255-87c70284aba0',
            'ad771901-8a40-4e09-af42-32d3f99538f9'
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            '54f4e784-2a01-41a2-bd85-7626e0898cae',
            'معجون تبييض احترافي من GC',
            'معجون تبييض احترافي بتركيبة متقدمة من GC - عبوة 500 غرام',
            262500,
            375000,
            30,
            120,
            'مواد',
            false,
            false,
            '781198dd-8813-4ae2-9dfe-3e2bc66132f2',
            '21d388d4-ecef-482e-aaa6-794bce4452af'
        ) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, description, price, original_price, discount, stock, category, is_featured, is_new, supplier_id, brand_id) VALUES (
            '7c5080e9-47ed-4129-90eb-fafcec2a9d87',
            'جهاز تنظيف الأسنان بالموجات فوق الصوتية',
            'جهاز تنظيف بالموجات فوق الصوتية مع 5 رؤوس قابلة للتبديل',
            18750000,
            NULL,
            0,
            6,
            'أجهزة',
            true,
            true,
            'b86fb099-08c1-4987-ac06-54163497dfcf',
            'ad771901-8a40-4e09-af42-32d3f99538f9'
        ) ON CONFLICT (id) DO NOTHING;

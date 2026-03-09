-- COMPREHENSIVE TREATMENTS SEED
-- This seeds ALL treatments from the original assets.ts file

DO $$
DECLARE
    clinic_rec RECORD;
BEGIN
    FOR clinic_rec IN SELECT id FROM clinics LOOP
        -- Delete existing treatments to re-seed properly
        DELETE FROM treatments WHERE clinic_id = clinic_rec.id;
        
        -- Seed all treatments
        INSERT INTO treatments (clinic_id, name, category, base_price, cost_estimate, profit_margin, popularity, expected_sessions, is_active, is_complex) VALUES
        -- وقائي
        (clinic_rec.id, 'فحص دوري شامل', 'وقائي', 15000, 0, 100, 90, 1, true, false),
        (clinic_rec.id, 'تنظيف أسنان (Scaling)', 'وقائي', 25000, 5000, 87, 95, 1, true, false),
        (clinic_rec.id, 'تلميع الأسنان (Polishing)', 'وقائي', 25000, 2000, 92, 85, 1, true, false),
        (clinic_rec.id, 'تطبيق الفلورايد', 'وقائي', 30000, 5000, 83, 70, 1, true, false),
        (clinic_rec.id, 'سد الشقوق (Fissure Sealant) - للسن', 'وقائي', 35000, 5000, 85, 65, 1, true, false),
        (clinic_rec.id, 'تعليمات العناية الفموية', 'وقائي', 10000, 0, 100, 50, 1, true, false),
        (clinic_rec.id, 'واقي ليلي (Night Guard)', 'وقائي', 150000, 50000, 66, 45, 2, true, true),
        
        -- ترميمي
        (clinic_rec.id, 'حشوة كلاس آينومر (Glass Ionomer)', 'ترميمي', 50000, 12000, 76, 70, 1, true, false),
        (clinic_rec.id, 'حشوة ضوئية (Composite) - سطح واحد', 'ترميمي', 60000, 12000, 80, 95, 1, true, false),
        (clinic_rec.id, 'حشوة ضوئية (Composite) - سطحين', 'ترميمي', 75000, 15000, 80, 90, 1, true, false),
        (clinic_rec.id, 'حشوة ضوئية (Composite) - 3 أسطح', 'ترميمي', 90000, 20000, 77, 85, 1, true, false),
        (clinic_rec.id, 'بناء سن متهدم (Buildup) - كومبوزيت', 'ترميمي', 100000, 25000, 75, 50, 1, true, false),
        (clinic_rec.id, 'حشوة أملغم (Amalgam)', 'ترميمي', 50000, 10000, 80, 30, 1, true, false),
        (clinic_rec.id, 'حشوة عنق السن (Class V)', 'ترميمي', 55000, 10000, 81, 60, 1, true, false),
        (clinic_rec.id, 'إصلاح حشوة قديمة', 'ترميمي', 40000, 5000, 87, 45, 1, true, false),
        (clinic_rec.id, 'تغطية لب مباشرة (Direct Pulp Cap)', 'ترميمي', 30000, 5000, 83, 35, 1, true, false),
        (clinic_rec.id, 'تغطية لب غير مباشرة (Indirect Pulp Cap)', 'ترميمي', 30000, 5000, 83, 35, 1, true, false),
        (clinic_rec.id, 'وتد ليفي (Fiber POST)', 'ترميمي', 120000, 30000, 75, 40, 1, true, false),
        (clinic_rec.id, 'إزالة وتد قديم', 'ترميمي', 80000, 5000, 93, 15, 1, true, false),
        (clinic_rec.id, 'حشوة تجميلية (Diastema Closure)', 'ترميمي', 150000, 20000, 86, 30, 1, true, false),
        (clinic_rec.id, 'حشوة وقائية (PRR)', 'ترميمي', 40000, 5000, 87, 50, 1, true, false),
        (clinic_rec.id, 'تبييض داخلي (سن واحد)', 'ترميمي', 100000, 10000, 90, 10, 2, true, true),
        (clinic_rec.id, 'حشوة ساندويش (Sandwich Tech)', 'ترميمي', 85000, 18000, 78, 15, 1, true, false),
        (clinic_rec.id, 'إعادة تشكيل السن (Cosmetic Contouring)', 'ترميمي', 50000, 2000, 96, 25, 1, true, false),
        (clinic_rec.id, 'حشوة Onlay (Direct)', 'ترميمي', 120000, 25000, 79, 10, 1, true, false),
        (clinic_rec.id, 'حشوة Inlay (Direct)', 'ترميمي', 120000, 25000, 79, 10, 1, true, false),
        (clinic_rec.id, 'ترميم كسر بسيط', 'ترميمي', 60000, 10000, 83, 40, 1, true, false),
        
        -- علاج جذور
        (clinic_rec.id, 'علاج عصب - (RCT)', 'علاج جذور', 150000, 30000, 80, 70, 2, true, true),
        (clinic_rec.id, 'إعادة علاج عصب (Re-treatment)', 'علاج جذور', 200000, 40000, 80, 20, 2, true, true),
        (clinic_rec.id, 'بتر اللب (Pulpotomy) - أطفال', 'علاج جذور', 100000, 20000, 80, 50, 1, true, false),
        (clinic_rec.id, 'استئصال اللب (Pulpectomy) - أطفال', 'علاج جذور', 120000, 25000, 79, 40, 1, true, false),
        (clinic_rec.id, 'جراحة ذروة الجذر (Apicoectomy)', 'علاج جذور', 350000, 50000, 85, 10, 2, true, true),
        (clinic_rec.id, 'سد ثقب الجذر (Perforation Repair)', 'علاج جذور', 150000, 40000, 73, 5, 2, true, true),
        (clinic_rec.id, 'فتح خراج (Abscess Drainage)', 'علاج جذور', 50000, 5000, 90, 30, 1, true, false),
        (clinic_rec.id, 'Apexogenesis', 'علاج جذور', 150000, 30000, 80, 2, 2, true, true),
        (clinic_rec.id, 'Apexification', 'علاج جذور', 200000, 50000, 75, 2, 2, true, true),
        
        -- جراحة
        (clinic_rec.id, 'قلع بسيط (Simple Extraction)', 'جراحة', 50000, 5000, 90, 85, 1, true, false),
        (clinic_rec.id, 'قلع جراحي (Surgical Extraction)', 'جراحة', 100000, 15000, 85, 40, 1, true, true),
        (clinic_rec.id, 'قلع ضرس العقل - مطمور (Impaction)', 'جراحة', 350000, 50000, 85, 30, 2, true, true),
        (clinic_rec.id, 'زراعة سنية (Implant) - كوري', 'جراحة', 600000, 300000, 50, 50, 3, true, true),
        (clinic_rec.id, 'زراعة سنية (Implant) - سويسري', 'جراحة', 1000000, 500000, 50, 40, 3, true, true),
        (clinic_rec.id, 'زراعة سنية (Implant) - ألماني', 'جراحة', 800000, 400000, 50, 45, 3, true, true),
        (clinic_rec.id, 'رفع جيب فكي (Sinus Lift)', 'جراحة', 400000, 100000, 75, 15, 2, true, true),
        (clinic_rec.id, 'تطعيم عظمي (Bone Graft)', 'جراحة', 200000, 100000, 50, 20, 2, true, true),
        (clinic_rec.id, 'قص اللثة (Gingivectomy) - للسن', 'جراحة', 50000, 5000, 90, 30, 1, true, false),
        (clinic_rec.id, 'جراحة اللثة التجميلية (Per Quadrant)', 'جراحة', 250000, 30000, 88, 15, 2, true, true),
        (clinic_rec.id, 'Frenectomy', 'جراحة', 100000, 10000, 90, 10, 1, true, false),
        (clinic_rec.id, 'معالجة سنخ جاف (Dry Socket)', 'جراحة', 20000, 2000, 90, 15, 1, true, false),
        (clinic_rec.id, 'استئصال كيس (Cyst Enucleation)', 'جراحة', 250000, 30000, 88, 5, 2, true, true),
        (clinic_rec.id, 'Biopsy', 'جراحة', 100000, 20000, 80, 5, 1, true, false),
        
        -- تعويضات
        (clinic_rec.id, 'تاج خزف معدن (PFM Crown)', 'تعويضات', 150000, 50000, 66, 80, 2, true, true),
        (clinic_rec.id, 'تاج زركون (Zirconia Crown)', 'تعويضات', 250000, 80000, 68, 85, 2, true, true),
        (clinic_rec.id, 'تاج إيماكس (E-max Crown)', 'تعويضات', 300000, 100000, 66, 70, 2, true, true),
        (clinic_rec.id, 'جسر خزف معدن (لكل وحدة)', 'تعويضات', 150000, 50000, 66, 60, 2, true, true),
        (clinic_rec.id, 'جسر زركون (لكل وحدة)', 'تعويضات', 250000, 80000, 68, 65, 2, true, true),
        (clinic_rec.id, 'طقم جزئي أكريليك (Partial Acrylic)', 'تعويضات', 300000, 50000, 83, 50, 3, true, true),
        (clinic_rec.id, 'طقم جزئي معدني (Cast Partial)', 'تعويضات', 600000, 200000, 66, 30, 3, true, true),
        (clinic_rec.id, 'طقم جزئي مرن (Flexible Denture)', 'تعويضات', 500000, 150000, 70, 40, 3, true, true),
        (clinic_rec.id, 'طقم كامل (Complete Denture) - فك واحد', 'تعويضات', 500000, 100000, 80, 45, 4, true, true),
        (clinic_rec.id, 'طقم كامل (Complete Denture) - فكين', 'تعويضات', 900000, 150000, 83, 40, 4, true, true),
        (clinic_rec.id, 'تبطين طقم (Reline) - مباشر', 'تعويضات', 100000, 20000, 80, 20, 1, true, false),
        (clinic_rec.id, 'تبطين طقم (Reline) - مختبري', 'تعويضات', 150000, 50000, 66, 15, 2, true, true),
        (clinic_rec.id, 'إصلاح كسر طقم (Denture Repair)', 'تعويضات', 50000, 10000, 80, 25, 1, true, true),
        (clinic_rec.id, 'إضافة سن لطقم', 'تعويضات', 60000, 15000, 75, 20, 1, true, true),
        (clinic_rec.id, 'Inlay/Onlay - سيراميك', 'تعويضات', 250000, 80000, 68, 10, 2, true, true),
        (clinic_rec.id, 'إلصاق تاج (Recementation)', 'تعويضات', 25000, 2000, 92, 35, 1, true, false),
        (clinic_rec.id, 'Maryland Bridge (لكل وحدة)', 'تعويضات', 200000, 60000, 70, 10, 2, true, true),
        (clinic_rec.id, 'Snap-on Smile (للفك)', 'تعويضات', 400000, 150000, 62, 15, 2, true, true),
        (clinic_rec.id, 'تاج مؤقت (Temporary Crown)', 'تعويضات', 25000, 2000, 92, 80, 1, true, false),
        (clinic_rec.id, 'وتد وبناء (Cast Post & Core)', 'تعويضات', 150000, 40000, 73, 30, 2, true, true),
        (clinic_rec.id, 'Richmond Crown', 'تعويضات', 200000, 60000, 70, 5, 2, true, true),
        (clinic_rec.id, 'Veneer (E-max)', 'تعويضات', 350000, 100000, 71, 60, 2, true, true),
        (clinic_rec.id, 'Veneer (Zirconia)', 'تعويضات', 300000, 80000, 73, 40, 2, true, true),
        (clinic_rec.id, 'Lumineer (No prep)', 'تعويضات', 400000, 150000, 62, 20, 2, true, true),
        (clinic_rec.id, 'إزالة تاج قديم', 'تعويضات', 30000, 2000, 93, 45, 1, true, false),
        
        -- تجميل
        (clinic_rec.id, 'تبييض منزلي (Kit)', 'تجميل', 250000, 100000, 60, 70, 1, true, false),
        (clinic_rec.id, 'تبييض ليزر (عيادة)', 'تجميل', 400000, 80000, 80, 75, 1, true, false),
        (clinic_rec.id, 'إغلاق فلجة بالكومبوزيت', 'تجميل', 150000, 20000, 86, 35, 1, true, false),
        (clinic_rec.id, 'سنايل آرت (Snap-on)', 'تجميل', 400000, 150000, 62, 15, 2, true, true),
        (clinic_rec.id, 'Botox (Smile correction)', 'تجميل', 250000, 100000, 60, 20, 1, true, false),
        (clinic_rec.id, 'Fillers (Lip)', 'تجميل', 300000, 150000, 50, 15, 1, true, false),
        (clinic_rec.id, 'Mock-up', 'تجميل', 50000, 5000, 90, 30, 1, true, false);
        
        RAISE NOTICE 'Seeded % comprehensive treatments for clinic %', 85, clinic_rec.id;
    END LOOP;
END $$;

DO $$ BEGIN RAISE NOTICE 'All 85 Treatments Seeded Successfully!'; END $$;

-- Simple Direct Seed for Treatments
-- This bypasses template tables and directly inserts treatments

-- First, get the clinic id dynamically
DO $$
DECLARE
    clinic_rec RECORD;
BEGIN
    FOR clinic_rec IN SELECT id FROM clinics LOOP
        -- Check if this clinic already has treatments
        IF NOT EXISTS (SELECT 1 FROM treatments WHERE clinic_id = clinic_rec.id LIMIT 1) THEN
            -- Insert default treatments for this clinic
            INSERT INTO treatments (clinic_id, name, category, base_price, cost_estimate, profit_margin, expected_sessions, is_active, is_complex)
            VALUES
                (clinic_rec.id, 'فحص دوري شامل', 'وقائي', 15000, 0, 100, 1, true, false),
                (clinic_rec.id, 'تنظيف أسنان (Scaling)', 'وقائي', 25000, 5000, 87, 1, true, false),
                (clinic_rec.id, 'تلميع الأسنان (Polishing)', 'وقائي', 25000, 2000, 92, 1, true, false),
                (clinic_rec.id, 'تطبيق الفلورايد', 'وقائي', 30000, 5000, 83, 1, true, false),
                (clinic_rec.id, 'سد الشقوق (Fissure Sealant)', 'وقائي', 35000, 5000, 85, 1, true, false),
                (clinic_rec.id, 'واقي ليلي (Night Guard)', 'وقائي', 150000, 50000, 66, 2, true, true),
                (clinic_rec.id, 'حشوة ضوئية - سطح واحد', 'ترميمي', 60000, 12000, 80, 1, true, false),
                (clinic_rec.id, 'حشوة ضوئية - سطحين', 'ترميمي', 75000, 15000, 80, 1, true, false),
                (clinic_rec.id, 'حشوة ضوئية - 3 أسطح', 'ترميمي', 90000, 20000, 77, 1, true, false),
                (clinic_rec.id, 'علاج عصب (RCT)', 'علاج جذور', 150000, 30000, 80, 2, true, true),
                (clinic_rec.id, 'إعادة علاج عصب', 'علاج جذور', 200000, 40000, 80, 2, true, true),
                (clinic_rec.id, 'قلع بسيط', 'جراحة', 50000, 5000, 90, 1, true, false),
                (clinic_rec.id, 'قلع جراحي', 'جراحة', 100000, 15000, 85, 1, true, true),
                (clinic_rec.id, 'تاج خزف معدن (PFM)', 'تعويضات', 150000, 50000, 66, 2, true, true),
                (clinic_rec.id, 'تاج زركون', 'تعويضات', 250000, 80000, 68, 2, true, true),
                (clinic_rec.id, 'تبييض ليزر (عيادة)', 'تجميل', 400000, 80000, 80, 1, true, false),
                (clinic_rec.id, 'فينير واحد', 'تجميل', 300000, 100000, 66, 2, true, true),
                (clinic_rec.id, 'زراعة سن واحد', 'زراعة', 800000, 300000, 62, 3, true, true);
                
            RAISE NOTICE 'Seeded treatments for clinic %', clinic_rec.id;
        ELSE
            RAISE NOTICE 'Clinic % already has treatments, skipping', clinic_rec.id;
        END IF;
    END LOOP;
END $$;

-- Also seed inventory if needed
DO $$
DECLARE
    clinic_rec RECORD;
BEGIN
    FOR clinic_rec IN SELECT id FROM clinics LOOP
        IF NOT EXISTS (SELECT 1 FROM inventory WHERE clinic_id = clinic_rec.id LIMIT 1) THEN
            INSERT INTO inventory (clinic_id, item_name, category, quantity, min_quantity, unit, unit_price)
            VALUES
                (clinic_rec.id, 'بنج موضعي (Lidocaine)', 'medicines', 50, 10, 'امبولة', 900),
                (clinic_rec.id, 'أبر بنج قصيرة 30G', 'consumables', 100, 20, 'قطعة', 150),
                (clinic_rec.id, 'حشوة كومبوزيت A1', 'consumables', 10, 5, 'تيوب', 35000),
                (clinic_rec.id, 'حشوة كومبوزيت A2', 'consumables', 10, 5, 'تيوب', 35000),
                (clinic_rec.id, 'Etching Gel', 'consumables', 5, 3, 'حقنة', 8000),
                (clinic_rec.id, 'قطن طبي', 'consumables', 20, 10, 'باكيت', 6000),
                (clinic_rec.id, 'قفازات طبية', 'consumables', 10, 5, 'علبة', 8000),
                (clinic_rec.id, 'الجينات (Alginate)', 'supplies', 5, 3, 'كيس', 18000);
                
            RAISE NOTICE 'Seeded inventory for clinic %', clinic_rec.id;
        ELSE
            RAISE NOTICE 'Clinic % already has inventory, skipping', clinic_rec.id;
        END IF;
    END LOOP;
END $$;

DO $$ BEGIN RAISE NOTICE 'Direct Seeding Completed!'; END $$;

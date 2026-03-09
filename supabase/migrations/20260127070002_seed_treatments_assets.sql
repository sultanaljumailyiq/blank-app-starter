
-- 5. Seed System Templates (Data from assets.ts)
TRUNCATE system_treatment_templates;
TRUNCATE system_inventory_templates;

INSERT INTO system_treatment_templates (name, category, base_price, cost_estimate, profit_margin, popularity, expected_sessions, is_complex, default_phases) VALUES
('فحص دوري شامل', 'وقائي', 15000, 0, 100, 90, 1, false, '[]'),
('تنظيف أسنان (Scaling)', 'وقائي', 25000, 5000, 87, 95, 1, false, '[]'),
('تلميع الأسنان (Polishing)', 'وقائي', 25000, 2000, 92, 85, 1, false, '[]'),
('تطبيق الفلورايد', 'وقائي', 30000, 5000, 83, 70, 1, false, '[]'),
('سد الشقوق (Fissure Sealant)', 'وقائي', 35000, 5000, 85, 65, 1, false, '[]'),
('واقي ليلي (Night Guard)', 'وقائي', 150000, 50000, 66, 45, 2, true, '["أخذ طبعة", "تسليم"]'),
('حشوة ضوئية (Composite) - سطح واحد', 'ترميمي', 60000, 12000, 80, 95, 1, false, '[]'),
('حشوة ضوئية (Composite) - سطحين', 'ترميمي', 75000, 15000, 80, 90, 1, false, '[]'),
('حشوة ضوئية (Composite) - 3 أسطح', 'ترميمي', 90000, 20000, 77, 85, 1, false, '[]'),
('علاج عصب - (RCT)', 'علاج جذور', 150000, 30000, 80, 70, 2, true, '["فتح وتنظيف قنوات", "حشو قنوات نهائي"]'),
('إعادة علاج عصب (Re-treatment)', 'علاج جذور', 200000, 40000, 80, 20, 2, true, '[]'),
('قلع بسيط (Simple Extraction)', 'جراحة', 50000, 5000, 90, 85, 1, false, '[]'),
('قلع جراحي (Surgical Extraction)', 'جراحة', 100000, 15000, 85, 40, 1, true, '[]'),
('تاج خزف معدن (PFM Crown)', 'تعويضات', 150000, 50000, 66, 80, 2, true, '["تحضير وطبعة", "بروفة", "تسليم"]'),
('تاج زركون (Zirconia Crown)', 'تعويضات', 250000, 80000, 68, 85, 2, true, '["تحضير وطبعة", "بروفة", "تسليم"]'),
('تبييض ليزر (عيادة)', 'تجميل', 400000, 80000, 80, 75, 1, false, '[]');

INSERT INTO system_inventory_templates (name, category, min_quantity, unit, price) VALUES
('بنج موضعي (Lidocaine)', 'medicines', 10, 'علبة (50 امبولة)', 45000),
('أبر بنج (Needles) - قصيرة 30G', 'consumables', 5, 'علبة (100 قطعة)', 15000),
('حشوة كومبوزيت (Composite) - A1', 'consumables', 5, 'تيوب (4g)', 35000),
('حشوة كومبوزيت (Composite) - A2', 'consumables', 5, 'تيوب (4g)', 35000),
('Etching Gel', 'consumables', 3, 'حقنة (3ml)', 8000),
('قطن رول (Cotton Rolls)', 'consumables', 10, 'باكيت', 6000),
('قفازات طبية (Gloves)', 'consumables', 10, 'علبة (100 زوج)', 8000),
('الجينات (Alginate)', 'supplies', 3, 'كيس (500g)', 18000);

-- 6. Create or Replace Seeding Function
CREATE OR REPLACE FUNCTION public.seed_clinic_defaults()
RETURNS TRIGGER AS $$
BEGIN
    -- Seed Treatments
    INSERT INTO treatments (
        clinic_id, name, category, base_price, cost_estimate, 
        profit_margin, popularity, expected_sessions, is_complex, default_phases
    )
    SELECT 
        NEW.id, name, category, base_price, cost_estimate, 
        profit_margin, popularity, expected_sessions, is_complex, default_phases
    FROM system_treatment_templates;

    -- Seed Inventory
    INSERT INTO inventory (
        clinic_id, name, category, min_quantity, unit, price, quantity
    )
    SELECT 
        NEW.id, name, category, min_quantity, unit, price, 0 -- Start with 0 stock
    FROM system_inventory_templates;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create Trigger
DROP TRIGGER IF EXISTS on_clinic_created_seed ON clinics;
CREATE TRIGGER on_clinic_created_seed
AFTER INSERT ON clinics
FOR EACH ROW
EXECUTE FUNCTION seed_clinic_defaults();

-- 8. Backfill for Existing Clinics (Unique Check to avoid duplicates)
-- Insert TREATMENTS
INSERT INTO treatments (
    clinic_id, name, category, base_price, cost_estimate, 
    profit_margin, popularity, expected_sessions, is_complex, default_phases
)
SELECT 
    c.id, t.name, t.category, t.base_price, t.cost_estimate, 
    t.profit_margin, t.popularity, t.expected_sessions, t.is_complex, t.default_phases
FROM clinics c
CROSS JOIN system_treatment_templates t
WHERE NOT EXISTS (SELECT 1 FROM treatments WHERE clinic_id = c.id);

-- Insert INVENTORY
INSERT INTO inventory (
    clinic_id, name, category, min_quantity, unit, price, quantity
)
SELECT 
    c.id, i.name, i.category, i.min_quantity, i.unit, i.price, 0
FROM clinics c
CROSS JOIN system_inventory_templates i
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE clinic_id = c.id);

DO $$ BEGIN RAISE NOTICE 'Full Seeding Completed Successfully.'; END $$;

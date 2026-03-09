-- UNIFIED FIX: Schema + Permissions + Data Seed
-- Run this script to completely repair the Demo Environment.

-- PART 1: ENSURE SCHEMA IS CORRECT (Add missing columns if needed)
-- Patients
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);

-- Inventory
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs',
ADD COLUMN IF NOT EXISTS status TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN quantity <= 0 THEN 'out_of_stock'
    WHEN quantity <= min_stock THEN 'low_stock'
    WHEN expiry_date <= CURRENT_DATE THEN 'expired'
    ELSE 'available'
  END
) STORED;

CREATE INDEX IF NOT EXISTS idx_inventory_clinic_id ON inventory(clinic_id);

-- Staff (Check based on previous checks, assuming it's okay or adding safety)
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE;

-- PART 2: FIX PERMISSIONS (Allow reading Demo Data)
-- Drop restrictive policies if they exist (optional, but cleaner)
-- Or just add the Permissive Policies for Demo Data (Safe)

DROP POLICY IF EXISTS "Allow public read for demo patients" ON patients;
CREATE POLICY "Allow public read for demo patients"
  ON patients FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

DROP POLICY IF EXISTS "Allow public read for demo inventory" ON inventory;
CREATE POLICY "Allow public read for demo inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

DROP POLICY IF EXISTS "Allow public read for demo appointments" ON appointments;
CREATE POLICY "Allow public read for demo appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

DROP POLICY IF EXISTS "Allow public read for demo staff" ON staff;
CREATE POLICY "Allow public read for demo staff"
  ON staff FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

DROP POLICY IF EXISTS "Allow public read for demo transactions" ON financial_transactions;
CREATE POLICY "Allow public read for demo transactions"
  ON financial_transactions FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

-- PART 3: RE-SEED DATA (Guarantee Data Exists)
-- Ensure Clinics Exist
INSERT INTO clinics (id, name, address, city, phone, is_active)
VALUES 
    (1, 'عيادة النور التخصصية', 'شارع فلسطين', 'بغداد', '07701234567', true),
    (2, 'مركز الابتسامة الرقمي', 'حي الكرادة', 'بغداد', '07901234567', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    is_active = true;

-- Patients
INSERT INTO patients (clinic_id, full_name, age, gender, phone, email, address, status, last_visit_date, total_visits, medical_history, notes, created_at)
VALUES 
    (1, 'سارة أحمد محمود', 28, 'female', '07701234567', 'sara.ahmed@example.com', 'بغداد - المنصور', 'active', CURRENT_DATE - INTERVAL '2 days', 3, 'حساسية بنسلين', 'مريضة منتظمة، مهتمة بالتجميل', NOW()),
    (1, 'محمد علي حسن', 45, 'male', '07901112222', 'mohammed.ali@example.com', 'بغداد - الكرادة', 'active', CURRENT_DATE - INTERVAL '10 days', 5, 'سكري مسيطر عليه', 'يحتاج متابعة للزرع', NOW()),
    (1, 'نور الهدى كريم', 32, 'female', '07802223333', 'noor.huda@example.com', 'بغداد - الجادرية', 'active', CURRENT_DATE - INTERVAL '1 month', 2, 'لا توجد', 'تنظيف وتبييض', NOW()),
    (1, 'حسين كاظم', 55, 'male', '07703334444', NULL, 'بغداد - الشعب', 'archived', CURRENT_DATE - INTERVAL '6 months', 1, 'ضغط دم', 'لم يراجع منذ فترة', NOW()),
    (2, 'Zainab Basil (Center)', 22, 'female', '07505556666', 'zainab.b@example.com', 'أربيل - وزيران', 'active', CURRENT_DATE, 1, 'Asthma', 'First visit checkup', NOW());

-- Inventory
INSERT INTO inventory (clinic_id, item_name, category, quantity, unit_price, min_stock, unit, supplier_name, status, expiry_date)
VALUES 
    (1, 'Lignospan (Anesthetic)', 'تخدير', 5, 25000, 10, 'box', 'مذخر النور', 'low_stock', '2026-05-01'),
    (1, 'Composite Kit 3M', 'حشوات', 2, 120000, 3, 'set', 'شركة دجلة', 'low_stock', '2025-12-30'),
    (2, 'Disposable Gloves (M)', 'مستهلكات', 4, 5000, 20, 'box', 'مكتب الصيادلة', 'low_stock', '2027-01-01'),
    (1, 'Cotton Rolls', 'مستهلكات', 50, 2000, 10, 'pack', 'مذخر النور', 'available', '2030-01-01'),
    (1, 'Etching Gel', 'حشوات', 15, 8000, 5, 'syringe', 'شركة دجلة', 'available', '2026-08-15');

-- Appointments (Pending Requests)
INSERT INTO appointments (clinic_id, patient_id, doctor_id, date, time, status, type, notes, patient_name, phone_number, created_at)
VALUES
    (1, NULL, NULL, CURRENT_DATE + INTERVAL '1 day', '10:00', 'pending', 'consultation', 'أعاني من ألم في السن العلوي', 'أحمد ياسين', '07709998888', NOW()),
    (1, NULL, NULL, CURRENT_DATE + INTERVAL '2 days', '16:30', 'pending', 'checkup', 'حجز تبييض أسنان', 'مريم فارس', '07807776666', NOW()),
    (2, NULL, NULL, CURRENT_DATE + INTERVAL '1 day', '09:00', 'pending', 'emergency', 'Urgent pain', 'John Doe', '07500000000', NOW());

-- Financial Transactions
INSERT INTO financial_transactions (clinic_id, amount, type, category, description, transaction_date, status)
VALUES
    (1, 75000, 'income', 'علاجات', 'حشوة ضوئية - سارة أحمد', CURRENT_DATE, 'completed'),
    (1, 150000, 'expense', 'رواتب', 'سلفة مساعد طبيب', CURRENT_DATE - INTERVAL '2 days', 'completed'),
    (1, 250000, 'income', 'تركيبات', 'دفعة أولى زيركون - محمد علي', CURRENT_DATE - INTERVAL '1 day', 'completed'),
    (1, 50000, 'expense', 'شراء مواد', 'شراء كمامات وكفوف', CURRENT_DATE - INTERVAL '5 days', 'completed');

-- Staff
INSERT INTO staff (clinic_id, full_name, role_title, phone, email, join_date, salary, is_active)
VALUES
    (1, 'د. علي حسين', 'طبيب أسنان عام', '07701112222', 'ali.h@clinic.com', '2024-01-01', 2000000, true),
    (1, 'م. زينب', 'مساعدة طبيب', '07903334444', NULL, '2024-03-15', 800000, true);

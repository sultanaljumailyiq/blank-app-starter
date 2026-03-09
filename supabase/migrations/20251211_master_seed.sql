-- MASTER SEED SCRIPT (2025-12-11)
-- Populates: Clinics, Patients, Inventory, Appointments

-- 1. Ensure Clinics Exist (Using specific IDs to match frontend hardcoding often used in demos)
INSERT INTO clinics (id, name, address, city, phone, owner_id)
VALUES 
(1, 'عيادة النور التخصصية', 'شارع فلسطين', 'بغداد', '07701234567', auth.uid()),
(2, 'مركز الابتسامة الرقمي', 'حي الكرادة', 'بغداد', '07901234567', auth.uid())
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, address = EXCLUDED.address, city = EXCLUDED.city, phone = EXCLUDED.phone;

-- 2. Seed Patients
-- Clinic 1 Patients
INSERT INTO patients (clinic_id, name, phone, age, gender, created_at, last_visit)
VALUES
(1, 'أحمد محمد', '07705551111', 35, 'male', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
(1, 'سارة علي', '07705552222', 28, 'female', NOW() - INTERVAL '60 days', NOW() - INTERVAL '10 days'),
(1, 'حسين كاظم', '07705553333', 45, 'male', NOW() - INTERVAL '90 days', NOW() - INTERVAL '15 days'),
(1, 'زينب حسن', '07705554444', 32, 'female', NOW() - INTERVAL '120 days', NOW() - INTERVAL '20 days'),
(1, 'فاطمة كريم', '07705555555', 25, 'female', NOW(), NULL); -- New patient

-- Clinic 2 Patients
INSERT INTO patients (clinic_id, name, phone, age, gender, created_at, last_visit)
VALUES
(2, 'علي حسين', '07801111111', 40, 'male', NOW() - INTERVAL '40 days', NOW() - INTERVAL '2 days'),
(2, 'مروة احمد', '07802222222', 22, 'female', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),
(2, 'يوسف محمود', '07803333333', 12, 'male', NOW() - INTERVAL '10 days', NOW()); -- Child

-- 3. Seed Inventory (With Low Stock for Alerts)
-- Clinic 1 Inventory
INSERT INTO inventory (clinic_id, item_name, quantity, min_stock, unit, price, expiry_date, category)
VALUES
(1, 'Anaesthetic Cartridges (Lidocaine)', 50, 20, 'box', 45.00, NOW() + INTERVAL '1 year', 'Medical'),
(1, 'Composite Kit (A2)', 3, 5, 'kit', 120.00, NOW() + INTERVAL '6 months', 'Restorative'), -- LOW STOCK
(1, 'Surgical Gloves (M)', 100, 50, 'box', 15.00, NOW() + INTERVAL '2 years', 'Consumables'),
(1, 'Bonding Agent', 2, 3, 'bottle', 85.00, NOW() + INTERVAL '2 months', 'Restorative'); -- LOW STOCK & NEAR EXPIRY

-- Clinic 2 Inventory
INSERT INTO inventory (clinic_id, item_name, quantity, min_stock, unit, price, expiry_date, category)
VALUES
(2, 'Alginate Impression Material', 2, 5, 'bag', 25.00, NOW() + INTERVAL '1 year', 'Impression'), -- LOW STOCK
(2, 'Disposable Bibs', 200, 100, 'pack', 20.00, NOW() + INTERVAL '3 years', 'Consumables'),
(2, 'Cotton Rolls', 500, 200, 'roll', 10.00, NOW() + INTERVAL '2 years', 'Consumables');

-- 4. Seed Appointments
-- Pending Appointments (Online Requests)
INSERT INTO appointments (clinic_id, patient_name, appointment_date, appointment_time, type, status, notes, created_at)
VALUES
(1, 'هدى سالم', CURRENT_DATE + 2, '16:00', 'تبييض أسنان', 'pending', 'حجز إلكتروني - عرض خاص', NOW()),
(1, 'محمد رضا', CURRENT_DATE + 3, '18:30', 'زراعة', 'pending', 'استشارة زراعة فورية', NOW()),
(2, 'نور الهدى', CURRENT_DATE + 1, '12:00', 'تقويم', 'pending', 'مراجعة أولى', NOW());

-- Confirmed Appointments (Today & Past for Stats)
INSERT INTO appointments (clinic_id, patient_name, appointment_date, appointment_time, type, status, notes, created_at)
VALUES
-- Today Clinic 1
(1, 'أحمد محمد', CURRENT_DATE, '09:00', 'حشوة', 'confirmed', 'تحضير للتاج', NOW()),
(1, 'سارة علي', CURRENT_DATE, '10:00', 'تنظيف', 'completed', 'تم الدفع', NOW()),
-- Today Clinic 2
(2, 'علي حسين', CURRENT_DATE, '11:00', 'قلع', 'confirmed', 'ضرس العقل', NOW()),
-- Upcoming
(1, 'حسين كاظم', CURRENT_DATE + 5, '15:00', 'علاج عصب', 'scheduled', 'جلسة أولى', NOW());

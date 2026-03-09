-- SEED DATA for Smart Dental Platform
-- Purpose: Populate fresh database with verified test accounts.

-- 1. Create Users (in auth.users) - Note: This usually requires Supabase Admin API or direct SQL if allowed. 
-- We will assume the Profiles are created by triggers OR we adhere to creating profiles manually here if triggers aren't set.
-- Ideally, we insert into public.profiles directly if we can't seed auth.users via SQL easily in local dev without extensive ID generation.
-- For this script, we will mock the IDs to be static UUIDs for easy testing.

-- STATIC UUIDs
-- Admin: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- Doctor: dddddddd-dddd-dddd-dddd-dddddddddddd
-- Supplier: ssssssss-ssss-ssss-ssss-ssssssssssss
-- Lab: llllllll-llll-llll-llll-llllllllllll
-- Patient: pppppppp-pppp-pppp-pppp-pppppppppppp

-- 1. PROFILES
INSERT INTO public.profiles (id, email, full_name, role, phone, created_at) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@smartdental.com', 'مدير النظام', 'admin', '07700000000', NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'doctor@smartdental.com', 'د. أحمد علي', 'doctor', '07711111111', NOW()),
('ssssssss-ssss-ssss-ssss-ssssssssssss', 'supplier@smartdental.com', 'شركة المورد الحديث', 'supplier', '07722222222', NOW()),
('llllllll-llll-llll-llll-llllllllllll', 'lab@smartdental.com', 'مختبر بابل التقني', 'lab', '07733333333', NOW()),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'patient@smartdental.com', 'علي حسن', 'patient', '07744444444', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. CLINICS (For Doctor)
INSERT INTO public.clinics (id, owner_id, name, address, phone, is_verified, subscription_tier) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'عيادة النور لطب الأسنان', 'بغداد - المنصور', '07711111111', true, 'premium')
ON CONFLICT DO NOTHING;

-- 3. SUPPLIERS (For Supplier)
INSERT INTO public.suppliers (id, profile_id, company_name, license_number, is_verified, commission_rate) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ssssssss-ssss-ssss-ssss-ssssssssssss', 'شركة المورد الحديث', 'LIC-998877', true, 10.00)
ON CONFLICT DO NOTHING;

-- 4. PRODUCTS (For Supplier)
INSERT INTO public.products (supplier_id, name, category, price, stock_quantity, description) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'حشوة ضوئية 3M', 'materials', 45000, 100, 'حشوة ضوئية عالية الجودة من شركة 3M'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'تورباين أسنان', 'equipment', 150000, 20, 'تورباين سرعة عالية مع ضوء LED')
ON CONFLICT DO NOTHING;

-- 5. LABS (For Lab)
INSERT INTO public.labs (id, profile_id, lab_name, is_verified, services) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'llllllll-llll-llll-llll-llllllllllll', 'مختبر بابل التقني', true, '[{"name": "Zirconia Crown", "price": 80000}, {"name": "PFM", "price": 40000}]'::jsonb)
ON CONFLICT DO NOTHING;

-- 6. LAB ORDERS (From Doctor to Lab)
INSERT INTO public.lab_orders (clinic_id, lab_id, patient_name, work_type, status, price, created_at) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'سارة أحمد', 'Zirconia Crown', 'received', 80000, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 7. SUPPORT TICKETS
INSERT INTO public.support_tickets (ticket_number, title, description, user_type, status, priority) VALUES
('TKT-1001', 'مشكلة في الدفع', 'واجهت مشكلة عند محاولة دفع الاشتراك', 'doctor', 'open', 'high')
ON CONFLICT DO NOTHING;

-- 8. JOBS
INSERT INTO public.jobs (poster_id, title, description, location, job_type, status) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'مساعد طبيب أسنان', 'مطلوب مساعد طبيب أسنان خريج حصراً', 'بغداد', 'full-time', 'open')
ON CONFLICT DO NOTHING;

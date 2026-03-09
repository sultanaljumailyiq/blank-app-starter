-- ==============================================================================
-- SMART DENTAL PLATFORM - FULL DATABASE SCHEMA (CONSOLIDATED)
-- ==============================================================================

-- 0. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

SET search_path TO public;

-- 0. CLEANUP (RESET)
DROP TABLE IF EXISTS supplier_order_items CASCADE;
DROP TABLE IF EXISTS supplier_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS lab_services CASCADE;
DROP TABLE IF EXISTS dental_lab_orders CASCADE;
DROP TABLE IF EXISTS dental_laboratories CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS lab_works CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES (Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'patient', 'supplier')),
  avatar_url TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Function to check admin role without recursion (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Allow public read access to profiles" ON profiles FOR SELECT TO public USING (true);
CREATE POLICY "Allow users to update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow admins full access to profiles" ON profiles FOR ALL TO authenticated USING (is_admin());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CLINICS
CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  services JSONB DEFAULT '[]',
  working_hours JSONB DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);
CREATE INDEX IF NOT EXISTS idx_clinics_owner ON clinics(owner_id);
CREATE INDEX IF NOT EXISTS idx_clinics_active ON clinics(is_active);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Clinic Policies
CREATE POLICY "Allow public read access to active clinics" ON clinics FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Allow owners and admins to update clinics" ON clinics FOR UPDATE TO authenticated 
USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to insert clinics" ON clinics FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor')));

CREATE POLICY "Allow admins to delete clinics" ON clinics FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE, -- Link to clinic
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,     -- Link to user account (optional)
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  age INTEGER,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  emergency_contact TEXT,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medical_history TEXT,
  last_visit_date DATE,
  total_visits INTEGER DEFAULT 0,
  assigned_doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_doctor_name TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Patient Policies (Fixed owner_id reference)
CREATE POLICY "Clinic owners can view their patients" ON patients FOR SELECT 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Clinic owners can create patients" ON patients FOR INSERT 
WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Clinic owners can update patients" ON patients FOR UPDATE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Clinic owners can delete patients" ON patients FOR DELETE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

-- Allow patients to see their own data
CREATE POLICY "Allow users to read own patient data" ON patients FOR SELECT 
USING (user_id = auth.uid());

-- 4. APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE SET NULL,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL, -- Denormalized for display/pending requests
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  doctor_name TEXT NOT NULL,  -- Denormalized
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  treatment_type TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'pending', 'confirmed')),
  notes TEXT,
  cost DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date DESC);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Appointment Policies (Fixed owner_id reference)
CREATE POLICY "Clinic owners can view appointments" ON appointments FOR SELECT 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Clinic owners can create appointments" ON appointments FOR INSERT 
WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Clinic owners can update appointments" ON appointments FOR UPDATE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Clinic owners can delete appointments" ON appointments FOR DELETE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

-- Allow patients to read own appointments
CREATE POLICY "Allow patients to read own appointments" ON appointments FOR SELECT 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Allow public (pending requests)
CREATE POLICY "Allow public to create pending appointments" ON appointments FOR INSERT 
TO anon, authenticated WITH CHECK (status = 'pending');

-- 5. STAFF
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  department TEXT,
  salary DECIMAL(10, 2) NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  join_date DATE NOT NULL,
  contract_type TEXT DEFAULT 'full_time' CHECK (contract_type IN ('full_time', 'part_time', 'contract')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_clinic ON staff(clinic_id);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Staff Policies (Fixed owner_id reference)
CREATE POLICY "Staff viewable by clinic owners" ON staff FOR SELECT 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Staff insertable by clinic owners" ON staff FOR INSERT 
WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Staff updatable by clinic owners" ON staff FOR UPDATE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Staff deletable by clinic owners" ON staff FOR DELETE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

-- 6. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  min_stock INTEGER DEFAULT 10,
  unit TEXT DEFAULT 'pcs',
  supplier_name TEXT,
  supplier_phone TEXT,
  brand TEXT,
  location TEXT,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  status TEXT DEFAULT 'available',
  expiry_date DATE,
  last_restock_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_clinic ON inventory(clinic_id);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Inventory Policies (Fixed owner_id reference)
CREATE POLICY "Inventory viewable by clinic owners" ON inventory FOR SELECT 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Inventory insertable by clinic owners" ON inventory FOR INSERT 
WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Inventory updatable by clinic owners" ON inventory FOR UPDATE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Inventory deletable by clinic owners" ON inventory FOR DELETE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

-- 7. FINANCIAL TRANSACTIONS
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method TEXT DEFAULT 'cash',
  patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_clinic ON financial_transactions(clinic_id);

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Transaction Policies (Fixed owner_id reference)
CREATE POLICY "Transactions are viewable by clinic owners" ON financial_transactions FOR SELECT 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Transactions are insertable by clinic owners" ON financial_transactions FOR INSERT 
WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Transactions are updatable by clinic owners" ON financial_transactions FOR UPDATE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Transactions are deletable by clinic owners" ON financial_transactions FOR DELETE 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

-- ==============================================================================
-- 8. LAB & MARKETPLACE (Simplified)
-- ==============================================================================

-- Dental Laboratories (Profiles for Labs)
CREATE TABLE IF NOT EXISTS dental_laboratories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dental_laboratories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lab" ON dental_laboratories FOR SELECT USING (is_active = true);

-- Lab Orders
CREATE TABLE IF NOT EXISTS dental_lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    laboratory_id UUID REFERENCES dental_laboratories(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    service_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dental_lab_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics manage orders" ON dental_lab_orders FOR ALL 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

-- ==============================================================================
-- 9. SEED DATA (Fixed Columns)
-- ==============================================================================

-- Ensure Demo Clinics Exist
INSERT INTO clinics (id, name, address, city, phone, is_active)
VALUES 
    (1, 'عيادة النور التخصصية', 'شارع فلسطين', 'بغداد', '07701234567', true),
    (2, 'مركز الابتسامة الرقمي', 'حي الكرادة', 'بغداد', '07901234567', true)
ON CONFLICT (id) DO UPDATE SET is_active = true;

-- Seed Patients (Using Correct Columns: full_name, last_visit_date, gender, status)
INSERT INTO patients (clinic_id, full_name, age, gender, phone, email, address, status, last_visit_date, total_visits, medical_history, notes, created_at)
VALUES 
    (1, 'سارة أحمد محمود', 28, 'female', '07701234567', 'sara.ahmed@example.com', 'بغداد - المنصور', 'active', CURRENT_DATE - INTERVAL '2 days', 3, 'Allergy', 'Regular', NOW()),
    (1, 'محمد علي حسن', 45, 'male', '07901112222', 'mohammed.ali@example.com', 'بغداد - الكرادة', 'active', CURRENT_DATE - INTERVAL '10 days', 5, 'Diabetes', 'Followup', NOW()),
    (2, 'Zainab Basil', 22, 'female', '07505556666', 'zainab.b@example.com', 'أربيل', 'active', CURRENT_DATE, 1, 'Asthma', 'First visit', NOW());

-- Seed Inventory (Using Correct Columns: status, condition)
INSERT INTO inventory (clinic_id, item_name, category, quantity, unit_price, min_stock, unit, supplier_name, status, expiry_date)
VALUES 
    (1, 'Lignospan', 'Medical', 5, 25000, 10, 'box', 'Noor Supply', 'low_stock', '2026-05-01'),
    (1, 'Composite Kit', 'Restorative', 2, 120000, 3, 'set', 'Dijlah', 'low_stock', '2025-12-30');

-- Seed Appointments (Using Correct Columns: appointment_date, appointment_time, treatment_type, doctor_name)
INSERT INTO appointments (clinic_id, patient_id, doctor_id, appointment_date, appointment_time, status, treatment_type, notes, patient_name, doctor_name, created_at)
VALUES
    (1, NULL, NULL, CURRENT_DATE + INTERVAL '1 day', '10:00', 'pending', 'consultation', 'Pain in upper tooth', 'Ahmed Yasin', 'Online Request', NOW()),
    (1, NULL, NULL, CURRENT_DATE + INTERVAL '2 days', '16:30', 'pending', 'checkup', 'Whitening', 'Maryam Faris', 'Online Request', NOW());

-- Seed Transactions
INSERT INTO financial_transactions (clinic_id, amount, type, category, description, transaction_date, status)
VALUES
    (1, 75000, 'income', 'Treatment', 'Composite Filling', CURRENT_DATE, 'completed'),
    (1, 150000, 'expense', 'Salary', 'Assistant Advance', CURRENT_DATE - INTERVAL '2 days', 'completed');

-- Seed Staff
INSERT INTO staff (clinic_id, full_name, role_title, phone, email, join_date, salary, is_active)
VALUES
    (1, 'Dr. Ali Hussein', 'Dentist', '07701112222', 'ali@example.com', '2024-01-01', 2000000, true);

-- DEMO POLICIES (Allow reading demo data for authenticated users)
CREATE POLICY "Demo Read Patients" ON patients FOR SELECT TO authenticated USING (clinic_id IN (1, 2));
CREATE POLICY "Demo Read Inventory" ON inventory FOR SELECT TO authenticated USING (clinic_id IN (1, 2));
CREATE POLICY "Demo Read Appointments" ON appointments FOR SELECT TO authenticated USING (clinic_id IN (1, 2));
CREATE POLICY "Demo Read Staff" ON staff FOR SELECT TO authenticated USING (clinic_id IN (1, 2));
CREATE POLICY "Demo Read Transactions" ON financial_transactions FOR SELECT TO authenticated USING (clinic_id IN (1, 2));

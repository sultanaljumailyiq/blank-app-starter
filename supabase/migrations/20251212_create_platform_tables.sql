-- Create Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    governorate TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    clinics_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    qr_code_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Creating permissive policies for Admin (assuming authenticated users are admins for now or public for demo)
-- For this demo, we can allow public read, and authenticated write.
CREATE POLICY "Allow public read access to agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow public read access to payment_methods" ON payment_methods FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert to agents" ON agents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update to agents" ON agents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete to agents" ON agents FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert to payment_methods" ON payment_methods FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update to payment_methods" ON payment_methods FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed Initial Data (Matching previous mocks)
INSERT INTO agents (name, governorate, phone, status, clinics_count, join_date) VALUES 
('علي حسين', 'بغداد', '07701234567', 'active', 15, '2025-01-01'),
('محمد كريم', 'البصرة', '07801234567', 'active', 8, '2025-02-15'),
('عمر فاد', 'أربيل', '07501234567', 'active', 12, '2025-03-10');

INSERT INTO payment_methods (name, number, is_active) VALUES 
('ZainCash', '07800000000', true),
('Rafidain (QiCard)', '1234-5678-9012-3456', true);

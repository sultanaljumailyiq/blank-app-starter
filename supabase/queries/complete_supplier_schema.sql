
-- 1. Create Supplier Expenses Table
CREATE TABLE IF NOT EXISTS supplier_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'Rent', 'Salaries', 'Equipment', 'Marketing', 'Other'
    amount DECIMAL(12, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for expenses
ALTER TABLE supplier_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers manage their own expenses" ON supplier_expenses
    USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()))
    WITH CHECK (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));


-- 2. Update Suppliers Table for Profile/Verification
-- Add missing columns if they don't exist
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'; -- pending, verified, rejected
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS business_license TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tax_number TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS established_year INTEGER;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"showPhone": true, "showEmail": true, "showAddress": true}'::jsonb;

-- 3. Fix Messages FKs (if needed, to allow joining with profiles)
-- Supabase PostgREST might need explicit FK to profiles for easy embedding
-- However, since auth.users id == profiles.id, we can usually join manually or add a FK.
-- Adding explicit FK to profiles is safer for client joins.

-- Try to add FK to profiles if not exists (might fail if profiles table missing, but checks above passed)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE messages
        DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
        ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id),
        DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey,
        ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES profiles(id);
    END IF;
END $$;

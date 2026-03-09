-- Comprehensive Lab System Integration Migration
-- 2026-01-24

-- Reset tables to ensure correct schema types
DROP TABLE IF EXISTS clinic_custom_labs CASCADE;
DROP TABLE IF EXISTS clinic_lab_favorites CASCADE;
DROP TABLE IF EXISTS clinic_members CASCADE;

-- 0. Recreate clinic_members (Fixing UUID vs INT mismatch)
CREATE TABLE IF NOT EXISTS clinic_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, user_id)
);

ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own membership"
    ON clinic_members FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 0.5 Create dental_lab_representatives if missing
CREATE TABLE IF NOT EXISTS dental_lab_representatives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lab_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dental_lab_representatives ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dental_lab_representatives') THEN
        CREATE POLICY "Labs manage delegates" ON dental_lab_representatives FOR ALL USING (true); -- Simplify for now
    END IF;
END $$;

-- 1. Create clinic_custom_labs (Manual Labs)
CREATE TABLE IF NOT EXISTS clinic_custom_labs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE, -- Changed to INTEGER
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    specialties TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clinic_custom_labs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clinic_custom_labs' 
        AND policyname = 'Clinics can manage their custom labs'
    ) THEN
        CREATE POLICY "Clinics can manage their custom labs"
            ON clinic_custom_labs
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM clinics c
                    WHERE c.id = clinic_custom_labs.clinic_id
                    AND (c.owner_id = auth.uid() OR 
                         EXISTS (SELECT 1 FROM clinic_members cm WHERE cm.clinic_id = c.id AND cm.user_id = auth.uid())
                    )
                )
            );
    END IF;
END
$$;

-- 2. Create clinic_lab_favorites (Unified Favorites)
-- Handles both Platform (dental_laboratories) and Custom (clinic_custom_labs)
CREATE TABLE IF NOT EXISTS clinic_lab_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE, -- Changed to INTEGER
    
    -- Reference either a Platform Lab OR a Custom Lab
    lab_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE, 
    custom_lab_id UUID REFERENCES clinic_custom_labs(id) ON DELETE CASCADE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure at least one is set, but preferably via application logic we manage distincts
    CONSTRAINT one_lab_reference CHECK (
        (lab_id IS NOT NULL AND custom_lab_id IS NULL) OR 
        (lab_id IS NULL AND custom_lab_id IS NOT NULL)
    ),
    UNIQUE(clinic_id, lab_id),
    UNIQUE(clinic_id, custom_lab_id)
);

ALTER TABLE clinic_lab_favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clinic_lab_favorites' 
        AND policyname = 'Clinics can manage favorites'
    ) THEN
        CREATE POLICY "Clinics can manage favorites"
            ON clinic_lab_favorites
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM clinics c
                    WHERE c.id = clinic_lab_favorites.clinic_id
                    AND (c.owner_id = auth.uid() OR 
                         EXISTS (SELECT 1 FROM clinic_members cm WHERE cm.clinic_id = c.id AND cm.user_id = auth.uid())
                    )
                )
            );
    END IF;
END
$$;

-- 3. Ensure Dental Lab Orders has all columns
ALTER TABLE dental_lab_orders
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'ready_for_pickup', 'collected', 'delivered', 'completed', 'returned', 'cancelled')),
ADD COLUMN IF NOT EXISTS return_reason TEXT,
ADD COLUMN IF NOT EXISTS is_return_cycle BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS service_name TEXT, -- Snapshot of service name
ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS laboratory_id UUID REFERENCES dental_laboratories(id), -- For Platform Labs
ADD COLUMN IF NOT EXISTS custom_lab_name TEXT, -- For Manual Labs (snapshot)
ADD COLUMN IF NOT EXISTS custom_lab_id UUID REFERENCES clinic_custom_labs(id), -- For Manual Labs (FK)
ADD COLUMN IF NOT EXISTS delegate_id UUID REFERENCES dental_lab_representatives(id),
ADD COLUMN IF NOT EXISTS delegate_name TEXT;

-- 4. Enable RLS for dental_laboratories (Access for Doctors)
ALTER TABLE dental_laboratories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dental_laboratories' 
        AND policyname = 'Authenticated users can read labs'
    ) THEN
        CREATE POLICY "Authenticated users can read labs"
            ON dental_laboratories
            FOR SELECT
            TO authenticated
            USING (true); -- Allow reading all labs for listing
    END IF;
END
$$;

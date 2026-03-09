-- Fix Lab Access and Favorites
-- 1. Create clinic_lab_favorites table (missing in previous migrations but used in code)
CREATE TABLE IF NOT EXISTS clinic_lab_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, lab_id)
);

-- 2. Enable RLS on clinic_lab_favorites
ALTER TABLE clinic_lab_favorites ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for clinic_lab_favorites
CREATE POLICY "Clinics can manage their favorite labs"
    ON clinic_lab_favorites
    FOR ALL
    USING (
         -- Verify the user is a member/owner of the clinic
         EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = clinic_lab_favorites.clinic_id
            AND (c.owner_id = auth.uid() OR 
                 EXISTS (SELECT 1 FROM clinic_members cm WHERE cm.clinic_id = c.id AND cm.user_id = auth.uid())
            )
         )
    );

-- 4. RLS Policy for reading dental_laboratories (Platform Labs)
-- Ensure authenticated users (doctors) can see active labs
ALTER TABLE dental_laboratories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active labs"
    ON dental_laboratories
    FOR SELECT
    TO authenticated
    USING (account_status = 'active');

-- 5. Policy for reading clinic_custom_labs (ensure it exists)
-- (clinic_custom_labs already created in 20251217_create_lab_orders_base.sql)
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

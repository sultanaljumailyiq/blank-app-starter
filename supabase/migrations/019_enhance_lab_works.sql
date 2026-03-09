-- Enhance lab_works for External Labs and Multi-Clinic Support

ALTER TABLE lab_works
ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS lab_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS expected_completion_date DATE;

-- RLS Updates
DROP POLICY IF EXISTS "Allow admins and doctors to manage lab works" ON lab_works;

-- Clinic Owners/Doctors can Manage works they created OR belonging to their clinic
CREATE POLICY "Clinic Staff can manage their lab works"
ON lab_works FOR ALL
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid()) -- Owner
  OR
  requested_by = auth.uid() -- The doctor who requested it
);

-- Labs can VIEW and UPDATE works assigned to them
CREATE POLICY "Labs can view assigned works"
ON lab_works FOR SELECT
USING (
  lab_id = auth.uid()
);

CREATE POLICY "Labs can update assigned works"
ON lab_works FOR UPDATE
USING (
  lab_id = auth.uid()
);


-- 1. Ensure Patient History Columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_history jsonb DEFAULT '[]'::jsonb;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS dental_history jsonb DEFAULT '[]'::jsonb;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_history_data jsonb DEFAULT '{}'::jsonb;

-- 2. Create Treatment Tables (Fixed patient_id type to bigint)

-- Patient Teeth
CREATE TABLE IF NOT EXISTS patient_teeth (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id bigint REFERENCES patients(id) ON DELETE CASCADE, -- Changed from uuid
    tooth_number integer NOT NULL,
    condition text DEFAULT 'healthy',
    notes text,
    history jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(patient_id, tooth_number)
);

-- Treatment Plans
CREATE TABLE IF NOT EXISTS tooth_treatment_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id bigint REFERENCES patients(id) ON DELETE CASCADE, -- Changed from uuid
    tooth_number integer DEFAULT 0,
    treatment_type text NOT NULL,
    status text DEFAULT 'planned',
    overall_status text DEFAULT 'planning', 
    session_count integer DEFAULT 1,
    completed_sessions integer DEFAULT 0,
    estimated_cost numeric DEFAULT 0,
    diagnosis text,
    treatment_description text,
    start_date date,
    end_date date,
    assigned_doctor text,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Treatment Sessions
CREATE TABLE IF NOT EXISTS treatment_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid REFERENCES tooth_treatment_plans(id) ON DELETE CASCADE, -- Matches plan.id (uuid)
    session_number integer NOT NULL,
    session_date date,
    start_time time,
    duration_minutes integer DEFAULT 30,
    procedure_name text,
    phase_name text,
    session_status text DEFAULT 'pending',
    notes text,
    amount_charged numeric DEFAULT 0,
    is_paid boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE patient_teeth ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON patient_teeth;
CREATE POLICY "Enable all access for authenticated users" ON patient_teeth FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON tooth_treatment_plans;
CREATE POLICY "Enable all access for authenticated users" ON tooth_treatment_plans FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON treatment_sessions;
CREATE POLICY "Enable all access for authenticated users" ON treatment_sessions FOR ALL USING (auth.role() = 'authenticated');

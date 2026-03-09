-- Create dental_lab_orders table if not exists
CREATE TABLE IF NOT EXISTS dental_lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    laboratory_id UUID REFERENCES dental_laboratories(id) ON DELETE SET NULL, -- Nullable for custom labs
    custom_lab_name TEXT, -- For manual/custom labs
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    doctor_id UUID REFERENCES profiles(id),
    
    order_number TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_details JSONB, -- For shade, teeth numbers, etc.
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'received', 'in_progress', 'completed', 'delivered', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    notes TEXT,
    price DECIMAL(10,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dental_lab_orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Clinics can manage their own orders"
    ON dental_lab_orders FOR ALL
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (
                SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Labs can view assigned orders"
    ON dental_lab_orders FOR ALL
    USING (
        laboratory_id IN (
            SELECT id FROM dental_laboratories WHERE user_id = auth.uid()
        )
    );

-- Create table for Custom/Manual Labs (Saved by Doctor)
CREATE TABLE IF NOT EXISTS clinic_custom_labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    contact_person TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clinic_custom_labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics can manage their custom labs"
    ON clinic_custom_labs FOR ALL
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (
                SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
            )
        )
    );

-- Create Patient Files Table (Archive)
CREATE TABLE IF NOT EXISTS patient_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('xray', 'report', 'prescription', 'lab', 'other')) NOT NULL,
    url TEXT NOT NULL,
    size TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Smart Assistant Chats Table
CREATE TABLE IF NOT EXISTS smart_assistant_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT,
    summary TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_assistant_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Patient Files
CREATE POLICY "Enable all access for authenticated users" ON patient_files
    FOR ALL USING (auth.role() = 'authenticated');

-- Smart Assistant Chats
CREATE POLICY "Enable all access for authenticated users" ON smart_assistant_chats
    FOR ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_patient_files_patient ON patient_files(patient_id);
CREATE INDEX idx_smart_chats_patient ON smart_assistant_chats(patient_id);

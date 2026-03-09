-- Create AI Analyses Table
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL, -- Optional, can analyze anonymous images
    image_url TEXT NOT NULL,
    status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
    result_json JSONB, -- Stores the analysis findings (bounding boxes, labels, confidence)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_analyses_doctor ON ai_analyses(doctor_id);
CREATE INDEX idx_ai_analyses_created_at ON ai_analyses(created_at);

-- RLS
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own analyses"
    ON ai_analyses FOR SELECT
    TO authenticated
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create analyses"
    ON ai_analyses FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own analyses"
    ON ai_analyses FOR UPDATE
    TO authenticated
    USING (auth.uid() = doctor_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_analyses_modtime
    BEFORE UPDATE ON ai_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

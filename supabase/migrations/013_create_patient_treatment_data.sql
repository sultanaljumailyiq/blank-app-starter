-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teeth Conditions Table
CREATE TABLE IF NOT EXISTS patient_teeth_conditions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL,
    condition TEXT NOT NULL, 
    notes TEXT,
    existing_treatments TEXT[], 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(patient_id, tooth_number)
);

-- Treatment Plans Table
-- Using TEXT for IDs to allow client-generated IDs or existing formats
CREATE TABLE IF NOT EXISTS patient_treatment_plans (
    id TEXT PRIMARY KEY, 
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    total_sessions INTEGER DEFAULT 1,
    completed_sessions INTEGER DEFAULT 0,
    cost DECIMAL(10, 2) DEFAULT 0,
    paid DECIMAL(10, 2) DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    treatment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Treatment Sessions Table
CREATE TABLE IF NOT EXISTS patient_treatment_sessions (
    id TEXT PRIMARY KEY,
    plan_id TEXT REFERENCES patient_treatment_plans(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    title TEXT,
    status TEXT DEFAULT 'pending',
    schema_id TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    paid DECIMAL(10, 2) DEFAULT 0,
    duration INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE patient_teeth_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_treatment_sessions ENABLE ROW LEVEL SECURITY;

-- Simplified policies for now - can be restricted to doctor/admin later
CREATE POLICY "Users can view/manage teeth conditions" ON patient_teeth_conditions FOR ALL USING (true);
CREATE POLICY "Users can view/manage treatment plans" ON patient_treatment_plans FOR ALL USING (true);
CREATE POLICY "Users can view/manage treatment sessions" ON patient_treatment_sessions FOR ALL USING (true);

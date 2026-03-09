-- Create enrollments table for Course and Webinar registrations
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL, -- Course or Webinar ID
    item_type TEXT NOT NULL CHECK (item_type IN ('course', 'webinar')),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'completed', 'dropped')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate enrollments for the same item by the same user
    UNIQUE(user_id, item_id)
);

-- Indexes for performance
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_item ON enrollments(item_id);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own enrollments"
    ON enrollments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves"
    ON enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" -- e.g., to mark as completed or drop
    ON enrollments FOR UPDATE
    USING (auth.uid() = user_id);

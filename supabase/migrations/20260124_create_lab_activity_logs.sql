-- Create lab_activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS lab_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lab_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE,
    order_id UUID REFERENCES dental_lab_orders(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- e.g., 'order_created', 'status_changed', 'payment_received'
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_lab_activity_logs_lab_id ON lab_activity_logs(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_activity_logs_created_at ON lab_activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE lab_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Labs can view their own logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lab_activity_logs' 
        AND policyname = 'Labs can view their own logs'
    ) THEN
        CREATE POLICY "Labs can view their own logs"
            ON lab_activity_logs
            FOR SELECT
            USING (
                lab_id IN (
                    SELECT id FROM dental_laboratories WHERE user_id = auth.uid()
                )
            );
    END IF;
END
$$;

-- RLS Policy: Labs can insert logs (via functions or backend, but enabling for now)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lab_activity_logs' 
        AND policyname = 'Labs can create logs'
    ) THEN
        CREATE POLICY "Labs can create logs"
            ON lab_activity_logs
            FOR INSERT
            WITH CHECK (
                lab_id IN (
                    SELECT id FROM dental_laboratories WHERE user_id = auth.uid()
                )
            );
    END IF;
END
$$;

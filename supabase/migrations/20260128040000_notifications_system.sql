-- Create Campaigns Table
CREATE TABLE IF NOT EXISTS notification_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('promotional', 'system', 'announcement', 'reminder')) DEFAULT 'system',
    target_audience TEXT NOT NULL, -- 'all', 'doctor', 'supplier', 'laboratory'
    content TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'normal',
    channels JSONB DEFAULT '["app"]'::jsonb,
    sent_count INTEGER DEFAULT 0,
    open_rate FLOAT DEFAULT 0,
    click_rate FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns" ON notification_campaigns
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create function to send campaign notifications to specific user roles
CREATE OR REPLACE FUNCTION send_campaign_notifications(
    p_title TEXT,
    p_message TEXT,
    p_target_role TEXT, -- 'all', 'doctor', 'supplier', 'laboratory'
    p_type TEXT DEFAULT 'system',
    p_link TEXT DEFAULT NULL,
    p_sender_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Run as owner to access all users
AS $$
DECLARE
    v_count INTEGER;
    v_campaign_id UUID;
BEGIN
    -- 1. Create Campaign Record
    INSERT INTO notification_campaigns (title, content, target_audience, type, status, sent_count, created_by)
    VALUES (p_title, p_message, p_target_role, p_type, 'sent', 0, p_sender_id)
    RETURNING id INTO v_campaign_id;

    -- 2. Insert notifications based on role
    IF p_target_role = 'all' THEN
        INSERT INTO notifications (user_id, title, message, type, link, created_at, read)
        SELECT id, p_title, p_message, p_type, p_link, NOW(), false
        FROM auth.users
        WHERE id != COALESCE(p_sender_id, '00000000-0000-0000-0000-000000000000'::uuid); -- Exclude sender
    ELSE
        INSERT INTO notifications (user_id, title, message, type, link, created_at, read)
        SELECT u.id, p_title, p_message, p_type, p_link, NOW(), false
        FROM auth.users u
        JOIN public.profiles p ON u.id = p.id
        WHERE p.role = p_target_role
        AND u.id != COALESCE(p_sender_id, '00000000-0000-0000-0000-000000000000'::uuid);
    END IF;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- 3. Update Campaign with Count
    UPDATE notification_campaigns 
    SET sent_count = v_count 
    WHERE id = v_campaign_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'sent_count', v_count,
        'campaign_id', v_campaign_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

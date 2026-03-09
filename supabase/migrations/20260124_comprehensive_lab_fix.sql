-- ===========================================================
-- COMPREHENSIVE LAB DASHBOARD FIX - ALL MISSING FEATURES
-- ===========================================================

-- =====================
-- 1. FIX REPRESENTATIVES TABLE
-- =====================
-- Add missing columns that frontend expects

ALTER TABLE dental_lab_representatives
ADD COLUMN IF NOT EXISTS laboratory_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS "position" TEXT,
ADD COLUMN IF NOT EXISTS representative_type TEXT DEFAULT 'delivery' CHECK (representative_type IN ('delivery', 'technical', 'administrative')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
ADD COLUMN IF NOT EXISTS current_assignments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_assignments INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS total_deliveries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_deliveries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancelled_deliveries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS working_hours JSONB,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Copy data from old columns if they exist
UPDATE dental_lab_representatives 
SET laboratory_id = lab_id, full_name = name 
WHERE laboratory_id IS NULL AND lab_id IS NOT NULL;

-- =====================
-- 2. ADD REPRESENTATIVE RPC
-- =====================
CREATE OR REPLACE FUNCTION add_representative(
    p_laboratory_id UUID,
    p_user_id UUID,
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL,
    p_position TEXT DEFAULT NULL,
    p_representative_type TEXT DEFAULT 'delivery',
    p_max_assignments INTEGER DEFAULT 5,
    p_working_hours JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_rep_id UUID;
    v_real_lab_id UUID;
BEGIN
    -- Get lab ID from user_id if needed
    SELECT id INTO v_real_lab_id FROM dental_laboratories WHERE user_id = p_laboratory_id;
    IF v_real_lab_id IS NULL THEN
        v_real_lab_id := p_laboratory_id; -- Assume it's already the Lab ID
    END IF;

    INSERT INTO dental_lab_representatives (
        laboratory_id,
        user_id,
        full_name,
        phone,
        email,
        "position",
        representative_type,
        max_assignments,
        working_hours,
        status,
        is_active
    ) VALUES (
        v_real_lab_id,
        p_user_id,
        p_full_name,
        p_phone,
        p_email,
        p_position,
        p_representative_type,
        p_max_assignments,
        p_working_hours,
        'available',
        TRUE
    ) RETURNING id INTO v_rep_id;
    
    RETURN v_rep_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 3. UPDATE REPRESENTATIVE STATUS RPC
-- =====================
CREATE OR REPLACE FUNCTION update_representative_status(
    p_representative_id UUID,
    p_new_status TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE dental_lab_representatives
    SET status = p_new_status
    WHERE id = p_representative_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 4. GET LAB FINANCIAL STATS RPC
-- =====================
DROP FUNCTION IF EXISTS get_lab_financial_stats(uuid);

CREATE OR REPLACE FUNCTION get_lab_financial_stats(p_lab_id UUID)
RETURNS TABLE (
    total_revenue DECIMAL,
    monthly_revenue DECIMAL,
    total_commission DECIMAL,
    net_revenue DECIMAL,
    pending_payments DECIMAL,
    completed_payments DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(final_amount), 0)::DECIMAL as total_revenue,
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN final_amount ELSE 0 END), 0)::DECIMAL as monthly_revenue,
        (COALESCE(SUM(final_amount), 0) * 0.05)::DECIMAL as total_commission,
        (COALESCE(SUM(final_amount), 0) * 0.95)::DECIMAL as net_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN final_amount ELSE 0 END), 0)::DECIMAL as pending_payments,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN final_amount ELSE 0 END), 0)::DECIMAL as completed_payments
    FROM dental_lab_orders
    WHERE laboratory_id = p_lab_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 5. FIX LAB CHAT SYSTEM
-- =====================
-- Create lab_chat_conversations if missing
CREATE TABLE IF NOT EXISTS lab_chat_conversations (
    id BIGSERIAL PRIMARY KEY,
    doctor_id UUID REFERENCES auth.users(id),
    lab_id UUID REFERENCES auth.users(id),
    order_id UUID REFERENCES dental_lab_orders(id),
    last_message_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lab_chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chat participants access" ON lab_chat_conversations;
CREATE POLICY "Chat participants access" ON lab_chat_conversations 
    FOR ALL 
    USING (doctor_id = auth.uid() OR lab_id = auth.uid());

-- Create lab_chat_messages if missing
CREATE TABLE IF NOT EXISTS lab_chat_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES lab_chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lab_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Message participants access" ON lab_chat_messages;
CREATE POLICY "Message participants access" ON lab_chat_messages
    FOR ALL
    USING (
        conversation_id IN (
            SELECT id FROM lab_chat_conversations 
            WHERE doctor_id = auth.uid() OR lab_id = auth.uid()
        )
    );

-- =====================
-- 6. UPDATE LAB PROFILE RPC
-- =====================
CREATE OR REPLACE FUNCTION update_lab_profile(
    p_lab_id UUID,
    p_lab_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_logo_url TEXT DEFAULT NULL,
    p_specialties TEXT[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_real_lab_id UUID;
BEGIN
    -- Get lab row ID from user_id if needed
    SELECT id INTO v_real_lab_id FROM dental_laboratories WHERE user_id = p_lab_id;
    IF v_real_lab_id IS NULL THEN
        v_real_lab_id := p_lab_id;
    END IF;
    
    UPDATE dental_laboratories
    SET 
        lab_name = COALESCE(p_lab_name, lab_name),
        description = COALESCE(p_description, description),
        phone = COALESCE(p_phone, phone),
        email = COALESCE(p_email, email),
        address = COALESCE(p_address, address),
        city = COALESCE(p_city, city),
        logo_url = COALESCE(p_logo_url, logo_url),
        specialties = COALESCE(p_specialties, specialties),
        updated_at = NOW()
    WHERE id = v_real_lab_id OR user_id = p_lab_id;
    
    RETURN v_real_lab_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 7. FIX create_conversation_for_order
-- =====================
DROP FUNCTION IF EXISTS create_conversation_for_order(uuid, uuid);

CREATE OR REPLACE FUNCTION create_conversation_for_order(
    p_order_id UUID,
    p_doctor_id UUID
) RETURNS BIGINT AS $$
DECLARE
    v_lab_id UUID;
    v_lab_user_id UUID;
    v_conv_id BIGINT;
BEGIN
    -- Get Lab Row ID from Order
    SELECT laboratory_id INTO v_lab_id FROM dental_lab_orders WHERE id = p_order_id;
    
    IF v_lab_id IS NULL THEN
        RAISE EXCEPTION 'Cannot start chat for this order: No platform laboratory linked.';
    END IF;

    -- Get Lab Owner User ID
    SELECT user_id INTO v_lab_user_id FROM dental_laboratories WHERE id = v_lab_id;

    -- Check existing conversation
    SELECT id INTO v_conv_id 
    FROM lab_chat_conversations 
    WHERE order_id = p_order_id;

    -- Create if not exists
    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, order_id)
        VALUES (p_doctor_id, v_lab_user_id, p_order_id)
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 8. FIX get_lab_dashboard_stats 
-- =====================
DROP FUNCTION IF EXISTS get_lab_dashboard_stats(uuid);

CREATE OR REPLACE FUNCTION get_lab_dashboard_stats(p_lab_id UUID)
RETURNS TABLE (
    total_orders BIGINT,
    pending_orders BIGINT,
    in_progress_orders BIGINT,
    ready_orders BIGINT,
    completed_orders BIGINT,
    returned_orders BIGINT,
    cancelled_orders BIGINT,
    overdue_orders BIGINT,
    active_representatives BIGINT,
    total_representatives BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_orders,
        COUNT(*) FILTER (WHERE o.status = 'pending')::BIGINT as pending_orders,
        COUNT(*) FILTER (WHERE o.status = 'in_progress')::BIGINT as in_progress_orders,
        COUNT(*) FILTER (WHERE o.status IN ('ready_for_pickup', 'ready_for_delivery'))::BIGINT as ready_orders,
        COUNT(*) FILTER (WHERE o.status = 'completed')::BIGINT as completed_orders,
        COUNT(*) FILTER (WHERE o.status = 'returned')::BIGINT as returned_orders,
        COUNT(*) FILTER (WHERE o.status = 'cancelled')::BIGINT as cancelled_orders,
        COUNT(*) FILTER (WHERE o.expected_delivery_date < CURRENT_DATE AND o.status NOT IN ('completed', 'cancelled', 'returned'))::BIGINT as overdue_orders,
        (SELECT COUNT(*) FROM dental_lab_representatives WHERE laboratory_id = p_lab_id AND status != 'offline' AND is_active = TRUE)::BIGINT as active_representatives,
        (SELECT COUNT(*) FROM dental_lab_representatives WHERE laboratory_id = p_lab_id AND is_active = TRUE)::BIGINT as total_representatives
    FROM dental_lab_orders o
    WHERE o.laboratory_id = p_lab_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

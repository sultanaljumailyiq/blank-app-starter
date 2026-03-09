-- Create lab_activity_logs table
CREATE TABLE IF NOT EXISTS lab_activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lab_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES dental_lab_orders(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- e.g., 'order_created', 'status_changed', 'payment_received'
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_lab_activity_logs_lab_id ON lab_activity_logs(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_activity_logs_created_at ON lab_activity_logs(created_at DESC);

-- RPC: get_lab_dashboard_stats (Ensure it exists or update it if needed, but the file implies it might exist. 
-- However, let's create get_lab_financial_stats as requested)

CREATE OR REPLACE FUNCTION get_lab_financial_stats(p_lab_id UUID)
RETURNS TABLE (
    total_revenue DECIMAL,
    monthly_revenue DECIMAL,
    total_commission DECIMAL,
    net_revenue DECIMAL
) AS $$
DECLARE
    v_total_revenue DECIMAL := 0;
    v_monthly_revenue DECIMAL := 0;
    v_total_commission DECIMAL := 0;
    v_net_revenue DECIMAL := 0;
BEGIN
    -- Calculate Total Revenue (Total Paid Amount from Orders)
    SELECT COALESCE(SUM(paid_amount), 0)
    INTO v_total_revenue
    FROM dental_lab_orders
    WHERE laboratory_id = p_lab_id AND paid_amount > 0;

    -- Calculate Monthly Revenue (Current Month)
    SELECT COALESCE(SUM(paid_amount), 0)
    INTO v_monthly_revenue
    FROM dental_lab_orders
    WHERE laboratory_id = p_lab_id 
      AND paid_amount > 0
      AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE);

    -- Calculate Platform Commission (Assuming 10% for now or from lab settings if available)
    -- Using the 'dental_laboratories' commission_percentage if available, else 10%
    SELECT COALESCE(SUM(paid_amount * (COALESCE(dl.commission_percentage, 10) / 100)), 0)
    INTO v_total_commission
    FROM dental_lab_orders dlo
    JOIN dental_laboratories dl ON dlo.laboratory_id = dl.id
    WHERE dlo.laboratory_id = p_lab_id AND dlo.paid_amount > 0;

    v_net_revenue := v_total_revenue - v_total_commission;

    RETURN QUERY SELECT 
        v_total_revenue,
        v_monthly_revenue,
        v_total_commission,
        v_net_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get_lab_dashboard_stats (Re-defining/Ensuring it matches the dashboard's needs)
CREATE OR REPLACE FUNCTION get_lab_dashboard_stats(p_lab_id UUID)
RETURNS TABLE (
    total_orders BIGINT,
    pending_orders BIGINT,
    in_progress_orders BIGINT,
    completed_orders BIGINT,
    returned_orders BIGINT,
    cancelled_orders BIGINT,
    active_representatives BIGINT,
    total_representatives BIGINT,
    overdue_orders BIGINT,
    ready_orders BIGINT
) AS $$
BEGIN
    RETURN QUERY SELECT
        COUNT(*)::BIGINT as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_orders,
        COUNT(*) FILTER (WHERE status IN ('in_progress', 'confirmed', 'in_lab'))::BIGINT as in_progress_orders,
        COUNT(*) FILTER (WHERE status IN ('completed', 'delivered'))::BIGINT as completed_orders,
        COUNT(*) FILTER (WHERE status = 'returned')::BIGINT as returned_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_orders,
        -- Representatives (Placeholder count for now as we don't have a reps table linked yet, or assuming 'users' with role 'representative')
        0::BIGINT as active_representatives, 
        0::BIGINT as total_representatives,
        COUNT(*) FILTER (WHERE expected_delivery_date < CURRENT_DATE AND status NOT IN ('completed', 'delivered', 'cancelled', 'returned'))::BIGINT as overdue_orders,
        COUNT(*) FILTER (WHERE status = 'ready_for_pickup' OR status = 'ready_for_delivery')::BIGINT as ready_orders
    FROM dental_lab_orders
    WHERE laboratory_id = p_lab_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Helper: get_orders_by_status (Used in EnhancedOrderManagement)
CREATE OR REPLACE FUNCTION get_orders_by_status(p_lab_id UUID, p_status TEXT DEFAULT NULL)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR,
    patient_name VARCHAR,
    doctor_name VARCHAR,
    service_name VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    order_date TIMESTAMP WITH TIME ZONE,
    estimated_completion_date DATE,
    assigned_representative_name VARCHAR,
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_number,
        o.patient_name,
        d.full_name as doctor_name,
        o.service_name,
        o.status,
        o.priority,
        o.created_at as order_date,
        o.expected_delivery_date as estimated_completion_date,
        -- Representative name (mock for now or join if we had the column)
        NULL::VARCHAR as assigned_representative_name,
        o.price as total_amount
    FROM dental_lab_orders o
    LEFT JOIN doctors d ON o.doctor_id = d.id
    WHERE o.laboratory_id = p_lab_id
    AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

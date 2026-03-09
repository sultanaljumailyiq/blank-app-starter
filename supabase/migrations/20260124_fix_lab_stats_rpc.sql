-- Re-create get_lab_dashboard_stats Function
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
        COUNT(*) FILTER (WHERE status IN ('in_progress', 'confirmed', 'in_lab', 'working'))::BIGINT as in_progress_orders,
        COUNT(*) FILTER (WHERE status IN ('completed', 'delivered', 'shipped'))::BIGINT as completed_orders,
        COUNT(*) FILTER (WHERE status = 'returned')::BIGINT as returned_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_orders,
        0::BIGINT as active_representatives, 
        0::BIGINT as total_representatives,
        COUNT(*) FILTER (WHERE expected_delivery_date < CURRENT_DATE AND status NOT IN ('completed', 'delivered', 'cancelled', 'returned'))::BIGINT as overdue_orders,
        COUNT(*) FILTER (WHERE status IN ('ready_for_pickup', 'ready_for_delivery'))::BIGINT as ready_orders
    FROM dental_lab_orders
    WHERE laboratory_id = p_lab_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create get_lab_financial_stats Function
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
    -- Calculate Total Revenue
    SELECT COALESCE(SUM(final_amount), 0) -- Changed to final_amount as paid_amount might be 0
    INTO v_total_revenue
    FROM dental_lab_orders
    WHERE laboratory_id = p_lab_id AND status IN ('completed', 'delivered');

    -- Calculate Monthly Revenue
    SELECT COALESCE(SUM(final_amount), 0)
    INTO v_monthly_revenue
    FROM dental_lab_orders
    WHERE laboratory_id = p_lab_id 
      AND status IN ('completed', 'delivered')
      AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE);

    v_total_commission := 0; -- Hardcode 0 for now
    v_net_revenue := v_total_revenue - v_total_commission;

    RETURN QUERY SELECT 
        v_total_revenue,
        v_monthly_revenue,
        v_total_commission,
        v_net_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

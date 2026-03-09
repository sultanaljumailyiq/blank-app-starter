-- =============================================
-- FIX ORDER SYNC, DELETE POLICY, AND LAB PROFILE
-- =============================================

-- 1. FIX DELETE POLICY - Allow clinics to delete their own orders
DROP POLICY IF EXISTS "Clinics can delete their own orders" ON dental_lab_orders;
CREATE POLICY "Clinics can delete their own orders"
    ON dental_lab_orders FOR DELETE
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (
                SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid()
            )
        )
    );

-- 2. Fix lab_services table - Add laboratory_id column if missing
ALTER TABLE lab_services 
ADD COLUMN IF NOT EXISTS laboratory_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE;

-- 3. Create function to get lab profile with representatives and services
CREATE OR REPLACE FUNCTION get_lab_full_profile(p_lab_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_real_lab_id UUID;
BEGIN
    -- Get lab row ID from user_id if needed
    SELECT id INTO v_real_lab_id FROM dental_laboratories WHERE user_id = p_lab_id;
    IF v_real_lab_id IS NULL THEN
        v_real_lab_id := p_lab_id;
    END IF;

    SELECT jsonb_build_object(
        'lab', (SELECT row_to_json(dl.*) FROM dental_laboratories dl WHERE dl.id = v_real_lab_id),
        'representatives', (
            SELECT COALESCE(jsonb_agg(row_to_json(r.*)), '[]'::jsonb)
            FROM dental_lab_representatives r 
            WHERE r.laboratory_id = v_real_lab_id AND r.is_active = TRUE
        ),
        'services', (
            SELECT COALESCE(jsonb_agg(row_to_json(s.*)), '[]'::jsonb)
            FROM lab_services s 
            WHERE s.laboratory_id = v_real_lab_id
        ),
        'stats', (
            SELECT row_to_json(stats.*)
            FROM (
                SELECT 
                    COUNT(*) as total_orders,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
                    COALESCE(SUM(final_amount), 0) as total_revenue
                FROM dental_lab_orders 
                WHERE laboratory_id = v_real_lab_id
            ) stats
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

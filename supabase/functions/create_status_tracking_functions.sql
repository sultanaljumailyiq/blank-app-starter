-- دالة تحديث حالة الطلب
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_status_description TEXT DEFAULT NULL,
  p_assigned_representative_id UUID DEFAULT NULL,
  p_estimated_completion_date TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_status_changed_by UUID
)
RETURNS TABLE (
  tracking_id INTEGER,
  status TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tracking_id INTEGER;
  previous_status TEXT;
BEGIN
  -- جلب الحالة الحالية
  SELECT status INTO previous_status
  FROM order_status_tracking
  WHERE order_id = p_order_id
  ORDER BY status_changed_at DESC
  LIMIT 1;
  
  -- إذا لم توجد حالة سابقة، اجعل الحالة السابقة فارغة
  IF previous_status IS NULL THEN
    previous_status := '';
  END IF;
  
  -- إدراج حالة جديدة
  INSERT INTO order_status_tracking (
    order_id, status, status_description, previous_status,
    assigned_representative_id, estimated_completion_date,
    status_changed_by, notes
  ) VALUES (
    p_order_id, p_new_status, p_status_description, previous_status,
    p_assigned_representative_id, p_estimated_completion_date,
    p_status_changed_by, p_notes
  ) RETURNING id INTO tracking_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, order_id, activity_type, description, performed_by
  )
  SELECT 
    dlo.laboratory_id,
    p_order_id,
    'status_update',
    'تحديث حالة الطلب إلى: ' || p_status_description || ' - ' || p_notes,
    p_status_changed_by
  FROM dental_lab_orders dlo
  WHERE dlo.id = p_order_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT tracking_id, p_new_status, NOW();
END;
$$;

-- دالة جلب تاريخ حالة الطلب
CREATE OR REPLACE FUNCTION get_order_status_history(
  p_order_id UUID
)
RETURNS TABLE (
  tracking_id INTEGER,
  status TEXT,
  status_description TEXT,
  previous_status TEXT,
  assigned_representative_name TEXT,
  estimated_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  status_changed_by_name TEXT,
  status_changed_at TIMESTAMPTZ,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ost.id,
    ost.status,
    ost.status_description,
    ost.previous_status,
    dlr.full_name as assigned_representative_name,
    ost.estimated_completion_date,
    ost.actual_completion_date,
    p.full_name as status_changed_by_name,
    ost.status_changed_at,
    ost.notes
  FROM order_status_tracking ost
  LEFT JOIN dental_lab_representatives dlr ON ost.assigned_representative_id = dlr.id
  LEFT JOIN profiles p ON ost.status_changed_by = p.id
  WHERE ost.order_id = p_order_id
  ORDER BY ost.status_changed_at;
END;
$$;

-- دالة جلب الطلبات حسب الحالة
CREATE OR REPLACE FUNCTION get_orders_by_status(
  p_lab_id UUID,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  patient_name TEXT,
  doctor_name TEXT,
  service_name TEXT,
  status TEXT,
  priority TEXT,
  order_date TIMESTAMPTZ,
  estimated_completion_date TIMESTAMPTZ,
  assigned_representative_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dlo.id,
    dlo.order_number,
    dlo.patient_name,
    p.full_name as doctor_name,
    dlo.service_name,
    ost.status,
    dlo.priority,
    dlo.order_date,
    ost.estimated_completion_date,
    dlr.full_name as assigned_representative_name
  FROM dental_lab_orders dlo
  JOIN profiles p ON dlo.doctor_id = p.id
  JOIN (
    SELECT DISTINCT ON (order_id)
      order_id, status, estimated_completion_date
    FROM order_status_tracking
    ORDER BY order_id, status_changed_at DESC
  ) ost ON dlo.id = ost.order_id
  LEFT JOIN dental_lab_representatives dlr ON dlo.representative_id = dlr.id
  WHERE dlo.laboratory_id = p_lab_id
    AND (p_status IS NULL OR ost.status = p_status)
  ORDER BY dlo.order_date DESC;
END;
$$;

-- دالة جلب إحصائيات المختبر
CREATE OR REPLACE FUNCTION get_lab_dashboard_stats(
  p_lab_id UUID
)
RETURNS TABLE (
  total_orders BIGINT,
  pending_orders BIGINT,
  in_progress_orders BIGINT,
  ready_orders BIGINT,
  completed_orders BIGINT,
  returned_orders BIGINT,
  cancelled_orders BIGINT,
  overdue_orders BIGINT,
  active_representatives INTEGER,
  total_representatives INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH status_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status IN ('ready_for_pickup', 'ready_for_delivery') THEN 1 END) as ready,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
      COUNT(CASE WHEN status IN ('in_progress', 'ready_for_pickup', 'ready_for_delivery') 
               AND ost.estimated_completion_date < NOW() THEN 1 END) as overdue
    FROM dental_lab_orders dlo
    JOIN (
      SELECT DISTINCT ON (order_id)
        order_id, status, estimated_completion_date
      FROM order_status_tracking
      ORDER BY order_id, status_changed_at DESC
    ) ost ON dlo.id = ost.order_id
    WHERE dlo.laboratory_id = p_lab_id
    AND dlo.created_at >= DATE_TRUNC('month', NOW())
  ),
  rep_stats AS (
    SELECT 
      COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active,
      COUNT(*) as total
    FROM dental_lab_representatives
    WHERE laboratory_id = p_lab_id
  )
  SELECT 
    ss.total,
    ss.pending,
    ss.in_progress,
    ss.ready,
    ss.completed,
    ss.returned,
    ss.cancelled,
    ss.overdue,
    rs.active,
    rs.total
  FROM status_stats ss, rep_stats rs;
END;
$$;

-- دالة جلب الطلبات المتأخرة
CREATE OR REPLACE FUNCTION get_overdue_orders(
  p_lab_id UUID
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  patient_name TEXT,
  doctor_name TEXT,
  service_name TEXT,
  status TEXT,
  order_date TIMESTAMPTZ,
  estimated_completion_date TIMESTAMPTZ,
  days_overdue INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dlo.id,
    dlo.order_number,
    dlo.patient_name,
    p.full_name as doctor_name,
    dlo.service_name,
    ost.status,
    dlo.order_date,
    ost.estimated_completion_date,
    EXTRACT(days FROM NOW() - ost.estimated_completion_date)::INTEGER as days_overdue
  FROM dental_lab_orders dlo
  JOIN profiles p ON dlo.doctor_id = p.id
  JOIN (
    SELECT DISTINCT ON (order_id)
      order_id, status, estimated_completion_date
    FROM order_status_tracking
    ORDER BY order_id, status_changed_at DESC
  ) ost ON dlo.id = ost.order_id
  WHERE dlo.laboratory_id = p_lab_id
    AND ost.status IN ('in_progress', 'ready_for_pickup', 'ready_for_delivery')
    AND ost.estimated_completion_date < NOW()
  ORDER BY ost.estimated_completion_date;
END;
$$;
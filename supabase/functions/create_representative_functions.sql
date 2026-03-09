-- دالة إضافة مندوب جديد
CREATE OR REPLACE FUNCTION add_representative(
  p_laboratory_id UUID,
  p_user_id TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT NULL,
  p_position TEXT DEFAULT NULL,
  p_representative_type TEXT DEFAULT 'delivery',
  p_max_assignments INTEGER DEFAULT 5,
  p_working_hours JSONB DEFAULT NULL
)
RETURNS TABLE (
  representative_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rep_id UUID;
BEGIN
  -- إدراج المندوب الجديد
  INSERT INTO dental_lab_representatives (
    laboratory_id, user_id, full_name, phone, email, position,
    representative_type, max_assignments, working_hours, is_active, is_verified
  ) VALUES (
    p_laboratory_id, p_user_id, p_full_name, p_phone, p_email, p_position,
    p_representative_type, p_max_assignments, p_working_hours, TRUE, FALSE
  ) RETURNING id INTO rep_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, activity_type, description
  ) VALUES (
    p_laboratory_id,
    'representative_added',
    'تم إضافة مندوب جديد: ' || p_full_name
  );
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT rep_id, NOW();
END;
$$;

-- دالة تحديث حالة المندوب
CREATE OR REPLACE FUNCTION update_representative_status(
  p_representative_id UUID,
  p_new_status TEXT, -- 'available', 'busy', 'offline'
  p_current_latitude DECIMAL DEFAULT NULL,
  p_current_longitude DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  representative_id UUID,
  status TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- تحديث حالة المندوب
  UPDATE dental_lab_representatives
  SET 
    status = p_new_status,
    current_latitude = p_current_latitude,
    current_longitude = p_current_longitude,
    last_location_update = CASE 
      WHEN p_current_latitude IS NOT NULL AND p_current_longitude IS NOT NULL 
      THEN NOW() 
      ELSE last_location_update 
    END,
    updated_at = NOW()
  WHERE id = p_representative_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, activity_type, description, performed_by
  )
  SELECT 
    dlr.laboratory_id,
    'representative_status_update',
    'تحديث حالة المندوب إلى: ' || p_new_status,
    dlr.user_id::UUID
  FROM dental_lab_representatives dlr
  WHERE dlr.id = p_representative_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT p_representative_id, p_new_status, NOW();
END;
$$;

-- دالة تعيين طلب للمندوب
CREATE OR REPLACE FUNCTION assign_order_to_representative(
  p_order_id UUID,
  p_representative_id UUID,
  p_assigned_by UUID
)
RETURNS TABLE (
  order_id UUID,
  representative_id UUID,
  assigned_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- التحقق من عدم تجاوز الحد الأقصى
  IF (
    SELECT current_assignments 
    FROM dental_lab_representatives 
    WHERE id = p_representative_id
  ) >= (
    SELECT max_assignments 
    FROM dental_lab_representatives 
    WHERE id = p_representative_id
  ) THEN
    RAISE EXCEPTION 'تم تجاوز الحد الأقصى للمهام المخصصة لهذا المندوب';
  END IF;
  
  -- تحديث الطلب
  UPDATE dental_lab_orders
  SET representative_id = p_representative_id,
      assigned_at = NOW()
  WHERE id = p_order_id;
  
  -- تحديث عدد المهام الحالية للمندوب
  UPDATE dental_lab_representatives
  SET current_assignments = current_assignments + 1,
      status = 'busy'
  WHERE id = p_representative_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, order_id, activity_type, description, performed_by
  )
  SELECT 
    dlo.laboratory_id,
    p_order_id,
    'order_assigned',
    'تم تعيين الطلب #' || dlo.order_number || ' للمندوب',
    p_assigned_by
  FROM dental_lab_orders dlo
  WHERE dlo.id = p_order_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT p_order_id, p_representative_id, NOW();
END;
$$;

-- دالة استكمال المهمة من المندوب
CREATE OR REPLACE FUNCTION complete_representative_task(
  p_order_id UUID,
  p_representative_id UUID,
  p_task_type TEXT, -- 'pickup', 'delivery'
  p_completed_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  representative_id UUID,
  task_type TEXT,
  completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, order_id, activity_type, description, performed_by
  )
  SELECT 
    dlo.laboratory_id,
    p_order_id,
    'task_completed',
    CASE 
      WHEN p_task_type = 'pickup' THEN 'تم استلام الطلب من العيادة'
      WHEN p_task_type = 'delivery' THEN 'تم توصيل الطلب للعيادة'
    END || ' - ' || COALESCE(p_completed_notes, ''),
    dlr.user_id::UUID
  FROM dental_lab_orders dlo
  JOIN dental_lab_representatives dlr ON p_representative_id = dlr.id
  WHERE dlo.id = p_order_id;
  
  -- تقليل عدد المهام الحالية
  UPDATE dental_lab_representatives
  SET current_assignments = GREATEST(current_assignments - 1, 0),
      status = CASE 
        WHEN current_assignments - 1 = 0 THEN 'available'
        ELSE status
      END
  WHERE id = p_representative_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT p_order_id, p_representative_id, p_task_type, NOW();
END;
$$;

-- دالة جلب المندوبين المتوفرين
CREATE OR REPLACE FUNCTION get_available_representatives(
  p_laboratory_id UUID,
  p_representative_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  representative_id UUID,
  full_name TEXT,
  phone TEXT,
  representative_type TEXT,
  current_assignments INTEGER,
  max_assignments INTEGER,
  status TEXT,
  current_latitude DECIMAL,
  current_longitude DECIMAL,
  rating DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dlr.id,
    dlr.full_name,
    dlr.phone,
    dlr.representative_type,
    dlr.current_assignments,
    dlr.max_assignments,
    dlr.status,
    dlr.current_latitude,
    dlr.current_longitude,
    COALESCE(dlr.rating, 0) as rating
  FROM dental_lab_representatives dlr
  WHERE dlr.laboratory_id = p_laboratory_id
    AND dlr.is_active = TRUE
    AND (p_representative_type IS NULL OR dlr.representative_type = p_representative_type)
    AND dlr.current_assignments < dlr.max_assignments
    AND dlr.status = 'available'
  ORDER BY dlr.rating DESC, dlr.current_assignments;
END;
$$;

-- دالة جلب تفاصيل المندوب
CREATE OR REPLACE FUNCTION get_representative_details(
  p_representative_id UUID
)
RETURNS TABLE (
  representative_id UUID,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  position TEXT,
  representative_type TEXT,
  status TEXT,
  current_assignments INTEGER,
  max_assignments INTEGER,
  total_deliveries INTEGER,
  successful_deliveries INTEGER,
  cancelled_deliveries INTEGER,
  rating DECIMAL,
  vehicle_type TEXT,
  working_hours JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dlr.id,
    dlr.full_name,
    dlr.phone,
    dlr.email,
    dlr.position,
    dlr.representative_type,
    dlr.status,
    dlr.current_assignments,
    dlr.max_assignments,
    COALESCE(dlr.total_deliveries, 0) as total_deliveries,
    COALESCE(dlr.successful_deliveries, 0) as successful_deliveries,
    COALESCE(dlr.cancelled_deliveries, 0) as cancelled_deliveries,
    COALESCE(dlr.rating, 0) as rating,
    dlr.vehicle_type,
    dlr.working_hours
  FROM dental_lab_representatives dlr
  WHERE dlr.id = p_representative_id;
END;
$$;

-- دالة جلب المهام الحالية للمندوب
CREATE OR REPLACE FUNCTION get_representative_current_orders(
  p_representative_id UUID
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  patient_name TEXT,
  clinic_name TEXT,
  service_name TEXT,
  status TEXT,
  order_date TIMESTAMPTZ,
  pickup_address TEXT,
  delivery_address TEXT
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
    dlo.clinic_name,
    dlo.service_name,
    ost.status,
    dlo.order_date,
    dlo.delivery_address as pickup_address,
    dlo.delivery_address
  FROM dental_lab_orders dlo
  JOIN (
    SELECT DISTINCT ON (order_id)
      order_id, status
    FROM order_status_tracking
    ORDER BY order_id, status_changed_at DESC
  ) ost ON dlo.id = ost.order_id
  WHERE dlo.representative_id = p_representative_id
    AND ost.status IN ('ready_for_pickup', 'in_transit', 'ready_for_delivery')
  ORDER BY dlo.order_date;
END;
$$;
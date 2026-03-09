-- دالة إرسال السعر من المختبر للطبيب
CREATE OR REPLACE FUNCTION send_lab_price(
  p_order_id UUID,
  p_service_type TEXT,
  p_teeth_info TEXT,
  p_lab_price DECIMAL,
  p_lab_notes TEXT
)
RETURNS TABLE (
  pricing_id INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pricing_id INTEGER;
BEGIN
  -- إدراج السعر الجديد أو تحديث الموجود
  INSERT INTO order_pricing (
    order_id, service_type, teeth_info, lab_price, lab_notes, status
  ) VALUES (
    p_order_id, p_service_type, p_teeth_info, p_lab_price, p_lab_notes, 'sent'
  ) RETURNING id INTO pricing_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, order_id, activity_type, description
  )
  SELECT 
    dlo.laboratory_id,
    p_order_id,
    'price_sent',
    'تم إرسال السعر: ' || p_lab_price::TEXT || ' للخدمة: ' || p_service_type
  FROM dental_lab_orders dlo
  WHERE dlo.id = p_order_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT pricing_id, 'sent', NOW();
END;
$$;

-- دالة قبول/رفض السعر من قبل الطبيب
CREATE OR REPLACE FUNCTION respond_to_price(
  p_pricing_id INTEGER,
  p_response TEXT -- 'accepted' أو 'rejected'
)
RETURNS TABLE (
  pricing_id INTEGER,
  status TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- تحديث حالة السعر
  UPDATE order_pricing
  SET status = p_response, updated_at = NOW()
  WHERE id = p_pricing_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, order_id, activity_type, description
  )
  SELECT 
    dlo.laboratory_id,
    op.order_id,
    'price_response',
    'تم ' || CASE WHEN p_response = 'accepted' THEN 'قبول' ELSE 'رفض' END || ' السعر للطلب #' || dlo.order_number
  FROM order_pricing op
  JOIN dental_lab_orders dlo ON op.order_id = dlo.id
  WHERE op.id = p_pricing_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT p_pricing_id, p_response, NOW();
END;
$$;

-- دالة جلب أسعار الطلب
CREATE OR REPLACE FUNCTION get_order_pricing(
  p_order_id UUID
)
RETURNS TABLE (
  pricing_id INTEGER,
  service_type TEXT,
  teeth_info TEXT,
  lab_price DECIMAL,
  lab_notes TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    op.id,
    op.service_type,
    op.teeth_info,
    op.lab_price,
    op.lab_notes,
    op.status,
    op.created_at,
    op.updated_at
  FROM order_pricing op
  WHERE op.order_id = p_order_id
  ORDER BY op.created_at DESC;
END;
$$;

-- دالة جلب أسعار الطلبات للطبيب
CREATE OR REPLACE FUNCTION get_doctor_pending_prices(
  p_doctor_id TEXT
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  patient_name TEXT,
  service_type TEXT,
  lab_price DECIMAL,
  lab_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    op.order_id,
    dlo.order_number,
    dlo.patient_name,
    op.service_type,
    op.lab_price,
    p.full_name as lab_name,
    op.created_at
  FROM order_pricing op
  JOIN dental_lab_orders dlo ON op.order_id = dlo.id
  JOIN profiles p ON dlo.laboratory_id = p.id
  WHERE dlo.doctor_id = p_doctor_id 
    AND op.status = 'sent'
  ORDER BY op.created_at DESC;
END;
$$;

-- دالة جلب أسعار الطلبات للمختبر
CREATE OR REPLACE FUNCTION get_lab_pending_prices(
  p_lab_id UUID
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  doctor_name TEXT,
  service_type TEXT,
  lab_price DECIMAL,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    op.order_id,
    dlo.order_number,
    p.full_name as doctor_name,
    op.service_type,
    op.lab_price,
    op.status,
    op.created_at
  FROM order_pricing op
  JOIN dental_lab_orders dlo ON op.order_id = dlo.id
  JOIN profiles p ON dlo.doctor_id = p.id
  WHERE dlo.laboratory_id = p_lab_id
  ORDER BY op.created_at DESC;
END;
$$;
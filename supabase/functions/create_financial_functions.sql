-- دالة إنشاء سجل مالي للطلب
CREATE OR REPLACE FUNCTION create_financial_record(
  p_order_id UUID,
  p_lab_id UUID,
  p_total_amount DECIMAL,
  p_platform_commission_rate DECIMAL DEFAULT 5.00
)
RETURNS TABLE (
  financial_id INTEGER,
  total_amount DECIMAL,
  commission_amount DECIMAL,
  lab_amount DECIMAL,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  financial_id INTEGER;
  commission_amount DECIMAL;
  lab_amount DECIMAL;
  clinic_id UUID;
BEGIN
  -- جلب معرف العيادة
  SELECT clinic_id INTO clinic_id
  FROM (
    SELECT 
      CASE 
        WHEN doctor_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        THEN doctor_id::UUID
        ELSE NULL
      END as clinic_id
    FROM dental_lab_orders 
    WHERE id = p_order_id
  ) sub
  WHERE clinic_id IS NOT NULL
  LIMIT 1;
  
  -- حساب العمولة والمبلغ للعيادة
  commission_amount := p_total_amount * (p_platform_commission_rate / 100);
  lab_amount := p_total_amount - commission_amount;
  
  -- إدراج السجل المالي
  INSERT INTO financial_linking (
    order_id, clinic_id, lab_id, total_amount, platform_commission_rate,
    platform_commission_amount, lab_amount
  ) VALUES (
    p_order_id, clinic_id, p_lab_id, p_total_amount, p_platform_commission_rate,
    commission_amount, lab_amount
  ) RETURNING id INTO financial_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, order_id, activity_type, description
  ) VALUES (
    p_lab_id, p_order_id, 'financial_record_created',
    'تم إنشاء سجل مالي: المبلغ الإجمالي ' || p_total_amount::TEXT || 
    ' - العمولة ' || commission_amount::TEXT || ' - للمختبر ' || lab_amount::TEXT
  );
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT financial_id, p_total_amount, commission_amount, lab_amount, NOW();
END;
$$;

-- دالة تسجيل دفع العيادة
CREATE OR REPLACE FUNCTION record_clinic_payment(
  p_order_id UUID,
  p_payment_amount DECIMAL,
  p_payment_method TEXT,
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS TABLE (
  financial_id INTEGER,
  clinic_paid BOOLEAN,
  payment_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  financial_id INTEGER;
BEGIN
  -- تحديث السجل المالي
  UPDATE financial_linking
  SET 
    clinic_paid = TRUE,
    clinic_payment_date = NOW()
  WHERE order_id = p_order_id;
  
  -- جلب معرف السجل المالي
  SELECT id INTO financial_id
  FROM financial_linking
  WHERE order_id = p_order_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, order_id, activity_type, description
  )
  SELECT 
    lab_id,
    p_order_id,
    'clinic_payment_recorded',
    'تم تسجيل دفع العيادة: ' || p_payment_amount::TEXT || ' via ' || p_payment_method
  FROM financial_linking
  WHERE order_id = p_order_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT financial_id, TRUE, NOW();
END;
$$;

-- دالة تسجيل دفع المختبر
CREATE OR REPLACE FUNCTION record_lab_payment(
  p_order_id UUID,
  p_payment_amount DECIMAL,
  p_payment_method TEXT,
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS TABLE (
  financial_id INTEGER,
  lab_paid BOOLEAN,
  payment_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  financial_id INTEGER;
BEGIN
  -- تحديث السجل المالي
  UPDATE financial_linking
  SET 
    lab_paid = TRUE,
    lab_payment_date = NOW(),
    financial_status = CASE 
      WHEN clinic_paid = TRUE THEN 'completed'
      ELSE 'partial'
    END
  WHERE order_id = p_order_id;
  
  -- جلب معرف السجل المالي
  SELECT id INTO financial_id
  FROM financial_linking
  WHERE order_id = p_order_id;
  
  -- إضافة سجل النشاط
  INSERT INTO lab_activity_logs (
    lab_id, order_id, activity_type, description
  )
  SELECT 
    lab_id,
    p_order_id,
    'lab_payment_recorded',
    'تم تسجيل دفع المختبر: ' || p_payment_amount::TEXT || ' via ' || p_payment_method
  FROM financial_linking
  WHERE order_id = p_order_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT financial_id, TRUE, NOW();
END;
$$;

-- دالة جلب السجل المالي للطلب
CREATE OR REPLACE FUNCTION get_order_financial_record(
  p_order_id UUID
)
RETURNS TABLE (
  financial_id INTEGER,
  total_amount DECIMAL,
  commission_rate DECIMAL,
  commission_amount DECIMAL,
  lab_amount DECIMAL,
  clinic_paid BOOLEAN,
  lab_paid BOOLEAN,
  clinic_payment_date TIMESTAMPTZ,
  lab_payment_date TIMESTAMPTZ,
  financial_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fl.id,
    fl.total_amount,
    fl.platform_commission_rate,
    fl.platform_commission_amount,
    fl.lab_amount,
    fl.clinic_paid,
    fl.lab_paid,
    fl.clinic_payment_date,
    fl.lab_payment_date,
    fl.financial_status,
    fl.created_at
  FROM financial_linking fl
  WHERE fl.order_id = p_order_id;
END;
$$;

-- دالة جلب الإحصائيات المالية للمختبر
CREATE OR REPLACE FUNCTION get_lab_financial_stats(
  p_lab_id UUID
)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  total_commission DECIMAL,
  net_revenue DECIMAL,
  paid_orders BIGINT,
  unpaid_orders BIGINT,
  partially_paid_orders BIGINT,
  monthly_revenue DECIMAL,
  monthly_commission DECIMAL,
  monthly_net_revenue DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH financial_stats AS (
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      SUM(platform_commission_amount) as total_commission,
      SUM(lab_amount) as net_revenue,
      COUNT(CASE WHEN financial_status = 'completed' THEN 1 END) as paid_orders,
      COUNT(CASE WHEN financial_status = 'pending' THEN 1 END) as unpaid_orders,
      COUNT(CASE WHEN financial_status = 'partial' THEN 1 END) as partially_paid_orders,
      SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) 
               THEN total_amount ELSE 0 END) as monthly_revenue,
      SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) 
               THEN platform_commission_amount ELSE 0 END) as monthly_commission,
      SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) 
               THEN lab_amount ELSE 0 END) as monthly_net_revenue
    FROM financial_linking
    WHERE lab_id = p_lab_id
      AND created_at >= DATE_TRUNC('month', NOW())
  )
  SELECT 
    fs.total_orders,
    COALESCE(fs.total_revenue, 0),
    COALESCE(fs.total_commission, 0),
    COALESCE(fs.net_revenue, 0),
    fs.paid_orders,
    fs.unpaid_orders,
    fs.partially_paid_orders,
    COALESCE(fs.monthly_revenue, 0),
    COALESCE(fs.monthly_commission, 0),
    COALESCE(fs.monthly_net_revenue, 0)
  FROM financial_stats fs;
END;
$$;

-- دالة جلب الطلبات المالية المعلقة للمختبر
CREATE OR REPLACE FUNCTION get_lab_pending_payments(
  p_lab_id UUID
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  patient_name TEXT,
  clinic_name TEXT,
  total_amount DECIMAL,
  lab_amount DECIMAL,
  commission_amount DECIMAL,
  clinic_paid BOOLEAN,
  lab_paid BOOLEAN,
  financial_status TEXT,
  order_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fl.order_id,
    dlo.order_number,
    dlo.patient_name,
    dlo.clinic_name,
    fl.total_amount,
    fl.lab_amount,
    fl.platform_commission_amount,
    fl.clinic_paid,
    fl.lab_paid,
    fl.financial_status,
    dlo.order_date
  FROM financial_linking fl
  JOIN dental_lab_orders dlo ON fl.order_id = dlo.id
  WHERE fl.lab_id = p_lab_id
    AND fl.financial_status IN ('pending', 'partial')
  ORDER BY dlo.order_date DESC;
END;
$$;

-- دالة جلب الطلبات المالية المعلقة للعيادة
CREATE OR REPLACE FUNCTION get_clinic_pending_payments(
  p_clinic_id UUID
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  patient_name TEXT,
  lab_name TEXT,
  service_name TEXT,
  total_amount DECIMAL,
  commission_amount DECIMAL,
  lab_amount DECIMAL,
  clinic_paid BOOLEAN,
  lab_paid BOOLEAN,
  financial_status TEXT,
  order_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fl.order_id,
    dlo.order_number,
    dlo.patient_name,
    p.full_name as lab_name,
    dlo.service_name,
    fl.total_amount,
    fl.platform_commission_amount,
    fl.lab_amount,
    fl.clinic_paid,
    fl.lab_paid,
    fl.financial_status,
    dlo.order_date
  FROM financial_linking fl
  JOIN dental_lab_orders dlo ON fl.order_id = dlo.id
  JOIN profiles p ON fl.lab_id = p.id
  WHERE fl.clinic_id = p_clinic_id
    AND fl.financial_status IN ('pending', 'partial')
  ORDER BY dlo.order_date DESC;
END;
$$;
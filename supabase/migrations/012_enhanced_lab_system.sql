-- تحسين نظام إدارة المختبرات
-- 2024-11-16

-- جدول المحادثات بين الأطباء والمعامل
CREATE TABLE IF NOT EXISTS lab_conversations (
  id SERIAL PRIMARY KEY,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lab_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES dental_lab_orders(id) ON DELETE CASCADE,
  last_message_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, lab_id, order_id)
);

-- جدول الرسائل في المحادثات
CREATE TABLE IF NOT EXISTS lab_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES lab_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'price', 'image', 'file')),
  message_content TEXT NOT NULL,
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الأسعار المخصصة للطلبات
CREATE TABLE IF NOT EXISTS order_pricing (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES dental_lab_orders(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  teeth_info TEXT,
  lab_price DECIMAL(10, 2),
  lab_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تحديث جدول المندوبين لدعم عدة مندوبين
ALTER TABLE dental_lab_representatives 
ADD COLUMN IF NOT EXISTS representative_type TEXT DEFAULT 'delivery' CHECK (representative_type IN ('delivery', 'technical', 'administrative')),
ADD COLUMN IF NOT EXISTS max_assignments INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS current_assignments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS work_schedule TEXT, -- JSON string for schedule
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(8, 2);

-- جدول تتبع حالة الطلبات المفصل
CREATE TABLE IF NOT EXISTS order_status_tracking (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES dental_lab_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'in_progress', 'ready_for_pickup', 'collected', 'in_lab', 'ready_for_delivery', 'delivered', 'completed', 'returned', 'cancelled')),
  status_description TEXT,
  previous_status TEXT,
  next_status TEXT,
  assigned_representative_id UUID REFERENCES dental_lab_representatives(id),
  estimated_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  status_changed_by UUID REFERENCES profiles(id),
  status_changed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- جدول الربط المالي للطلبات
CREATE TABLE IF NOT EXISTS financial_linking (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES dental_lab_orders(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lab_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2),
  platform_commission_rate DECIMAL(5, 2) DEFAULT 5.00, -- نسبة مئوية
  platform_commission_amount DECIMAL(10, 2),
  lab_amount DECIMAL(10, 2),
  clinic_paid BOOLEAN DEFAULT FALSE,
  lab_paid BOOLEAN DEFAULT FALSE,
  clinic_payment_date TIMESTAMPTZ,
  lab_payment_date TIMESTAMPTZ,
  financial_status TEXT DEFAULT 'pending' CHECK (financial_status IN ('pending', 'partial', 'completed', 'disputed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المختبرات المحفوظة من قبل الطبيب
CREATE TABLE IF NOT EXISTS doctor_saved_labs (
  id SERIAL PRIMARY KEY,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lab_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, lab_id)
);

-- إضافة جدول سجل النشاطات
CREATE TABLE IF NOT EXISTS lab_activity_logs (
  id SERIAL PRIMARY KEY,
  lab_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES dental_lab_orders(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة حقول إضافية لجدول dental_lab_orders
ALTER TABLE dental_lab_orders 
ADD COLUMN IF NOT EXISTS service_details JSONB, -- تفاصيل الخدمات
ADD COLUMN IF NOT EXISTS patient_notes TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_delivery_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS treatment_complexity TEXT DEFAULT 'simple' CHECK (treatment_complexity IN ('simple', 'medium', 'complex'));

-- إضافة حقول لجدول dental_laboratories
ALTER TABLE dental_laboratories
ADD COLUMN IF NOT EXISTS lab_description TEXT,
ADD COLUMN IF NOT EXISTS lab_logo_url TEXT,
ADD COLUMN IF NOT EXISTS lab_images JSONB, -- مصفوفة من روابط الصور
ADD COLUMN IF NOT EXISTS working_hours JSONB, -- ساعات العمل
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS certification_photos JSONB, -- شهادات المختبر
ADD COLUMN IF NOT EXISTS accepted_insurance JSONB, -- شركات التأمين المقبولة
ADD COLUMN IF NOT EXISTS delivery_zones JSONB, -- مناطق التوصيل
ADD COLUMN IF NOT EXISTS pickup_locations JSONB; -- مواقع الاستلام

-- فهارس للجداول الجديدة
CREATE INDEX IF NOT EXISTS idx_lab_conversations_doctor ON lab_conversations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_lab_conversations_lab ON lab_conversations(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_messages_conversation ON lab_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_lab_messages_created_at ON lab_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_pricing_order ON order_pricing(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_tracking_order ON order_status_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_tracking_status ON order_status_tracking(status);
CREATE INDEX IF NOT EXISTS idx_financial_linking_order ON financial_linking(order_id);
CREATE INDEX IF NOT EXISTS idx_financial_linking_status ON financial_linking(financial_status);
CREATE INDEX IF NOT EXISTS idx_doctor_saved_labs_doctor ON doctor_saved_labs(doctor_id);
CREATE INDEX IF NOT EXISTS idx_lab_activity_logs_lab ON lab_activity_logs(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_activity_logs_order ON lab_activity_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_activity_logs_type ON lab_activity_logs(activity_type);

-- تمكين RLS للجداول الجديدة
ALTER TABLE lab_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_linking ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_saved_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_activity_logs ENABLE ROW LEVEL SECURITY;

-- سياسات RLS

-- المحادثات
CREATE POLICY "Allow lab conversations for doctors and labs"
  ON lab_conversations FOR ALL
  TO authenticated
  USING (
    (doctor_id = auth.uid() OR lab_id = auth.uid())
  );

-- الرسائل
CREATE POLICY "Allow lab messages for conversation participants"
  ON lab_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lab_conversations
      WHERE lab_conversations.id = lab_messages.conversation_id
      AND (lab_conversations.doctor_id = auth.uid() OR lab_conversations.lab_id = auth.uid())
    )
  );

-- الأسعار المخصصة
CREATE POLICY "Allow order pricing for order participants"
  ON order_pricing FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dental_lab_orders
      WHERE dental_lab_orders.id = order_pricing.order_id
      AND (dental_lab_orders.doctor_id = auth.uid()::text OR dental_lab_orders.laboratory_id = auth.uid())
    )
  );

-- تتبع حالة الطلبات
CREATE POLICY "Allow order status tracking for order participants"
  ON order_status_tracking FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dental_lab_orders
      WHERE dental_lab_orders.id = order_status_tracking.order_id
      AND (dental_lab_orders.doctor_id = auth.uid()::text OR dental_lab_orders.laboratory_id = auth.uid())
    )
  );

-- الربط المالي
CREATE POLICY "Allow financial linking for order participants"
  ON financial_linking FOR ALL
  TO authenticated
  USING (
    (clinic_id = auth.uid() OR lab_id = auth.uid())
  );

-- المختبرات المحفوظة
CREATE POLICY "Allow doctors to manage saved labs"
  ON doctor_saved_labs FOR ALL
  TO authenticated
  USING (doctor_id = auth.uid());

-- سجل النشاطات
CREATE POLICY "Allow lab activity logs for lab owners"
  ON lab_activity_logs FOR ALL
  TO authenticated
  USING (lab_id = auth.uid());

-- Trigger function لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة Triggers
CREATE TRIGGER update_lab_conversations_updated_at 
  BEFORE UPDATE ON lab_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_pricing_updated_at 
  BEFORE UPDATE ON order_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_linking_updated_at 
  BEFORE UPDATE ON financial_linking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
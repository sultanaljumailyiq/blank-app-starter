-- إنشاء نظام مخطط الأسنان التفاعلي والخطط العلاجية المتقدمة
-- تاريخ الإنشاء: 2024-11-16
-- وصف: نظام شامل لإدارة الأسنان والخطط العلاجية مع مخطط تفاعلي

-- تفعيل_extension المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول معلومات الأسنان للمرضى
CREATE TABLE patient_teeth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL CHECK (tooth_number >= 11 AND tooth_number <= 48),
    tooth_type VARCHAR(50) NOT NULL DEFAULT 'ضرس',
    condition VARCHAR(20) NOT NULL DEFAULT 'healthy' 
        CHECK (condition IN ('present', 'healthy', 'missing', 'lost', 'cavity', 'stained', 'broken', 'mobile', 'decayed', 'calculus', 'abnormal_shape', 'abnormal_position')),
    
    -- معلومات التشخيص
    diagnosis TEXT[],
    treatment_notes TEXT,
    root_treatment_sessions INTEGER DEFAULT 0,
    root_treatment_notes TEXT,
    
    -- التكلفة والمعلومات المالية
    cost DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    
    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    -- قيود فريدة
    UNIQUE(patient_id, tooth_number)
);

-- جدول الخطط العلاجية للأسنان
CREATE TABLE tooth_treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL,
    tooth_type VARCHAR(50) NOT NULL DEFAULT 'ضرس',
    
    -- حالة الخطة العامة
    overall_status VARCHAR(20) NOT NULL DEFAULT 'healthy'
        CHECK (overall_status IN ('healthy', 'needs_treatment', 'in_progress', 'completed', 'post_treatment', 'failed')),
    status VARCHAR(15) NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'started', 'in_progress', 'completed', 'failed', 'on_hold', 'cancelled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- تفاصيل العلاج
    treatment_type VARCHAR(100) NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_description TEXT NOT NULL,
    alternative_treatments TEXT[],
    contraindications TEXT[],
    
    -- التكلفة والجدولة
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2),
    session_count INTEGER DEFAULT 1,
    completed_sessions INTEGER DEFAULT 0,
    estimated_duration INTEGER DEFAULT 60, -- بالدقائق
    actual_duration INTEGER, -- بالدقائق
    
    -- التواريخ
    estimated_start_date DATE,
    actual_start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    
    -- المتابعة والمراقبة
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    complications TEXT[],
    
    -- المقدمون والطاقم
    assigned_doctor VARCHAR(255) NOT NULL,
    assigned_technician VARCHAR(255),
    assigned_nurse VARCHAR(255),
    
    -- النتيجة والتقييم
    outcome VARCHAR(20) CHECK (outcome IN ('success', 'partial', 'failure', 'complication', 'pending')),
    patient_satisfaction INTEGER CHECK (patient_satisfaction >= 1 AND patient_satisfaction <= 10),
    long_term_prognosis TEXT,
    
    -- الملاحظات والتسجيل
    initial_notes TEXT NOT NULL,
    progress_notes TEXT[] DEFAULT '{}',
    final_notes TEXT,
    
    -- الحالة المالية
    financial_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (financial_status IN ('pending', 'partial_payment', 'paid', 'refunded', 'overdue')),
    payment_method VARCHAR(50),
    invoice_generated BOOLEAN DEFAULT false,
    
    -- التواريخ والمراجعة
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    last_updated_by UUID REFERENCES profiles(id),
    
    -- قيود فريدة
    UNIQUE(patient_id, tooth_number, id)
);

-- جدول مراحل العلاج
CREATE TABLE treatment_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES tooth_treatment_plans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phase_order INTEGER NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    estimated_duration DECIMAL(5,2) DEFAULT 1, -- بالساعات
    actual_duration DECIMAL(5,2),
    
    -- التبعيات
    prerequisites TEXT[] DEFAULT '{}',
    next_phases TEXT[] DEFAULT '{}',
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(plan_id, phase_order)
);

-- جدول المهام العلاجية
CREATE TABLE treatment_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID REFERENCES treatment_phases(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    task_order INTEGER NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    estimated_time INTEGER NOT NULL, -- بالدقائق
    actual_time INTEGER, -- بالدقائق
    
    -- الموارد والمواد
    assigned_to VARCHAR(255),
    materials TEXT[] DEFAULT '{}',
    equipment TEXT[] DEFAULT '{}',
    
    -- معايير الإكمال والتبعيات
    completion_criteria TEXT[] DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(phase_id, task_order)
);

-- جدول جلسات العلاج
CREATE TABLE treatment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES tooth_treatment_plans(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    duration_minutes INTEGER,
    
    -- الحالة والمرحلة
    session_status VARCHAR(15) NOT NULL DEFAULT 'scheduled'
        CHECK (session_status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    phase_name VARCHAR(255),
    
    -- تفاصيل الجلسة
    procedure_name VARCHAR(255) NOT NULL,
    findings TEXT[] DEFAULT '{}',
    complications TEXT[],
    medications TEXT[],
    instructions TEXT,
    next_session_plan TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    
    -- المالية
    amount_charged DECIMAL(10,2) DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    
    -- الطاقم والموارد
    assistant VARCHAR(255),
    equipment_used TEXT[] DEFAULT '{}',
    materials_used TEXT[] DEFAULT '{}',
    photos_taken TEXT[] DEFAULT '{}',
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(plan_id, session_number)
);

-- جدول تفاصيل طلبات المختبر
CREATE TABLE lab_order_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES tooth_treatment_plans(id) ON DELETE CASCADE,
    order_id VARCHAR(50) NOT NULL,
    lab_id VARCHAR(50) NOT NULL,
    lab_name VARCHAR(255) NOT NULL,
    order_type VARCHAR(100) NOT NULL,
    
    -- الحالة والمراحل
    order_status VARCHAR(15) NOT NULL DEFAULT 'ordered'
        CHECK (order_status IN ('ordered', 'sent', 'in_progress', 'ready', 'delivered', 'cancelled')),
    ordered_date DATE NOT NULL,
    expected_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    
    -- التكلفة
    estimated_cost DECIMAL(10,2) NOT NULL,
    actual_cost DECIMAL(10,2),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- التفاصيل والملاحظات
    special_instructions TEXT,
    attachments TEXT[] DEFAULT '{}',
    follow_up_required BOOLEAN DEFAULT false,
    
    -- فحص الجودة
    quality_check_performed BOOLEAN DEFAULT false,
    quality_check_passed BOOLEAN DEFAULT false,
    checked_by VARCHAR(255),
    checked_date DATE,
    quality_issues TEXT[],
    quality_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(plan_id, order_id)
);

-- جدول المرفقات والوثائق
CREATE TABLE treatment_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES tooth_treatment_plans(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL
        CHECK (file_type IN ('image', 'pdf', 'document', 'xray', 'photo', 'video', 'audio')),
    file_size BIGINT NOT NULL,
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
    uploaded_by VARCHAR(255) NOT NULL,
    
    -- التصنيف والوصف
    attachment_category VARCHAR(20) NOT NULL
        CHECK (attachment_category IN ('before', 'after', 'progress', 'xray', 'lab_order', 'consent', 'invoice', 'other')),
    description TEXT,
    is_confidential BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    
    -- المسار المرجعي
    file_path VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس لتحسين الأداء
CREATE INDEX idx_patient_teeth_patient_id ON patient_teeth(patient_id);
CREATE INDEX idx_patient_teeth_tooth_number ON patient_teeth(tooth_number);
CREATE INDEX idx_patient_teeth_condition ON patient_teeth(condition);

CREATE INDEX idx_tooth_treatment_plans_patient_id ON tooth_treatment_plans(patient_id);
CREATE INDEX idx_tooth_treatment_plans_tooth_number ON tooth_treatment_plans(tooth_number);
CREATE INDEX idx_tooth_treatment_plans_status ON tooth_treatment_plans(status);
CREATE INDEX idx_tooth_treatment_plans_overall_status ON tooth_treatment_plans(overall_status);
CREATE INDEX idx_tooth_treatment_plans_assigned_doctor ON tooth_treatment_plans(assigned_doctor);

CREATE INDEX idx_treatment_phases_plan_id ON treatment_phases(plan_id);
CREATE INDEX idx_treatment_phases_order ON treatment_phases(phase_order);

CREATE INDEX idx_treatment_tasks_phase_id ON treatment_tasks(phase_id);
CREATE INDEX idx_treatment_tasks_order ON treatment_tasks(task_order);

CREATE INDEX idx_treatment_sessions_plan_id ON treatment_sessions(plan_id);
CREATE INDEX idx_treatment_sessions_date ON treatment_sessions(session_date);

CREATE INDEX idx_lab_order_details_plan_id ON lab_order_details(plan_id);
CREATE INDEX idx_lab_order_details_lab_id ON lab_order_details(lab_id);
CREATE INDEX idx_lab_order_details_status ON lab_order_details(order_status);

CREATE INDEX idx_treatment_attachments_plan_id ON treatment_attachments(plan_id);
CREATE INDEX idx_treatment_attachments_category ON treatment_attachments(attachment_category);

-- دوال للتحديث التلقائي
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تفعيل triggers للتحديث التلقائي
CREATE TRIGGER update_patient_teeth_updated_at BEFORE UPDATE ON patient_teeth
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tooth_treatment_plans_updated_at BEFORE UPDATE ON tooth_treatment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_phases_updated_at BEFORE UPDATE ON treatment_phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_tasks_updated_at BEFORE UPDATE ON treatment_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_sessions_updated_at BEFORE UPDATE ON treatment_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_order_details_updated_at BEFORE UPDATE ON lab_order_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_attachments_updated_at BEFORE UPDATE ON treatment_attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة لحساب الإحصائيات
CREATE OR REPLACE FUNCTION get_patient_teeth_stats(patient_uuid UUID)
RETURNS TABLE(
    total_teeth INTEGER,
    healthy_teeth INTEGER,
    needs_treatment INTEGER,
    in_progress INTEGER,
    completed INTEGER,
    missing_teeth INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_teeth,
        COUNT(*) FILTER (WHERE pt.condition = 'healthy') as healthy_teeth,
        COUNT(*) FILTER (WHERE ttp.overall_status IN ('needs_treatment', 'planned')) as needs_treatment,
        COUNT(*) FILTER (WHERE ttp.overall_status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE ttp.overall_status = 'completed') as completed,
        COUNT(*) FILTER (WHERE pt.condition = 'missing') as missing_teeth
    FROM patient_teeth pt
    LEFT JOIN tooth_treatment_plans ttp ON pt.patient_id = ttp.patient_id AND pt.tooth_number = ttp.tooth_number
    WHERE pt.patient_id = patient_uuid;
END;
$$ LANGUAGE plpgsql;

-- بيانات تجريبية للإدخال السريع
INSERT INTO patient_teeth (patient_id, tooth_number, tooth_type, condition, diagnosis, treatment_notes, cost)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000'::UUID, -- ID وهمي للمريض التجريبي
    number,
    CASE 
        WHEN number >= 18 OR number >= 48 OR number <= 28 OR number <= 38 THEN 'ضرس'
        ELSE 'قاطع'
    END,
    'healthy',
    ARRAY['السن سليم'],
    'حالة طبيعية',
    0
FROM generate_series(11, 48) as number;

-- تطبيق صلاحيات الأمان (RLS)
ALTER TABLE patient_teeth ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_attachments ENABLE ROW LEVEL SECURITY;

-- صلاحيات المستخدمين (يمكن تخصيصها حسب الحاجة)
CREATE POLICY "Users can view their own patient's data" ON patient_teeth
    FOR SELECT USING (true); -- تعديل حسب نظام المصادقة

CREATE POLICY "Users can manage treatment plans" ON tooth_treatment_plans
    FOR ALL USING (true); -- تعديل حسب نظام المصادقة

CREATE POLICY "Users can manage treatment phases" ON treatment_phases
    FOR ALL USING (true);

CREATE POLICY "Users can manage treatment tasks" ON treatment_tasks
    FOR ALL USING (true);

CREATE POLICY "Users can manage treatment sessions" ON treatment_sessions
    FOR ALL USING (true);

CREATE POLICY "Users can manage lab orders" ON lab_order_details
    FOR ALL USING (true);

CREATE POLICY "Users can manage attachments" ON treatment_attachments
    FOR ALL USING (true);

COMMENT ON TABLE patient_teeth IS 'جدول معلومات الأسنان للمرضى مع التشخيص والحالة';
COMMENT ON TABLE tooth_treatment_plans IS 'جدول الخطط العلاجية المفصلة لكل سن';
COMMENT ON TABLE treatment_phases IS 'جدول مراحل العلاج المتدرجة';
COMMENT ON TABLE treatment_tasks IS 'جدول المهام التفصيلية لكل مرحلة';
COMMENT ON TABLE treatment_sessions IS 'جدول جلسات العلاج مع التفاصيل المالية';
COMMENT ON TABLE lab_order_details IS 'جدول تفاصيل طلبات المختبر';
COMMENT ON TABLE treatment_attachments IS 'جدول المرفقات والوثائق الطبية';

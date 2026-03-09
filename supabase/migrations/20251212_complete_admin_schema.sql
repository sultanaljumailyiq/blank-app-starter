-- 1. Suppliers Table (Enhanced)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    category TEXT,
    address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    commission_percentage NUMERIC DEFAULT 0,
    total_sales NUMERIC DEFAULT 0,
    pending_commission NUMERIC DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    orders_count INTEGER DEFAULT 0,
    description TEXT,
    documents TEXT[], -- Array of URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Jobs System
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company_name TEXT,
    governorate TEXT,
    district TEXT,
    category TEXT,
    type TEXT, -- 'Full-time', 'Part-time'
    salary TEXT,
    experience TEXT,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    sponsorship_level TEXT DEFAULT 'basic', -- 'premium', 'gold', 'silver', 'basic'
    status TEXT DEFAULT 'active', -- 'active', 'expired', 'draft', 'featured'
    applications_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Community System
CREATE TABLE IF NOT EXISTS webinars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    instructor TEXT,
    type TEXT DEFAULT 'webinar', -- 'webinar', 'course', 'workshop'
    date DATE,
    time Time,
    current_attendees INTEGER DEFAULT 0,
    max_attendees INTEGER DEFAULT 100,
    price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    rating NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elite_doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_name TEXT NOT NULL,
    specialty TEXT,
    hospital TEXT,
    experience INTEGER,
    publications INTEGER,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    admin_name TEXT,
    member_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Support System
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL, -- "TKT-1234"
    title TEXT NOT NULL,
    user_name TEXT, -- Snapshot or join with profiles
    user_id UUID, -- Optional link to auth.users
    user_type TEXT, -- 'doctor', 'lab', 'supplier', etc
    category TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to TEXT, -- Admin Name or ID
    description TEXT,
    rating INTEGER, -- Satisfaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_name TEXT,
    message TEXT NOT NULL,
    is_from_support BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Notifications System
CREATE TABLE IF NOT EXISTS notification_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT, -- 'promotional', 'system', 'announcement'
    target_audience TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft',
    content TEXT,
    channels TEXT[], -- ['app', 'email', 'sms']
    priority TEXT DEFAULT 'normal',
    sent_count INTEGER DEFAULT 0,
    open_rate NUMERIC DEFAULT 0,
    click_rate NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    category TEXT,
    subject TEXT,
    content TEXT,
    language TEXT DEFAULT 'ar',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Policies (Permissive for Demo Admin Access)
CREATE POLICY "Admin All Access" ON suppliers FOR ALL USING (true); -- Ideally role='admin'
CREATE POLICY "Admin All Access Jobs" ON job_postings FOR ALL USING (true);
CREATE POLICY "Admin All Access Webinars" ON webinars FOR ALL USING (true);
CREATE POLICY "Admin All Access Elite" ON elite_doctors FOR ALL USING (true);
CREATE POLICY "Admin All Access Groups" ON medical_groups FOR ALL USING (true);
CREATE POLICY "Admin All Access Tickets" ON support_tickets FOR ALL USING (true);
CREATE POLICY "Admin All Access Messages" ON ticket_messages FOR ALL USING (true);
CREATE POLICY "Admin All Access Campaigns" ON notification_campaigns FOR ALL USING (true);
CREATE POLICY "Admin All Access Templates" ON notification_templates FOR ALL USING (true);

-- Seed Data (Matching Frontend Mocks)
INSERT INTO suppliers (company_name, contact_person, email, phone, category, address, status, commission_percentage, total_sales, pending_commission, rating, orders_count) VALUES
('شركة النور الطبية', 'محمد أحمد', 'info@alnoor.com', '07700000001', 'معدات طبية', 'بغداد - السعدون', 'approved', 5, 25000000, 1250000, 4.8, 156),
('مذخر بغداد', 'علي حسين', 'baghdad@store.com', '07900000002', 'مستلزمات استهلاكية', 'بغداد - الحارثية', 'pending', 0, 0, 0, 0, 0);

INSERT INTO job_postings (title, company_name, governorate, district, category, type, salary, experience, description, contact_email, contact_phone, sponsorship_level, status, applications_count, views_count) VALUES
('طبيب أسنان عام', 'عيادة النور الطبية', 'بغداد', 'الكرادة', 'طبيب أسنان عام', 'دوام كامل', '2,500,000', '3-5 سنوات', 'مطلوب طبيب أسنان خبرة في التركيبات', 'hr@alnoor.com', '0770000000', 'silver', 'active', 12, 156),
('أخصائي جراحة وجه وفكين', 'مستشفى الحياة', 'أربيل', 'عين كاوه', 'أخصائي جراحة الفم', 'دوام جزئي', 'نسبة', '5+ سنوات', 'مطلوب استشاري', 'jobs@life-hospital.com', '0750000000', 'premium', 'featured', 5, 420);

INSERT INTO webinars (title, instructor, type, date, time, current_attendees, max_attendees, price, status, rating) VALUES
('أحدث تقنيات زراعة الأسنان', 'د. محمد أحمد', 'webinar', '2025-12-15', '19:00', 450, 500, 50000, 'scheduled', 4.8),
('دورة تجميل الأسنان المتقدمة', 'د. سارة علي', 'course', '2025-12-20', '10:00', 25, 30, 250000, 'scheduled', 0);

INSERT INTO elite_doctors (doctor_name, specialty, hospital, experience, publications, rating, reviews_count) VALUES
('د. أحمد الربيعي', 'جراحة الوجه والفكين', 'مستشفى اليرموك', 15, 12, 4.9, 150);

INSERT INTO medical_groups (name, category, admin_name, member_count, posts_count, comments_count) VALUES
('ملتقى أطباء الأسنان - بغداد', 'عام', 'د. علي حسين', 2500, 15, 85);

INSERT INTO support_tickets (ticket_number, title, user_name, user_type, category, priority, status, description, created_at) VALUES
('TKT-1001', 'مشكلة في تسجيل الدخول', 'د. أحمد علي', 'doctor', 'technical', 'high', 'open', 'لا أستطيع الدخول لحسابي منذ الصباح', NOW() - INTERVAL '4 hours'),
('TKT-1002', 'استفسار عن الفواتير', 'مختبر بغداد', 'lab', 'billing', 'normal', 'resolved', 'كيف يمكنني دفع الفاتورة الشهرية؟', NOW() - INTERVAL '1 day');

INSERT INTO notification_campaigns (title, type, target_audience, scheduled_date, status, content, priority) VALUES
('تحديث سياسة الخصوصية', 'system', 'all_users', NOW() + INTERVAL '2 days', 'scheduled', 'نود إعلامكم بتحديث سياسة الخصوصية...', 'high');


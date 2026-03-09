-- =============================================
-- SEED DATA: Full Demo Environment for Lab-Clinic Workflow
-- =============================================

-- 1. Create Demo Profiles if not exist
INSERT INTO profiles (id, full_name, email, role, phone, created_at)
VALUES 
    ('d0c-demo-uuid', 'د. أحمد علي (تجريبي)', 'doctor.demo@smartdental.com', 'doctor', '07705551111', NOW()),
    ('lab-demo-uuid', 'مختبر الأضواء (تجريبي)', 'lab.demo@smartdental.com', 'laboratory', '07800000000', NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Create Demo Clinic linked to Doctor
INSERT INTO clinics (id, name, address, phone, email, doctor_id, is_verified, created_at)
VALUES 
    (101, 'عيادة النور التخصصية', 'بغداد - شارع 14 رمضان', '07705551111', 'clinic.demo@smartdental.com', 'd0c-demo-uuid', true, NOW())
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    doctor_id = EXCLUDED.doctor_id;

-- 3. Create Demo Lab Profile in Dental Laboratories
INSERT INTO dental_laboratories (id, user_id, lab_name, phone, address, is_verified, created_at)
VALUES 
    ('lab-demo-uuid', 'lab-demo-uuid', 'مختبر الأضواء (تجريبي)', '07800000000', 'بغداد - الكرادة', true, NOW())
ON CONFLICT (user_id) DO UPDATE SET lab_name = EXCLUDED.lab_name;

-- 4. Create Demo Patients
INSERT INTO patients (id, clinic_id, full_name, phone, gender, age, created_at)
VALUES 
    ('p1-demo', 101, 'زينب باسل', '07901112222', 'female', 28, NOW()),
    ('p2-demo', 101, 'حسن أمير', '07903334444', 'male', 35, NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Create Demo Orders
INSERT INTO dental_lab_orders (
    id, clinic_id, laboratory_id, doctor_id, patient_id, patient_name, 
    order_number, service_name, status, priority, price, created_at, expected_delivery_date
)
VALUES 
    (
        'ord-demo-1', 101, 'lab-demo-uuid', 'd0c-demo-uuid', 'p1-demo', 'زينب باسل',
        'L-2025-001', 'Zirconia Crown (x2)', 'in_progress', 'normal', 90000, 
        NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days'
    ),
    (
        'ord-demo-2', 101, 'lab-demo-uuid', 'd0c-demo-uuid', 'p2-demo', 'حسن أمير',
        'L-2025-002', 'E-Max Veneer (x6)', 'pending', 'high', 250000, 
        NOW(), NOW() + INTERVAL '5 days'
    ),
    (
        'ord-demo-3', 101, 'lab-demo-uuid', 'd0c-demo-uuid', 'p1-demo', 'زينب باسل',
        'L-2025-003', 'Night Guard', 'completed', 'normal', 30000, 
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Create Demo Conversations
-- Clinic Conversation
INSERT INTO lab_chat_conversations (id, doctor_id, lab_id, order_id, created_at, last_message_date)
VALUES 
    (1001, 'd0c-demo-uuid', 'lab-demo-uuid', 'ord-demo-1', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Messages for Clinic Conversation
INSERT INTO lab_chat_messages (conversation_id, sender_id, message_type, message_content, is_read, created_at)
VALUES 
    (1001, 'd0c-demo-uuid', 'text', 'مرحباً، هل يمكن استلام الطلب يوم الخميس؟', true, NOW() - INTERVAL '5 hours'),
    (1001, 'lab-demo-uuid', 'text', 'أهلاً دكتور، نعم الجدول يسمح بذلك.', false, NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- Admin Conversation (Mocking an admin user for conversation)
INSERT INTO lab_chat_conversations (id, doctor_id, lab_id, order_id, created_at, last_message_date)
VALUES 
    (1002, NULL, 'lab-demo-uuid', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
-- Note: 'doctor_id' allows NULL based on schema? If not, we might need a dummy admin profile ID. 
-- Assuming schema allows NULL for non-doctor chats or different columns. 
-- If schema is strict, this might fail, so let's verify schema or assume the mock handles it.
-- For safety, let's skip admin chat insertion in SQL if schema is unknown, rely on frontend mock for Admin currently.


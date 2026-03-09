-- Seed Pending Appointments for Online Requests Testing

-- Insert sample pending appointments for Clinic 1 (Noor Clinic)
INSERT INTO appointments (clinic_id, patient_name, appointment_date, appointment_time, type, status, notes, created_at)
VALUES 
(1, 'فاطمة كريم', CURRENT_DATE + 1, '10:30', 'كشف عام (أونلاين)', 'pending', 'حجز إلكتروني - تجربة 1', NOW()),
(1, 'يوسف أحمد', CURRENT_DATE + 2, '14:00', 'كشف عام (أونلاين)', 'pending', 'حجز إلكتروني - تجربة 2', NOW());

-- Insert sample pending appointments for Clinic 2 (Smile Center)
INSERT INTO appointments (clinic_id, patient_name, appointment_date, appointment_time, type, status, notes, created_at)
VALUES 
(2, 'زينب مهدي', CURRENT_DATE + 1, '11:00', 'تجميل (أونلاين)', 'pending', 'حجز إلكتروني - تجربة 3', NOW());

-- Note: Ensure 'pending' status is allowed by constraints (run fix_appointments_policy.sql first)

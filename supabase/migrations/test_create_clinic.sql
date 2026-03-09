
INSERT INTO clinics (name, email, phone, address, city) 
VALUES ('Test Trigger Clinic 2', 'test2@trigger.com', '123456', 'Test Address', 'Baghdad') 
RETURNING id;

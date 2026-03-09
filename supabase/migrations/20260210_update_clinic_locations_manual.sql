-- Update clinic locations for existing demo clinics
-- Clinic 1: Palestine Street -> Baghdad, Palestine Street
-- Clinic 2: Al-Mansour -> Baghdad, Al-Mansour

UPDATE clinics 
SET governorate = 'بغداد', 
    city = 'شارع فلسطين',
    address = 'شارع فلسطين، قرب تقاطع الصخرة'
WHERE id = 1;

UPDATE clinics 
SET governorate = 'بغداد', 
    city = 'المنصور',
    address = 'المنصور، شارع 14 رمضان'
WHERE id = 2;

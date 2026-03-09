-- Add settings column for storing complex lab profile data (working hours, price list, etc.)
ALTER TABLE dental_laboratories
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Update the default lab with some initial settings if needed
UPDATE dental_laboratories
SET settings = '{
  "workingHours": {
    "start": "09:00",
    "end": "17:00",
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
  },
  "deliveryRadius": 25,
  "emergencyService": true,
  "autoAcceptOrders": true,
  "priceList": []
}'::jsonb
WHERE lab_name = 'مختبر الأضواء للأسنان';

-- Add paid column to tooth_treatment_plans
ALTER TABLE tooth_treatment_plans 
ADD COLUMN IF NOT EXISTS paid DECIMAL(12, 2) DEFAULT 0;

-- Comment
COMMENT ON COLUMN tooth_treatment_plans.paid IS 'المبلغ الذي تم تسديده سريرياً (Clinical Settlement)';

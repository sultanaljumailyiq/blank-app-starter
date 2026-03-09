-- Trigger to automatically set is_featured = true when subscription_plan becomes Premium
CREATE OR REPLACE FUNCTION auto_feature_premium_clinics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_plan = 'Premium' AND (OLD.subscription_plan IS DISTINCT FROM 'Premium') THEN
        NEW.is_featured := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_feature_premium
BEFORE UPDATE ON clinics
FOR EACH ROW
EXECUTE FUNCTION auto_feature_premium_clinics();

-- ============================================================
-- Bidirectional Image Sync Trigger: suppliers.logo ↔ profiles.avatar_url
-- Run via: node scripts/run_migration.cjs scripts/sync_supplier_image_trigger.sql
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TRIGGER: When profiles.avatar_url changes → sync to suppliers.logo
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_supplier_logo_from_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire for supplier role accounts and when avatar_url actually changed
  IF NEW.role = 'supplier' AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url AND NEW.avatar_url IS NOT NULL THEN
    UPDATE suppliers
    SET logo = NEW.avatar_url
    WHERE
      user_id    = NEW.id
      OR profile_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_supplier_logo_from_profile ON profiles;
CREATE TRIGGER trigger_sync_supplier_logo_from_profile
  AFTER UPDATE OF avatar_url ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_supplier_logo_from_profile();

-- ─────────────────────────────────────────────
-- 2. TRIGGER: When suppliers.logo changes → sync to profiles.avatar_url
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_profile_avatar_from_supplier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.logo IS DISTINCT FROM OLD.logo AND NEW.logo IS NOT NULL THEN
    UPDATE profiles
    SET avatar_url = NEW.logo
    WHERE
      id = NEW.user_id
      OR id = NEW.profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_profile_avatar_from_supplier ON suppliers;
CREATE TRIGGER trigger_sync_profile_avatar_from_supplier
  AFTER UPDATE OF logo ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_avatar_from_supplier();

-- ─────────────────────────────────────────────
-- 3. One-time sync: ensure existing records are consistent
-- (prefers suppliers.logo as the canonical image if both exist)
-- ─────────────────────────────────────────────
UPDATE profiles p
SET avatar_url = s.logo
FROM suppliers s
WHERE
  (s.user_id = p.id OR s.profile_id = p.id)
  AND s.logo IS NOT NULL
  AND s.logo != ''
  AND (p.avatar_url IS NULL OR p.avatar_url != s.logo);

DO $$
BEGIN
  RAISE NOTICE 'Sync complete. Triggers created for bidirectional suppliers.logo <-> profiles.avatar_url sync.';
END;
$$;

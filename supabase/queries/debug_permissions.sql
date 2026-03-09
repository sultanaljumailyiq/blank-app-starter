-- Diagnostic Script
-- 1. Who am I?
SELECT 'User: ' || current_user AS info
UNION ALL
-- 2. Can I create tables in public?
SELECT 'Can Create: ' || CASE WHEN has_schema_privilege(current_user, 'public', 'CREATE') THEN 'YES' ELSE 'NO' END
UNION ALL
-- 3. Who owns public schema?
SELECT 'Schema Owner: ' || n.nspname || ' -> ' || r.rolname
FROM pg_namespace n
JOIN pg_roles r ON n.nspowner = r.oid
WHERE n.nspname = 'public';

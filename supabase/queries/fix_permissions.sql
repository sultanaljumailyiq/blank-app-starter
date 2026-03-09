-- Try to fix permissions safely
GRANT USAGE, CREATE ON SCHEMA public TO service_role;
GRANT USAGE, CREATE ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO service_role;

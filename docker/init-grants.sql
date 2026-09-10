-- Create least-privilege app role for HAFEZ (runs once on fresh Postgres volume).
-- Owner role `hafez` retains DDL; application should connect as `hafez_app` in production.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hafez_app') THEN
    CREATE ROLE hafez_app LOGIN PASSWORD 'hafez_app';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE hafez TO hafez_app;
GRANT USAGE ON SCHEMA public TO hafez_app;

-- Default: full DML on public tables for app role (tables created later by Prisma)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO hafez_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO hafez_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hafez_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO hafez_app;

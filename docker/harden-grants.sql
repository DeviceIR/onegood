-- Run as table owner / superuser AFTER prisma migrate/db push.
-- Enforces append-only LedgerEntry + AuditLog for the application role.

-- Ensure role exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hafez_app') THEN
    CREATE ROLE hafez_app LOGIN PASSWORD 'hafez_app';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE hafez TO hafez_app;
GRANT USAGE ON SCHEMA public TO hafez_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hafez_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO hafez_app;

-- Append-only financial + audit trail
REVOKE UPDATE, DELETE ON TABLE "LedgerEntry" FROM hafez_app;
REVOKE UPDATE, DELETE ON TABLE "AuditLog" FROM hafez_app;
GRANT SELECT, INSERT ON TABLE "LedgerEntry" TO hafez_app;
GRANT SELECT, INSERT ON TABLE "AuditLog" TO hafez_app;

-- Document: production DATABASE_URL should use hafez_app, not the owner role.

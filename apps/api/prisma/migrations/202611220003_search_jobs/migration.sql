CREATE TABLE "SearchJob" (
  id TEXT PRIMARY KEY, query TEXT NOT NULL, publish BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'QUEUED', report JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "SearchJob_status_createdAt_idx" ON "SearchJob"(status,"createdAt");
CREATE TABLE "SearchDocument" (
  url TEXT PRIMARY KEY, hash TEXT NOT NULL, payload JSONB NOT NULL,
  etag TEXT, modified TEXT
);

-- En Supabase las tablas del esquema público pueden heredar permisos de la Data API.
REVOKE ALL ON "SearchJob","SearchDocument" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname='anon') THEN
    REVOKE ALL ON "SearchJob","SearchDocument" FROM anon;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname='authenticated') THEN
    REVOKE ALL ON "SearchJob","SearchDocument" FROM authenticated;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname='becas_reader') THEN
    GRANT SELECT, INSERT ON "SearchJob" TO becas_reader;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname='becas_editor') THEN
    GRANT SELECT, INSERT, UPDATE ON "SearchJob","SearchDocument" TO becas_editor;
  END IF;
END $$;

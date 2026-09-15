-- ============================================================
-- Réplica mínima del entorno de Supabase para probar las
-- migraciones con PGlite, sin Docker ni proyecto remoto.
-- Solo incluye lo que las migraciones usan.
-- ============================================================

CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

-- auth: usuarios y JWT (PostgREST publica el sub en request.jwt.claim.sub)
CREATE SCHEMA auth;

CREATE TABLE auth.users (
  id                  UUID PRIMARY KEY,
  email               TEXT,
  raw_user_meta_data  JSONB NOT NULL DEFAULT '{}'
);

CREATE FUNCTION auth.uid() RETURNS UUID
LANGUAGE sql STABLE
AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', TRUE), '')::UUID $$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

-- storage: buckets y objetos con RLS, igual que en Supabase
CREATE SCHEMA storage;

CREATE TABLE storage.buckets (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  public  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE storage.objects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id  TEXT REFERENCES storage.buckets(id),
  name       TEXT NOT NULL
);

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION storage.foldername(name TEXT) RETURNS TEXT[]
LANGUAGE sql IMMUTABLE
AS $$
  SELECT parts[1:array_length(parts, 1) - 1]
  FROM (SELECT string_to_array(name, '/') AS parts) AS p
$$;

GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;

CREATE PUBLICATION supabase_realtime;

-- Supabase da todos los privilegios de public a los roles de la API:
-- lo que protege los datos son las políticas RLS y los GRANT de cada migración.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

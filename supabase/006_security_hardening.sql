-- ============================================================
-- Migración 006: Endurecimiento de seguridad
-- Ejecutar en: Supabase Dashboard > SQL Editor (después de la 005)
-- Tests: cd supabase && npm install && npm test
--
-- Corrige:
--   1. Recursión infinita en las políticas de la 005 (rompía toda
--      lectura de profiles y listings con sesión iniciada).
--   2. Escalada a admin por UPDATE del propio perfil.
--   3. Escalada a admin al registrarse (role en los metadatos).
--   4. Email y teléfono de todos los usuarios legibles por anon.
--   5. Transferencia de anuncios a otro usuario.
--   6. Consultas enviadas a quien no es dueño del anuncio.
--   7. Edición del texto de consultas y mensajes de chat ajenos.
--   8. Subida de imágenes a la carpeta de otro usuario.
-- ============================================================


-- ============================================================
-- 1. is_admin(): lee profiles sin pasar por RLS
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- profiles_public_read ya permite leer todas las filas; lo sensible
-- se protege por columnas (sección 3).
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Admins can read all listings" ON public.listings;
DROP POLICY IF EXISTS "listings_owner_or_admin_read" ON public.listings;
CREATE POLICY "listings_owner_or_admin_read"
  ON public.listings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());


-- ============================================================
-- 2. Rol: 'admin' solo se asigna desde el SQL Editor
-- ============================================================
-- Se bloquea tanto por rol de la API como por JWT de usuario: así una futura
-- función SECURITY DEFINER (que cambia current_user) tampoco puede saltearlo.
CREATE OR REPLACE FUNCTION public.protect_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND 'admin' IN (NEW.role, OLD.role)
     AND (current_user IN ('anon', 'authenticated') OR auth.uid() IS NOT NULL) THEN
    RAISE EXCEPTION 'No autorizado a cambiar el rol admin' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_admin_role ON public.profiles;
CREATE TRIGGER profiles_protect_admin_role
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_admin_role();

DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
CREATE POLICY "profiles_owner_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Registro: de los metadatos solo se acepta investor o seller
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_role      TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );
  v_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' IN ('investor', 'seller')
      THEN NEW.raw_user_meta_data->>'role'
    ELSE 'investor'
  END;

  INSERT INTO public.profiles (id, email, role, full_name, onboarding_done)
  VALUES (NEW.id, NEW.email, v_role, v_full_name, FALSE)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


-- ============================================================
-- 3. Datos personales: email y teléfonos fuera de la API
-- ============================================================
REVOKE ALL ON public.profiles FROM anon, authenticated;

GRANT SELECT (id, full_name, role, company_name, bio, onboarding_done, created_at)
  ON public.profiles TO anon, authenticated;

GRANT UPDATE (full_name, phone_number, company_name, bio, role, onboarding_done)
  ON public.profiles TO authenticated;

-- Perfil propio completo, incluidos email y teléfono
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid()
$$;

-- Listado completo para el panel admin
CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$;


-- ============================================================
-- 4. Anuncios: el dueño no puede transferirlos
-- ============================================================
DROP POLICY IF EXISTS "listings_owner_update" ON public.listings;
CREATE POLICY "listings_owner_update"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 5. Consultas: solo al dueño del anuncio; el receptor solo marca leído
-- ============================================================
DROP POLICY IF EXISTS "inquiries_insert" ON public.inquiries;
CREATE POLICY "inquiries_insert"
  ON public.inquiries FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND receiver_id = (SELECT user_id FROM public.listings WHERE id = listing_id)
  );

REVOKE UPDATE ON public.inquiries FROM anon, authenticated;
GRANT UPDATE (is_read) ON public.inquiries TO authenticated;

DROP POLICY IF EXISTS "inquiries_receiver_update" ON public.inquiries;
CREATE POLICY "inquiries_receiver_update"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);


-- ============================================================
-- 6. Chat: de un mensaje solo se puede cambiar is_read
-- ============================================================
REVOKE UPDATE ON public.chat_messages FROM anon, authenticated;
GRANT UPDATE (is_read) ON public.chat_messages TO authenticated;


-- ============================================================
-- 7. Storage: cada usuario sube imágenes solo a su carpeta
-- ============================================================
DROP POLICY IF EXISTS "listings_images_auth_insert" ON storage.objects;
CREATE POLICY "listings_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listings-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );


-- PostgREST recarga el esquema para tomar los nuevos permisos por columna
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- FIN MIGRACIÓN 006
-- ============================================================

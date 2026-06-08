-- ============================================================
-- Migración 005: Agregar rol 'admin' al CHECK constraint de profiles
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Actualizar CHECK constraint para incluir 'admin'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('investor', 'seller', 'admin'));

-- RLS: los admins pueden leer todos los perfiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR id = auth.uid()
  );

-- RLS: los admins pueden leer todos los listings
CREATE POLICY "Admins can read all listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR user_id = auth.uid()
    OR status = 'active'
  );

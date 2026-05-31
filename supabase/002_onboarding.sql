-- ============================================================
-- Migración 002: Campo onboarding + mejoras al perfil
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Agregar campos nuevos a profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number    TEXT,
  ADD COLUMN IF NOT EXISTS company_name    TEXT,
  ADD COLUMN IF NOT EXISTS bio             TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN NOT NULL DEFAULT FALSE;

-- Actualizar el trigger para marcar onboarding_done=true
-- en registros creados por OAuth (Google) que ya traen nombre
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
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'investor');

  INSERT INTO public.profiles (id, email, role, full_name, onboarding_done)
  VALUES (
    NEW.id,
    NEW.email,
    v_role,
    v_full_name,
    FALSE   -- siempre false; el onboarding completa los datos
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================
-- FIN DE MIGRACIÓN 002
-- ============================================================

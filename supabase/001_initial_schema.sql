-- ============================================================
-- MARKETPLACE DE NEGOCIOS Y FRANQUICIAS
-- Migración 001: Schema inicial + RLS
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 1. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. TABLA: profiles
-- Extiende auth.users con datos de perfil y rol
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'investor' CHECK (role IN ('investor', 'seller')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);


-- ============================================================
-- 3. TABLA: listings
-- Anuncios de negocios/franquicias en venta
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  price            NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  category         TEXT NOT NULL CHECK (category IN (
                     'gastronomia', 'tecnologia', 'retail', 'servicios',
                     'salud', 'educacion', 'manufactura', 'franquicia', 'otro'
                   )),
  location         TEXT NOT NULL,
  annual_revenue   NUMERIC(15, 2),               -- Facturación anual (opcional)
  is_confidential  BOOLEAN NOT NULL DEFAULT FALSE, -- Modo privado
  images           TEXT[] NOT NULL DEFAULT '{}',   -- URLs de imágenes en Storage
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'paused')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para filtros del feed
CREATE INDEX IF NOT EXISTS listings_status_idx    ON public.listings(status);
CREATE INDEX IF NOT EXISTS listings_category_idx  ON public.listings(category);
CREATE INDEX IF NOT EXISTS listings_price_idx     ON public.listings(price);
CREATE INDEX IF NOT EXISTS listings_user_id_idx   ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings(created_at DESC);


-- ============================================================
-- 4. TABLA: inquiries
-- Mensajes de inversores a vendedores (sin exponer emails)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT no_self_inquiry CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS inquiries_listing_idx   ON public.inquiries(listing_id);
CREATE INDEX IF NOT EXISTS inquiries_sender_idx    ON public.inquiries(sender_id);
CREATE INDEX IF NOT EXISTS inquiries_receiver_idx  ON public.inquiries(receiver_id);


-- ============================================================
-- 5. FUNCTION: crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'investor'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger: se ejecuta al crear un nuevo usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- --- profiles ---
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver perfiles básicos (necesario para mostrar vendedor en listing)
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Solo el propio usuario puede actualizar su perfil
CREATE POLICY "profiles_owner_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- --- listings ---
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Feed público: ver listings activos (respetando confidencialidad desde el frontend)
CREATE POLICY "listings_public_read"
  ON public.listings FOR SELECT
  USING (status = 'active');

-- Vendedor: insertar sus propios listings
CREATE POLICY "listings_owner_insert"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Vendedor: actualizar solo sus listings
CREATE POLICY "listings_owner_update"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Vendedor: eliminar solo sus listings
CREATE POLICY "listings_owner_delete"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);


-- --- inquiries ---
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Inversor: ver los mensajes que envió
CREATE POLICY "inquiries_sender_read"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = sender_id);

-- Vendedor: ver los mensajes que recibió
CREATE POLICY "inquiries_receiver_read"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = receiver_id);

-- Inversor autenticado: puede enviar mensajes
CREATE POLICY "inquiries_insert"
  ON public.inquiries FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND auth.uid() IS NOT NULL);

-- Vendedor: marcar mensajes como leídos
CREATE POLICY "inquiries_receiver_update"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = receiver_id);


-- ============================================================
-- 7. STORAGE: bucket para imágenes de listings
-- ============================================================

-- Crear bucket público para imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings-images', 'listings-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquiera puede leer imágenes
CREATE POLICY "listings_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings-images');

-- Política: usuarios autenticados pueden subir imágenes
CREATE POLICY "listings_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listings-images'
    AND auth.uid() IS NOT NULL
  );

-- Política: usuarios pueden actualizar/borrar sus propias imágenes
CREATE POLICY "listings_images_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listings-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "listings_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listings-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );


-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================

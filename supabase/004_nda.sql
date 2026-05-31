-- ============================================================
-- Migración 004: Acuerdos de NDA digital
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.nda_agreements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  agreed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT nda_agreements_unique UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS nda_agreements_user_idx    ON public.nda_agreements(user_id);
CREATE INDEX IF NOT EXISTS nda_agreements_listing_idx ON public.nda_agreements(listing_id);

-- RLS
ALTER TABLE public.nda_agreements ENABLE ROW LEVEL SECURITY;

-- El usuario solo ve y gestiona sus propios acuerdos
CREATE POLICY "nda_own_read"
  ON public.nda_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "nda_own_insert"
  ON public.nda_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- El vendedor del listing puede ver quiénes firmaron
CREATE POLICY "nda_seller_read"
  ON public.nda_agreements FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.listings WHERE id = listing_id
    )
  );

-- ============================================================
-- FIN MIGRACIÓN 004
-- ============================================================

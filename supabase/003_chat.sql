-- ============================================================
-- Migración 003: Chat interno
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla de mensajes de chat (hilo por inquiry)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id  UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) > 0),
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_inquiry_idx ON public.chat_messages(inquiry_id);
CREATE INDEX IF NOT EXISTS chat_messages_sender_idx  ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_idx ON public.chat_messages(created_at ASC);

-- RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Solo los participantes de la inquiry pueden leer los mensajes
CREATE POLICY "chat_read"
  ON public.chat_messages FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() IN (
      SELECT sender_id FROM public.inquiries WHERE id = inquiry_id
      UNION
      SELECT receiver_id FROM public.inquiries WHERE id = inquiry_id
    )
  );

-- Solo participantes pueden insertar
CREATE POLICY "chat_insert"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT sender_id FROM public.inquiries WHERE id = inquiry_id
      UNION
      SELECT receiver_id FROM public.inquiries WHERE id = inquiry_id
    )
  );

-- Marcar como leído: solo el receptor
CREATE POLICY "chat_update_read"
  ON public.chat_messages FOR UPDATE
  USING (
    auth.uid() != sender_id AND
    auth.uid() IN (
      SELECT sender_id FROM public.inquiries WHERE id = inquiry_id
      UNION
      SELECT receiver_id FROM public.inquiries WHERE id = inquiry_id
    )
  );

-- Habilitar Realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- ============================================================
-- FIN MIGRACIÓN 003
-- ============================================================

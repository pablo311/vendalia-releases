'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, CheckCircle, Loader2, ArrowRight } from 'lucide-react'

interface InquiryFormProps {
  listingId: string
  receiverId: string
}

export function InquiryForm({ listingId, receiverId }: InquiryFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inquiryId, setInquiryId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!message.trim()) { setError('Escribí un mensaje antes de enviar.'); return }
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data, error: err } = await supabase
      .from('inquiries')
      .insert({
        listing_id: listingId,
        sender_id: user.id,
        receiver_id: receiverId,
        message: message.trim(),
      })
      .select('id')
      .single()

    setLoading(false)
    if (err) {
      setError('Error al enviar. Intentá de nuevo.')
      return
    }

    setInquiryId(data.id)
  }

  if (inquiryId) {
    return (
      <div className="flex flex-col items-center gap-3 py-5 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
          <CheckCircle className="h-6 w-6 text-white" strokeWidth={2} />
        </div>
        <p className="font-semibold text-gray-900 dark:text-gray-100">¡Consulta enviada!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
          Tu mensaje fue enviado. Podés continuar la conversación en el chat.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/messages/${inquiryId}`)}
          className="mt-1 w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
        >
          <MessageSquare className="h-4 w-4" strokeWidth={2} />
          Ir al chat
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="inq-message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tu mensaje
        </label>
        <textarea
          id="inq-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hola, me interesa tu negocio. ¿Podrías contarme más sobre...?"
          rows={4}
          required
          className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all resize-none"
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Tu email no será visible hasta que ambas partes decidan compartirlo.
      </p>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
          : <><MessageSquare className="h-4 w-4" strokeWidth={2} /> Enviar consulta</>}
      </button>
    </form>
  )
}

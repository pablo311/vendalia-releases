import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/chat/chat-window'
import { ArrowLeft, Lock, TrendingUp } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/types'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: inquiryId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Verificar que el usuario es participante de esta inquiry
  const { data: inquiry } = await supabase
    .from('inquiries')
    .select(`
      id, message, created_at,
      listings(id, title, is_confidential, category, images),
      sender:profiles!inquiries_sender_id_fkey(id, full_name),
      receiver:profiles!inquiries_receiver_id_fkey(id, full_name)
    `)
    .eq('id', inquiryId)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .single()

  if (!inquiry) notFound()

  const sender = inquiry.sender as any
  const receiver = inquiry.receiver as any
  const listing = inquiry.listings as any

  const other = sender?.id === user.id ? receiver : sender
  const otherName = other?.full_name || 'Usuario'

  const displayTitle = listing?.is_confidential
    ? `Negocio en ${CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS] ?? listing.category}`
    : listing?.title

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950">

      {/* Header del chat */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link
          href="/dashboard/messages"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
        >
          {otherName[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{otherName}</p>
          <Link
            href={listing?.id ? `/listings/${listing.id}` : '#'}
            className="flex items-center gap-1 text-[11px] text-purple-500 hover:text-purple-700 transition-colors truncate"
          >
            {listing?.is_confidential
              ? <Lock className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
              : <TrendingUp className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />}
            <span className="truncate">{displayTitle}</span>
          </Link>
        </div>
      </div>

      {/* Mensaje inicial de la inquiry */}
      <div className="px-4 py-3 bg-purple-50/60 dark:bg-purple-950/30 border-b border-purple-100/50 dark:border-purple-900/50 flex-shrink-0">
        <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wide mb-1">
          Consulta inicial · {new Date(inquiry.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{inquiry.message}</p>
      </div>

      {/* Chat en tiempo real */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          inquiryId={inquiryId}
          currentUserId={user.id}
          otherName={otherName}
        />
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSeller = profile?.role === 'seller'

  // Traer todas las inquiries donde participa el usuario, con último mensaje de chat
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select(`
      id, message, created_at, listing_id,
      listings(id, title, is_confidential, category),
      sender:profiles!inquiries_sender_id_fkey(id, full_name, email),
      receiver:profiles!inquiries_receiver_id_fkey(id, full_name, email)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Para cada inquiry, traer el último mensaje del chat y contar no leídos
  const enriched = await Promise.all(
    (inquiries ?? []).map(async (inq: any) => {
      const { data: lastMsg } = await supabase
        .from('chat_messages')
        .select('content, created_at, sender_id')
        .eq('inquiry_id', inq.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const { count: unread } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('inquiry_id', inq.id)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      return { ...inq, lastMsg, unread: unread ?? 0 }
    })
  )

  // Ordenar por actividad más reciente
  enriched.sort((a, b) => {
    const dateA = a.lastMsg?.created_at ?? a.created_at
    const dateB = b.lastMsg?.created_at ?? b.created_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 sm:pb-10">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 pt-8 pb-5">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Volver al panel
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-heading">Mensajes</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{enriched.length} conversaciones</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 mt-5 space-y-2.5">
        {enriched.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <MessageCircle className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Sin conversaciones aún</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
              {isSeller ? 'Aparecerán cuando inversores te contacten.' : 'Contactá vendedores desde los anuncios.'}
            </p>
          </div>
        ) : (
          enriched.map((inq: any) => {
            const other = inq.sender?.id === user.id ? inq.receiver : inq.sender
            const listingTitle = inq.listings?.is_confidential ? 'Negocio confidencial' : inq.listings?.title
            const lastText = inq.lastMsg?.content ?? inq.message
            const lastDate = inq.lastMsg?.created_at ?? inq.created_at
            const isLastMine = inq.lastMsg?.sender_id === user.id

            return (
              <Link
                key={inq.id}
                href={`/dashboard/messages/${inq.id}`}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
                >
                  {(other?.full_name ?? other?.email ?? '?')[0].toUpperCase()}
                  {inq.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {inq.unread > 9 ? '9+' : inq.unread}
                    </span>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-semibold truncate ${inq.unread > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {other?.full_name ?? other?.email ?? 'Usuario'}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {new Date(lastDate).toLocaleDateString('es-PY', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <p className="text-xs text-purple-500 font-medium truncate mb-0.5">
                    {listingTitle}
                  </p>
                  <p className={`text-xs truncate ${inq.unread > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                    {isLastMine ? 'Tú: ' : ''}{lastText}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" strokeWidth={1.5} />
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

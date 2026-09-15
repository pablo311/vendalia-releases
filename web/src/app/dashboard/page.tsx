import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteListing, updateListingStatus } from '@/app/actions/listings'
import { CATEGORY_LABELS, type Listing } from '@/lib/types'
import {
  Plus, Eye, Pencil, Trash2, MessageSquare, Lock,
  TrendingUp, Store, ChevronRight, User, BarChart3,
  CheckCircle, Clock, PauseCircle, ShoppingBag
} from 'lucide-react'

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`
  return `$${amount}`
}

const STATUS_CONFIG = {
  active:  { label: 'Activo',  icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50'  },
  sold:    { label: 'Vendido', icon: TrendingUp,   color: 'text-gray-500',   bg: 'bg-gray-100'  },
  paused:  { label: 'Pausado', icon: PauseCircle,  color: 'text-amber-600',  bg: 'bg-amber-50'  },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const isSeller = profile?.role === 'seller'
  const firstName = profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Usuario'

  // Datos del vendedor
  const { data: listings } = isSeller
    ? await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    : { data: [] }

  // Consultas recibidas (vendedor) o enviadas (inversor)
  const { data: inquiries } = isSeller
    ? await supabase
        .from('inquiries')
        .select('*, listings(id, title, is_confidential), sender:profiles!inquiries_sender_id_fkey(full_name)')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    : await supabase
        .from('inquiries')
        .select('*, listings(id, title, is_confidential), receiver:profiles!inquiries_receiver_id_fkey(full_name)')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

  // Métricas
  const activeListings = (listings ?? []).filter((l: Listing) => l.status === 'active').length
  const soldListings   = (listings ?? []).filter((l: Listing) => l.status === 'sold').length
  const totalValue     = (listings ?? [])
    .filter((l: Listing) => l.status === 'active')
    .reduce((sum: number, l: Listing) => sum + (l.price ?? 0), 0)

  // Mensajes no leídos: mensajes en chat de otros hacia este usuario
  const inquiryIds = (inquiries ?? []).map((i: { id: string }) => i.id)
  let unreadCount = 0
  if (inquiryIds.length > 0) {
    const { count } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .in('inquiry_id', inquiryIds)
      .eq('is_read', false)
      .neq('sender_id', user.id)
    unreadCount = count ?? 0
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 sm:pb-10">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 pt-8 pb-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">Panel de control</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-heading">Hola, {firstName}</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5">
              {isSeller ? <Store className="h-3.5 w-3.5" strokeWidth={2} /> : <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />}
              {isSeller ? 'Vendedor' : 'Inversor'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSeller && (
              <Link
                href="/dashboard/new"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Publicar
              </Link>
            )}
            <Link
              href="/dashboard/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              title="Mi perfil"
            >
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 mt-6 space-y-5">

        {/* ── Métricas ── */}
        {isSeller ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Activos', value: activeListings, icon: CheckCircle, color: '#22c55e' },
              { label: 'Vendidos', value: soldListings,  icon: TrendingUp,  color: '#a855f7' },
              { label: 'Consultas nuevas', value: unreadCount, icon: MessageSquare, color: '#22d3ee' },
              { label: 'Valor activo', value: totalValue > 0 ? formatCurrency(totalValue) : '—', icon: BarChart3, color: '#f97316' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} strokeWidth={2} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Consultas enviadas', value: inquiries?.length ?? 0, icon: MessageSquare, color: '#a855f7' },
              { label: 'Sin respuesta', value: unreadCount, icon: Clock, color: '#f97316' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Mis Anuncios (solo vendedor) ── */}
        {isSeller && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 font-heading">Mis anuncios</h2>
              {(listings ?? []).length > 0 && (
                <Link href="/listings" className="text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors">
                  Ver todos
                </Link>
              )}
            </div>

            {!listings || listings.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed p-10 text-center">
                <Store className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-4">Todavía no publicaste ningún negocio</p>
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} /> Publicar mi primer negocio
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(listings as Listing[]).map((listing) => {
                  const st = STATUS_CONFIG[listing.status]
                  const StatusIcon = st.icon
                  return (
                    <div key={listing.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-3.5 flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #f3e8ff, #cffafe)' }}>
                        {!listing.is_confidential && listing.images[0] ? (
                          <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {listing.is_confidential
                              ? <Lock className="h-5 w-5 text-purple-300" strokeWidth={1.5} />
                              : <TrendingUp className="h-5 w-5 text-purple-300" strokeWidth={1.5} />}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{listing.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                            <StatusIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
                            {st.label}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {CATEGORY_LABELS[listing.category]} · {formatCurrency(listing.price)}
                          </span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/listings/${listing.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" title="Ver">
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        </Link>
                        <Link href={`/dashboard/edit/${listing.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" title="Editar">
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        </Link>
                        {listing.status !== 'sold' && (
                          <form action={async () => { 'use server'; await updateListingStatus(listing.id, 'sold') }}>
                            <button type="submit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-colors cursor-pointer" title="Marcar como vendido">
                              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </form>
                        )}
                        {listing.status === 'active' && (
                          <form action={async () => { 'use server'; await updateListingStatus(listing.id, 'paused') }}>
                            <button type="submit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors cursor-pointer" title="Pausar">
                              <PauseCircle className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </form>
                        )}
                        {listing.status === 'paused' && (
                          <form action={async () => { 'use server'; await updateListingStatus(listing.id, 'active') }}>
                            <button type="submit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-colors cursor-pointer" title="Reactivar">
                              <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </form>
                        )}
                        <form action={async () => { 'use server'; await deleteListing(listing.id) }}>
                          <button type="submit"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer" title="Eliminar">
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Consultas ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 font-heading flex items-center gap-2">
              {isSeller ? 'Consultas recibidas' : 'Mis consultas'}
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}>
                  {unreadCount}
                </span>
              )}
            </h2>
            <Link href="/dashboard/messages" className="text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors">
              Ver todas
            </Link>
          </div>

          {!inquiries || inquiries.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
              <MessageSquare className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {isSeller ? 'Aún no recibiste consultas.' : 'Aún no enviaste mensajes.'}
              </p>
              {!isSeller && (
                <Link href="/listings"
                  className="inline-block mt-4 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}>
                  Explorar negocios
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {(inquiries as any[]).map((inq) => {
                const other = isSeller ? inq.sender : inq.receiver
                const listingTitle = inq.listings?.is_confidential ? 'Negocio confidencial' : inq.listings?.title
                return (
                  <Link key={inq.id} href={`/listings/${inq.listing_id}`}
                    className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-3.5 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
                      {(other?.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {other?.full_name || 'Usuario'}
                        </p>
                        {!inq.is_read && isSeller && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }} />
                        )}
                      </div>
                      <p className="text-[11px] text-purple-500 font-medium truncate">Re: {listingTitle}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{inq.message}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        {new Date(inq.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: 'short' })}
                      </p>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Acceso rápido al perfil ── */}
        <Link href="/dashboard/profile"
          className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
            {firstName[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{profile?.full_name ?? user.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Editar perfil y contraseña</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" strokeWidth={1.5} />
        </Link>

      </div>
    </div>
  )
}

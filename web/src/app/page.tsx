import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Search, MapPin, TrendingUp, Lock, PlusCircle, Compass, ChevronRight } from 'lucide-react'
import { CategoryFilters } from '@/components/home/category-filters'
import { BottomNav } from '@/components/home/bottom-nav'
import { CATEGORY_LABELS, type Listing } from '@/lib/types'

interface SearchParams {
  q?: string
  category?: string
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`
  }
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

async function getPageData(searchParams: SearchParams) {
  const supabase = await createClient()

  // User profile
  const { data: { user } } = await supabase.auth.getUser()
  let userName = 'Explorador'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    const name = profile?.full_name ?? user.email?.split('@')[0] ?? 'Explorador'
    userName = name.split(' ')[0]
  }

  // Featured listings (4 most recent active)
  const { data: featuredRaw } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4)
  const featured = (featuredRaw as Listing[]) ?? []

  // Recent listings with optional filters (skip first 4)
  let recentQuery = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(4, 11)

  if (searchParams.category && searchParams.category !== 'all') {
    recentQuery = recentQuery.eq('category', searchParams.category)
  }
  if (searchParams.q) {
    recentQuery = recentQuery.or(
      `title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`
    )
  }

  const { data: recentRaw } = await recentQuery
  const recent = (recentRaw as Listing[]) ?? []

  return { userName, featured, recent, user }
}

// ─── Featured Card ────────────────────────────────────────────────────────────
function FeaturedCard({ listing }: { listing: Listing }) {
  const isConfidential = listing.is_confidential
  const title = isConfidential ? `Negocio en ${CATEGORY_LABELS[listing.category]}` : listing.title
  const hasImage = !isConfidential && listing.images.length > 0

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex-none w-56 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm shadow-gray-200/80 dark:shadow-gray-900/60 border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-md hover:shadow-gray-200 transition-shadow duration-200"
    >
      {/* Image area */}
      <div className="relative h-36 overflow-hidden">
        {hasImage ? (
          <img
            src={listing.images[0]}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #cffafe 100%)' }}
          >
            {isConfidential ? (
              <Lock className="h-10 w-10 text-purple-300" strokeWidth={1.5} />
            ) : (
              <TrendingUp className="h-10 w-10 text-purple-300" strokeWidth={1.5} />
            )}
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
            style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}>
            {CATEGORY_LABELS[listing.category]}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">{title}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-2">
          <MapPin className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
          <span className="line-clamp-1">
            {isConfidential ? 'Ubicación confidencial' : listing.location}
          </span>
        </div>
        <p className="text-sm font-bold vendalia-gradient-text">{formatCurrency(listing.price)}</p>
      </div>
    </Link>
  )
}

// ─── Recent Card ──────────────────────────────────────────────────────────────
function RecentCard({ listing }: { listing: Listing }) {
  const isConfidential = listing.is_confidential
  const title = isConfidential ? `Negocio en ${CATEGORY_LABELS[listing.category]}` : listing.title
  const hasImage = !isConfidential && listing.images.length > 0

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm shadow-gray-100/80 hover:shadow-md hover:shadow-gray-200 transition-shadow duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="flex-none w-16 h-16 rounded-xl overflow-hidden">
        {hasImage ? (
          <img
            src={listing.images[0]}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #cffafe 100%)' }}
          >
            {isConfidential ? (
              <Lock className="h-5 w-5 text-purple-300" strokeWidth={1.5} />
            ) : (
              <TrendingUp className="h-5 w-5 text-purple-300" strokeWidth={1.5} />
            )}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{title}</p>
        <div className="flex items-center gap-1 mt-0.5 mb-1">
          <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
            {isConfidential ? 'Ubicación confidencial' : listing.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
            {CATEGORY_LABELS[listing.category]}
          </span>
          {listing.annual_revenue && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatCurrency(listing.annual_revenue)}/año
            </span>
          )}
        </div>
      </div>

      {/* Price + arrow */}
      <div className="flex-none flex flex-col items-end gap-1">
        <p className="text-sm font-bold vendalia-gradient-text whitespace-nowrap">
          {formatCurrency(listing.price)}
        </p>
        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
      </div>
    </Link>
  )
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
function FeaturedSkeleton() {
  return (
    <div className="flex gap-4 px-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-none w-56 h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  )
}

function RecentSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { userName, featured, recent, user } = await getPageData(params)
  const initial = userName?.[0]?.toUpperCase() ?? 'V'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 sm:pb-10">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 px-5 pt-10 pb-5 sm:pt-6">
        {/* Greeting row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">
              Bienvenido de nuevo
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-heading leading-tight">
              Hola, {userName}
            </h1>
          </div>

          {/* Avatar */}
          <Link
            href={user ? '/dashboard' : '/auth/login'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-md"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
            aria-label="Mi perfil"
          >
            {initial}
          </Link>
        </div>

        {/* Search bar — pill shape */}
        <form action="/" method="GET">
          {params.category && params.category !== 'all' && (
            <input type="hidden" name="category" value={params.category} />
          )}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Buscar negocios, franquicias..."
              aria-label="Buscar negocios"
              className="w-full rounded-full bg-gray-100 dark:bg-gray-800 border-0 pl-11 pr-5 py-3.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-shadow"
            />
          </div>
        </form>
      </div>

      {/* ── FEATURED CAROUSEL ──────────────────────────────────────────── */}
      <section className="mt-6 mb-5">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 font-heading">
            Negocios Destacados
          </h2>
          <Link
            href="/listings"
            className="text-sm font-medium vendalia-gradient-text cursor-pointer flex items-center gap-0.5"
          >
            Ver todos
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5}
              style={{ stroke: 'url(#v-grad)' }}
            />
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="v-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
          </Link>
        </div>

        <Suspense fallback={<FeaturedSkeleton />}>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
            {featured.length === 0 ? (
              <div className="flex-none w-56 h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Sin listados aún</p>
              </div>
            ) : (
              featured.map((listing) => (
                <FeaturedCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </Suspense>
      </section>

      {/* ── CATEGORY FILTERS ───────────────────────────────────────────── */}
      <div className="px-5 mb-5">
        <Suspense fallback={<div className="h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />}>
          <CategoryFilters
            activeCategory={params.category ?? 'all'}
            searchQuery={params.q}
          />
        </Suspense>
      </div>

      {/* ── CTA BUTTONS ────────────────────────────────────────────────── */}
      <div className="px-5 mb-6 grid grid-cols-2 gap-3">
        {/* Primary CTA — gradient */}
        <Link
          href="/listings/new"
          className="flex items-center justify-center gap-1.5 rounded-2xl text-white text-sm font-semibold py-4 px-3 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
          style={{
            background: 'linear-gradient(to right, #a855f7, #22d3ee)',
            boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)',
          }}
        >
          <PlusCircle className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
          <span className="leading-tight">Vender mi Negocio</span>
        </Link>

        {/* Secondary CTA — outlined */}
        <Link
          href="/listings"
          className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold py-4 px-3 cursor-pointer hover:border-purple-300 hover:text-purple-600 transition-colors duration-150"
        >
          <Compass className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
          <span className="leading-tight">Explorar Listados</span>
        </Link>
      </div>

      {/* ── RECENT LISTINGS ────────────────────────────────────────────── */}
      <section className="px-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 font-heading mb-3">
          Listados Recientes
        </h2>

        <Suspense fallback={<RecentSkeleton />}>
          {recent.length === 0 ? (
            <div className="text-center py-14 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <TrendingUp className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No hay listados disponibles</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Sé el primero en publicar tu negocio</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((listing) => (
                <RecentCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </Suspense>
      </section>

      {/* ── BOTTOM NAV (mobile only, rendered client-side) ─────────────── */}
      <BottomNav />
    </div>
  )
}

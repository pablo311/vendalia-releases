import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Lock, TrendingUp, ChevronRight, Search, ChevronLeft } from 'lucide-react'
import { CategoryFilters } from '@/components/home/category-filters'
import { CATEGORY_LABELS, type Listing } from '@/lib/types'

const PAGE_SIZE = 20

interface SearchParams {
  q?: string
  category?: string
  price?: string
  page?: string
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`
  return new Intl.NumberFormat('es-PY', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(amount)
}

async function getListings(searchParams: SearchParams): Promise<{ listings: Listing[]; total: number }> {
  const supabase = await createClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (searchParams.q) {
    // Sanitize: remove PostgREST special chars to prevent filter injection
    const safe = searchParams.q.replace(/[%_,."'\\]/g, ' ').trim().substring(0, 100)
    if (safe) {
      query = query.or(
        `title.ilike.%${safe}%,description.ilike.%${safe}%,location.ilike.%${safe}%`
      )
    }
  }
  if (searchParams.category && searchParams.category !== 'all') {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.price && searchParams.price !== 'all') {
    const [min, max] = searchParams.price.split('-').map(Number)
    query = query.gte('price', min).lte('price', max)
  }

  const { data, count } = await query
  return { listings: (data as Listing[]) ?? [], total: count ?? 0 }
}

function ListingRow({ listing }: { listing: Listing }) {
  const isConfidential = listing.is_confidential
  const title = isConfidential ? `Negocio en ${CATEGORY_LABELS[listing.category]}` : listing.title
  const hasImage = !isConfidential && listing.images.length > 0

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex-none w-16 h-16 rounded-xl overflow-hidden">
        {hasImage ? (
          <img src={listing.images[0]} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #cffafe 100%)' }}>
            {isConfidential
              ? <Lock className="h-5 w-5 text-purple-300" strokeWidth={1.5} />
              : <TrendingUp className="h-5 w-5 text-purple-300" strokeWidth={1.5} />}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{title}</p>
        <div className="flex items-center gap-1 mt-0.5 mb-1">
          <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
            {isConfidential ? 'Ubicación confidencial' : listing.location}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
          {CATEGORY_LABELS[listing.category]}
        </span>
      </div>
      <div className="flex-none flex flex-col items-end gap-1">
        <p className="text-sm font-bold whitespace-nowrap" style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {formatCurrency(listing.price)}
        </p>
        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
      </div>
    </Link>
  )
}

function buildPageUrl(params: SearchParams, page: number): string {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.category && params.category !== 'all') sp.set('category', params.category)
  if (params.price && params.price !== 'all') sp.set('price', params.price)
  if (page > 1) sp.set('page', String(page))
  const qs = sp.toString()
  return `/listings${qs ? `?${qs}` : ''}`
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10))
  const { listings, total } = await getListings(params)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 sm:pb-10">
      <div className="bg-white dark:bg-gray-900 px-5 pt-8 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Explorar negocios</h1>
        <form action="/listings" method="GET">
          {params.category && params.category !== 'all' && (
            <input type="hidden" name="category" value={params.category} />
          )}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Buscar negocios, franquicias..."
              className="w-full rounded-full bg-gray-100 dark:bg-gray-800 border-0 pl-11 pr-5 py-3.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-shadow"
            />
          </div>
        </form>
        <Suspense fallback={<div className="h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />}>
          <CategoryFilters activeCategory={params.category ?? 'all'} searchQuery={params.q} />
        </Suspense>
      </div>

      <div className="px-5 mt-5">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          {total} {total === 1 ? 'resultado' : 'resultados'}
          {totalPages > 1 && ` · Página ${currentPage} de ${totalPages}`}
        </p>
        {listings.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <TrendingUp className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No se encontraron negocios</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Probá con otros filtros</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(params, currentPage - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                Anterior
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                Anterior
              </span>
            )}

            <span className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(params, currentPage + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed">
                Siguiente
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

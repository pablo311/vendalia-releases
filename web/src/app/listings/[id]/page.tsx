import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { InquiryForm } from '@/components/listings/inquiry-form'
import { CATEGORY_LABELS, type Listing, type Profile } from '@/lib/types'
import { agreeToNda } from '@/app/actions/listings'
import type { Metadata } from 'next'
import {
  MapPin, Lock, TrendingUp, Calendar, ArrowLeft,
  DollarSign, BarChart3, User, ShieldCheck, FileText,
} from 'lucide-react'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-PY', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ─── SEO metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, category, price, is_confidential, images, location')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!listing) return { title: 'Negocio no encontrado — Vendalia' }

  const category = CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS] ?? listing.category
  const title = listing.is_confidential
    ? `Negocio en ${category} — Vendalia`
    : `${listing.title} | ${category} en ${listing.location} — Vendalia`

  const description = listing.is_confidential
    ? `Negocio confidencial en venta. Categoría: ${category}. Precio: ${formatCurrency(listing.price)}.`
    : listing.description.slice(0, 155)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: listing.images?.[0] ? [{ url: listing.images[0] }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  }
}

// ─── NDA wall ─────────────────────────────────────────────────────────────────
function NdaWall({ listingId }: { listingId: string }) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-8 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
      >
        <ShieldCheck className="h-7 w-7 text-white" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 font-heading mb-2">
        Contenido confidencial
      </h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs mx-auto">
        Para ver el nombre, ubicación exacta y descripción completa de este negocio, aceptá el acuerdo de confidencialidad.
      </p>
      <ul className="text-left text-sm text-gray-600 space-y-2 mb-7 max-w-xs mx-auto">
        {[
          'No compartiré esta información con terceros',
          'No contactaré al vendedor fuera de la plataforma',
          'Usaré la información solo para evaluar esta oportunidad',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            {item}
          </li>
        ))}
      </ul>
      <form action={async () => { 'use server'; await agreeToNda(listingId) }}>
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
        >
          Acepto el acuerdo de confidencialidad
        </button>
      </form>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(full_name, role)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!listing) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const isConfidential = listing.is_confidential
  const seller = listing.profiles as Profile
  const isOwner = user?.id === listing.user_id

  // Check if user signed NDA for this listing
  let hasNda = false
  if (user && isConfidential && !isOwner) {
    const { data: nda } = await supabase
      .from('nda_agreements')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', id)
      .single()
    hasNda = !!nda
  }

  // Reveal confidential data only to owner or NDA-signed users
  const canSeeDetails = !isConfidential || isOwner || hasNda

  const displayTitle = canSeeDetails ? listing.title : `Negocio en ${CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}`
  const displayLocation = canSeeDetails ? listing.location : 'Ubicación confidencial'
  const displayImages = canSeeDetails ? (listing.images ?? []) : []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/listings" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Galería */}
          {displayImages.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              <img
                src={displayImages[0]}
                alt={displayTitle}
                className="w-full h-72 object-cover rounded-xl"
              />
              {displayImages.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {displayImages.slice(1, 4).map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${displayTitle} ${i + 2}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-full h-56 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #cffafe 100%)' }}
            >
              {isConfidential
                ? <Lock className="h-16 w-16 text-purple-200" strokeWidth={1} />
                : <TrendingUp className="h-16 w-16 text-purple-200" strokeWidth={1} />}
            </div>
          )}

          {/* Título y badges */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayTitle}</h1>
              {isConfidential && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                  <Lock className="h-3 w-3 mr-1" /> Confidencial
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">{CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}</Badge>
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4" /> {displayLocation}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" /> {formatDate(listing.created_at)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Descripción o NDA wall */}
          <div>
            <h2 className="text-lg font-semibold dark:text-gray-100 mb-3">Descripción del negocio</h2>
            {canSeeDetails ? (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            ) : user ? (
              <NdaWall listingId={id} />
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
                <Lock className="h-8 w-8 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-gray-500 mb-4">
                  Iniciá sesión para ver la descripción completa y contactar al vendedor.
                </p>
                <Link href={`/auth/login?next=/listings/${id}`}>
                  <Button size="sm">Iniciar sesión</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Métricas financieras */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Precio de venta</span>
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {formatCurrency(listing.price)}
                </p>
              </CardContent>
            </Card>
            {listing.annual_revenue && (
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Facturación anual</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(listing.annual_revenue)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Card vendedor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Publicado por
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {canSeeDetails ? (seller?.full_name ?? 'Vendedor') : 'Vendedor anónimo'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" strokeWidth={2} />
                Vendedor verificado
              </p>
            </CardContent>
          </Card>

          {/* Formulario de contacto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contactar al vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Este es tu anuncio</p>
                  <Link href={`/dashboard/edit/${listing.id}`}>
                    <Button variant="outline" size="sm" className="w-full">Editar anuncio</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="w-full">Ir al panel</Button>
                  </Link>
                </div>
              ) : user ? (
                canSeeDetails || !isConfidential ? (
                  <InquiryForm listingId={listing.id} receiverId={listing.user_id} />
                ) : (
                  <div className="text-center py-3">
                    <p className="text-sm text-gray-500">Aceptá el NDA para contactar al vendedor.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Iniciá sesión para contactar al vendedor
                  </p>
                  <Link href={`/auth/login?next=/listings/${id}`}>
                    <Button className="w-full" size="sm">Iniciar sesión</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline" className="w-full" size="sm">Crear cuenta</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

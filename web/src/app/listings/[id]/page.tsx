import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { InquiryForm } from '@/components/listings/inquiry-form'
import { CATEGORY_LABELS, type Listing, type Profile } from '@/lib/types'
import {
  MapPin, Lock, TrendingUp, Calendar, ArrowLeft,
  DollarSign, BarChart3, User
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

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(full_name, email, role)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!listing) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const isConfidential = listing.is_confidential
  const seller = listing.profiles as Profile
  const isOwner = user?.id === listing.user_id

  const displayTitle = isConfidential ? `Negocio en ${CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}` : listing.title
  const displayLocation = isConfidential ? 'Ubicación confidencial' : listing.location
  const displayImages = isConfidential ? [] : (listing.images ?? [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
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
            <div className="w-full h-56 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
              {isConfidential
                ? <Lock className="h-16 w-16 text-indigo-300" />
                : <TrendingUp className="h-16 w-16 text-indigo-300" />}
            </div>
          )}

          {/* Título y badges */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayTitle}</h1>
              {isConfidential && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 shrink-0">
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

          {/* Descripción */}
          <div>
            <h2 className="text-lg font-semibold dark:text-gray-100 mb-3">Descripción del negocio</h2>
            {isConfidential ? (
              <p className="text-gray-500 dark:text-gray-400 italic">
                La descripción detallada se comparte tras el primer contacto con el vendedor.
              </p>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            )}
          </div>

          {/* Métricas financieras */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Precio de venta</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(listing.price)}</p>
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
                {isConfidential ? 'Vendedor anónimo' : (seller?.full_name ?? 'Vendedor')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vendedor verificado</p>
            </CardContent>
          </Card>

          {/* Formulario de contacto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contactar al vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Este es tu anuncio</p>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="w-full">
                      Gestionar anuncio
                    </Button>
                  </Link>
                </div>
              ) : user ? (
                <InquiryForm
                  listingId={listing.id}
                  receiverId={listing.user_id}
                />
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Iniciá sesión para contactar al vendedor
                  </p>
                  <Link href="/auth/login">
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

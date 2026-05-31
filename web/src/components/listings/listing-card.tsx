import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Lock, TrendingUp } from 'lucide-react'
import { CATEGORY_LABELS, type Listing } from '@/lib/types'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ListingCard({ listing }: { listing: Listing }) {
  const isConfidential = listing.is_confidential
  const displayTitle = isConfidential ? `Negocio en ${CATEGORY_LABELS[listing.category]}` : listing.title
  const displayLocation = isConfidential ? 'Ubicación confidencial' : listing.location
  const hasImage = !isConfidential && listing.images.length > 0

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
        {/* Imagen */}
        <div className="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
          {hasImage ? (
            <img
              src={listing.images[0]}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {isConfidential ? (
                <Lock className="h-12 w-12 text-indigo-300" />
              ) : (
                <TrendingUp className="h-12 w-12 text-indigo-300" />
              )}
            </div>
          )}
          {isConfidential && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-gray-900/70 text-white border-0 text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Confidencial
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="pt-4 pb-2">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
              {displayTitle}
            </h3>
          </div>

          <Badge variant="outline" className="text-xs mb-3">
            {CATEGORY_LABELS[listing.category]}
          </Badge>

          <p className="text-sm text-gray-500 line-clamp-2">
            {isConfidential
              ? 'Información detallada disponible tras contactar al vendedor.'
              : listing.description}
          </p>
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(listing.price)}
            </p>
            {listing.annual_revenue && (
              <p className="text-xs text-gray-500">
                Facturación: {formatCurrency(listing.annual_revenue)}/año
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{displayLocation}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

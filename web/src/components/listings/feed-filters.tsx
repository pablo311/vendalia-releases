'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { CATEGORIES } from '@/lib/types'

const PRICE_RANGES = [
  { label: 'Todos los precios', value: 'all' },
  { label: 'Hasta USD 50.000', value: '0-50000' },
  { label: 'USD 50.000 – 200.000', value: '50000-200000' },
  { label: 'USD 200.000 – 500.000', value: '200000-500000' },
  { label: 'Más de USD 500.000', value: '500000-99999999' },
]

export function FeedFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? 'all'
  const price = searchParams.get('price') ?? 'all'

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      router.push(`/listings?${params.toString()}`)
    },
    [router, searchParams]
  )

  const hasFilters = q || (category && category !== 'all') || (price && price !== 'all')

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Buscar negocios..."
          defaultValue={q}
          onChange={(e) => {
            const val = e.target.value
            clearTimeout((window as any).__searchTimer)
            ;(window as any).__searchTimer = setTimeout(
              () => updateParams({ q: val }),
              400
            )
          }}
        />
      </div>

      {/* Filtro categoría */}
      <Select
        value={category}
        onValueChange={(val) => updateParams({ category: val ?? 'all' })}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro precio */}
      <Select
        value={price}
        onValueChange={(val) => updateParams({ price: val ?? 'all' })}
      >
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="Rango de precio" />
        </SelectTrigger>
        <SelectContent>
          {PRICE_RANGES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Limpiar filtros */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/listings')}
          title="Limpiar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

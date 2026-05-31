'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createListing, updateListing } from '@/app/actions/listings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES, type Listing } from '@/lib/types'
import { Upload, X, Lock, Unlock, Loader2 } from 'lucide-react'

interface ListingFormProps {
  listing?: Listing
  userId: string
}

export function ListingForm({ listing, userId }: ListingFormProps) {
  const isEdit = !!listing
  const formRef = useRef<HTMLFormElement>(null)

  const [isConfidential, setIsConfidential] = useState(listing?.is_confidential ?? false)
  const [category, setCategory] = useState(listing?.category ?? '')
  const [status, setStatus] = useState(listing?.status ?? 'active')
  const [images, setImages] = useState<string[]>(listing?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('listings-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (!uploadError) {
        const { data } = supabase.storage.from('listings-images').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
    }

    setImages((prev) => [...prev, ...newUrls])
    setUploading(false)
    e.target.value = ''
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('is_confidential', String(isConfidential))
      formData.set('category', category)
      if (isEdit) formData.set('status', status)
      images.forEach((url) => formData.append('imageUrls', url))

      if (isEdit && listing) {
        await updateListing(listing.id, formData)
      } else {
        await createListing(formData)
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar el anuncio.')
      setSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Modo confidencial */}
      <div
        className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isConfidential
            ? 'border-amber-400 bg-amber-50'
            : 'border-gray-200 bg-gray-50'
        }`}
        onClick={() => setIsConfidential(!isConfidential)}
      >
        <div className="flex items-center gap-3">
          {isConfidential
            ? <Lock className="h-5 w-5 text-amber-600" />
            : <Unlock className="h-5 w-5 text-gray-400" />}
          <div>
            <p className="font-medium text-sm">
              {isConfidential ? 'Listado privado (confidencial)' : 'Listado público'}
            </p>
            <p className="text-xs text-gray-500">
              {isConfidential
                ? 'Se ocultarán nombre, fotos y ubicación exacta'
                : 'Toda la información será visible'}
            </p>
          </div>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors ${isConfidential ? 'bg-amber-400' : 'bg-gray-300'}`}>
          <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${isConfidential ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título del anuncio <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={listing?.title}
          placeholder="Ej: Restaurante italiano en zona céntrica"
          required
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={listing?.description}
          placeholder="Describí el negocio: historia, operación, empleados, activos incluidos..."
          rows={5}
          required
        />
      </div>

      {/* Precio y Categoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">
            Precio (USD) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1000"
            defaultValue={listing?.price}
            placeholder="150000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>
            Categoría <span className="text-red-500">*</span>
          </Label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? '')} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná una categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="category" value={category} />
        </div>
      </div>

      {/* Ubicación y Facturación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">
            Ubicación <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            name="location"
            defaultValue={listing?.location}
            placeholder="Ej: Asunción, Paraguay"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="annual_revenue">
            Facturación anual (USD) <span className="text-gray-400 font-normal">opcional</span>
          </Label>
          <Input
            id="annual_revenue"
            name="annual_revenue"
            type="number"
            min="0"
            step="1000"
            defaultValue={listing?.annual_revenue ?? ''}
            placeholder="500000"
          />
        </div>
      </div>

      {/* Estado (solo en edición) */}
      {isEdit && (
        <div className="space-y-2">
          <Label>Estado del anuncio</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v as any)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="sold">Vendido</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>
      )}

      {/* Imágenes */}
      {!isConfidential && (
        <div className="space-y-3">
          <Label>Imágenes</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative w-24 h-24 group">
                <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              {uploading
                ? <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                : <Upload className="h-5 w-5 text-gray-400 mb-1" />}
              <span className="text-xs text-gray-400">Subir</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-400">JPG, PNG o WebP. Máx. 5 MB por imagen.</p>
        </div>
      )}

      <Button type="submit" className="w-full sm:w-auto" disabled={submitting || uploading}>
        {submitting ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
        ) : isEdit ? 'Guardar cambios' : 'Publicar anuncio'}
      </Button>
    </form>
  )
}

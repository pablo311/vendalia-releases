import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingForm } from '@/components/listings/listing-form'
import { ArrowLeft } from 'lucide-react'
import type { Listing } from '@/lib/types'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!listing) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar anuncio</h1>
      <p className="text-gray-500 mb-8">Modificá los datos de tu negocio publicado.</p>

      <ListingForm listing={listing as Listing} userId={user.id} />
    </div>
  )
}

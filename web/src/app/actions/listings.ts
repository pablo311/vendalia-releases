'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ListingCategory } from '@/lib/types'

export async function createListing(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const imageUrls = formData.getAll('imageUrls') as string[]

  const payload = {
    user_id: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    category: formData.get('category') as ListingCategory,
    location: formData.get('location') as string,
    annual_revenue: formData.get('annual_revenue')
      ? parseFloat(formData.get('annual_revenue') as string)
      : null,
    is_confidential: formData.get('is_confidential') === 'true',
    images: imageUrls.filter(Boolean),
    status: 'active' as const,
  }

  const { error } = await supabase.from('listings').insert(payload)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/')
  redirect('/dashboard')
}

export async function updateListing(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const imageUrls = formData.getAll('imageUrls') as string[]

  const payload = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    category: formData.get('category') as ListingCategory,
    location: formData.get('location') as string,
    annual_revenue: formData.get('annual_revenue')
      ? parseFloat(formData.get('annual_revenue') as string)
      : null,
    is_confidential: formData.get('is_confidential') === 'true',
    images: imageUrls.filter(Boolean),
    status: formData.get('status') as 'active' | 'sold' | 'paused',
  }

  const { error } = await supabase
    .from('listings')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/')
  redirect('/dashboard')
}

export async function deleteListing(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/')
}

export async function sendInquiry(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const listingId = formData.get('listing_id') as string
  const receiverId = formData.get('receiver_id') as string
  const message = formData.get('message') as string

  if (!message.trim()) throw new Error('El mensaje no puede estar vacío.')

  const { error } = await supabase.from('inquiries').insert({
    listing_id: listingId,
    sender_id: user.id,
    receiver_id: receiverId,
    message: message.trim(),
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/listings/${listingId}`)
}

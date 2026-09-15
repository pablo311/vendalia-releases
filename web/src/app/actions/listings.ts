'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ListingCategory, ListingStatus } from '@/lib/types'
import { sendNewInquiryEmail, sendNewMessageEmail } from '@/lib/email'
import { getContactEmail } from '@/lib/supabase/admin'

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
    status: formData.get('status') as ListingStatus,
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

export async function updateListingStatus(id: string, status: ListingStatus) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/')
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

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: receiverId,
      message: message.trim(),
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Fire email notification (non-blocking)
  try {
    const [senderRes, receiverRes, listingRes, sellerEmail] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase.from('profiles').select('full_name').eq('id', receiverId).single(),
      supabase.from('listings').select('title, is_confidential, category').eq('id', listingId).single(),
      getContactEmail(receiverId),
    ])
    if (sellerEmail && inquiry) {
      const listingTitle = listingRes.data?.is_confidential
        ? `Negocio confidencial`
        : (listingRes.data?.title ?? 'Negocio en Vendalia')
      await sendNewInquiryEmail({
        sellerEmail,
        sellerName: receiverRes.data?.full_name ?? 'Vendedor',
        buyerName: senderRes.data?.full_name ?? user.email ?? 'Inversor',
        listingTitle,
        message: message.trim(),
        inquiryId: inquiry.id,
      })
    }
  } catch {
    // Email failure never blocks the inquiry
  }

  revalidatePath(`/listings/${listingId}`)
}

export async function sendChatMessage(inquiryId: string, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase.from('chat_messages').insert({
    inquiry_id: inquiryId,
    sender_id: user.id,
    content: content.trim(),
  })

  if (error) throw new Error(error.message)

  // Notify the other participant
  try {
    const { data: inq } = await supabase
      .from('inquiries')
      .select(`
        id, listing_id,
        listings(title, is_confidential),
        sender:profiles!inquiries_sender_id_fkey(id, full_name),
        receiver:profiles!inquiries_receiver_id_fkey(id, full_name)
      `)
      .eq('id', inquiryId)
      .single()

    if (inq) {
      type ParticipantRow = { id: string; full_name: string | null }
      type ListingRow = { title: string; is_confidential: boolean }
      const sender = (inq.sender as unknown) as ParticipantRow | null
      const receiver = (inq.receiver as unknown) as ParticipantRow | null
      const other = sender?.id === user.id ? receiver : sender
      const me = sender?.id === user.id ? sender : receiver
      const listing = (inq.listings as unknown) as ListingRow | null
      const recipientEmail = other ? await getContactEmail(other.id) : null

      if (other && recipientEmail) {
        await sendNewMessageEmail({
          recipientEmail,
          recipientName: other.full_name ?? 'Usuario',
          senderName: me?.full_name ?? user.email ?? 'Usuario',
          listingTitle: listing?.is_confidential ? 'Negocio confidencial' : (listing?.title ?? 'Negocio'),
          messagePreview: content.trim().slice(0, 200),
          inquiryId,
        })
      }
    }
  } catch {
    // Email failure never blocks the message
  }
}

export async function agreeToNda(listingId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase
    .from('nda_agreements')
    .upsert({ user_id: user.id, listing_id: listingId }, { onConflict: 'user_id,listing_id' })

  revalidatePath(`/listings/${listingId}`)
}

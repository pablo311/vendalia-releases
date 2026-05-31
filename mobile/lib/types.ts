export type UserRole = 'investor' | 'seller'
export type ListingStatus = 'active' | 'paused' | 'sold'
export type ListingCategory =
  | 'gastronomia' | 'franquicia' | 'tecnologia' | 'retail'
  | 'servicios' | 'salud' | 'educacion' | 'manufactura' | 'otro'

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  gastronomia: 'Gastronomía',
  franquicia: 'Franquicias',
  tecnologia: 'Tecnología',
  retail: 'Retail',
  servicios: 'Servicios',
  salud: 'Salud',
  educacion: 'Educación',
  manufactura: 'Manufactura',
  otro: 'Otro',
}

export interface Profile {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  phone_number: string | null
  company_name: string | null
  bio: string | null
  onboarding_done: boolean
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  category: ListingCategory
  price: number
  location: string
  images: string[]
  is_confidential: boolean
  status: ListingStatus
  annual_revenue: number | null
  created_at: string
}

export interface Inquiry {
  id: string
  listing_id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
}

export interface ChatMessage {
  id: string
  inquiry_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export type UserRole = 'investor' | 'seller' | 'admin'

export type ListingStatus = 'active' | 'sold' | 'paused'

export type ListingCategory =
  | 'gastronomia'
  | 'tecnologia'
  | 'retail'
  | 'servicios'
  | 'salud'
  | 'educacion'
  | 'manufactura'
  | 'franquicia'
  | 'otro'

export interface Profile {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  phone: string | null
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
  price: number
  category: ListingCategory
  location: string
  annual_revenue: number | null
  is_confidential: boolean
  images: string[]
  status: ListingStatus
  created_at: string
  profiles?: Profile
}

export interface Inquiry {
  id: string
  listing_id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
  listings?: Pick<Listing, 'title' | 'is_confidential'>
  sender?: Pick<Profile, 'full_name'>
}

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  gastronomia: 'Gastronomía',
  tecnologia: 'Tecnología',
  retail: 'Retail / Comercio',
  servicios: 'Servicios',
  salud: 'Salud y Bienestar',
  educacion: 'Educación',
  manufactura: 'Manufactura',
  franquicia: 'Franquicia',
  otro: 'Otro',
}

export const CATEGORIES = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as ListingCategory, label })
)

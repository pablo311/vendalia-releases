import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /onboarding/check
// Usuarios que ya tenían cuenta y entran con Google:
// si ya completaron el onboarding → /dashboard, si no → /onboarding
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_done')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_done) {
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  return NextResponse.redirect(`${origin}/onboarding`)
}

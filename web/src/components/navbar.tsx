import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/auth/user-menu'
import { VendaliaLogo } from '@/components/vendalia-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { NavLinks, NavAuthButtons } from '@/components/nav-links'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="cursor-pointer">
            <VendaliaLogo height={30} />
          </Link>

          <div className="flex items-center gap-3">
            <NavLinks />
            <LanguageToggle />
            <ThemeToggle />
            {user ? (
              <UserMenu
                fullName={profile?.full_name ?? null}
                email={user.email ?? ''}
                role={profile?.role ?? 'investor'}
              />
            ) : (
              <NavAuthButtons />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

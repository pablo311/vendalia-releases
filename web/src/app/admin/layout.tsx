import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Users, Store, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-5 py-6 border-b border-gray-800">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Vendalia</p>
          <p className="text-sm font-bold text-white">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
            Resumen
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            Usuarios
          </Link>
          <Link href="/admin/listings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
            <Store className="h-4 w-4" strokeWidth={1.5} />
            Anuncios
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 truncate px-3 mb-1">{profile?.full_name ?? user.email}</p>
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Volver al dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

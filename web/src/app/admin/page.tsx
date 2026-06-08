import { createClient } from '@/lib/supabase/server'
import { Users, Store, MessageSquare, TrendingUp } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalListings },
    { count: activeListings },
    { count: totalInquiries },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Usuarios totales', value: totalUsers ?? 0, icon: Users, color: '#a855f7' },
    { label: 'Anuncios totales', value: totalListings ?? 0, icon: Store, color: '#22d3ee' },
    { label: 'Anuncios activos', value: activeListings ?? 0, icon: TrendingUp, color: '#22c55e' },
    { label: 'Consultas', value: totalInquiries ?? 0, icon: MessageSquare, color: '#f97316' },
  ]

  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Resumen</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 rounded-2xl border border-gray-800 px-5 py-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} strokeWidth={2} />
              <p className="text-xs text-gray-400 font-medium">{label}</p>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

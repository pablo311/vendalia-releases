import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, type Listing } from '@/lib/types'

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`
  return `$${amount}`
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-900 text-green-300',
  paused: 'bg-amber-900 text-amber-300',
  sold:   'bg-gray-800 text-gray-400',
}

export default async function AdminListingsPage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Anuncios ({listings?.length ?? 0})</h1>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Título</th>
              <th className="text-left px-5 py-3 font-medium">Vendedor</th>
              <th className="text-left px-5 py-3 font-medium">Categoría</th>
              <th className="text-left px-5 py-3 font-medium">Precio</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="text-left px-5 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {((listings ?? []) as (Listing & { profiles: { full_name: string | null; email: string } | null })[]).map((l) => (
              <tr key={l.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-3 text-gray-200 font-medium max-w-[200px] truncate">{l.title}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{l.profiles?.full_name ?? l.profiles?.email ?? '—'}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{CATEGORY_LABELS[l.category]}</td>
                <td className="px-5 py-3 text-gray-300 font-medium">{formatCurrency(l.price)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[l.status] ?? 'bg-gray-800 text-gray-400'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {new Date(l.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

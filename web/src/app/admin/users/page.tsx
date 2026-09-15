import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Los emails solo salen de esta RPC, que rechaza a quien no es admin
  const { data } = await supabase
    .rpc('admin_list_profiles')
    .limit(100)
  const users = data as Profile[] | null

  const ROLE_BADGE: Record<string, string> = {
    investor: 'bg-blue-900 text-blue-300',
    seller:   'bg-purple-900 text-purple-300',
    admin:    'bg-red-900 text-red-300',
  }

  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Usuarios ({users?.length ?? 0})</h1>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Nombre</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Rol</th>
              <th className="text-left px-5 py-3 font-medium">Onboarding</th>
              <th className="text-left px-5 py-3 font-medium">Registro</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-3 text-gray-200 font-medium">{u.full_name ?? '—'}</td>
                <td className="px-5 py-3 text-gray-400">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role] ?? 'bg-gray-800 text-gray-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium ${u.onboarding_done ? 'text-green-400' : 'text-amber-400'}`}>
                    {u.onboarding_done ? 'Completo' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {new Date(u.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

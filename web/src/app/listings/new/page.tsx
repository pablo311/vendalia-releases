import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// /listings/new → redirige a /dashboard/new (solo vendedores)
// Si es inversor, redirige a /auth/register para cambiar de rol
export default async function ListingsNewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/listings/new')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'seller') {
    redirect('/dashboard/new')
  }

  // Inversor intentando publicar — mostrar mensaje orientativo
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f3e8ff, #cffafe)' }}
        >
          <span className="text-2xl">🏪</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Cuenta de Vendedor</h2>
        <p className="text-sm text-gray-500 mb-6">
          Tu cuenta actual es de <strong>Inversor</strong>. Para publicar negocios necesitás una cuenta de Vendedor.
        </p>
        <a
          href="/dashboard"
          className="block w-full py-3 rounded-2xl text-white text-sm font-semibold text-center"
          style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
        >
          Ir a mi panel
        </a>
      </div>
    </div>
  )
}

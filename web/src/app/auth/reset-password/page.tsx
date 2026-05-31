'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  // Supabase envía el token en el hash de la URL — lo intercambia por sesión
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })
  }, [])

  function strength(p: string) {
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('No se pudo actualizar. El enlace puede haber expirado.')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  const s = strength(password)
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Fuerte']

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} aria-hidden="true" />

      <header className="relative flex items-center px-6 py-5 sm:px-10">
        <Link href="/landing" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
            <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-gray-900 font-heading tracking-tight">Vendalia</span>
        </Link>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 px-8 py-10 sm:px-10">

            {done ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
                  <CheckCircle className="h-7 w-7 text-white" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 font-heading mb-3">¡Contraseña actualizada!</h1>
                <p className="text-sm text-gray-500 mb-6">Redirigiendo a tu panel...</p>
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-purple-50">
                    <Lock className="h-7 w-7 text-purple-500" strokeWidth={1.5} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-gray-900 font-heading mb-2">Nueva contraseña</h1>
                  <p className="text-sm text-gray-500">Elegí una contraseña segura para tu cuenta.</p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Nueva contraseña */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Nueva contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
                      <input
                        id="password" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                        value={password} onChange={(e) => setPassword(e.target.value)} required
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
                      />
                    </div>
                    {/* Barra de fortaleza */}
                    {password.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                              style={{ background: s >= i ? strengthColors[s - 1] : '#e5e7eb' }} />
                          ))}
                        </div>
                        <p className="text-[11px] font-medium" style={{ color: s > 0 ? strengthColors[s - 1] : '#9ca3af' }}>
                          {s > 0 ? strengthLabels[s - 1] : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirmar */}
                  <div className="space-y-1.5">
                    <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700">Confirmar contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
                      <input
                        id="confirm" type="password" autoComplete="new-password" placeholder="Repetí la contraseña"
                        value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                        className={`w-full rounded-xl bg-gray-50 border pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                          confirm && confirm !== password
                            ? 'border-red-300 focus:ring-red-400/40 focus:border-red-400'
                            : 'border-gray-200 focus:ring-purple-400/40 focus:border-purple-400'
                        }`}
                      />
                    </div>
                    {confirm && confirm !== password && (
                      <p className="text-[11px] text-red-500">Las contraseñas no coinciden.</p>
                    )}
                  </div>

                  {/* Requisitos */}
                  <ul className="space-y-1.5 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                    {[
                      { ok: password.length >= 8, label: 'Al menos 8 caracteres' },
                      { ok: /[A-Z]/.test(password), label: 'Una letra mayúscula' },
                      { ok: /[0-9]/.test(password), label: 'Un número' },
                      { ok: /[^A-Za-z0-9]/.test(password), label: 'Un carácter especial (!@#$...)' },
                    ].map(({ ok, label }) => (
                      <li key={label} className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-colors ${ok ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                          {ok ? '✓' : '·'}
                        </span>
                        <span className={ok ? 'text-green-600 font-medium' : ''}>{label}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="submit" disabled={loading || (!!confirm && confirm !== password)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shadow-lg"
                    style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)', boxShadow: '0 8px 24px rgba(168,85,247,0.3)' }}
                  >
                    {loading ? (
                      <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Actualizando...</>
                    ) : (
                      <>Actualizar contraseña <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

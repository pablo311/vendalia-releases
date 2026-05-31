'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('Ocurrió un error. Verificá el email ingresado.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} aria-hidden="true" />

      <header className="relative flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/landing" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
            <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-gray-900 font-heading tracking-tight">Vendalia</span>
        </Link>
        <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          ← Volver al login
        </Link>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 px-8 py-10 sm:px-10">

            {sent ? (
              /* ── Éxito ── */
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
                  <CheckCircle className="h-7 w-7 text-white" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 font-heading mb-3">
                  Revisá tu email
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed mb-2">
                  Enviamos un enlace de recuperación a:
                </p>
                <p className="text-sm font-semibold text-purple-600 mb-6">{email}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-8">
                  Si no lo ves en unos minutos, revisá la carpeta de spam. El enlace expira en 1 hora.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-2xl text-white text-sm font-bold py-3.5 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
                >
                  Ir al login
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              </div>
            ) : (
              /* ── Formulario ── */
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-purple-50">
                    <Mail className="h-7 w-7 text-purple-500" strokeWidth={1.5} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-gray-900 font-heading mb-2">
                    Recuperar contraseña
                  </h1>
                  <p className="text-sm text-gray-500">
                    Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
                      <input
                        id="email" type="email" autoComplete="email" placeholder="tu@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shadow-lg"
                    style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)', boxShadow: '0 8px 24px rgba(168,85,247,0.3)' }}
                  >
                    {loading ? (
                      <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Enviando...</>
                    ) : (
                      <>Enviar enlace <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>
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

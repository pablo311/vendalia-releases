'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GoogleButton } from '@/components/auth/google-button'
import { Store, Mail, Lock, User, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { VendaliaLogo } from '@/components/vendalia-logo'
import type { UserRole } from '@/lib/types'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<UserRole>('investor')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      setError(
        error.message === 'User already registered'
          ? 'Ya existe una cuenta con ese email. Iniciá sesión.'
          : error.message
      )
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Background glows */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }}
        aria-hidden="true"
      />

      {/* Top bar */}
      <header className="relative flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/landing" className="cursor-pointer">
          <VendaliaLogo height={28} />
        </Link>
        <Link
          href="/auth/login"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          ¿Ya tenés cuenta?{' '}
          <span
            className="font-semibold"
            style={{
              background: 'linear-gradient(to right, #a855f7, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Ingresar
          </span>
        </Link>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 px-8 py-10 sm:px-10">

            {step === 'role' ? (
              <>
                {/* Step 1: Elegir rol */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-extrabold text-gray-900 font-heading mb-2">
                    Crear cuenta gratis
                  </h1>
                  <p className="text-sm text-gray-500">¿Cuál es tu objetivo en Vendalia?</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole('investor')}
                    className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      role === 'investor' ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={role === 'investor'
                        ? { background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }
                        : { background: '#f3f4f6' }}
                    >
                      <TrendingUp className={`h-5 w-5 ${role === 'investor' ? 'text-white' : 'text-gray-400'}`} strokeWidth={2} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${role === 'investor' ? 'text-purple-700' : 'text-gray-700'}`}>Inversor</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">Busco negocios para comprar</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      role === 'seller' ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={role === 'seller'
                        ? { background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }
                        : { background: '#f3f4f6' }}
                    >
                      <Store className={`h-5 w-5 ${role === 'seller' ? 'text-white' : 'text-gray-400'}`} strokeWidth={2} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${role === 'seller' ? 'text-purple-700' : 'text-gray-700'}`}>Vendedor</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">Quiero vender mi negocio</p>
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                    boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
                  }}
                >
                  Continuar como {role === 'investor' ? 'Inversor' : 'Vendedor'}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium">o registrate con</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <GoogleButton
                  label="Registrarse con Google"
                  redirectTo="/auth/callback?next=/onboarding"
                />
              </>
            ) : (
              <>
                {/* Step 2: Datos de cuenta */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setStep('role')}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mb-4 flex items-center gap-1"
                  >
                    ← Volver
                  </button>
                  <h1 className="text-2xl font-extrabold text-gray-900 font-heading mb-1">Tus datos</h1>
                  <p className="text-sm text-gray-500">
                    Cuenta de{' '}
                    <span className="font-semibold text-purple-600">
                      {role === 'investor' ? 'Inversor' : 'Vendedor'}
                    </span>
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-sm text-red-600 leading-snug">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
                      <input
                        id="fullName" type="text" autoComplete="name" placeholder="Juan Pérez"
                        value={fullName} onChange={(e) => setFullName(e.target.value)} required
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
                      />
                    </div>
                  </div>

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

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
                      <input
                        id="password" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                        value={password} onChange={(e) => setPassword(e.target.value)} required
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
                      />
                    </div>
                    {password.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{
                              background: password.length >= i * 3
                                ? i <= 1 ? '#ef4444' : i <= 2 ? '#f97316' : i <= 3 ? '#eab308' : '#22c55e'
                                : '#e5e7eb',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 mt-2 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shadow-lg"
                    style={{
                      background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                      boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    {loading ? (
                      <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creando cuenta...</>
                    ) : (
                      <>Crear cuenta <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-5">
                  Al registrarte aceptás nuestros{' '}
                  <a href="/terms" className="text-purple-500 hover:underline">Términos</a> y{' '}
                  <a href="/privacy" className="text-purple-500 hover:underline">Privacidad</a>.
                </p>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Tu información está protegida con cifrado de extremo a extremo.
          </p>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GoogleButton } from '@/components/auth/google-button'
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { VendaliaLogo } from '@/components/vendalia-logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos. Verificá tus datos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Background decorations */}
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

      {/* Minimal top bar */}
      <header className="relative flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/landing" className="cursor-pointer">
          <VendaliaLogo height={28} />
        </Link>
        <Link
          href="/auth/register"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          ¿No tenés cuenta?{' '}
          <span
            className="font-semibold"
            style={{
              background: 'linear-gradient(to right, #a855f7, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Registrarse
          </span>
        </Link>
      </header>

      {/* Form area */}
      <main className="relative flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">

          {/* Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 px-8 py-10 sm:px-10">

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900 font-heading mb-2">
                Bienvenido de nuevo
              </h1>
              <p className="text-sm text-gray-500">
                Ingresá a tu cuenta para continuar
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 mb-6">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-sm text-red-600 leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Contraseña
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-purple-500 hover:text-purple-700 transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 mt-2 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                  boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                      aria-hidden="true"
                    />
                    Ingresando...
                  </>
                ) : (
                  <>
                    Ingresar
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">o continuá con</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Google OAuth */}
            <GoogleButton
              label="Ingresar con Google"
              redirectTo="/auth/callback?next=/onboarding/check"
            />

            <div className="mt-6" />

            {/* Register link */}
            <p className="text-center text-sm text-gray-500">
              ¿No tenés cuenta?{' '}
              <Link
                href="/auth/register"
                className="font-semibold cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Crear cuenta gratis
              </Link>
            </p>
          </div>

          {/* Trust note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Tu información está protegida con cifrado de extremo a extremo.
          </p>
        </div>
      </main>
    </div>
  )
}

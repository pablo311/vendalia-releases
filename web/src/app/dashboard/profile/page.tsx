'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  User, Phone, Building2, FileText, Lock,
  ArrowLeft, CheckCircle, AlertCircle, Loader2,
  TrendingUp, Store, ArrowRight
} from 'lucide-react'
import type { UserRole } from '@/lib/types'

type Section = 'profile' | 'password'

export default function ProfilePage() {
  const router = useRouter()
  const [section, setSection] = useState<Section>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [bio, setBio] = useState('')
  const [role, setRole] = useState<UserRole>('investor')
  const [email, setEmail] = useState('')

  // Password fields
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email ?? '')
      supabase
        .from('profiles')
        .select('full_name, phone_number, company_name, bio, role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFullName(data.full_name ?? '')
            setPhoneNumber(data.phone_number ?? '')
            setCompanyName(data.company_name ?? '')
            setBio(data.bio ?? '')
            setRole((data.role as UserRole) ?? 'investor')
          }
          setLoading(false)
        })
    })
  }, [router])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!fullName.trim()) { setError('El nombre es obligatorio.'); return }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || null,
        company_name: companyName.trim() || null,
        bio: bio.trim() || null,
        role,
      })
      .eq('id', user.id)

    setSaving(false)
    if (err) { setError('Error al guardar. Intentá de nuevo.'); return }
    setSuccess('Perfil actualizado correctamente.')
    router.refresh()
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (newPassword.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden.'); return }

    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)

    if (err) { setError('No se pudo actualizar la contraseña.'); return }
    setSuccess('Contraseña actualizada.')
    setNewPassword(''); setConfirmPassword('')
  }

  function strengthLevel(p: string) {
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  const s = strengthLevel(newPassword)
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 sm:pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 pt-8 pb-5">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Volver al panel
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-heading">Mi perfil</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{email}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 mt-6 space-y-4">

        {/* Tab selector */}
        <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-1 gap-1">
          {(['profile', 'password'] as Section[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSection(s); setError(''); setSuccess('') }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                section === s
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              style={section === s ? { background: 'linear-gradient(to right, #a855f7, #22d3ee)' } : {}}
            >
              {s === 'profile' ? 'Datos del perfil' : 'Contraseña'}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-3 rounded-2xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" strokeWidth={2} />
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" strokeWidth={2} />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* ── SECCIÓN: Perfil ──────────────────────────────────────────────── */}
        {section === 'profile' && (
          <form onSubmit={saveProfile}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-7 space-y-5">

              {/* Rol */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tipo de cuenta</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'investor', icon: TrendingUp, title: 'Inversor' },
                    { value: 'seller', icon: Store, title: 'Vendedor' },
                  ] as const).map(({ value, icon: Icon, title }) => (
                    <button
                      key={value} type="button" onClick={() => setRole(value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                        role === value ? 'border-purple-400 bg-purple-50 dark:bg-purple-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${role === value ? 'text-purple-500' : 'text-gray-400 dark:text-gray-500'}`} strokeWidth={2} />
                      <span className={`text-sm font-semibold ${role === value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>{title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <Field label="Nombre completo *" htmlFor="fullName" icon={<User className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}>
                <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez" required
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all" />
              </Field>

              {/* Teléfono */}
              <Field label="Teléfono" htmlFor="phone" icon={<Phone className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}>
                <input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+595 981 123456"
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all" />
              </Field>

              {/* Empresa */}
              <Field label={role === 'seller' ? 'Empresa / Negocio' : 'Empresa / Fondo'} htmlFor="company"
                icon={<Building2 className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}>
                <input id="company" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={role === 'seller' ? 'Ej: Mi Empresa S.A.' : 'Ej: Capital Partners'}
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all" />
              </Field>

              {/* Bio */}
              <div className="space-y-1.5">
                <label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                  Sobre vos
                </label>
                <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tu experiencia, sectores de interés..."
                  rows={3} maxLength={400}
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all resize-none" />
                <p className="text-[11px] text-gray-400 dark:text-gray-500 text-right">{bio.length}/400</p>
              </div>

              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shadow-lg"
                style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)', boxShadow: '0 8px 24px rgba(168,85,247,0.25)' }}
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <>Guardar cambios <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── SECCIÓN: Contraseña ──────────────────────────────────────────── */}
        {section === 'password' && (
          <form onSubmit={savePassword}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-7 space-y-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Si iniciaste sesión con Google, establecé una contraseña para también poder acceder con email y contraseña.
              </p>

              <Field label="Nueva contraseña" htmlFor="newPass" icon={<Lock className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}>
                <input id="newPass" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all" />
              </Field>

              {newPassword.length > 0 && (
                <div className="space-y-1 -mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{ background: s >= i ? strengthColors[s - 1] : '#e5e7eb' }} />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: s > 0 ? strengthColors[s - 1] : '#9ca3af' }}>
                    {['', 'Muy débil', 'Débil', 'Regular', 'Fuerte'][s]}
                  </p>
                </div>
              )}

              <Field label="Confirmar contraseña" htmlFor="confirmPass" icon={<Lock className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}>
                <input id="confirmPass" type="password" autoComplete="new-password" placeholder="Repetí la contraseña"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className={`w-full rounded-xl bg-gray-50 dark:bg-gray-800 border pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-400/40' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-400/40 focus:border-purple-400'
                  }`} />
              </Field>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-red-500 -mt-2">Las contraseñas no coinciden.</p>
              )}

              <button type="submit" disabled={saving || (!!confirmPassword && confirmPassword !== newPassword)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shadow-lg"
                style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)', boxShadow: '0 8px 24px rgba(168,85,247,0.25)' }}
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Actualizando...</> : <>Actualizar contraseña <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, htmlFor, icon, children }: {
  label: string; htmlFor: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
        {children}
      </div>
    </div>
  )
}

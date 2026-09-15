'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  TrendingUp, Store, User, Phone, Building2,
  FileText, CheckCircle, ArrowRight, Loader2
} from 'lucide-react'
import type { Profile, UserRole } from '@/lib/types'

// ─── Validation helpers ───────────────────────────────────────────────────────
function validatePhone(phone: string) {
  return /^\+?[\d\s\-().]{7,20}$/.test(phone.trim())
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            background:
              i < current
                ? 'linear-gradient(to right, #a855f7, #22d3ee)'
                : i === current
                ? 'linear-gradient(to right, #a855f7, #22d3ee)'
                : '#e5e7eb',
          }}
        />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [role, setRole] = useState<UserRole>('investor')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [bio, setBio] = useState('')

  // Pre-fill from existing profile (Google OAuth may bring name)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      // El teléfono no se expone en profiles: el perfil propio completo sale de la RPC
      supabase
        .rpc('get_my_profile')
        .single<Profile>()
        .then(({ data }) => {
          if (data?.onboarding_done) { router.push('/dashboard'); return }
          if (data?.full_name) setFullName(data.full_name)
          if (data?.role) setRole(data.role as UserRole)
          if (data?.phone_number) setPhoneNumber(data.phone_number)
          if (data?.company_name) setCompanyName(data.company_name)
          if (data?.bio) setBio(data.bio)
        })
    })
  }, [router])

  // ── Step validation ──────────────────────────────────────────────────────
  function canProceed(): { ok: boolean; msg: string } {
    if (step === 1) {
      if (!fullName.trim()) return { ok: false, msg: 'Ingresá tu nombre completo.' }
      if (!phoneNumber.trim()) return { ok: false, msg: 'El teléfono es obligatorio.' }
      if (!validatePhone(phoneNumber)) return { ok: false, msg: 'Formato de teléfono inválido. Ej: +595 981 123456' }
    }
    return { ok: true, msg: '' }
  }

  function handleNext() {
    const { ok, msg } = canProceed()
    if (!ok) { setError(msg); return }
    setError('')
    setStep((s) => s + 1)
  }

  // ── Final save ────────────────────────────────────────────────────────────
  async function handleFinish() {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error: err } = await supabase
      .from('profiles')
      .update({
        role,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        company_name: companyName.trim() || null,
        bio: bio.trim() || null,
        onboarding_done: true,
      })
      .eq('id', user.id)

    if (err) {
      setError('Ocurrió un error al guardar. Intentá de nuevo.')
      setSaving(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const TOTAL_STEPS = 4

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Background glows */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[350px] h-[350px] rounded-full opacity-[0.05] blur-3xl"
        style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }}
        aria-hidden="true"
      />

      {/* Logo */}
      <header className="relative flex items-center px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
          >
            <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-gray-100 font-heading tracking-tight">Vendalia</span>
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-[460px]">
          <StepDots current={step} total={TOTAL_STEPS} />

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-gray-900/40 px-8 py-10 sm:px-10">

            {/* ── STEP 0: Rol ─────────────────────────────────────────────── */}
            {step === 0 && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 font-heading mb-2">
                    ¿Cómo usarás Vendalia?
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Podés cambiarlo después desde tu perfil.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {([
                    { value: 'investor', icon: TrendingUp, title: 'Inversor', desc: 'Busco oportunidades de compra o inversión' },
                    { value: 'seller', icon: Store, title: 'Vendedor', desc: 'Tengo un negocio o franquicia para vender' },
                  ] as const).map(({ value, icon: Icon, title, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        role === value ? 'border-purple-400 bg-purple-50 dark:bg-purple-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={role === value
                          ? { background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }
                          : { background: '#f3f4f6' }}
                      >
                        <Icon className={`h-6 w-6 ${role === value ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} strokeWidth={2} />
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${role === value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{title}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <NextButton label="Continuar" onClick={handleNext} />
              </>
            )}

            {/* ── STEP 1: Datos personales ─────────────────────────────────── */}
            {step === 1 && (
              <>
                <div className="mb-7">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 font-heading mb-1">Datos personales</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Necesitamos verificar tu identidad.</p>
                </div>

                {error && <ErrorBox msg={error} />}

                <div className="space-y-4">
                  {/* Nombre */}
                  <FieldGroup label="Nombre completo *" htmlFor="fullName">
                    <FieldInput
                      id="fullName" type="text" placeholder="Juan Pérez"
                      icon={<User className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}
                      value={fullName} onChange={setFullName}
                    />
                  </FieldGroup>

                  {/* Teléfono */}
                  <FieldGroup label="Teléfono de contacto *" htmlFor="phone">
                    <FieldInput
                      id="phone" type="tel" placeholder="+595 981 123456"
                      icon={<Phone className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}
                      value={phoneNumber} onChange={setPhoneNumber}
                    />
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                      Formato internacional. No será público.
                    </p>
                  </FieldGroup>
                </div>

                <div className="flex gap-3 mt-8">
                  <BackButton onClick={() => { setError(''); setStep(0) }} />
                  <NextButton label="Continuar" onClick={handleNext} flex1 />
                </div>
              </>
            )}

            {/* ── STEP 2: Datos profesionales ──────────────────────────────── */}
            {step === 2 && (
              <>
                <div className="mb-7">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 font-heading mb-1">Perfil profesional</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role === 'seller'
                      ? 'Información sobre tu empresa o emprendimiento.'
                      : 'Cuéntanos sobre tu experiencia como inversor.'}
                    {' '}(Opcional)
                  </p>
                </div>

                <div className="space-y-4">
                  <FieldGroup
                    label={role === 'seller' ? 'Nombre de tu empresa' : 'Empresa / Fondo de inversión'}
                    htmlFor="company"
                  >
                    <FieldInput
                      id="company" type="text"
                      placeholder={role === 'seller' ? 'Ej: Café Monteverde S.A.' : 'Ej: Capital PY Partners'}
                      icon={<Building2 className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}
                      value={companyName} onChange={setCompanyName}
                    />
                  </FieldGroup>

                  <FieldGroup label="Sobre vos" htmlFor="bio">
                    <textarea
                      id="bio"
                      placeholder={
                        role === 'seller'
                          ? 'Breve descripción de tu trayectoria o el tipo de negocio que manejás...'
                          : 'Tu experiencia, sectores de interés, ticket mínimo de inversión...'
                      }
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      maxLength={400}
                      className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all resize-none"
                    />
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 text-right">{bio.length}/400</p>
                  </FieldGroup>
                </div>

                <div className="flex gap-3 mt-8">
                  <BackButton onClick={() => setStep(1)} />
                  <NextButton label="Continuar" onClick={() => { setError(''); setStep(3) }} flex1 />
                </div>
              </>
            )}

            {/* ── STEP 3: Confirmación ─────────────────────────────────────── */}
            {step === 3 && (
              <>
                <div className="text-center mb-8">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
                  >
                    <FileText className="h-7 w-7 text-white" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 font-heading mb-2">
                    Confirmá tus datos
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revisá antes de finalizar.</p>
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-8">
                  {[
                    { label: 'Rol', value: role === 'investor' ? 'Inversor' : 'Vendedor' },
                    { label: 'Nombre', value: fullName },
                    { label: 'Teléfono', value: phoneNumber },
                    { label: 'Empresa', value: companyName || '—' },
                    { label: 'Sobre vos', value: bio || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5 break-words">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {error && <ErrorBox msg={error} />}

                <div className="flex gap-3">
                  <BackButton onClick={() => setStep(2)} />
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shadow-lg"
                    style={{
                      background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                      boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    {saving ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4" strokeWidth={2} /> Finalizar</>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function FieldGroup({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  )
}

function FieldInput({
  id, type, placeholder, icon, value, onChange,
}: {
  id: string; type: string; placeholder: string
  icon: React.ReactNode; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
      <input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
      />
    </div>
  )
}

function NextButton({ label, onClick, flex1 }: { label: string; onClick: () => void; flex1?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${flex1 ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold py-3.5 cursor-pointer hover:opacity-90 transition-opacity shadow-lg`}
      style={{
        background: 'linear-gradient(to right, #a855f7, #22d3ee)',
        boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
      }}
    >
      {label}
      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
    </button>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      ← Atrás
    </button>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 px-4 py-3 mb-5">
      <span className="text-red-500 dark:text-red-400 text-sm font-medium leading-snug">{msg}</span>
    </div>
  )
}

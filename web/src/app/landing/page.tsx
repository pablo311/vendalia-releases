import Link from 'next/link'
import {
  Shield,
  UserCheck,
  Zap,
  MapPin,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Building2,
  BarChart3,
} from 'lucide-react'
import { LandingHeader } from '@/components/landing/landing-header'
import { VendaliaLogo } from '@/components/vendalia-logo'

// ─── Mock listing data ────────────────────────────────────────────────────────
const FEATURED_LISTINGS = [
  {
    id: 1,
    title: 'Plataforma SaaS de Gestión Empresarial',
    category: 'Tecnología',
    location: 'Asunción, PY',
    revenue: '$180K',
    price: '$1.2M',
    icon: Zap,
    badge: 'Destacado',
    bgFrom: '#f3e8ff',
    bgTo: '#e0f2fe',
  },
  {
    id: 2,
    title: 'Franquicia de Café & Coworking',
    category: 'Gastronomía',
    location: 'Ciudad del Este, PY',
    revenue: '$95K',
    price: '$380K',
    icon: Building2,
    badge: 'Nuevo',
    bgFrom: '#fdf2f8',
    bgTo: '#fce7f3',
  },
  {
    id: 3,
    title: 'Clínica Odontológica Premium',
    category: 'Salud',
    location: 'Encarnación, PY',
    revenue: '$140K',
    price: '$520K',
    icon: BarChart3,
    badge: 'Verificado',
    bgFrom: '#f0fdf4',
    bgTo: '#dcfce7',
  },
]

const VALUE_PROPS = [
  {
    icon: Shield,
    title: 'Confidencialidad Total',
    desc: 'Nuestro algoritmo oculta automáticamente datos sensibles. Solo los inversores verificados acceden a la información completa tras firmar un NDA digital.',
  },
  {
    icon: UserCheck,
    title: 'Inversores Verificados',
    desc: 'Cada inversor pasa por un proceso de verificación de identidad y capacidad financiera. Sin curiosos ni competidores — solo capital real.',
  },
  {
    icon: Zap,
    title: 'Proceso Tech-Enabled',
    desc: 'Valoración asistida por IA, due diligence simplificado y firma digital de documentos. Cierra operaciones en semanas, no en meses.',
  },
]

const TRUST_STATS = [
  { value: '127+', label: 'Negocios listados' },
  { value: '$47M+', label: 'En transacciones' },
  { value: '340+', label: 'Inversores verificados' },
  { value: '98%', label: 'Confidencialidad' },
]

// ─── Components ───────────────────────────────────────────────────────────────

function GradientIcon({ Icon }: { Icon: React.ElementType }) {
  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #cffafe 100%)' }}
    >
      <Icon className="h-7 w-7 text-purple-500" strokeWidth={1.5} />
    </div>
  )
}

function ValueCard({
  icon,
  title,
  desc,
}: {
  icon: React.ElementType
  title: string
  desc: string
}) {
  return (
    <div className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-200 cursor-default">
      <GradientIcon Icon={icon} />
      <h3 className="text-lg font-bold text-gray-900 font-heading mb-3">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      <div className="mt-5 flex items-center gap-1.5">
        <CheckCircle className="h-4 w-4 text-purple-400" strokeWidth={2} />
        <span className="text-xs font-semibold text-purple-500">Incluido en todos los planes</span>
      </div>
    </div>
  )
}

function ListingCard({
  listing,
}: {
  listing: (typeof FEATURED_LISTINGS)[number]
}) {
  const { icon: Icon, title, category, location, revenue, price, badge, bgFrom, bgTo } = listing
  return (
    <div className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1.5 transition-all duration-200 overflow-hidden cursor-pointer">
      {/* Image area */}
      <div
        className="h-44 relative flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)` }}
      >
        <Icon className="h-14 w-14 text-gray-300 group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
        <span
          className="absolute top-3 left-3 text-[11px] font-bold text-white px-3 py-1 rounded-full"
          style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
        >
          {badge}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5">
        <span className="inline-block text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2.5 py-1 mb-3">
          {category}
        </span>
        <h4 className="text-base font-bold text-gray-900 font-heading mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
          <span>{location}</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Facturación anual</p>
            <p className="text-sm font-semibold text-gray-700">{revenue}/año</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 mb-0.5">Precio</p>
            <p
              className="text-lg font-extrabold font-heading"
              style={{
                background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {price}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <Link
          href="/listings"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:border-purple-300 hover:text-purple-600 transition-colors cursor-pointer"
        >
          Ver Detalles
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />

      {/* ══════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        {/* Subtle background glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 lg:items-center">

            {/* ── Text column ── */}
            <div className="relative z-20">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-7">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-purple-600">
                  El marketplace #1 de M&A en Paraguay
                </span>
              </div>

              {/* H1 */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 font-heading leading-[1.1] tracking-tight mb-6">
                Vende tu empresa{' '}
                <span
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  de forma discreta.
                </span>{' '}
                Encuentra tu próximo{' '}
                <span
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  gran negocio.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-500 leading-relaxed mb-9 max-w-lg">
                La plataforma tech que conecta dueños de Pymes con inversores serios en Paraguay.{' '}
                <strong className="text-gray-700 font-semibold">Sin fricción</strong>, con total
                confidencialidad.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary */}
                <Link
                  href="/listings/new"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold px-7 py-4 cursor-pointer hover:opacity-90 transition-opacity shadow-xl"
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                    boxShadow: '0 12px 32px rgba(168, 85, 247, 0.35)',
                  }}
                >
                  Quiero Vender
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>

                {/* Secondary */}
                <div
                  className="p-px rounded-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
                >
                  <Link
                    href="/listings"
                    className="flex items-center justify-center gap-2 rounded-[14px] bg-white px-7 py-[15px] text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Busco Invertir
                    <TrendingUp className="h-4 w-4 text-purple-500" strokeWidth={2} />
                  </Link>
                </div>
              </div>

              {/* Social proof mini */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['bg-purple-400', 'bg-cyan-400', 'bg-indigo-400', 'bg-pink-400'].map(
                    (color, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center`}
                        aria-hidden="true"
                      >
                        <span className="text-[10px] text-white font-bold">
                          {['A', 'B', 'C', 'D'][i]}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  <strong className="text-gray-900 font-semibold">+340</strong> inversores activos
                  en la plataforma
                </p>
              </div>
            </div>

            {/* ── Video column ── */}
            <div className="relative lg:pb-6">
              {/* Outer glow */}
              <div
                className="absolute -inset-4 rounded-[36px] opacity-30 blur-2xl pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(34,211,238,0.4) 100%)',
                }}
                aria-hidden="true"
              />

              {/* Gradient border wrapper */}
              <div
                className="relative p-0.5 rounded-3xl shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)',
                  boxShadow: '0 32px 64px rgba(168,85,247,0.25)',
                }}
              >
                {/*
                  Inner container: fondo BLANCO porque el video tiene fondo blanco.
                  El video tiene z-10 para que quede encima del placeholder.
                  El placeholder (z-0) es visible solo mientras el video no arrancó.
                */}
                <div className="rounded-[22px] overflow-hidden bg-white aspect-video relative">

                  {/* Placeholder — detrás del video (z-0) */}
                  <div
                    className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-5"
                    style={{ background: '#f9fafb' }}
                    aria-hidden="true"
                  >
                    <VendaliaLogo variant="svg" height={44} textColor="#111827" />
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{
                            background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                            animationDelay: `${i * 150}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Video — encima del placeholder (z-10) */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 z-10 w-full h-full object-contain"
                    aria-label="Animación del logo Vendalia"
                  >
                    <source src="/hero-video.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              {/* Floating stats card */}
              <div className="hidden lg:flex absolute -bottom-5 -left-4 sm:-left-8 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
                >
                  <BarChart3 className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 leading-none mb-0.5">Último cierre</p>
                  <p className="text-sm font-bold text-gray-900 font-heading">$2.4M USD</p>
                </div>
              </div>

              {/* Floating verified badge */}
              <div className="hidden lg:flex absolute -top-3 -right-3 sm:-right-5 bg-white rounded-2xl shadow-lg border border-gray-100 px-3 py-2 items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                <span className="text-xs font-semibold text-gray-700">Verificado</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50/60 py-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p
                  className="text-3xl font-extrabold font-heading mb-1"
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {value}
                </p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          VALUE PROPS
      ══════════════════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-24 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Section header */}
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-purple-500 uppercase tracking-widest">
              Ventajas
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading">
              ¿Por qué{' '}
              <span
                style={{
                  background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Vendalia?
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto leading-relaxed">
              Diseñado para que dueños de negocios e inversores puedan operar con confianza,
              velocidad y total discreción.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {VALUE_PROPS.map((vp) => (
              <ValueCard key={vp.title} {...vp} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          LISTING PREVIEW
      ══════════════════════════════════════════════════════════════════ */}
      <section id="explorar" className="py-24 sm:py-28 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <span className="text-sm font-bold text-purple-500 uppercase tracking-widest">
                Listados
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading">
                Oportunidades Destacadas
              </h2>
            </div>
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-500 hover:text-purple-700 transition-colors cursor-pointer flex-shrink-0"
            >
              Ver todos los listados
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════ */}
      <section
        id="premium"
        className="relative py-28 sm:py-36 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f0520 0%, #071428 100%)',
        }}
      >
        {/* Glow orbs */}
        <div
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border"
            style={{
              borderColor: 'rgba(168,85,247,0.4)',
              background: 'rgba(168,85,247,0.1)',
            }}
          >
            <span className="text-xs font-semibold text-purple-300">
              Sin costo de publicación
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-heading leading-[1.1] mb-6">
            ¿Listo para el{' '}
            <span
              style={{
                background: 'linear-gradient(to right, #a855f7, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              siguiente paso?
            </span>
          </h2>

          <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto">
            Publica tu negocio hoy y conecta con inversores verificados. El proceso toma menos de
            10 minutos.
          </p>

          {/* CTA button */}
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-3 rounded-2xl text-white text-base font-bold px-9 py-5 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-150 shadow-2xl"
            style={{
              background: 'linear-gradient(to right, #a855f7, #22d3ee)',
              boxShadow: '0 16px 48px rgba(168, 85, 247, 0.4)',
            }}
          >
            Publicar mi Negocio Gratis
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>

          {/* Trust footnotes */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5">
            {[
              'Sin costo inicial',
              'NDA automático',
              'Soporte dedicado',
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" strokeWidth={2} />
                <span className="text-sm text-gray-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer
        className="py-12 border-t"
        style={{ background: '#0a0a0f', borderTopColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Brand — SVG variant so it renders cleanly on the dark footer */}
            <VendaliaLogo variant="svg" height={28} textColor="white" />

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                ['Términos de Uso', '/terms'],
                ['Política de Privacidad', '/privacy'],
                ['Contacto', '/contact'],
                ['Blog', '/blog'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Copyright */}
            <p className="text-sm text-gray-600">© 2025 Vendalia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

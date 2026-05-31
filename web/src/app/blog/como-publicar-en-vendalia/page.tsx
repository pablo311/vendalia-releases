import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export const metadata = { title: 'Cómo publicar tu negocio en Vendalia — Vendalia Blog' }

const STEPS = [
  { n: '01', title: 'Creá tu cuenta', desc: 'Registrate como vendedor con tu email o Google. El proceso toma menos de 2 minutos.' },
  { n: '02', title: 'Completá tu perfil', desc: 'Agregá tu nombre, empresa y teléfono de contacto. Los inversores verificados verán esta información tras firmar el NDA digital.' },
  { n: '03', title: 'Escribí la descripción', desc: 'Sé específico: qué hace el negocio, cuántos empleados tiene, cuánto factura anualmente. Cuanto más detalle, más consultas de calidad recibís.' },
  { n: '04', title: 'Subí fotos', desc: 'Imágenes del local, producto o equipo generan 3x más consultas. Si activás confidencialidad, las fotos solo se mostrarán a inversores verificados.' },
  { n: '05', title: 'Definí el precio', desc: 'Usá los métodos de valoración de nuestro blog. Si no estás seguro, publicá en un rango y ajustá según las consultas que recibís.' },
  { n: '06', title: 'Activá la confidencialidad', desc: 'Con esta opción, el nombre y ubicación exacta quedan ocultos en el listing público. Solo inversores verificados acceden al detalle.' },
]

export default function Post() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-purple-500 hover:underline mb-10">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Volver al Blog
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2.5 py-1 rounded-full">Guía</span>
          <span className="text-xs text-gray-400">Abril 2025 · 3 min lectura</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading leading-tight mb-6">
          Cómo publicar tu negocio en Vendalia
        </h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          Paso a paso para crear un anuncio efectivo: fotos, descripción, precio y confidencialidad.
        </p>

        <div className="space-y-6">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
                {step.n}
              </div>
              <div className="pt-1.5">
                <h3 className="font-bold text-gray-900 font-heading mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 space-y-2">
          <p className="text-sm font-bold text-gray-900 font-heading">Checklist antes de publicar</p>
          {['Descripción de al menos 150 caracteres', 'Precio definido o rango estimado', 'Al menos 1 foto (o confidencialidad activada)', 'Facturación anual indicada', 'Ubicación de la ciudad'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" strokeWidth={2} />
              <span className="text-sm text-gray-600">{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50/40 p-6">
          <p className="text-sm font-semibold text-purple-700 mb-1">¿Listo para empezar?</p>
          <p className="text-sm text-gray-600 mb-3">Publicar tu negocio en Vendalia es gratis durante el período de lanzamiento.</p>
          <Link href="/listings/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}>
            Publicar ahora
          </Link>
        </div>
      </div>
    </div>
  )
}

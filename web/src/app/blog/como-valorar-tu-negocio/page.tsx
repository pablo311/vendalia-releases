import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Cómo valorar tu negocio antes de venderlo — Vendalia Blog' }

export default function Post() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-purple-500 hover:underline mb-10">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Volver al Blog
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2.5 py-1 rounded-full">M&A</span>
          <span className="text-xs text-gray-400">Mayo 2025 · 5 min lectura</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading leading-tight mb-6">
          Cómo valorar tu negocio antes de venderlo
        </h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          Los 5 métodos más usados para calcular el valor de una empresa pequeña o mediana en Paraguay.
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-bold text-gray-900 font-heading">1. Múltiplo de EBITDA</h2>
          <p>El método más usado en M&A para Pymes. Se calcula multiplicando el EBITDA anual (ganancias antes de impuestos, depreciación y amortización) por un múltiplo de industria, que en Paraguay oscila entre 3x y 6x para negocios saludables.</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">2. Flujo de Caja Descontado (DCF)</h2>
          <p>Proyectás los flujos de caja futuros a 3–5 años y los traés a valor presente con una tasa de descuento. Es el método más técnico y preciso, pero requiere datos históricos confiables.</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">3. Valoración por activos</h2>
          <p>Sumás el valor de mercado de todos los activos (maquinaria, inventario, inmuebles, software) y restás los pasivos. Útil para negocios intensivos en capital como manufactura o gastronomía con local propio.</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">4. Comparable de mercado</h2>
          <p>Buscás negocios similares que se hayan vendido recientemente en la misma industria y región. En Paraguay, Vendalia recopila datos de transacciones para que puedas tener referencias reales del mercado local.</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">5. Valoración por facturación</h2>
          <p>Para negocios en etapa temprana o sin utilidades claras, se usa un múltiplo de la facturación anual. Por ejemplo, un SaaS con MRR creciente puede valorarse a 2x–4x la facturación anual.</p>

          <div className="mt-10 rounded-2xl border border-purple-100 bg-purple-50/40 p-6">
            <p className="text-sm font-semibold text-purple-700 mb-1">¿Listo para publicar tu negocio?</p>
            <p className="text-sm text-gray-600 mb-3">Nuestro equipo te ayuda a preparar el anuncio con la valoración correcta.</p>
            <Link href="/listings/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}>
              Publicar mi negocio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

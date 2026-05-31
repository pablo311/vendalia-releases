import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Qué revisar antes de comprar una franquicia — Vendalia Blog' }

export default function Post() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-purple-500 hover:underline mb-10">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Volver al Blog
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2.5 py-1 rounded-full">Inversión</span>
          <span className="text-xs text-gray-400">Abril 2025 · 7 min lectura</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading leading-tight mb-6">
          Qué revisar antes de comprar una franquicia
        </h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          Due diligence básico para inversores: contratos, royalties, exclusividad territorial y red de soporte.
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-bold text-gray-900 font-heading">1. Contrato de franquicia</h2>
          <p>Revisá la duración del contrato, condiciones de renovación y causales de rescisión. Prestá especial atención a las cláusulas de no competencia post-contrato y los derechos de preferencia del franquiciante en caso de venta.</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">2. Estructura de royalties y fees</h2>
          <p>Entendé todos los costos: fee de entrada, royalty mensual (% de ventas), fee de publicidad, y otros cargos. Calculá el punto de equilibrio con estos costos incluidos antes de comprometerte.</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">3. Exclusividad territorial</h2>
          <p>Verificá si tenés exclusividad en una zona geográfica definida. ¿Puede el franquiciante abrir otra unidad propia o vender otra franquicia a dos cuadras de tu local?</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">4. Soporte operativo</h2>
          <p>Evaluá qué training inicial recibís, si hay manuales operativos actualizados, y cómo es el soporte continuo. Una franquicia sin soporte real es un negocio independiente con costos extra.</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">5. Hablar con otros franquiciados</h2>
          <p>Contactá a franquiciados actuales y ex-franquiciados. Sus experiencias son el mejor indicador de cómo es realmente operar bajo esa marca. Preguntá específicamente por el soporte post-venta y la relación con la central.</p>

          <h2 className="text-xl font-bold text-gray-900 font-heading">6. Estado financiero del franquiciante</h2>
          <p>Pedí los estados financieros auditados de la empresa franquiciante. Una central endeudada o con flujo negativo puede cancelar el programa o degradar el soporte en cualquier momento.</p>

          <div className="mt-10 rounded-2xl border border-purple-100 bg-purple-50/40 p-6">
            <p className="text-sm font-semibold text-purple-700 mb-1">Explorá franquicias disponibles</p>
            <p className="text-sm text-gray-600 mb-3">Encontrá oportunidades verificadas en Vendalia.</p>
            <Link href="/listings?category=franquicia" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}>
              Ver franquicias
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

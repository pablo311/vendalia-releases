import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export const metadata = { title: 'Términos de Uso — Vendalia' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/landing" className="flex items-center gap-2 mb-10 w-fit">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
            <TrendingUp className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 font-heading">Vendalia</span>
        </Link>

        <h1 className="text-4xl font-extrabold text-gray-900 font-heading mb-3">Términos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 3 de junio de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceptación de los términos</h2>
            <p>Al acceder y utilizar Vendalia, aceptás cumplir con estos Términos de Uso. Si no estás de acuerdo con alguna parte, no debés utilizar el servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Descripción del servicio</h2>
            <p>Vendalia es una plataforma de marketplace para la compra, venta y consulta de negocios, empresas y franquicias en Latinoamérica. Actuamos como intermediario entre compradores (inversores) y vendedores, sin ser parte de las transacciones.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Registro y cuentas</h2>
            <p>Para utilizar las funciones del marketplace debés crear una cuenta con información veraz y actualizada. Sos responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Publicación de listados</h2>
            <p>Los vendedores garantizan que la información publicada es veraz, actualizada y no infringe derechos de terceros. Vendalia se reserva el derecho de remover listados que violen estas condiciones sin previo aviso.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Limitación de responsabilidad</h2>
            <p>Vendalia no garantiza la exactitud de los listados ni el éxito de ninguna transacción. No somos responsables por pérdidas económicas derivadas del uso de la plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados con al menos 15 días de anticipación.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contacto</h2>
            <p>Para consultas sobre estos términos, escribinos a <a href="mailto:legal@vendalia.com" className="text-purple-500 hover:underline">legal@vendalia.com</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/landing" className="text-sm text-purple-500 hover:underline">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export const metadata = { title: 'Política de Privacidad — Vendalia' }

export default function PrivacyPage() {
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

        <h1 className="text-4xl font-extrabold text-gray-900 font-heading mb-3">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 3 de junio de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Información que recopilamos</h2>
            <p>Recopilamos la información que nos proporcionás al registrarte (nombre, correo electrónico, teléfono, empresa), así como datos de uso de la plataforma (listados visitados, consultas enviadas, mensajes).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cómo usamos tu información</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Operar y mejorar el servicio de marketplace</li>
              <li>Conectar compradores con vendedores</li>
              <li>Enviarte notificaciones relevantes sobre tu actividad</li>
              <li>Cumplir con obligaciones legales aplicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Compartición de datos</h2>
            <p>No vendemos tus datos personales a terceros. Podemos compartir información con proveedores de servicio que nos asisten en la operación (ej: Supabase para base de datos), siempre bajo acuerdos de confidencialidad.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Datos de listados confidenciales</h2>
            <p>Cuando marcás un listado como confidencial, ocultamos tu identidad y detalles específicos del negocio a visitantes no autorizados. Solo quienes reciban una consulta aprobada accederán a la información completa.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Tus derechos</h2>
            <p>Tenés derecho a acceder, corregir o eliminar tus datos personales en cualquier momento. Para ejercer estos derechos, contactanos en <a href="mailto:privacidad@vendalia.com" className="text-purple-500 hover:underline">privacidad@vendalia.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Seguridad</h2>
            <p>Utilizamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado en tránsito (HTTPS) y políticas de acceso granular en base de datos (Row Level Security).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies</h2>
            <p>Utilizamos cookies de sesión necesarias para el funcionamiento de la plataforma. No utilizamos cookies de seguimiento de terceros con fines publicitarios.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/landing" className="text-sm text-purple-500 hover:underline">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

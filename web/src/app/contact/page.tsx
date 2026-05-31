import Link from 'next/link'
import { TrendingUp, Mail, MessageSquare, MapPin } from 'lucide-react'

export const metadata = { title: 'Contacto — Vendalia' }

export default function ContactPage() {
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

        <h1 className="text-4xl font-extrabold text-gray-900 font-heading mb-3">Contacto</h1>
        <p className="text-gray-500 mb-12 text-[15px]">¿Tenés preguntas? Estamos para ayudarte.</p>

        <div className="grid gap-6 sm:grid-cols-3 mb-14">
          <div className="rounded-2xl border border-gray-100 p-6 flex flex-col items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Mail className="h-5 w-5 text-purple-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Email general</p>
              <a href="mailto:hola@vendalia.com" className="text-sm text-purple-500 hover:underline">hola@vendalia.com</a>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 p-6 flex flex-col items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Soporte</p>
              <a href="mailto:soporte@vendalia.com" className="text-sm text-purple-500 hover:underline">soporte@vendalia.com</a>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 p-6 flex flex-col items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-purple-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Ubicación</p>
              <p className="text-sm text-gray-500">Asunción, Paraguay</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Horario de atención</h2>
          <p className="text-sm text-gray-500 mb-4">Respondemos en menos de 24 horas hábiles.</p>
          <p className="text-sm text-gray-600">Lunes a Viernes: 08:00 – 18:00 (PYT)</p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/landing" className="text-sm text-purple-500 hover:underline">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

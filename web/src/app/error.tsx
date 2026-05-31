'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #f87171, #fb923c)' }}>
          <AlertTriangle className="h-8 w-8 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-heading mb-2">
          Algo salió mal
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Ocurrió un error inesperado. Podés intentar recargar la página o volver al inicio.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Home className="h-4 w-4" strokeWidth={1.5} />
            Inicio
          </Link>
        </div>
        {error.digest && (
          <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}

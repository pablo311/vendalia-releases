'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { VendaliaLogo } from '@/components/vendalia-logo'

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Cómo Funciona' },
  { href: '#explorar', label: 'Explorar Negocios' },
  { href: '#premium', label: 'Servicio Premium' },
]

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/landing" className="cursor-pointer flex-shrink-0">
            <VendaliaLogo height={30} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150 cursor-pointer"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Ingresar
            </Link>
            {/* Gradient border button */}
            <div
              className="p-px rounded-full"
              style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
            >
              <Link
                href="/auth/register"
                className="block rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Acceso Cliente
              </Link>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 pb-5 pt-3">
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-gray-100">
            <Link
              href="/auth/login"
              className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
            >
              Ingresar
            </Link>
            <Link
              href="/auth/register"
              className="rounded-xl px-4 py-3 text-sm font-semibold text-white text-center cursor-pointer"
              style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
            >
              Acceso Cliente
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

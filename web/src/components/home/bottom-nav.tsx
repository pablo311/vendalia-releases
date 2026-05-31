'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, PlusCircle, MessageCircle, User } from 'lucide-react'

const tabs = [
  { href: '/', icon: Compass, label: 'Explora' },
  { href: '/listings/new', icon: PlusCircle, label: 'Vender' },
  { href: '/dashboard/messages', icon: MessageCircle, label: 'Mensajes' },
  { href: '/dashboard', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 sm:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-sm mx-auto">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 min-w-[60px] py-1 cursor-pointer"
              aria-label={label}
            >
              {isActive ? (
                /* Active: icon with gradient color */
                <div className="relative flex items-center justify-center w-6 h-6">
                  <Icon
                    className="h-6 w-6"
                    style={{ stroke: 'url(#vendalia-gradient)' }}
                    strokeWidth={2}
                  />
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient id="vendalia-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : (
                <Icon className="h-6 w-6 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
              )}
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'vendalia-gradient-text' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

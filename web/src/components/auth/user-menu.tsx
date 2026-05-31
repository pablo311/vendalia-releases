'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, LayoutDashboard, LogOut, ChevronDown, TrendingUp, Store, MessageSquare } from 'lucide-react'

interface UserMenuProps {
  fullName: string | null
  email: string
  role: 'investor' | 'seller'
}

export function UserMenu({ fullName, email, role }: UserMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const displayName = fullName?.split(' ')[0] ?? email.split('@')[0]
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : email[0].toUpperCase()

  // Cerrar al clickear fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
        >
          {initials}
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:block max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/60 dark:shadow-gray-900/60 py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName ?? displayName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {role === 'seller'
                ? <Store className="h-3 w-3 text-purple-400" strokeWidth={2} />
                : <TrendingUp className="h-3 w-3 text-purple-400" strokeWidth={2} />}
              <span className="text-[11px] font-medium text-purple-500">
                {role === 'seller' ? 'Vendedor' : 'Inversor'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="py-1">
            <MenuItem href="/dashboard" icon={LayoutDashboard} label="Mi Panel" onClick={() => setOpen(false)} />
            <MenuItem href="/dashboard/profile" icon={User} label="Mi Perfil" onClick={() => setOpen(false)} />
            <MenuItem href="/dashboard/messages" icon={MessageSquare} label="Mensajes" onClick={() => setOpen(false)} />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 py-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ href, icon: Icon, label, onClick }: {
  href: string; icon: React.ElementType; label: string; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
      {label}
    </Link>
  )
}

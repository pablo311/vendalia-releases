'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  // Una sola fuente de verdad: el ThemeProvider. Antes este botón llevaba su
  // propio estado y podía quedar en desacuerdo con el provider.
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      aria-label="Cambiar tema"
    >
      {dark
        ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />
        : <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />}
    </button>
  )
}

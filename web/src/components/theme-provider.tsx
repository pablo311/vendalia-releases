'use client'

import { createContext, useContext, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

// El tema vive en localStorage y en la clase `dark` del <html>: un store
// externo. useSyncExternalStore lo lee sin un setState dentro de un efecto,
// y en el servidor rinde 'light' para que el HTML sea estable.
const oyentes = new Set<() => void>()

function temaActual(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function suscribir(cb: () => void) {
  oyentes.add(cb)
  return () => { oyentes.delete(cb) }
}

function guardarTema(next: Theme) {
  localStorage.setItem('theme', next)
  document.documentElement.classList.toggle('dark', next === 'dark')
  oyentes.forEach((cb) => cb())
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(suscribir, temaActual, () => 'light' as Theme)

  // Mantiene la clase del <html> alineada con lo leído, también en la primera carga.
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  function toggle() {
    guardarTema(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

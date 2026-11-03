'use client'
import { createContext, useContext, useSyncExternalStore } from 'react'
import translations, { type Lang, type TranslationKey } from '@/lib/i18n'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
  t: (key) => translations.es[key],
})

// El idioma vive en localStorage: un store externo que se lee con
// useSyncExternalStore en vez de un setState dentro de un efecto. En el
// servidor rinde 'es'.
const oyentes = new Set<() => void>()

function idiomaActual(): Lang {
  const stored = localStorage.getItem('lang')
  return stored === 'en' ? 'en' : 'es'
}

function suscribir(cb: () => void) {
  oyentes.add(cb)
  return () => { oyentes.delete(cb) }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(suscribir, idiomaActual, () => 'es' as Lang)

  function setLang(l: Lang) {
    localStorage.setItem('lang', l)
    document.cookie = `lang=${l}; path=/; max-age=31536000`
    oyentes.forEach((cb) => cb())
  }

  function t(key: TranslationKey): string {
    return translations[lang][key]
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

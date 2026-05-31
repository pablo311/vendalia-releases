import { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import translations, { type Lang, type TranslationKey } from './i18n'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  i18n: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
  i18n: (key) => translations.es[key],
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  useEffect(() => {
    AsyncStorage.getItem('lang').then((stored) => {
      if (stored === 'es' || stored === 'en') setLangState(stored)
    })
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    AsyncStorage.setItem('lang', l)
  }

  function i18n(key: TranslationKey): string {
    return translations[lang][key]
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, i18n }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

'use client'
import { useLanguage } from '@/components/language-provider'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-md text-xs font-700 transition-colors cursor-pointer ${
            lang === l
              ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {l === 'es' ? 'ES' : 'EN'}
        </button>
      ))}
    </div>
  )
}

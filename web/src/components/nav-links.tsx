'use client'
import Link from 'next/link'
import { useLanguage } from '@/components/language-provider'

export function NavLinks() {
  const { t } = useLanguage()
  return (
    <>
      <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer hidden sm:block">
        {t('explore')}
      </Link>
      <Link href="/listings/new" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer hidden sm:block">
        {t('ctaPublish')}
      </Link>
    </>
  )
}

export function NavAuthButtons() {
  const { t } = useLanguage()
  return (
    <>
      <Link href="/auth/login" className="text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
        {t('login')}
      </Link>
      <Link href="/auth/register" className="text-sm font-medium px-3 py-1.5 rounded-lg text-white vendalia-gradient border-0 cursor-pointer hover:opacity-90 transition-opacity">
        {t('register')}
      </Link>
    </>
  )
}

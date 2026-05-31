import type { Metadata } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider'

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Vendalia — Marketplace de M&A',
  description:
    'Compra y vende negocios y franquicias en Latinoamérica. El marketplace líder de fusiones y adquisiciones para Pymes.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/'

  // Routes that use their own full-page layout (no shared Navbar/Footer)
  const isStandalone =
    pathname.startsWith('/landing') ||
    pathname.startsWith('/auth')

  return (
    <html
      lang="es"
      className={`${geist.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-900">
        <ThemeProvider>
          {!isStandalone && (
            <div className="hidden sm:block">
              <Navbar />
            </div>
          )}
          <main className="flex-1">{children}</main>
          {!isStandalone && (
            <footer className="hidden sm:block border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-6 mt-12">
              <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400 dark:text-gray-500">
                © 2025 Vendalia — Compra y venta de negocios y franquicias
              </div>
            </footer>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}

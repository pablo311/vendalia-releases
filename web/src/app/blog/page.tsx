import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export const metadata = { title: 'Blog — Vendalia' }

const POSTS = [
  {
    slug: '/blog/como-valorar-tu-negocio',
    category: 'M&A',
    title: 'Cómo valorar tu negocio antes de venderlo',
    excerpt: 'Los 5 métodos más usados para calcular el valor de una empresa pequeña o mediana en Paraguay.',
    date: 'Mayo 2025',
    readTime: '5 min',
  },
  {
    slug: '/blog/que-revisar-antes-de-comprar-franquicia',
    category: 'Inversión',
    title: 'Qué revisar antes de comprar una franquicia',
    excerpt: 'Due diligence básico para inversores: contratos, royalties, exclusividad territorial y red de soporte.',
    date: 'Abril 2025',
    readTime: '7 min',
  },
  {
    slug: '/blog/como-publicar-en-vendalia',
    category: 'Guía',
    title: 'Cómo publicar tu negocio en Vendalia',
    excerpt: 'Paso a paso para crear un anuncio efectivo: fotos, descripción, precio y confidencialidad.',
    date: 'Abril 2025',
    readTime: '3 min',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/landing" className="flex items-center gap-2 mb-10 w-fit">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}>
            <TrendingUp className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 font-heading">Vendalia</span>
        </Link>

        <h1 className="text-4xl font-extrabold text-gray-900 font-heading mb-3">Blog</h1>
        <p className="text-gray-500 mb-12 text-[15px]">Recursos para compradores y vendedores de negocios en Latinoamérica.</p>

        <div className="space-y-6">
          {POSTS.map((post, i) => (
            <Link key={i} href={post.slug}
              className="block rounded-2xl border border-gray-100 p-6 hover:border-purple-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2.5 py-1 rounded-full">{post.category}</span>
                <span className="text-xs text-gray-400">{post.date} · {post.readTime} lectura</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">{post.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-8 text-center">
          <p className="text-sm text-gray-500 mb-1">¿Querés contribuir al blog?</p>
          <a href="mailto:hola@vendalia.com" className="text-sm font-semibold text-purple-500 hover:underline">Escribinos a hola@vendalia.com</a>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/landing" className="text-sm text-purple-500 hover:underline">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

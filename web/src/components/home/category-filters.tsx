'use client'

import { useRouter, usePathname } from 'next/navigation'

const FILTER_CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'franquicia', label: 'Franquicias' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'retail', label: 'Retail' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'salud', label: 'Salud' },
  { value: 'manufactura', label: 'Manufactura' },
]

interface CategoryFiltersProps {
  activeCategory: string
  searchQuery?: string
}

export function CategoryFilters({ activeCategory, searchQuery }: CategoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleFilter(value: string) {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (value !== 'all') params.set('category', value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTER_CATEGORIES.map(({ value, label }) => {
        const isActive = activeCategory === value

        if (isActive) {
          return (
            /* Active: gradient border wrapper + white inside + gradient text */
            <div
              key={value}
              className="p-px rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(to right, #a855f7, #22d3ee)' }}
            >
              <button
                onClick={() => handleFilter(value)}
                className="rounded-full bg-white dark:bg-gray-900 px-4 py-1.5 cursor-pointer"
                aria-pressed="true"
              >
                <span className="vendalia-gradient-text text-sm font-semibold whitespace-nowrap">
                  {label}
                </span>
              </button>
            </div>
          )
        }

        return (
          <button
            key={value}
            onClick={() => handleFilter(value)}
            className="flex-shrink-0 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150 cursor-pointer whitespace-nowrap"
            aria-pressed="false"
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

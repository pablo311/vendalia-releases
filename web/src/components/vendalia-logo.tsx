/**
 * VendaliaLogo
 *
 * variant="image"  → <img> plain del logo.jpeg (fondo blanco — úsalo en fondos claros)
 * variant="svg"    → V mark SVG reconstruido + wordmark (funciona en cualquier fondo)
 *
 * El JPEG mide 2752×1536 px (ratio 1.792:1) con whitespace alrededor del contenido.
 * Usamos <img> directo para evitar restricciones de next/image.
 */

interface VendaliaLogoProps {
  variant?: 'image' | 'svg'
  /** Altura visible en px. El ancho se ajusta con la proporción real. */
  height?: number
  /** Color del wordmark cuando variant="svg". */
  textColor?: string
  /** Muestra solo el ícono V, sin texto. */
  iconOnly?: boolean
  className?: string
}

// ─── SVG V mark ───────────────────────────────────────────────────────────────
function VMark({ size = 36 }: { size?: number }) {
  // IDs únicos por instancia no son necesarios en Next.js RSC —
  // el primer defs encontrado en el DOM define el gradiente.
  return (
    <svg
      width={size}
      height={Math.round(size * 1.3)}
      viewBox="0 0 56 73"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="vmark-grad"
          x1="0"
          y1="0"
          x2="56"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#7c3aed" />
          <stop offset="50%"  stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* Two thick arms of the V with flat caps and rounded joint at bottom */}
      <path
        d="M4 4 L28 69 L52 4"
        stroke="url(#vmark-grad)"
        strokeWidth="13"
        strokeLinecap="butt"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function VendaliaLogo({
  variant = 'image',
  height = 32,
  textColor = '#111827',
  iconOnly = false,
  className = '',
}: VendaliaLogoProps) {

  /* ── variant="image": renderiza el JPEG real ── */
  if (variant === 'image') {
    // El JPEG es 2752×1536 (ratio 1.792).
    // Multiplicamos ×1.8 para obtener el ancho natural, luego dejamos
    // que el navegador lo escale por la altura.
    // "mix-blend-mode: multiply" hace que el fondo blanco del JPEG
    // sea transparente sobre fondos blancos.
    const w = Math.round(height * 1.792)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.jpeg"
        alt="Vendalia"
        width={w}
        height={height}
        style={{
          height: `${height}px`,
          width: `${w}px`,
          objectFit: 'contain',
          objectPosition: 'left center',
          display: 'block',
          mixBlendMode: 'multiply',  // fondo blanco del JPEG → transparente
        }}
        className={className}
      />
    )
  }

  /* ── variant="svg": reconstruido desde cero (para fondos oscuros) ── */
  const iconH = Math.round(height * 1.0)

  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Vendalia">
      <VMark size={iconH} />
      {!iconOnly && (
        <span
          className="font-extrabold tracking-tight font-heading leading-none"
          style={{
            fontSize: Math.round(height * 0.8),
            color: textColor,
          }}
        >
          Vendalia
        </span>
      )}
    </div>
  )
}

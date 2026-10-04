/**
 * Monograma de AM (Andrés Millares · Personal Trainer): A en el color del texto y M en el acento.
 * Dibujado en una grilla de 128 × 100; los trazos se recortan al cuadro, así las puntas quedan planas.
 */

export const LOGO_ACCENT = '#c6f135'

/** Trazo de la A (con su travesaño) y de la M, en coordenadas de la grilla. */
export const A_PATH = 'M8 120 L36 0 L64 120'
export const A_BAR = 'M23 72 H49'
export const M_PATH = 'M78 130 L78 0 L99 62 L120 0 L120 130'
export const STROKE = 16

/** El monograma como SVG suelto (íconos, ventana flotante). */
export function monogramSvg({ x = 0, y = 0, width = 128, ink = '#ffffff', accent = LOGO_ACCENT } = {}): string {
  const id = `am-clip-${Math.round(x)}-${Math.round(y)}-${Math.round(width)}`
  return `<svg x="${x}" y="${y}" width="${width}" height="${(width * 100) / 128}" viewBox="0 0 128 100">
<defs><clipPath id="${id}"><rect width="128" height="100"/></clipPath></defs>
<g clip-path="url(#${id})" fill="none" stroke-miterlimit="20">
<path d="${A_PATH}" stroke="${ink}" stroke-width="${STROKE}"/>
<path d="${A_BAR}" stroke="${ink}" stroke-width="${STROKE * 0.75}"/>
<path d="${M_PATH}" stroke="${accent}" stroke-width="${STROKE}"/>
</g></svg>`
}

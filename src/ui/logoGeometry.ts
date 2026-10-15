/**
 * Monograma de AM (Andrés Millares · Personal Trainer), del archivo oficial de la marca (am_logo.svg, sin
 * su margen): la A en el color del texto y la raya + M en verde flúor. Grilla de 916 × 346.
 */

export const LOGO_ACCENT = '#c7ff00'

export const LOGO_W = 916
export const LOGO_H = 346

export const A_PATH = 'M344 0 L478 0 L478 108 L365 214 L364 107 L123 346 L0 346 Z M260 346 L478 139 L478 346 L364 346 L364 284 L297 346 Z'
export const ACCENT_PATH = 'M622 0 L659 0 L478 177 L478 136 Z M659 37 L712 127 L817 0 L916 0 L916 346 L812 346 L812 164 L706 291 L617 165 L617 346 L513 346 L513 180 Z'

/** El monograma como SVG suelto (íconos, video de la ventana flotante). */
export function monogramSvg({ x = 0, y = 0, width = LOGO_W, ink = '#ffffff', accent = LOGO_ACCENT } = {}): string {
  return `<svg x="${x}" y="${y}" width="${width}" height="${(width * LOGO_H) / LOGO_W}" viewBox="0 0 ${LOGO_W} ${LOGO_H}">
<path d="${A_PATH}" fill="${ink}"/>
<path d="${ACCENT_PATH}" fill="${accent}"/>
</svg>`
}

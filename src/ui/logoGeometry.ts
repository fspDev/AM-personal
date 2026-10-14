/**
 * Monograma de AM (Andrés Millares · Personal Trainer), según el manual de marca: A itálica en el color
 * del texto, raya diagonal y M en verde flúor. Formas rellenas en una grilla de 312 × 120.
 */

export const LOGO_ACCENT = '#c7ff00'

export const LOGO_W = 312
export const LOGO_H = 120

export const A_PATH = 'M0 120 L102 0 L148 0 L148 120 L116 120 L116 34 L43 120 Z'
export const STRIPE_PATH = 'M152 59 L159 59 L218 0 L211 0 Z'
export const M_PATH = 'M158 120 L167.5 56.5 L219.5 4.5 L235.9 54 L270 0 L312 0 L294 120 L252 120 L262.5 50 L228.4 104 L210.5 50 L200 120 Z'

/** El monograma como SVG suelto (íconos, video de la ventana flotante). */
export function monogramSvg({ x = 0, y = 0, width = LOGO_W, ink = '#ffffff', accent = LOGO_ACCENT } = {}): string {
  return `<svg x="${x}" y="${y}" width="${width}" height="${(width * LOGO_H) / LOGO_W}" viewBox="0 0 ${LOGO_W} ${LOGO_H}">
<path d="${A_PATH}" fill="${ink}"/>
<path d="${STRIPE_PATH}" fill="${accent}"/>
<path d="${M_PATH}" fill="${accent}"/>
</svg>`
}

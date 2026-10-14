// Genera el favicon y los íconos de la app a partir del monograma AM (src/ui/logoGeometry.ts).
// Uso: node scripts/iconos.mjs
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'node:fs'
import { monogramSvg } from '../src/ui/logoGeometry.ts'

const BG = '#121212'

function icon(size, { logo = 0.7, radius = 0 } = {}) {
  const w = size * logo
  const h = (w * 120) / 312
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
${monogramSvg({ x: (size - w) / 2, y: (size - h) / 2, width: w })}
</svg>`
}

const png = (svg) => new Resvg(svg).render().asPng()

writeFileSync('public/favicon.svg', icon(64, { logo: 0.8, radius: 14 }))
writeFileSync('public/pwa-192x192.png', png(icon(192)))
writeFileSync('public/pwa-512x512.png', png(icon(512)))
// Maskable: el sistema recorta hasta un círculo del 80 %; el logo queda bien adentro.
writeFileSync('public/maskable-512x512.png', png(icon(512, { logo: 0.56 })))
writeFileSync('public/apple-touch-icon.png', png(icon(180)))
console.log('Íconos generados en public/')

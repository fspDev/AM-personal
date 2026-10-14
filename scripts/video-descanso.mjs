// Genera public/descanso.mp4: la cuenta regresiva de la ventana flotante del iPhone (Safari no deja poner en flotante un video
// dibujado en vivo, sí un archivo). Necesita ffmpeg. Uso: node scripts/video-descanso.mjs
//
// Línea de tiempo (1 cuadro por segundo, todos clave para poder saltar a cualquier segundo):
//   0 → 600 s   cuenta regresiva de 10:00 a 0:01 (en t muestra 600 - t)
//   600 → 605 s "¡VAMOS!" (terminó la cuenta)
//   605 → 610 s "A ENTRENAR" (sin cuenta regresiva, p. ej. durante la serie, el video queda quieto acá)
// Si se cambian estos números, actualizar IOS_* en src/pip/pipEngine.ts.
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { monogramSvg } from '../src/ui/logoGeometry.ts'

const FONT = 'C\\:/Windows/Fonts/impact.ttf'
const LIME = '0xC7FF00'
const MARK_W = 72
const filter = [
  // Cuenta regresiva.
  `drawtext=fontfile='${FONT}':fontsize=160:fontcolor=${LIME}:x=(w-tw)/2:y=(h-th)/2+8:enable='lt(t,600)':text='%{eif\\:floor((600-t)/60)\\:d}\\:%{eif\\:mod(600-t\\,60)\\:d\\:2}'`,
  // Fin del descanso.
  `drawtext=fontfile='${FONT}':fontsize=110:fontcolor=${LIME}:x=(w-tw)/2:y=(h-th)/2:enable='between(t,600,604.99)':text='¡VAMOS!'`,
  // Entre descansos.
  `drawtext=fontfile='${FONT}':fontsize=84:fontcolor=white:x=(w-tw)/2:y=(h-th)/2-10:enable='gte(t,605)':text='A ENTRENAR'`,
  `drawtext=fontfile='${FONT}':fontsize=26:fontcolor=white@0.6:x=(w-tw)/2:y=h-70:enable='gte(t,605)':text='Seguí en la app'`,
].join(',')

const dir = mkdtempSync(join(tmpdir(), 'am-video-'))
const script = join(dir, 'filter.txt')
const mark = join(dir, 'mark.png')
// Monograma arriba a la izquierda, como en el resto de la app.
writeFileSync(mark, new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${MARK_W}" height="${(MARK_W * 120) / 312}">${monogramSvg({ width: MARK_W })}</svg>`).render().asPng())
writeFileSync(script, `[0:v]${filter}[bg];[bg][1:v]overlay=22:22`)
try {
  execFileSync(
    'ffmpeg',
    ['-y', '-f', 'lavfi', '-i', 'color=c=0x121212:s=480x360:r=1:d=610', '-i', mark, '-/filter_complex', script, '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '30', '-g', '1', '-pix_fmt', 'yuv420p', '-profile:v', 'baseline', '-movflags', '+faststart', '-an', 'public/descanso.mp4'],
    { stdio: 'inherit' },
  )
} finally {
  rmSync(dir, { recursive: true, force: true })
}
console.log('public/descanso.mp4 listo')

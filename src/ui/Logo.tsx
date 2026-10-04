import { useId } from 'react'
import { A_BAR, A_PATH, M_PATH, STROKE } from './logoGeometry'
import styles from './Logo.module.css'

/** Monograma AM: la A toma el color del texto y la M el acento (legible en cualquier paleta). */
export function LogoMark({ height = 28, accent = 'var(--accent-ink)' }: { height?: number; accent?: string }) {
  const clip = useId()
  return (
    <svg width={(height * 128) / 100} height={height} viewBox="0 0 128 100" aria-hidden="true" className={styles.mark}>
      <defs>
        <clipPath id={clip}>
          <rect width="128" height="100" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`} fill="none" strokeMiterlimit={20}>
        <path d={A_PATH} stroke="currentColor" strokeWidth={STROKE} />
        <path d={A_BAR} stroke="currentColor" strokeWidth={STROKE * 0.75} />
        <path d={M_PATH} stroke={accent} strokeWidth={STROKE} />
      </g>
    </svg>
  )
}

/** Logo completo: monograma + "ANDRÉS MILLARES · PERSONAL TRAINER". */
export function Logo({ size = 'sm', accent }: { size?: 'sm' | 'lg'; accent?: string }) {
  return (
    <div className={styles.logo} data-size={size} role="img" aria-label="AM · Andrés Millares Personal Trainer">
      <LogoMark height={size === 'lg' ? 150 : 30} accent={accent} />
      <div className={styles.words}>
        <span className={styles.name}>ANDRÉS MILLARES</span>
        <span className={styles.tag}>PERSONAL TRAINER</span>
      </div>
    </div>
  )
}

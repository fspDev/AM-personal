import { A_PATH, ACCENT_PATH, LOGO_H, LOGO_W } from './logoGeometry'
import styles from './Logo.module.css'

/** Monograma AM: la A toma el color del texto y la raya y la M, el acento. */
export function LogoMark({ height = 28, accent = 'var(--accent-ink)' }: { height?: number; accent?: string }) {
  return (
    <svg width={(height * LOGO_W) / LOGO_H} height={height} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} aria-hidden="true" className={styles.mark}>
      <path d={A_PATH} fill="currentColor" />
      <path d={ACCENT_PATH} fill={accent} />
    </svg>
  )
}

/** Logo completo: horizontal (monograma | nombre) o, en grande, apilado y centrado. */
export function Logo({ size = 'sm', accent, tag = 'PERSONAL TRAINER' }: { size?: 'sm' | 'lg'; accent?: string; tag?: string }) {
  return (
    <div className={styles.logo} data-size={size} role="img" aria-label="AM · Andrés Millares Personal Trainer">
      <LogoMark height={size === 'lg' ? 120 : 22} accent={accent} />
      {size === 'sm' && <span className={styles.divider} aria-hidden="true" />}
      <div className={styles.words}>
        <span className={styles.name}>ANDRÉS MILLARES</span>
        <span className={styles.tag}>{tag}</span>
      </div>
    </div>
  )
}

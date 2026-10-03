import styles from './LogoSlot.module.css'

/** Lugar reservado para el logo del gimnasio (versión de muestra). */
export function LogoSlot({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <div className={styles.slot} data-size={size} role="img" aria-label="Tu logo aquí">
      TU LOGO
      <br />
      AQUÍ
    </div>
  )
}

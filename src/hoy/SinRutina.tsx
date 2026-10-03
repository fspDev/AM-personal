import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { DAY_LIBRE } from '../data'
import { startWorkout } from '../workout/start'
import { LogoSlot } from '../ui/LogoSlot'
import styles from './SinRutina.module.css'

/** Hoy sin rutina (SinRutina.dc.html): estado vacío que lleva a armar la rutina y un entreno libre corto mientras tanto. */
export function SinRutina() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const first = profile?.nombre.trim().split(/\s+/)[0]

  const start = async () => {
    await startWorkout(DAY_LIBRE)
    navigate('/entreno')
  }

  return (
    <main className={styles.page}>
      <LogoSlot />
      <div className={styles.greeting}>{first ? `Buenas, ${first}.` : 'Buenas.'}</div>
      <div className={styles.eyebrow}>HOY TOCA</div>
      <div className={styles.title}>
        TODAVÍA
        <br />
        NADA.
      </div>
      <p className={styles.text}>Armá tu rutina: elegí los días y sumá ejercicios. Todo queda guardado en tu teléfono.</p>
      <button className={styles.notify} onClick={() => navigate('/rutina')}>
        ARMAR MI RUTINA
      </button>

      <div className={styles.grow} />

      <section className={styles.card} aria-label="Mientras tanto">
        <div className={styles.cardLabel}>MIENTRAS TANTO</div>
        <div className={styles.cardTitle}>BICI + ELONGACIÓN · 20 MIN</div>
        <button className={styles.start} onClick={() => void start()}>
          EMPEZAR
        </button>
      </section>
    </main>
  )
}

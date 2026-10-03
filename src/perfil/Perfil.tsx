import { useState } from 'react'
import { fmtTime } from '../format'
import { useDays } from '../rutina/useDays'
import { updateSettings, useSettings, type Settings } from '../settings'
import { askNotificationPermission, notificationPermission, showAlert } from '../notify'
import { closePiP, isPiPOpen, isPiPSupported, lastPiPError, openPiP } from '../pip/pipEngine'
import { PALETTES } from '../theme'
import styles from './Perfil.module.css'

const REST_STEP = 15
const REST_MIN = 30
const REST_MAX = 300

const TOGGLES: { key: 'vibracion' | 'sonido' | 'pantallaEncendida'; label: string }[] = [
  { key: 'vibracion', label: 'Vibrar al terminar el descanso' },
  { key: 'sonido', label: 'Sonido al terminar el descanso' },
  { key: 'pantallaEncendida', label: 'Mantener la pantalla encendida' },
]

const THEMES: { value: Settings['temaDescanso']; label: string }[] = [
  { value: 'auto', label: 'Automático' },
  { value: 'claro', label: 'Claro' },
  { value: 'oscuro', label: 'Oscuro' },
]

const FLOTANTE: { value: Settings['flotante']; label: string; hint: string }[] = [
  { value: 'salir', label: 'Al salir', hint: 'Intenta aparecer sola cuando cambiás de app (no todos los celulares lo permiten).' },
  { value: 'serie', label: 'Al tocar', hint: 'Se abre con tu primer toque del entreno: deslizar para empezar, HECHA o pausar la bici.' },
  { value: 'boton', label: 'Botón', hint: 'Solo cuando la abrís vos.' },
  { value: 'nunca', label: 'Nunca', hint: 'Sin ventana flotante ni botón.' },
]

const PERMISO: Record<string, string> = {
  granted: 'Activados',
  denied: 'Bloqueados: activalos en los permisos del sitio',
  default: 'Sin activar',
  unsupported: 'Este navegador no los permite',
}

export function Perfil() {
  const [permiso, setPermiso] = useState(notificationPermission)
  const [probado, setProbado] = useState<string | null>(null)
  const [pipTest, setPipTest] = useState<string | null>(null)
  const s = useSettings()
  const { rutina } = useDays()
  const nombre = s.nombre.trim() || 'Vos'
  const plan = rutina?.diasPorSemana ? `Rutina de ${rutina.diasPorSemana} ${rutina.diasPorSemana === 1 ? 'día' : 'días'} · ` : ''
  const sub = `${plan}todo queda guardado en este teléfono`
  const setRest = (delta: number) => updateSettings({ restSeconds: Math.min(REST_MAX, Math.max(REST_MIN, s.restSeconds + delta)) })

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>PERFIL</h1>

      <div className={styles.who}>
        <div className={styles.avatar} aria-hidden="true">
          {nombre.charAt(0).toUpperCase()}
        </div>
        <div className={styles.whoText}>
          <label htmlFor="perfil-nombre" className={styles.srOnly}>
            Tu nombre
          </label>
          <input
            id="perfil-nombre"
            className={styles.nameInput}
            placeholder="Tu nombre"
            value={s.nombre}
            onChange={(e) => updateSettings({ nombre: e.target.value })}
          />
          <div className={styles.sub}>{sub}</div>
        </div>
      </div>

      <div className={styles.section}>DURANTE EL ENTRENO</div>
      <div className={styles.rows}>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>Descanso entre series</div>
            <div className={styles.hint}>Si el ejercicio no tiene uno propio</div>
          </div>
          <div className={styles.stepper}>
            <button className={styles.round} aria-label="Menos descanso" onClick={() => setRest(-REST_STEP)} disabled={s.restSeconds <= REST_MIN}>
              −
            </button>
            <span className={styles.rest} aria-live="polite">
              {fmtTime(s.restSeconds)}
            </span>
            <button className={styles.round} aria-label="Más descanso" onClick={() => setRest(REST_STEP)} disabled={s.restSeconds >= REST_MAX}>
              +
            </button>
          </div>
        </div>

        {TOGGLES.map((t) => (
          <div key={t.key} className={styles.row}>
            <div className={styles.label}>{t.label}</div>
            <button className={styles.switch} role="switch" aria-checked={s[t.key]} aria-label={t.label} onClick={() => updateSettings({ [t.key]: !s[t.key] })}>
              <span className={styles.knob} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.section} style={{ marginTop: 24 }}>
        PANTALLA DE DESCANSO
      </div>
      <div className={styles.segmented} role="radiogroup" aria-label="Tema">
        {THEMES.map((t) => (
          <button key={t.value} className={styles.option} role="radio" aria-checked={s.temaDescanso === t.value} onClick={() => updateSettings({ temaDescanso: t.value })}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.section} style={{ marginTop: 24 }}>
        COLORES
      </div>
      <div className={styles.palettes} role="radiogroup" aria-label="Colores de fondo y texto">
        {PALETTES.map((p) => (
          <button key={p.id} className={styles.palette} role="radio" aria-checked={s.paleta === p.id} aria-label={p.nombre} onClick={() => updateSettings({ paleta: p.id })}>
            <span className={styles.swatch} style={{ background: p.bg, color: p.ink }}>
              Aa
            </span>
            <span className={styles.paletteName}>{p.nombre}</span>
          </button>
        ))}
      </div>

      <div className={styles.section} style={{ marginTop: 24 }}>
        VENTANA FLOTANTE
      </div>
      {isPiPSupported() ? (
        <>
          <div className={styles.segmented} role="radiogroup" aria-label="Ventana flotante">
            {FLOTANTE.map((t) => (
              <button key={t.value} className={styles.option} role="radio" aria-checked={s.flotante === t.value} onClick={() => updateSettings({ flotante: t.value })}>
                {t.label}
              </button>
            ))}
          </div>
          <p className={styles.note}>
            {FLOTANTE.find((t) => t.value === s.flotante)?.hint}
            {s.flotante !== 'nunca' && ' Siempre la podés abrir con el botón 🗗 de arriba del entreno.'} Desde la ventanita: ⏭ marca HECHA o salta el descanso, ⏮ suma 15 s y ⏯ pausa la bici.
          </p>
          <div className={styles.rows}>
            <div className={styles.row}>
              <div>
                <div className={styles.label}>Probar la ventana flotante</div>
                <div className={styles.hint}>{pipTest ?? 'Se abre con un cartel de prueba'}</div>
              </div>
              <button
                className={styles.small}
                onClick={async () => {
                  if (isPiPOpen()) {
                    closePiP()
                    setPipTest('Cerrada.')
                    return
                  }
                  const ok = await openPiP()
                  setPipTest(ok ? '✓ Funcionó. Tocá de nuevo para cerrarla.' : `No se abrió: ${lastPiPError ?? 'motivo desconocido'}`)
                }}
              >
                PROBAR
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className={styles.note}>Este navegador no permite ventanas flotantes. En Android usá Chrome actualizado.</p>
      )}

      <div className={styles.section} style={{ marginTop: 24 }}>
        AVISOS CON LA APP CERRADA
      </div>
      <div className={styles.rows}>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>Notificación al terminar el descanso</div>
            <div className={styles.hint}>{probado ?? PERMISO[permiso]}</div>
          </div>
          {permiso === 'granted' ? (
            <button
              className={styles.small}
              onClick={async () => {
                const ok = await showAlert('Así te avisa Entreno 💪', 'Cuando termine el descanso vas a sentir esta vibración.', 'entreno-prueba')
                setProbado(ok ? 'Enviado. ¿Vibró?' : 'No se pudo mandar')
              }}
            >
              PROBAR
            </button>
          ) : permiso === 'default' ? (
            <button
              className={styles.small}
              onClick={async () => {
                await askNotificationPermission()
                setPermiso(notificationPermission())
              }}
            >
              ACTIVAR
            </button>
          ) : null}
        </div>
      </div>

    </main>
  )
}

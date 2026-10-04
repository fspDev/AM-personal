import { useCallback, useEffect, useMemo, useState } from 'react'
import { slugify } from '../keys'
import { youtubeId, youtubeLink, youtubeThumb } from '../youtube'
import { guardarEjercicio, loadEjercicios, type Ejercicio } from './api'
import styles from './Ejercicios.module.css'
import ui from './ui.module.css'

/** Biblioteca del profe: cada ejercicio con su video; al sumarlo a un plan, el video viene solo. */
export function Ejercicios() {
  const [list, setList] = useState<Ejercicio[] | null>(null)
  const [q, setQ] = useState('')
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    loadEjercicios()
      .then((l) => {
        setError(false)
        setList(l)
      })
      .catch(() => setError(true))
  }, [])
  useEffect(load, [load])

  const visible = useMemo(() => {
    const t = slugify(q)
    return (list ?? []).filter((e) => !t || e.id.includes(t) || slugify(e.grupo ?? '').includes(t))
  }, [list, q])
  const nuevo = q.trim() && list && !list.some((e) => e.id === slugify(q))

  return (
    <main className={ui.page}>
      <h1 className={ui.title}>EJERCICIOS</h1>
      <div className={ui.sub}>Cargá el video de técnica una vez y queda para todos los planes.</div>
      <input className={ui.input} style={{ maxWidth: 360, marginTop: 20 }} placeholder="Buscar o agregar…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar ejercicio" />
      {error && <p className={ui.error}>No pudimos cargar la biblioteca.</p>}
      <ul className={styles.list}>
        {nuevo && (
          <li>
            <button
              className={ui.secondary}
              onClick={async () => {
                await guardarEjercicio({ nombre: q.trim().replace(/\s+/g, ' '), grupo: null, video: '' })
                setQ('')
                load()
              }}
            >
              + Agregar “{q.trim()}”
            </button>
          </li>
        )}
        {visible.map((e) => (
          <Fila key={e.id} e={e} onSaved={load} />
        ))}
      </ul>
    </main>
  )
}

function Fila({ e, onSaved }: { e: Ejercicio; onSaved: () => void }) {
  const [video, setVideo] = useState(e.video)
  const [state, setState] = useState<'idle' | 'saving' | 'ok'>('idle')
  const id = youtubeId(video)
  const bad = !!video.trim() && !id
  const dirty = video.trim() !== e.video

  return (
    <li className={styles.row}>
      <div className={styles.info}>
        <div className={styles.name}>{e.nombre}</div>
        {e.grupo && <div className={ui.hint}>{e.grupo}</div>}
      </div>
      <div className={styles.video}>
        {id ? (
          <a href={youtubeLink(video) ?? '#'} target="_blank" rel="noreferrer" aria-label={`Ver el video de ${e.nombre}`}>
            <img className={styles.thumb} src={youtubeThumb(id)} alt="" width={96} height={54} loading="lazy" />
          </a>
        ) : (
          <div className={styles.thumbEmpty} aria-hidden="true">
            ▶
          </div>
        )}
        <input
          className={ui.input}
          style={{ marginTop: 0, background: 'var(--bg)' }}
          placeholder="Link de YouTube"
          inputMode="url"
          value={video}
          aria-invalid={bad}
          aria-label={`Video de ${e.nombre}`}
          onChange={(x) => {
            setVideo(x.target.value)
            setState('idle')
          }}
        />
        <button
          className={ui.secondary}
          disabled={!dirty || bad || state === 'saving'}
          onClick={async () => {
            setState('saving')
            await guardarEjercicio({ nombre: e.nombre, grupo: e.grupo, video }, e.id).catch(() => {})
            setState('ok')
            onSaved()
          }}
        >
          {state === 'ok' && !dirty ? '✓' : 'Guardar'}
        </button>
      </div>
      {bad && <div className={styles.bad}>Ese link no es de un video de YouTube.</div>}
    </li>
  )
}

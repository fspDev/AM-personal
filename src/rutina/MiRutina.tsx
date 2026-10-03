import { useMemo, useState } from 'react'
import { Sheet } from '../entreno/Sheet'
import { fmtKg, fmtTime } from '../format'
import { addBloque, addDia, minutesOf, moveBloque, newBloque, patchBloque, removeBloque, removeDia, totalMinutes, type EBloque, type EDia, type EPaso, type ERutina } from './editor'
import styles from './MiRutina.module.css'
import { addEjercicio, getRutina, removeEjercicio, rutinaEjemplo, saveRutina, useEjercicios, useRutinaEditable, type Ejercicio } from './store'

const round1 = (n: number) => Math.round(n * 10) / 10

function detalle(b: EBloque): string {
  if (b.tipo === 'fuerza') return `${b.series} × ${b.reps}${b.pesoKg ? ` · ${fmtKg(b.pesoKg)} kg` : ''} · ${fmtTime(b.descansoS)}`
  if (b.tipo === 'tiempo') return `${b.subtitulo ? `${b.subtitulo.toLowerCase()} · ` : ''}${b.minutos} min`
  return `${b.rondas} rondas · ${b.pasos.length} pasos`
}

/** Mi rutina: el usuario arma sus días y bloques. Todo se guarda solo, en el teléfono. */
export function MiRutina() {
  const rutina = useRutinaEditable()
  const [diaId, setDiaId] = useState(rutina.dias[0]?.id ?? '')
  const [editId, setEditId] = useState<string | null>(null)
  const [picker, setPicker] = useState(false)
  const [reset, setReset] = useState(false)

  const dia = rutina.dias.find((d) => d.id === diaId) ?? rutina.dias[0]
  const editing = dia?.bloques.find((b) => b.id === editId) ?? null
  // Siempre sobre la última guardada: dos toques seguidos no se pisan.
  const update = (fn: (r: ERutina) => ERutina) => saveRutina(fn(getRutina()))

  const agregar = (b: EBloque) => {
    if (!dia) return
    update((r) => addBloque(r, dia.id, b))
    setEditId(b.id)
  }

  if (!dia) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>MI RUTINA</h1>
        <p className={styles.lead}>Todavía no armaste ningún día.</p>
        <button
          className={styles.primary}
          onClick={() => {
            const r: ERutina = { id: 'rutina', nombre: 'Mi rutina', dias: [] }
            const next = addDia(r)
            saveRutina(next)
            setDiaId(next.dias[0].id)
          }}
        >
          + ARMAR EL DÍA A
        </button>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>MI RUTINA</h1>
      <p className={styles.lead}>Se guarda sola. Cada ejercicio que creás queda en tu biblioteca.</p>

      <div className={styles.days} role="tablist" aria-label="Días">
        {rutina.dias.map((d) => (
          <button key={d.id} role="tab" aria-selected={d.id === dia.id} className={styles.day} onClick={() => setDiaId(d.id)}>
            {d.letra}
          </button>
        ))}
        <button
          className={styles.dayAdd}
          aria-label="Agregar un día"
          onClick={() => {
            const next = addDia(rutina)
            saveRutina(next)
            setDiaId(next.dias[next.dias.length - 1].id)
          }}
        >
          +
        </button>
      </div>

      <div className={styles.meta}>
        <span>
          DÍA {dia.letra} · {totalMinutes(dia)} MIN · {dia.bloques.length} {dia.bloques.length === 1 ? 'BLOQUE' : 'BLOQUES'}
        </span>
        {rutina.dias.length > 1 && (
          <button
            className={styles.link}
            onClick={() => {
              const next = removeDia(rutina, dia.id)
              saveRutina(next)
              setDiaId(next.dias[0].id)
            }}
          >
            Quitar día
          </button>
        )}
      </div>

      {dia.bloques.length === 0 && <p className={styles.empty}>Este día está vacío. Sumá ejercicios con los botones de abajo.</p>}

      <ol className={styles.list}>
        {dia.bloques.map((b, i) => (
          <li key={b.id}>
            <button className={styles.card} onClick={() => setEditId(b.id)}>
              <span className={styles.n}>{i + 1}</span>
              <span className={styles.cardText}>
                <span className={styles.cardName}>{b.nombre || 'Sin nombre'}</span>
                <span className={styles.cardDetail}>{detalle(b)}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </li>
        ))}
      </ol>

      <button className={styles.primary} onClick={() => setPicker(true)}>
        + EJERCICIO
      </button>
      <div className={styles.addRow}>
        <button className={styles.secondary} onClick={() => agregar(newBloque('tiempo', { nombre: 'Bici fija', minutos: 8, subtitulo: 'Calentamiento' }))}>
          + Por tiempo
        </button>
        <button className={styles.secondary} onClick={() => agregar(newBloque('circuito'))}>
          + Circuito
        </button>
      </div>

      <div className={styles.footer}>
        {reset ? (
          <div className={styles.confirm}>
            <span>¿Reemplazar todo por la rutina de ejemplo?</span>
            <button className={styles.link} onClick={() => setReset(false)}>
              No
            </button>
            <button
              className={styles.linkStrong}
              onClick={() => {
                const r = rutinaEjemplo()
                saveRutina(r)
                setDiaId(r.dias[0].id)
                setReset(false)
              }}
            >
              Sí
            </button>
          </div>
        ) : (
          <button className={styles.link} onClick={() => setReset(true)}>
            Volver a la rutina de ejemplo
          </button>
        )}
      </div>

      {editing && (
        <div className={styles.overlay}>
          <BloqueSheet
            key={editing.id}
            b={editing}
            index={dia.bloques.indexOf(editing)}
            last={dia.bloques.length - 1}
            onPatch={(p) => update((r) => patchBloque(r, dia.id, editing.id, p))}
            onMove={(to) => update((r) => moveBloque(r, dia.id, dia.bloques.indexOf(editing), to))}
            onRemove={() => {
              update((r) => removeBloque(r, dia.id, editing.id))
              setEditId(null)
            }}
            onClose={() => setEditId(null)}
          />
        </div>
      )}

      {picker && (
        <div className={styles.overlay}>
          <Picker
            dia={dia}
            onPick={(e) => {
              setPicker(false)
              agregar(newBloque('fuerza', { ejercicioId: e.id, nombre: e.nombre }))
            }}
            onClose={() => setPicker(false)}
          />
        </div>
      )}
    </main>
  )
}

/* ───────── Controles ───────── */

function Stepper({ label, value, display, onChange, step, min, max = 9999 }: { label: string; value: number; display?: string; onChange: (n: number) => void; step: number; min: number; max?: number }) {
  return (
    <div className={styles.stepRow}>
      <span className={styles.stepLabel}>{label}</span>
      <div className={styles.stepper}>
        <button className={styles.round} aria-label={`Menos ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(Math.max(min, round1(value - step)))}>
          −
        </button>
        <span className={styles.stepValue} aria-live="polite">
          {display ?? value}
        </span>
        <button className={styles.round} aria-label={`Más ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(Math.min(max, round1(value + step)))}>
          +
        </button>
      </div>
    </div>
  )
}

interface SheetProps {
  b: EBloque
  index: number
  last: number
  onPatch: (p: Partial<EBloque>) => void
  onMove: (to: number) => void
  onRemove: () => void
  onClose: () => void
}

function BloqueSheet({ b, index, last, onPatch, onMove, onRemove, onClose }: SheetProps) {
  const [nombre, setNombre] = useState(b.nombre)
  const tipo = b.tipo === 'fuerza' ? 'EJERCICIO' : b.tipo === 'tiempo' ? 'POR TIEMPO' : 'CIRCUITO'

  const commitNombre = () => {
    const limpio = nombre.trim()
    if (!limpio || limpio === b.nombre) return setNombre(b.nombre)
    if (b.tipo === 'fuerza') {
      // Un nombre nuevo es un ejercicio nuevo: queda en la biblioteca para la próxima.
      const e = addEjercicio(limpio)
      onPatch({ nombre: e.nombre, ejercicioId: e.id })
    } else {
      onPatch({ nombre: limpio })
    }
  }

  const patchPaso = (i: number, p: Partial<EPaso>) => onPatch({ pasos: b.pasos.map((x, j) => (j === i ? { ...x, ...p } : x)) })

  return (
    <Sheet label={`Editar ${b.nombre}`} onClose={onClose}>
      <div className={styles.sheetHead}>
        <span className={styles.kicker}>
          {tipo} · {minutesOf(b)} MIN
        </span>
        <button className={styles.done} onClick={onClose}>
          LISTO
        </button>
      </div>
      <label className={styles.srOnly} htmlFor="bloque-nombre">
        Nombre
      </label>
      <input
        id="bloque-nombre"
        className={styles.nameInput}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onBlur={commitNombre}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />

      {b.tipo === 'fuerza' && (
        <>
          <Stepper label="Series" value={b.series} step={1} min={1} max={20} onChange={(series) => onPatch({ series })} />
          <Stepper label="Reps" value={b.reps} step={1} min={1} max={100} onChange={(reps) => onPatch({ reps })} />
          <Stepper label="Peso inicial" value={b.pesoKg} display={`${fmtKg(b.pesoKg)} kg`} step={2.5} min={0} onChange={(pesoKg) => onPatch({ pesoKg })} />
          <Stepper label="Descanso" value={b.descansoS} display={fmtTime(b.descansoS)} step={15} min={15} max={600} onChange={(descansoS) => onPatch({ descansoS })} />
          <p className={styles.hint}>Después de cada entreno arranca con el último peso que usaste, y te sugiere +2,5 kg cuando completás todo.</p>
        </>
      )}

      {b.tipo === 'tiempo' && (
        <>
          <Stepper label="Minutos" value={b.minutos} step={1} min={1} max={120} onChange={(minutos) => onPatch({ minutos })} />
          <div className={styles.chips} role="radiogroup" aria-label="Momento">
            {['Calentamiento', 'Final', 'Cardio'].map((s) => (
              <button key={s} role="radio" aria-checked={b.subtitulo === s} className={styles.chip} onClick={() => onPatch({ subtitulo: s })}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {b.tipo === 'circuito' && (
        <>
          <Stepper label="Rondas" value={b.rondas} step={1} min={1} max={20} onChange={(rondas) => onPatch({ rondas })} />
          <div className={styles.pasos}>
            {b.pasos.map((p, i) => (
              <div key={i} className={styles.paso}>
                <input className={styles.pasoName} aria-label={`Paso ${i + 1}`} value={p.nombre} onChange={(e) => patchPaso(i, { nombre: e.target.value })} />
                <div className={styles.pasoRow}>
                  <div className={styles.toggle} role="radiogroup" aria-label="Por tiempo o por reps">
                    <button role="radio" aria-checked={!!p.segundos} onClick={() => patchPaso(i, { segundos: p.segundos ?? 30, reps: undefined })}>
                      Seg
                    </button>
                    <button role="radio" aria-checked={!p.segundos} onClick={() => patchPaso(i, { reps: p.reps ?? 12, segundos: undefined })}>
                      Reps
                    </button>
                  </div>
                  <div className={styles.stepper}>
                    <button
                      className={styles.round}
                      aria-label="Menos"
                      onClick={() => (p.segundos ? patchPaso(i, { segundos: Math.max(5, p.segundos - 5) }) : patchPaso(i, { reps: Math.max(1, (p.reps ?? 12) - 1) }))}
                    >
                      −
                    </button>
                    <span className={styles.stepValue}>{p.segundos ? `${p.segundos}s` : p.reps}</span>
                    <button className={styles.round} aria-label="Más" onClick={() => (p.segundos ? patchPaso(i, { segundos: p.segundos + 5 }) : patchPaso(i, { reps: (p.reps ?? 12) + 1 }))}>
                      +
                    </button>
                  </div>
                  <button className={styles.x} aria-label={`Quitar ${p.nombre}`} disabled={b.pasos.length <= 1} onClick={() => onPatch({ pasos: b.pasos.filter((_, j) => j !== i) })}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button className={styles.secondary} onClick={() => onPatch({ pasos: [...b.pasos, { nombre: 'Nuevo paso', segundos: 30 }] })}>
              + Paso
            </button>
          </div>
        </>
      )}

      <div className={styles.sheetActions}>
        <button className={styles.secondary} disabled={index <= 0} onClick={() => onMove(index - 1)}>
          ↑ Subir
        </button>
        <button className={styles.secondary} disabled={index >= last} onClick={() => onMove(index + 1)}>
          ↓ Bajar
        </button>
        <button className={styles.remove} onClick={onRemove}>
          Quitar
        </button>
      </div>
    </Sheet>
  )
}

function Picker({ dia, onPick, onClose }: { dia: EDia; onPick: (e: Ejercicio) => void; onClose: () => void }) {
  const ejercicios = useEjercicios()
  const [q, setQ] = useState('')
  const t = q.trim().toLowerCase()
  const list = useMemo(
    () => ejercicios.filter((e) => !t || e.nombre.toLowerCase().includes(t) || (e.grupo ?? '').toLowerCase().includes(t)).slice(0, 60),
    [ejercicios, t],
  )
  const exact = ejercicios.some((e) => e.nombre.toLowerCase() === t)
  const enDia = new Set(dia.bloques.map((b) => b.ejercicioId))

  return (
    <Sheet label="Agregar ejercicio" onClose={onClose}>
      <div className={styles.sheetHead}>
        <span className={styles.kicker}>AGREGAR AL DÍA {dia.letra}</span>
        <button className={styles.done} onClick={onClose}>
          CERRAR
        </button>
      </div>
      <label className={styles.srOnly} htmlFor="buscar-ejercicio">
        Buscar o crear ejercicio
      </label>
      <input
        id="buscar-ejercicio"
        className={styles.search}
        placeholder="Buscá o escribí uno nuevo"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && q.trim()) onPick(exact ? ejercicios.find((x) => x.nombre.toLowerCase() === t)! : addEjercicio(q))
        }}
        autoFocus
      />
      {!!q.trim() && !exact && (
        <button className={styles.create} onClick={() => onPick(addEjercicio(q))}>
          + Crear «{q.trim()}»
          <small>Queda guardado en tu biblioteca</small>
        </button>
      )}
      <ul className={styles.lib}>
        {list.map((e) => (
          <li key={e.id} className={styles.libRow}>
            <button className={styles.libPick} onClick={() => onPick(e)}>
              <span className={styles.libName}>{e.nombre}</span>
              <span className={styles.libMeta}>{e.propio ? 'Tuyo' : [e.grupo, e.equipo].filter(Boolean).join(' · ')}{enDia.has(e.id) ? ' · ya está en el día' : ''}</span>
            </button>
            {e.propio && (
              <button className={styles.x} aria-label={`Borrar ${e.nombre} de la biblioteca`} onClick={() => removeEjercicio(e.id)}>
                ✕
              </button>
            )}
          </li>
        ))}
        {list.length === 0 && !q.trim() && <li className={styles.libEmpty}>Tu biblioteca está vacía.</li>}
      </ul>
    </Sheet>
  )
}

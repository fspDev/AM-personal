import { useSyncExternalStore } from 'react'
import { slugify } from '../keys'
import { newBloque, toRows, type ERutina } from './editor'
import type { RutinaRow } from './mapRutina'

/**
 * La rutina y la biblioteca de ejercicios del usuario, guardadas en el teléfono.
 * Todo cambio se guarda al instante: no hay "publicar" ni servidor.
 */

const RUTINA_KEY = 'entreno:rutina'
const LIB_KEY = 'entreno:ejercicios'

export interface Ejercicio {
  id: string
  nombre: string
  grupo: string | null
  equipo: string | null
  /** Lo agregó el usuario (los de base vienen con la app). */
  propio?: boolean
}

const BASE: Omit<Ejercicio, 'id'>[] = [
  { nombre: 'Sentadilla con barra', grupo: 'Piernas', equipo: 'Barra' },
  { nombre: 'Press banca', grupo: 'Pecho', equipo: 'Barra' },
  { nombre: 'Remo con mancuerna', grupo: 'Espalda', equipo: 'Mancuerna' },
  { nombre: 'Peso muerto rumano', grupo: 'Piernas', equipo: 'Barra' },
  { nombre: 'Press militar', grupo: 'Hombros', equipo: 'Barra' },
  { nombre: 'Prensa 45°', grupo: 'Piernas', equipo: 'Máquina' },
  { nombre: 'Dominadas', grupo: 'Espalda', equipo: 'Peso corporal' },
  { nombre: 'Curl de bíceps', grupo: 'Brazos', equipo: 'Mancuerna' },
  { nombre: 'Extensión de tríceps', grupo: 'Brazos', equipo: 'Polea' },
  { nombre: 'Zancadas', grupo: 'Piernas', equipo: 'Mancuerna' },
  { nombre: 'Hip thrust', grupo: 'Glúteos', equipo: 'Barra' },
  { nombre: 'Jalón al pecho', grupo: 'Espalda', equipo: 'Polea' },
]

export const BASE_EJERCICIOS: Ejercicio[] = BASE.map((e) => ({ ...e, id: slugify(e.nombre) }))

/** Rutina con la que arranca la app: así se ve el recorrido completo sin cargar nada. */
export function rutinaEjemplo(): ERutina {
  const fuerza = (nombre: string, series: number, reps: number, pesoKg: number, descansoS = 90) =>
    newBloque('fuerza', { ejercicioId: slugify(nombre), nombre, series, reps, pesoKg, descansoS })
  const bici = (subtitulo: 'Calentamiento' | 'Final', minutos: number) =>
    newBloque('tiempo', {
      nombre: subtitulo === 'Calentamiento' ? 'Bici fija' : 'Bici y elongación',
      minutos,
      subtitulo,
      indicacion: subtitulo === 'Calentamiento' ? 'Ritmo suave · 70–80 rpm' : 'Pedaleo suave y elongá al terminar',
    })
  return {
    id: 'rutina',
    nombre: 'Mi rutina',
    dias: [
      {
        id: 'dia-a',
        letra: 'A',
        bloques: [bici('Calentamiento', 8), fuerza('Sentadilla con barra', 4, 8, 40), fuerza('Press banca', 4, 8, 30), fuerza('Remo con mancuerna', 3, 10, 18), bici('Final', 5)],
      },
      {
        id: 'dia-b',
        letra: 'B',
        bloques: [
          bici('Calentamiento', 8),
          fuerza('Peso muerto rumano', 3, 10, 40),
          fuerza('Press militar', 3, 10, 20),
          newBloque('circuito', {
            nombre: 'Plancha + core',
            rondas: 3,
            pasos: [
              { nombre: 'Plancha frontal', segundos: 45 },
              { nombre: 'Plancha lateral derecha', segundos: 30 },
              { nombre: 'Plancha lateral izquierda', segundos: 30 },
              { nombre: 'Dead bug', reps: 12 },
            ],
          }),
          bici('Final', 5),
        ],
      },
    ],
  }
}

function read<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback()
  } catch {
    return fallback()
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sin espacio: queda en memoria por esta sesión */
  }
}

const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const emit = () => listeners.forEach((l) => l())

let rutinaCache: ERutina | null = null
let libCache: Ejercicio[] | null = null

export const getRutina = (): ERutina => (rutinaCache ??= read(RUTINA_KEY, rutinaEjemplo))

export function saveRutina(r: ERutina) {
  rutinaCache = r
  write(RUTINA_KEY, r)
  emit()
}

export const getEjercicios = (): Ejercicio[] => (libCache ??= read(LIB_KEY, () => BASE_EJERCICIOS))

/** Suma un ejercicio a la biblioteca (o devuelve el que ya existe con ese nombre). */
export function addEjercicio(nombre: string): Ejercicio {
  const limpio = nombre.trim().replace(/\s+/g, ' ')
  const id = slugify(limpio)
  const list = getEjercicios()
  const existing = list.find((e) => e.id === id)
  if (existing) return existing
  const nuevo: Ejercicio = { id, nombre: limpio, grupo: null, equipo: null, propio: true }
  libCache = [...list, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  write(LIB_KEY, libCache)
  emit()
  return nuevo
}

export function removeEjercicio(id: string) {
  libCache = getEjercicios().filter((e) => e.id !== id)
  write(LIB_KEY, libCache)
  emit()
}

export const useRutinaEditable = () => useSyncExternalStore(subscribe, getRutina)
export const useEjercicios = () => useSyncExternalStore(subscribe, getEjercicios)

/** La rutina del editor → la forma que entiende el reproductor (`mapRutina`). */
export function toRutinaRow(r: ERutina): RutinaRow {
  const { dias, bloques } = toRows(r)
  return {
    id: r.id,
    nombre: r.nombre,
    dias_por_semana: r.dias.length,
    version: 0,
    publicada_at: null,
    dias: dias.map((d) => ({
      id: d.id,
      letra: d.letra,
      orden: d.orden,
      bloques: bloques
        .filter((b) => b.dia_id === d.id)
        .map(({ dia_id: _dia, ...b }) => {
          void _dia
          return b
        }),
    })),
  }
}

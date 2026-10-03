import type { Day } from '../data'
import type { Rutina } from './mapRutina'
import { useRutina } from './rutina'

export interface DaysState {
  days: Day[]
  rutina: Rutina | null
  loading: boolean
  /** Todavía no armó ningún día con bloques: toca la pantalla para armar la rutina. */
  sinRutina: boolean
}

/** Los días que se pueden entrenar: los de la rutina que armó el usuario. */
export function useDays(): DaysState {
  const { rutina, loading } = useRutina()
  const days = rutina?.days ?? []
  return { days, rutina, loading, sinRutina: days.length === 0 }
}

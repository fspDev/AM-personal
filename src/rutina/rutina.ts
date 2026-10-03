import { useMemo } from 'react'
import { mapRutina, type Rutina } from './mapRutina'
import { toRutinaRow, useRutinaEditable } from './store'

export interface RutinaState {
  rutina: Rutina | null
  loading: boolean
}

/** La rutina que armó el usuario, lista para entrenar. Sin días con bloques = `null`. */
export function useRutina(): RutinaState {
  const editable = useRutinaEditable()
  return useMemo(() => {
    const rutina = mapRutina(toRutinaRow(editable))
    return { rutina: rutina.days.length ? rutina : null, loading: false }
  }, [editable])
}

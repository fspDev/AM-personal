import { describe, expect, it } from 'vitest'
import { addDia, addBloque, newBloque } from './editor'
import { addEjercicio, getEjercicios, rutinaEjemplo, toRutinaRow } from './store'
import { mapRutina, shortName, type RutinaRow } from './mapRutina'

const bloque = (o: Partial<RutinaRow['dias'][number]['bloques'][number]> & { id: string; orden: number; tipo: 'fuerza' | 'tiempo' | 'circuito'; nombre: string }) => ({
  ejercicio_id: null,
  series: null,
  reps: null,
  peso_kg: null,
  descanso_s: null,
  minutos: null,
  rondas: null,
  pasos: null,
  ...o,
})

const row: RutinaRow = {
  id: 'r1',
  nombre: 'Plan 3 días',
  dias_por_semana: 3,
  version: 4,
  publicada_at: '2026-09-30T10:00:00Z',
  dias: [
    { id: 'd2', letra: 'B', orden: 2, bloques: [] },
    {
      id: 'd1',
      letra: 'A',
      orden: 1,
      bloques: [
        bloque({ id: 'b2', orden: 2, tipo: 'fuerza', nombre: 'Press banca', ejercicio_id: 'ej-press', series: 4, reps: 8, peso_kg: 35, descanso_s: 120 }),
        bloque({ id: 'b1', orden: 1, tipo: 'tiempo', nombre: 'Bici fija', minutos: 8 }),
        bloque({ id: 'b3', orden: 3, tipo: 'circuito', nombre: 'Core', rondas: 3, pasos: [{ nombre: 'Plancha', segundos: 45 }, { nombre: 'Dead bug', reps: 12 }] }),
      ],
    },
  ],
}

describe('mapRutina', () => {
  const r = mapRutina(row)

  it('ordena días y bloques, y descarta los días vacíos', () => {
    expect(r.days.map((d) => d.letter)).toEqual(['A'])
    expect(r.days[0].blocks.map((b) => b.id)).toEqual(['b1', 'b2', 'b3'])
    expect(r).toMatchObject({ version: 4, diasPorSemana: 3 })
  })

  it('el bloque de fuerza conserva ejercicio, peso y descanso del profe', () => {
    expect(r.days[0].blocks[1]).toMatchObject({ kind: 'fuerza', exerciseId: 'ej-press', series: 4, reps: 8, weight: 35, restSeconds: 120, short: 'PRESS BANCA', minutes: 11 })
  })

  it('el circuito arma pasos por tiempo o por reps', () => {
    expect(r.days[0].blocks[2]).toMatchObject({ kind: 'circuito', rounds: 3, steps: [{ name: 'Plancha', seconds: 45 }, { name: 'Dead bug', reps: 12 }] })
  })

  it('sin descanso cargado queda indefinido para que valga el del Perfil', () => {
    const b = mapRutina({ ...row, dias: [{ id: 'd', letra: 'A', orden: 1, bloques: [bloque({ id: 'x', orden: 1, tipo: 'fuerza', nombre: 'Remo con mancuerna', series: 3, reps: 10 })] }] }).days[0].blocks[0]
    expect(b).toMatchObject({ restSeconds: undefined, weight: 0, exerciseId: 'remo-con-mancuerna', short: 'REMO CON' })
  })
})

describe('shortName', () => {
  it('junta palabras cortas con la siguiente', () => {
    expect(shortName('Sentadilla con barra')).toBe('SENTADILLA')
    expect(shortName('Peso muerto rumano')).toBe('PESO MUERTO')
    expect(shortName('Dominadas')).toBe('DOMINADAS')
  })
})

describe('rutina local', () => {
  it('la rutina de ejemplo se puede entrenar: días A y B, con bici al principio y al final', () => {
    const r = mapRutina(toRutinaRow(rutinaEjemplo()))
    expect(r.days.map((d) => d.letter)).toEqual(['A', 'B'])
    const a = r.days[0].blocks
    expect(a[0]).toMatchObject({ kind: 'tiempo', subtitle: 'Calentamiento', minutes: 8 })
    expect(a[1]).toMatchObject({ kind: 'fuerza', exerciseId: 'sentadilla-con-barra', series: 4, reps: 8, weight: 40, restSeconds: 90 })
    expect(r.days[1].blocks.some((b) => b.kind === 'circuito')).toBe(true)
  })

  it('un día vacío no se puede entrenar', () => {
    const r = addDia({ id: 'r', nombre: 'R', dias: [] })
    expect(mapRutina(toRutinaRow(r)).days).toEqual([])
    const conUno = addBloque(r, r.dias[0].id, newBloque('fuerza', { nombre: 'Remo' }))
    expect(mapRutina(toRutinaRow(conUno)).days).toHaveLength(1)
  })

  it('un ejercicio nuevo queda en la biblioteca una sola vez, aunque se escriba distinto', () => {
    const antes = getEjercicios().length
    const e = addEjercicio('  Vuelos   laterales ')
    expect(e).toMatchObject({ id: 'vuelos-laterales', nombre: 'Vuelos laterales', propio: true })
    expect(addEjercicio('vuelos laterales').id).toBe('vuelos-laterales')
    expect(getEjercicios()).toHaveLength(antes + 1)
  })
})

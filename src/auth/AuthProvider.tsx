import { useMemo, type ReactNode } from 'react'
import { useSettings } from '../settings'
import { AuthContext, type AuthValue } from './context'

const noop = () => {}

/** Un solo usuario local: el "perfil" es el nombre que se carga en Perfil. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { nombre } = useSettings()
  const value = useMemo<AuthValue>(
    () => ({
      status: 'in',
      userId: 'local',
      profile: { id: 'local', rol: 'socio', nombre, apellido: '', email: '', profeId: null, profeNombre: null, profeEmail: null },
      syncNow: noop,
    }),
    [nombre],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

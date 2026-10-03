import { createContext, useContext } from 'react'

/** Versión de un solo usuario: no hay cuentas ni servidor, todo vive en el teléfono. */
export interface Profile {
  id: string
  rol: 'socio'
  nombre: string
  apellido: string
  email: string
  profeId: null
  profeNombre: string | null
  profeEmail: string | null
}

export type AuthStatus = 'in'

export interface AuthValue {
  status: AuthStatus
  userId: string
  profile: Profile
  /** Sin servidor no hay nada que subir; queda para que el reproductor no cambie. */
  syncNow: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth fuera de <AuthProvider>')
  return v
}

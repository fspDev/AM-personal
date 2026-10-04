import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context'
import { SinAcceso } from './SinAcceso'

/** La app de entreno es de los estudiantes: sin sesión manda a ingresar y al profe, a su panel. */
export function RequireAuth() {
  const { status, profile } = useAuth()
  if (status === 'loading') return null
  if (status === 'out') return <Navigate to="/ingreso" replace />
  if (status === 'sin-acceso') return <SinAcceso />
  if (profile?.rol === 'profe') return <Navigate to="/panel" replace />
  return <Outlet />
}

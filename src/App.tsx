import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useSettings } from './settings'
import { applyPalette } from './theme'
import { Entreno } from './entreno/Entreno'
import { Hoy } from './hoy/Hoy'
import { Perfil } from './perfil/Perfil'
import { Progreso } from './progreso/Progreso'
import { MiRutina } from './rutina/MiRutina'
import { TabsLayout } from './tabs/TabsLayout'
import { UpdateBanner } from './UpdateBanner'

export default function App() {
  const { paleta } = useSettings()
  useEffect(() => applyPalette(paleta), [paleta])

  return (
    <>
      <UpdateBanner />
      <Routes>
        <Route element={<TabsLayout />}>
          <Route index element={<Hoy />} />
          <Route path="rutina" element={<MiRutina />} />
          <Route path="progreso" element={<Progreso />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
        <Route path="/entreno" element={<Entreno />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

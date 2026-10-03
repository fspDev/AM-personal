import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Se publica en GitHub Pages bajo /ENTRENO/. Comparte dominio con otras apps (fspdev.github.io):
// por eso todo lo que se guarda en el teléfono lleva el prefijo "entreno:".
const base = process.env.BASE ?? '/ENTRENO/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // "prompt": la app nueva no se activa sola; el socio elige cuándo (nunca en medio de un entreno).
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Entreno',
        short_name: 'Entreno',
        id: base,
        description: 'Armá tu rutina y entrená bloque por bloque.',
        lang: 'es-AR',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#181818',
        theme_color: '#181818',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // La app completa (incluidas las tipografías, que van empaquetadas) queda guardada: abre sin señal.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        // Sin reglas de caché en tiempo de ejecución: todo queda en el teléfono.
      },
    }),
  ],
})

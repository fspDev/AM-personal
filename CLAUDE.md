# Entreno

Versión de muestra (un solo usuario, sin servidor) de la app de entrenamiento: el usuario arma su rutina y la entrena bloque por bloque. Se usa para venderla a gimnasios, así que el lugar del logo dice "TU LOGO AQUÍ".
Viene de la app de 653 Gym & Fitness (`D:\Desktop\GymApp\app`), sin Firebase, cuentas ni panel del profe.

## Datos

Todo vive en el teléfono:
- `localStorage`: `entreno:rutina` (la rutina en formato del editor, `rutina/editor.ts`), `entreno:ejercicios` (biblioteca: base + los que crea el usuario), `entreno:settings`, `entreno:workout` (entreno en curso).
- IndexedDB `entreno` (Dexie): historial de entrenos y series.

La app se publica en `fspdev.github.io/ENTRENO/`, el mismo dominio que la del gimnasio: **toda clave local lleva el prefijo `entreno:`** para no pisar datos de la otra.

## Convenciones

- React + TypeScript + Vite, CSS Modules con las variables de `src/index.css`. Sin librerías de UI.
- Colores: las paletas de `src/theme.ts` definen fondo y texto, y de ahí salen el resto de los tonos. No usar colores fijos en el CSS: usar las variables. El acento es el ámbar del gimnasio (`--accent`) y lleva texto oscuro (`--on-accent`); como texto o borde sobre el fondo usar `--accent-ink`.
- Textos en español rioplatense (vos), números `es-AR`. Áreas táctiles ≥ 44 px.
- Tiempos contra instantes de fin, nunca contando ticks. Lógica pura con tests de Vitest.

## Probar y publicar

```bash
npm run dev     # http://localhost:5173/ENTRENO/
npm test
```

Cada push a `main` corre los tests y publica con GitHub Actions (`.github/workflows/deploy.yml`).

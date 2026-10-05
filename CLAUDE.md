# AM · Andrés Millares Personal Trainer

App de entrenamiento con dos tipos de usuario:
- **Estudiantes** (la app, `/`): ven el plan que les armó el profe y lo entrenan bloque por bloque (reproductor de ENTRENO: series con peso y descanso, bici por tiempo, circuitos, ventana flotante, progreso y récords). Cada ejercicio puede traer una indicación y un video de YouTube del profe (botón PROFE durante el entreno).
- **Profe** (uno solo, `/panel`): da de alta estudiantes, arma y publica su plan, ve el registro de cada entreno, la evolución (constancia, peso por ejercicio, medidas) y las cuotas. Maneja la biblioteca de ejercicios (editar, eliminar, videos), su cuenta (nombre, usuario, contraseña, colores) y puede armar y entrenar **su propia rutina** con la app (`/panel/mi-rutina`).

Viene de ENTRENO (`D:\Desktop\ENTRENO`, una versión de muestra sin servidor) con la capa de Firebase y el panel de la app de 653 Gym (`D:\Desktop\GymApp\app`).

## Datos (Firebase compartido con 653 Gym)

Proyecto `somaapp-7166a`; todo lo de AM lleva prefijo `am`:
- `amConfig/profe`: `{ uid, nombre, apellido, username }`. Se crea una sola vez desde la pantalla de ingreso ("Primera vez: crear la cuenta del profe"); el profe puede cambiar nombre y usuario, nadie puede cambiar el `uid`. Al cambiar el usuario se crea `amLogins/{nuevo}` con la misma cuenta interna y se borra el viejo (solo entran usuarios registrados en `amLogins`).
- `amLogins/{usuario}`: `{ email, sid, rol }`: con qué cuenta interna entra cada usuario. Se lee sin sesión (de a uno; no se lista).
- `amStudents/{sid}`: ficha (`uid` = cuenta vigente, `cuota {monto, dia}`, `rutina {nombre, version, publicadaAt, dias}`, `exercisePrefs`) + subcolecciones `days` (plan), `logs` (entrenos, `src/syncFormat.ts`), `pagos`, `medidas`.
- `amExercises/{slug}`: biblioteca del profe (nombre, grupo, video). Los de base están en `src/panel/biblioteca.ts`; eliminar marca `oculto: true`.
- La rutina propia del profe es la ficha `amStudents/yo-{uid}` (`esFichaProfe`): no aparece en la lista de estudiantes ni tiene cuotas.

**Cuentas sin servidor propio:** usuario `nombre.apellido` → cuenta interna `nombre.apellido@am-personal.app`. Sin servidor no se puede cambiar la contraseña de otra cuenta, así que el profe "resetea" creando una cuenta nueva (`nombre.apellido+2@…`) y apuntando `amLogins` y `amStudents.uid` a esa; la vieja queda sin acceso (pantalla `SinAcceso`). El estudiante cambia la suya desde Perfil (pide la actual). Ver `src/cuentas.ts` y `src/panel/api.ts`.

**Reglas:** `firestore.rules` es UNO para todo el proyecto (SomaApp + 653 + AM). La copia de verdad está en `D:\Desktop\GymApp\app\firestore.rules`; la de acá tiene que ser idéntica. Antes de desplegar, `node scripts/test-reglas.mjs` (casos de AM y de 653). Desplegar desde la carpeta de GymApp: `firebase deploy --only firestore:rules --project somaapp-7166a`.

En el teléfono: `localStorage` con prefijo `am:` (perfil, plan, ajustes, entreno en curso) e IndexedDB `am` (historial). La app comparte dominio (`fspdev.github.io`) con las otras: **toda clave local lleva `am:`**. Al cerrar sesión se borra el historial local.

## Capa de servidor

`src/backend/`: interfaz chica (`Store` por rutas + `AuthApi`) con dos implementaciones: `firebase.ts` y `demo.ts` (todo en el navegador). El código de la app y del panel solo usa `store`/`authApi` de `src/backend`.

**Modo demo** (solo `npm run dev`): abrir con `?demo` (`?real` lo apaga). Datos de ejemplo en `src/backend/demoSeed.ts`: profe `andres.millares`, estudiantes `juan.perez`, `lucia.gomez`, `martin.diaz`, todos con contraseña `demo1234`. Sirve para probar todo sin tocar Firebase.

## Convenciones

- React + TypeScript + Vite, CSS Modules con las variables de `src/index.css`/`src/theme.ts`. Sin librerías de UI.
- Marca: monograma AM (`src/ui/logoGeometry.ts`, `src/ui/Logo.tsx`), acento lima `#c6f135` con texto oscuro (`--on-accent`); como texto o borde sobre el fondo usar `--accent-ink`. Íconos: `node scripts/iconos.mjs`.
- Textos en español rioplatense (vos), números `es-AR`. Áreas táctiles ≥ 44 px. El panel tiene que andar en el celular.
- Tiempos contra instantes de fin, nunca contando ticks. Lógica pura con tests de Vitest (cuentas, cuotas, plan, YouTube, listado).
- Firestore no acepta `undefined` (se ignora con `ignoreUndefinedProperties`); preferir `null`.

## Probar y publicar

```bash
npm run dev     # http://localhost:5173/AM-personal/  (?demo para el modo demo)
npm test
```

Cada push a `main` corre los tests y publica con GitHub Actions en https://fspdev.github.io/AM-personal/ (hay que tener Pages con "GitHub Actions" como fuente en la configuración del repo).

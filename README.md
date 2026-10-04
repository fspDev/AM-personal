# AM · Andrés Millares Personal Trainer

App de entrenamiento para los estudiantes de Andrés y panel del profe.

**App:** https://fspdev.github.io/AM-personal/ · **Panel del profe:** https://fspdev.github.io/AM-personal/panel

- **Estudiantes:** entran con `nombre.apellido` y la contraseña que les da el profe (la pueden cambiar en Perfil). Ven su plan con las indicaciones y videos de cada ejercicio y lo entrenan bloque por bloque; el historial se sube solo.
- **Profe:** da de alta estudiantes (genera usuario y contraseña, y se los manda por WhatsApp), resetea contraseñas, arma y publica el plan de cada uno con comentarios y links de YouTube, y sigue su registro de entrenos, evolución (constancia, peso por ejercicio, medidas) y cuotas.

La primera vez que se abre la app aparece "Primera vez: crear la cuenta del profe".

```bash
npm install
npm run dev      # con ?demo: datos de ejemplo, sin Firebase
npm test
```

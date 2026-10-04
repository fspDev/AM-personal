/** El mismo proyecto de Firebase que la app de 653 Gym: todo lo de AM lleva el prefijo "am". */
export const firebaseConfig = {
  apiKey: 'AIzaSyAeBQNCxL8tzeRfAfyjTOOqcivt5lFEgjk',
  authDomain: 'somaapp-7166a.firebaseapp.com',
  projectId: 'somaapp-7166a',
  storageBucket: 'somaapp-7166a.firebasestorage.app',
  messagingSenderId: '804374144817',
  appId: '1:804374144817:web:73c38e8af161da4a503210',
}

export const COL = {
  /** `amConfig/profe`: quién es el profe ({ uid, nombre, username }). */
  config: 'amConfig',
  /** `amLogins/{usuario}`: con qué cuenta interna entra cada usuario ({ email, sid?, rol }). */
  logins: 'amLogins',
  /** `amStudents/{sid}` + subcolecciones `days`, `logs`, `pagos`, `medidas`. */
  students: 'amStudents',
  /** Biblioteca de ejercicios del profe (con su video). */
  exercises: 'amExercises',
} as const

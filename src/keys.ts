// Claves y formatos compartidos (lógica pura, sin dependencias).

export function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** "Press banca con barra" → "press-banca-con-barra". Es la clave del ejercicio en historial y biblioteca. */
export function slugify(name: string): string {
  return stripDiacritics((name || '').trim().toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

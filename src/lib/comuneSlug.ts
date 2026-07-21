/** Converte il nome di un comune in uno slug URL-safe (lowercase, senza accenti). */
export function comuneSlug(nome: string): string {
  return nome
    .normalize('NFD')                 // separa i diacritici
    .replace(/[̀-ͯ]/g, '')  // rimuove i diacritici
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')      // ogni non-alfanumerico -> trattino
    .replace(/^-+|-+$/g, '');         // trim dei trattini ai bordi
}

import { comuniPriority, type ComunePriority } from '../data/comuniPriority';
import { findComune } from './comuniData';
import { comuneSlug } from './comuneSlug';

export interface ComunePage {
  nome: string;
  provincia: string;
  codiceCatastale: string;
  slug: string;
}

/**
 * Risolve la lista curata in pagine pronte da renderizzare.
 * Throw se la lista contiene un duplicato esatto (stesso nome+provincia) o
 * se un comune non è in comuni.json (fail-fast, no pagina fantasma).
 * Dedup: se due comuni DIVERSI producono lo stesso slug, tutti i collidenti
 * ricevono il suffisso "-<provincia lowercase>".
 *
 * @param priority lista da risolvere (default: la lista curata). Parametrizzato
 *   per testabilità del guard sui duplicati.
 */
export function resolveComuni(priority: ComunePriority[] = comuniPriority): ComunePage[] {
  // Guard: un duplicato esatto (nome+provincia) genererebbe due path identici
  // in getStaticPaths e Astro scarterebbe silenziosamente una delle pagine.
  const seen = new Set<string>();
  for (const p of priority) {
    const key = `${p.nome.toLowerCase()}|${p.provincia}`;
    if (seen.has(key)) {
      throw new Error(`Comune duplicato in comuniPriority: ${p.nome} (${p.provincia})`);
    }
    seen.add(key);
  }

  const base = priority.map(p => {
    const found = findComune(p.nome, p.provincia);
    if (!found) {
      throw new Error(`Comune non trovato in comuni.json: ${p.nome} (${p.provincia})`);
    }
    return {
      nome: found.nome,
      provincia: found.provincia,
      codiceCatastale: found.codiceCatastale,
      slug: comuneSlug(found.nome),
    };
  });

  // Conta gli slug per individuare le collisioni
  const counts = new Map<string, number>();
  for (const c of base) counts.set(c.slug, (counts.get(c.slug) ?? 0) + 1);

  return base.map(c =>
    (counts.get(c.slug) ?? 0) > 1
      ? { ...c, slug: `${c.slug}-${c.provincia.toLowerCase()}` }
      : c
  );
}

/** Comuni della stessa provincia (esclusa la pagina corrente), max N. */
export function comuniVicini(slug: string, all: ComunePage[], max = 6): ComunePage[] {
  const current = all.find(c => c.slug === slug);
  if (!current) return [];
  return all
    .filter(c => c.provincia === current.provincia && c.slug !== slug)
    .slice(0, max);
}

/**
 * Mappa ogni rotta del sito ai file sorgente che ne determinano il contenuto,
 * per calcolare un <lastmod> onesto nella sitemap.
 *
 * Scelta deliberata: layout e componenti condivisi NON sono sorgenti.
 * Se lo fossero, ritoccare Layout.astro farebbe dichiarare "modificate" tutte
 * e 218 le pagine a ogni deploy — che e' esattamente il segnale che porta
 * Google a smettere di fidarsi del campo. Qui lastmod cambia solo quando
 * cambia l'informazione della pagina.
 *
 * Per i cluster programmatici la granularita' e' quella del file dati: se
 * countryContent.ts cambia per un paese, tutte le pagine paese aggiornano la
 * data. E' impreciso ma vero — il repo non registra un dato piu' fine.
 */

const PAGES = 'src/pages';

/** Sorgenti dati del cluster /codice-catastale/[comune]/ */
const SORGENTI_COMUNI = [
  'src/lib/comuniCatastale.ts',
  'src/lib/comuniData.ts',
  'src/lib/comuneSlug.ts',
  'src/data/comuniPriority.ts',
  'public/data/comuni.json',
];

/** Sorgenti dati del cluster /codice-fiscale-estero/[slug]/ */
const SORGENTI_PAESI = [
  'src/data/countryContent.ts',
  'src/data/countryFlags.ts',
  'src/data/paesiEsteri.ts',
];

/** Pagine statiche: una rotta, un file .astro. */
const STATICHE: Record<string, string> = {
  '/': `${PAGES}/index.astro`,
  '/cerca-codice-belfiore/': `${PAGES}/cerca-codice-belfiore.astro`,
  '/cerca-comune-da-codice/': `${PAGES}/cerca-comune-da-codice.astro`,
  '/codice-belfiore/': `${PAGES}/codice-belfiore.astro`,
  '/codice-fiscale-inverso/': `${PAGES}/codice-fiscale-inverso.astro`,
  '/codice-fiscale-stranieri/': `${PAGES}/codice-fiscale-stranieri.astro`,
  '/come-leggere-codice-fiscale/': `${PAGES}/come-leggere-codice-fiscale.astro`,
  '/come-si-calcola-codice-fiscale/': `${PAGES}/come-si-calcola-codice-fiscale.astro`,
  '/mese-codice-fiscale/': `${PAGES}/mese-codice-fiscale.astro`,
  '/omocodia-codice-fiscale/': `${PAGES}/omocodia-codice-fiscale.astro`,
  '/richiedere-codice-fiscale/': `${PAGES}/richiedere-codice-fiscale.astro`,
  '/tabelle-codice-fiscale/': `${PAGES}/tabelle-codice-fiscale.astro`,
  '/verifica-codice-fiscale/': `${PAGES}/verifica-codice-fiscale.astro`,
  '/codice-catastale/': `${PAGES}/codice-catastale/index.astro`,
  '/codice-fiscale-estero/come-richiedere/': `${PAGES}/codice-fiscale-estero/come-richiedere.astro`,
};

/** Template delle rotte dinamiche. */
const TEMPLATE_COMUNE = `${PAGES}/codice-catastale/[comune].astro`;
const TEMPLATE_PAESE = `${PAGES}/codice-fiscale-estero/[slug].astro`;

/**
 * Tutti i file di cui serve la data. E' l'input di scripts/generate-lastmod.ts:
 * tenerlo derivato dalle mappe qui sopra evita che le due liste divergano.
 */
export const ALL_SOURCES: string[] = [
  ...new Set([
    ...Object.values(STATICHE),
    TEMPLATE_COMUNE,
    TEMPLATE_PAESE,
    ...SORGENTI_COMUNI,
    ...SORGENTI_PAESI,
  ]),
].sort();

/** Le rotte statiche note, per i test di invariante. */
export const ROTTE_STATICHE = Object.keys(STATICHE);

/** Accetta sia un pathname sia una URL assoluta; normalizza lo slash finale. */
function normalizza(urlOPath: string): string {
  let p = urlOPath;
  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname;
    } catch {
      return '';
    }
  }
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  return p;
}

/**
 * I file sorgente che determinano il contenuto della rotta.
 * Rotta sconosciuta -> array vuoto (nessun lastmod inventato).
 */
export function resolveSources(urlOPath: string): string[] {
  const p = normalizza(urlOPath);
  if (!p) return [];

  // Le statiche vengono prima: /codice-fiscale-estero/come-richiedere/ non e'
  // una pagina paese, e /codice-catastale/ non e' una pagina comune.
  const statica = STATICHE[p];
  if (statica) return [statica];

  if (/^\/codice-catastale\/[^/]+\/$/.test(p)) {
    return [TEMPLATE_COMUNE, ...SORGENTI_COMUNI];
  }

  if (/^\/codice-fiscale-estero\/[^/]+\/$/.test(p)) {
    return [TEMPLATE_PAESE, ...SORGENTI_PAESI];
  }

  return [];
}

/** ISO -> YYYY-MM-DD. Restituisce undefined se la data non e' valida. */
function soloGiorno(iso: string): string | undefined {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * lastmod della rotta: la piu' recente fra le date delle sue sorgenti.
 * Restituisce undefined se nessuna sorgente ha una data valida — meglio
 * nessun lastmod che un lastmod inventato.
 */
export function lastmodFor(
  urlOPath: string,
  dates: Record<string, string>
): string | undefined {
  const sorgenti = resolveSources(urlOPath);
  if (sorgenti.length === 0) return undefined;

  let max = -Infinity;
  for (const f of sorgenti) {
    const iso = dates[f];
    if (!iso) continue;
    const t = Date.parse(iso);
    if (Number.isNaN(t)) continue;
    if (t > max) max = t;
  }

  if (max === -Infinity) return undefined;
  return soloGiorno(new Date(max).toISOString());
}

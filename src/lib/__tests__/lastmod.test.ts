import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveSources, lastmodFor, ALL_SOURCES, ROTTE_STATICHE } from '../lastmod';

const ROOT = resolve(__dirname, '../../..');

const DATES = {
  'src/pages/index.astro': '2026-03-01T10:00:00+01:00',
  'src/pages/tabelle-codice-fiscale.astro': '2026-06-24T09:00:00+02:00',
  'src/pages/codice-catastale/index.astro': '2026-07-21T12:00:00+02:00',
  'src/pages/codice-catastale/[comune].astro': '2026-07-21T12:00:00+02:00',
  'src/pages/codice-fiscale-estero/[slug].astro': '2026-05-13T08:00:00+02:00',
  'src/pages/codice-fiscale-estero/come-richiedere.astro': '2026-05-13T08:00:00+02:00',
  'src/data/comuniPriority.ts': '2026-08-04T10:56:00+02:00',
  'src/data/countryContent.ts': '2026-05-21T11:18:00+02:00',
  'src/data/countryFlags.ts': '2026-05-13T19:42:00+02:00',
  'src/data/paesiEsteri.ts': '2026-05-21T11:18:00+02:00',
  'public/data/comuni.json': '2026-08-04T10:40:00+02:00',
  'src/lib/comuniCatastale.ts': '2026-07-21T11:00:00+02:00',
  'src/lib/comuniData.ts': '2026-05-13T19:41:00+02:00',
  'src/lib/comuneSlug.ts': '2026-07-21T10:00:00+02:00',
};

describe('resolveSources', () => {
  it('pagina statica di primo livello', () => {
    expect(resolveSources('/tabelle-codice-fiscale/')).toEqual([
      'src/pages/tabelle-codice-fiscale.astro',
    ]);
  });

  it('homepage', () => {
    expect(resolveSources('/')).toEqual(['src/pages/index.astro']);
  });

  it('hub catastale usa index.astro, non il template per-comune', () => {
    const s = resolveSources('/codice-catastale/');
    expect(s).toContain('src/pages/codice-catastale/index.astro');
    expect(s).not.toContain('src/pages/codice-catastale/[comune].astro');
  });

  it('pagina comune include template e sorgenti dati', () => {
    const s = resolveSources('/codice-catastale/milano/');
    expect(s).toContain('src/pages/codice-catastale/[comune].astro');
    expect(s).toContain('src/data/comuniPriority.ts');
    expect(s).toContain('public/data/comuni.json');
  });

  it('pagina paese include template e sorgenti dati', () => {
    const s = resolveSources('/codice-fiscale-estero/romania/');
    expect(s).toContain('src/pages/codice-fiscale-estero/[slug].astro');
    expect(s).toContain('src/data/countryContent.ts');
    expect(s).toContain('src/data/paesiEsteri.ts');
  });

  it('come-richiedere e una pagina statica, non una pagina paese', () => {
    const s = resolveSources('/codice-fiscale-estero/come-richiedere/');
    expect(s).toEqual(['src/pages/codice-fiscale-estero/come-richiedere.astro']);
    expect(s).not.toContain('src/data/countryContent.ts');
  });

  it('accetta una URL assoluta oltre al pathname', () => {
    expect(resolveSources('https://www.calcolare-codice-fiscale.it/tabelle-codice-fiscale/')).toEqual([
      'src/pages/tabelle-codice-fiscale.astro',
    ]);
  });

  it('tollera la mancanza dello slash finale', () => {
    expect(resolveSources('/tabelle-codice-fiscale')).toEqual([
      'src/pages/tabelle-codice-fiscale.astro',
    ]);
  });

  it('rotta sconosciuta non produce sorgenti', () => {
    expect(resolveSources('/qualcosa-che-non-esiste/')).toEqual([]);
  });

  it('non esclude i layout per sbaglio: non sono mai sorgenti', () => {
    const tutte = [
      ...resolveSources('/'),
      ...resolveSources('/codice-catastale/milano/'),
      ...resolveSources('/codice-fiscale-estero/romania/'),
    ];
    expect(tutte.some((f) => f.includes('layouts/'))).toBe(false);
    expect(tutte.some((f) => f.includes('components/'))).toBe(false);
  });
});

describe('lastmodFor', () => {
  it('usa la data piu recente fra le sorgenti', () => {
    // il template e di luglio, comuniPriority di agosto: vince agosto
    expect(lastmodFor('/codice-catastale/milano/', DATES)).toBe('2026-08-04');
  });

  it('pagina statica: prende la data del suo unico file', () => {
    expect(lastmodFor('/tabelle-codice-fiscale/', DATES)).toBe('2026-06-24');
  });

  it('pagina paese: vince countryContent su template piu vecchio', () => {
    expect(lastmodFor('/codice-fiscale-estero/romania/', DATES)).toBe('2026-05-21');
  });

  it('rotta sconosciuta: nessun lastmod, mai inventato', () => {
    expect(lastmodFor('/rotta-ignota/', DATES)).toBeUndefined();
  });

  it('sorgenti note ma senza data: nessun lastmod', () => {
    expect(lastmodFor('/tabelle-codice-fiscale/', {})).toBeUndefined();
  });

  it('ignora i file senza data e usa quelli disponibili', () => {
    const parziale = { 'src/data/comuniPriority.ts': '2026-08-04T10:56:00+02:00' };
    expect(lastmodFor('/codice-catastale/milano/', parziale)).toBe('2026-08-04');
  });

  it('restituisce sempre il formato YYYY-MM-DD', () => {
    const out = lastmodFor('/', DATES);
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('scarta le date non valide invece di propagarle', () => {
    const rotto = { 'src/pages/index.astro': 'non-una-data' };
    expect(lastmodFor('/', rotto)).toBeUndefined();
  });
});

// Invarianti contro la deriva: se qualcuno rinomina o aggiunge una pagina
// senza aggiornare la mappa, quella pagina resterebbe senza lastmod in
// silenzio. Questi due test lo trasformano in un fallimento rumoroso.
describe('invarianti sulla mappa delle sorgenti', () => {
  it('ogni file dichiarato in ALL_SOURCES esiste su disco', () => {
    const mancanti = ALL_SOURCES.filter((f) => !existsSync(resolve(ROOT, f)));
    expect(mancanti).toEqual([]);
  });

  it('ogni pagina .astro statica ha una rotta nella mappa', () => {
    // 404 non va in sitemap; i template dinamici sono gestiti a parte.
    const esclusi = new Set(['404.astro', '[comune].astro', '[slug].astro']);

    const attese: string[] = [];
    for (const f of readdirSync(resolve(ROOT, 'src/pages'), { withFileTypes: true })) {
      if (f.isFile() && f.name.endsWith('.astro') && !esclusi.has(f.name)) {
        attese.push(f.name === 'index.astro' ? '/' : `/${f.name.replace('.astro', '')}/`);
      }
      if (f.isDirectory()) {
        for (const g of readdirSync(resolve(ROOT, 'src/pages', f.name))) {
          if (!g.endsWith('.astro') || esclusi.has(g)) continue;
          attese.push(g === 'index.astro' ? `/${f.name}/` : `/${f.name}/${g.replace('.astro', '')}/`);
        }
      }
    }

    const note = new Set(ROTTE_STATICHE);
    expect(attese.filter((r) => !note.has(r))).toEqual([]);
  });
});

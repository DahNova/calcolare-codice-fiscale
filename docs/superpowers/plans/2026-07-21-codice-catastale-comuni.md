# Cluster "Codice Catastale [Comune]" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pubblicare un cluster programmatico `/codice-catastale/[comune]/` + hub `/codice-catastale/` per la Wave 0 (~20 comuni top), replicando il pattern validato delle pagine-paese.

**Architecture:** Logica pura testabile in `src/lib/` (slug, load dati, resolver); dati curati in `src/data/comuniPriority.ts`; pagine `.astro` sottili che consumano il resolver via `getStaticPaths`. Fonte codici: `public/data/comuni.json` (single source of truth), letta a build-time.

**Tech Stack:** Astro 5, React 19, Tailwind 3, TypeScript, Vitest.

## Global Constraints

- Terminologia primaria delle pagine nuove = **"codice catastale"** (non "codice belfiore"); "belfiore" solo come sinonimo nel corpo.
- Ogni pagina deve **disambiguare**: codice Belfiore del comune nel CF (posizioni 12-15) ≠ visura catastale immobiliare dell'Agenzia.
- Codici catastali provengono **sempre** da `public/data/comuni.json` (nessun codice hardcoded nelle pagine/dati di priorità).
- **Non modificare** title/H1 di pagine esistenti che rankano su Bing (in particolare `/codice-belfiore/`).
- URL con trailing slash: `/codice-catastale/[slug]/` (coerente col resto del sito).
- Node >= 20.3.0. Test runner: `npm test` (`vitest run`). Type check: `npm run check` (`astro check`).
- Ogni pagina ha next-step nativi (calcola / verifica / cerca) per non peggiorare le PV/session.
- Wave 0 = solo ~20 comuni curati; il resolver genera pagine SOLO per i record presenti in `comuniPriority.ts`.

---

## File Structure

| File | Responsabilità | Azione |
|---|---|---|
| `src/lib/comuneSlug.ts` | Genera slug URL-safe da nome comune | Create |
| `src/lib/__tests__/comuneSlug.test.ts` | Test slug | Create |
| `src/lib/comuniData.ts` | Carica `comuni.json`, lookup per nome+provincia | Create |
| `src/lib/__tests__/comuniData.test.ts` | Test lookup | Create |
| `src/data/comuniPriority.ts` | Lista curata Wave 0 (manopola staging) | Create |
| `src/lib/comuniCatastale.ts` | Resolver: priority → pagine (slug, dedup, vicini) | Create |
| `src/lib/__tests__/comuniCatastale.test.ts` | Test resolver | Create |
| `src/components/EsempioCF.astro` | Aggiunta prop opzionale `preposizione` | Modify |
| `src/pages/codice-catastale/[comune].astro` | Pagina per-comune | Create |
| `src/pages/codice-catastale/index.astro` | Hub/directory | Create |
| `src/pages/codice-belfiore.astro` | Aggiunta link all'hub (NO title) | Modify |

---

## Task 1: Slug generator

**Files:**
- Create: `src/lib/comuneSlug.ts`
- Test: `src/lib/__tests__/comuneSlug.test.ts`

**Interfaces:**
- Produces: `comuneSlug(nome: string): string`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/__tests__/comuneSlug.test.ts
import { describe, it, expect } from 'vitest';
import { comuneSlug } from '../comuneSlug';

describe('comuneSlug', () => {
  it('minuscola semplice', () => {
    expect(comuneSlug('Roma')).toBe('roma');
  });
  it('spazi in trattini', () => {
    expect(comuneSlug('Reggio di Calabria')).toBe('reggio-di-calabria');
  });
  it('rimuove accenti', () => {
    expect(comuneSlug('Forlì')).toBe('forli');
  });
  it("gestisce apostrofi", () => {
    expect(comuneSlug("Reggio nell'Emilia")).toBe('reggio-nell-emilia');
  });
  it('collassa separatori multipli', () => {
    expect(comuneSlug('San Giovanni  in Persiceto')).toBe('san-giovanni-in-persiceto');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- comuneSlug`
Expected: FAIL — `Cannot find module '../comuneSlug'`

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/comuneSlug.ts

/** Converte il nome di un comune in uno slug URL-safe (lowercase, senza accenti). */
export function comuneSlug(nome: string): string {
  return nome
    .normalize('NFD')                 // separa i diacritici
    .replace(/[̀-ͯ]/g, '')  // rimuove i diacritici
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')      // ogni non-alfanumerico -> trattino
    .replace(/^-+|-+$/g, '');         // trim dei trattini ai bordi
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- comuneSlug`
Expected: PASS (5 test)

- [ ] **Step 5: Commit**

```bash
git add src/lib/comuneSlug.ts src/lib/__tests__/comuneSlug.test.ts
git commit -m "feat: slug generator per comuni"
```

---

## Task 2: Caricamento e lookup dati comuni

**Files:**
- Create: `src/lib/comuniData.ts`
- Test: `src/lib/__tests__/comuniData.test.ts`

**Interfaces:**
- Consumes: `public/data/comuni.json` (array di `{ nome, provincia, codiceCatastale }`)
- Produces:
  - `interface Comune { nome: string; provincia: string; codiceCatastale: string }`
  - `findComune(nome: string, provincia: string): Comune | undefined`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/__tests__/comuniData.test.ts
import { describe, it, expect } from 'vitest';
import { findComune } from '../comuniData';

describe('findComune', () => {
  it('trova Roma con codice H501', () => {
    expect(findComune('Roma', 'RM')?.codiceCatastale).toBe('H501');
  });
  it('trova Milano con codice F205', () => {
    expect(findComune('Milano', 'MI')?.codiceCatastale).toBe('F205');
  });
  it('è case-insensitive sul nome', () => {
    expect(findComune('roma', 'RM')?.codiceCatastale).toBe('H501');
  });
  it('ritorna undefined per nome inesistente', () => {
    expect(findComune('Comunistaninesistente', 'XX')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- comuniData`
Expected: FAIL — `Cannot find module '../comuniData'`

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/comuniData.ts
import comuniRaw from '../../public/data/comuni.json';

export interface Comune {
  nome: string;
  provincia: string;
  codiceCatastale: string;
}

const comuni = comuniRaw as Comune[];

// Indice per lookup O(1): chiave = "nome_lowercase|provincia"
const byKey = new Map<string, Comune>();
for (const c of comuni) {
  byKey.set(`${c.nome.toLowerCase()}|${c.provincia}`, c);
}

/** Trova un comune per nome (case-insensitive) e sigla provincia. */
export function findComune(nome: string, provincia: string): Comune | undefined {
  return byKey.get(`${nome.toLowerCase()}|${provincia}`);
}
```

Nota: l'import JSON richiede `resolveJsonModule` attivo. Astro/Vite lo supporta di default; se `astro check` segnala l'import, aggiungere `"resolveJsonModule": true` a `tsconfig.json` in `compilerOptions` (verificato nello Step 4 via `npm run check`).

- [ ] **Step 4: Run test + typecheck**

Run: `npm test -- comuniData && npm run check`
Expected: test PASS (4), `astro check` con 0 nuovi errori.

- [ ] **Step 5: Commit**

```bash
git add src/lib/comuniData.ts src/lib/__tests__/comuniData.test.ts tsconfig.json
git commit -m "feat: lookup dati comuni da comuni.json"
```

---

## Task 3: Lista curata Wave 0 + resolver

**Files:**
- Create: `src/data/comuniPriority.ts`
- Create: `src/lib/comuniCatastale.ts`
- Test: `src/lib/__tests__/comuniCatastale.test.ts`

**Interfaces:**
- Consumes: `findComune` (Task 2), `comuneSlug` (Task 1)
- Produces:
  - `interface ComunePage { nome: string; provincia: string; codiceCatastale: string; slug: string }`
  - `resolveComuni(): ComunePage[]` — risolve la lista di priorità; **throw** se un comune non è in `comuni.json`; dedup slug con suffisso provincia.
  - `comuniVicini(slug: string, all: ComunePage[], max?: number): ComunePage[]` — stessa provincia, escluso sé stesso.

- [ ] **Step 1: Create la lista di priorità Wave 0**

```ts
// src/data/comuniPriority.ts

/**
 * Set curato del cluster codice catastale. La presenza di un record qui = pagina live.
 * Pubblicare una nuova ondata = aggiungere record. Il tag `wave` è solo documentazione.
 * `nome` + `provincia` DEVONO combaciare esattamente con public/data/comuni.json.
 */
export interface ComunePriority {
  nome: string;
  provincia: string;
  wave: number;
}

export const comuniPriority: ComunePriority[] = [
  { nome: 'Roma', provincia: 'RM', wave: 0 },
  { nome: 'Milano', provincia: 'MI', wave: 0 },
  { nome: 'Napoli', provincia: 'NA', wave: 0 },
  { nome: 'Torino', provincia: 'TO', wave: 0 },
  { nome: 'Palermo', provincia: 'PA', wave: 0 },
  { nome: 'Genova', provincia: 'GE', wave: 0 },
  { nome: 'Bologna', provincia: 'BO', wave: 0 },
  { nome: 'Firenze', provincia: 'FI', wave: 0 },
  { nome: 'Bari', provincia: 'BA', wave: 0 },
  { nome: 'Catania', provincia: 'CT', wave: 0 },
  { nome: 'Venezia', provincia: 'VE', wave: 0 },
  { nome: 'Verona', provincia: 'VR', wave: 0 },
  { nome: 'Messina', provincia: 'ME', wave: 0 },
  { nome: 'Padova', provincia: 'PD', wave: 0 },
  { nome: 'Trieste', provincia: 'TS', wave: 0 },
  { nome: 'Brescia', provincia: 'BS', wave: 0 },
  { nome: 'Prato', provincia: 'PO', wave: 0 },
  { nome: 'Parma', provincia: 'PR', wave: 0 },
  { nome: 'Modena', provincia: 'MO', wave: 0 },
  { nome: 'Reggio di Calabria', provincia: 'RC', wave: 0 },
];
```

- [ ] **Step 2: Verifica che tutti i nomi risolvano contro comuni.json**

Run:
```bash
node --experimental-strip-types -e "import('./src/data/comuniPriority.ts').then(async m=>{const {default:raw}=await import('./public/data/comuni.json',{with:{type:'json'}});const set=new Map(raw.map(c=>[c.nome.toLowerCase()+'|'+c.provincia,c]));const miss=m.comuniPriority.filter(p=>!set.has(p.nome.toLowerCase()+'|'+p.provincia));console.log('unresolved:',miss.length,miss.map(x=>x.nome+'/'+x.provincia));});"
```
Expected: `unresolved: 0 []`
Se un comune risulta unresolved (es. nome ANPR diverso), correggere `nome`/`provincia` in `comuniPriority.ts` cercandolo in `public/data/comuni.json`, poi ripetere.

- [ ] **Step 3: Write the failing test**

```ts
// src/lib/__tests__/comuniCatastale.test.ts
import { describe, it, expect } from 'vitest';
import { resolveComuni, comuniVicini, type ComunePage } from '../comuniCatastale';

describe('resolveComuni', () => {
  const all = resolveComuni();

  it('risolve tutti i comuni della Wave 0 senza lanciare', () => {
    expect(all.length).toBe(20);
  });
  it('Roma -> slug roma, codice H501', () => {
    const roma = all.find(c => c.nome === 'Roma');
    expect(roma?.slug).toBe('roma');
    expect(roma?.codiceCatastale).toBe('H501');
  });
  it('Milano -> codice F205', () => {
    expect(all.find(c => c.nome === 'Milano')?.codiceCatastale).toBe('F205');
  });
  it('tutti gli slug sono unici', () => {
    const slugs = all.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('comuniVicini', () => {
  it('ritorna comuni della stessa provincia, escluso sé stesso', () => {
    const fake: ComunePage[] = [
      { nome: 'A', provincia: 'MI', codiceCatastale: 'X001', slug: 'a' },
      { nome: 'B', provincia: 'MI', codiceCatastale: 'X002', slug: 'b' },
      { nome: 'C', provincia: 'RM', codiceCatastale: 'X003', slug: 'c' },
    ];
    const vicini = comuniVicini('a', fake);
    expect(vicini.map(v => v.slug)).toEqual(['b']);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- comuniCatastale`
Expected: FAIL — `Cannot find module '../comuniCatastale'`

- [ ] **Step 5: Write the resolver**

```ts
// src/lib/comuniCatastale.ts
import { comuniPriority } from '../data/comuniPriority';
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
 * Throw se un comune non è in comuni.json (fail-fast, no pagina fantasma).
 * Dedup: se due comuni producono lo stesso slug, tutti i collidenti
 * ricevono il suffisso "-<provincia lowercase>".
 */
export function resolveComuni(): ComunePage[] {
  const base = comuniPriority.map(p => {
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- comuniCatastale`
Expected: PASS (5)

- [ ] **Step 7: Commit**

```bash
git add src/data/comuniPriority.ts src/lib/comuniCatastale.ts src/lib/__tests__/comuniCatastale.test.ts
git commit -m "feat: lista curata Wave 0 + resolver comuni catastale"
```

---

## Task 4: Pagina per-comune

**Files:**
- Modify: `src/components/EsempioCF.astro` (aggiunta prop opzionale `preposizione`)
- Create: `src/pages/codice-catastale/[comune].astro`

**Interfaces:**
- Consumes: `resolveComuni`, `comuniVicini` (Task 3); `EsempioCF`; `Layout`.

- [ ] **Step 1: Aggiungi la prop opzionale `preposizione` a EsempioCF**

In `src/components/EsempioCF.astro`, modifica l'interfaccia Props e la destrutturazione. Il default `'in'` preserva il rendering attuale delle pagine-paese.

Da:
```astro
interface Props {
  cognome: string;
  nome: string;
  sesso: 'M' | 'F';
  giorno: number;
  mese: number;
  anno: number;
  paese: string;
  codiceCatastale: string;
}

const { cognome, nome, sesso, giorno, mese, anno, paese, codiceCatastale } = Astro.props;
```
A:
```astro
interface Props {
  cognome: string;
  nome: string;
  sesso: 'M' | 'F';
  giorno: number;
  mese: number;
  anno: number;
  paese: string;
  codiceCatastale: string;
  preposizione?: string;
}

const { cognome, nome, sesso, giorno, mese, anno, paese, codiceCatastale, preposizione = 'in' } = Astro.props;
```
E nella riga della label (frase "nato ... in {paese}"), sostituisci ` in {paese}:` con ` {preposizione} {paese}:`:
```astro
  <p class="font-medium text-slate-700 mb-4">{nome} {cognome}, {sesso === 'M' ? 'nato' : 'nata'} il {giorno} {MESI_NOMI[mese]?.toLowerCase()} {anno} {preposizione} {paese}:</p>
```

- [ ] **Step 2: Verifica che le pagine-paese non cambino output**

Run: `npm run check`
Expected: 0 nuovi errori. (Le pagine-paese non passano `preposizione` → resta `'in'`, rendering invariato.)

- [ ] **Step 3: Crea la pagina per-comune**

```astro
---
// src/pages/codice-catastale/[comune].astro
import Layout from '../../layouts/Layout.astro';
import EsempioCF from '../../components/EsempioCF.astro';
import { resolveComuni, comuniVicini } from '../../lib/comuniCatastale';

export function getStaticPaths() {
  const all = resolveComuni();
  return all.map(c => ({
    params: { comune: c.slug },
    props: { c, vicini: comuniVicini(c.slug, all) },
  }));
}

const { c, vicini } = Astro.props;
const code = c.codiceCatastale;

const title = `Codice Catastale ${c.nome} (${c.provincia}): ${code} | Codice Fiscale`;
const description = `${code} è il codice catastale (Belfiore) di ${c.nome} (${c.provincia}), usato nelle posizioni 12-15 del codice fiscale. Esempio pratico, come si legge e differenza dalla visura catastale.`;
const url = `https://www.calcolare-codice-fiscale.it/codice-catastale/${c.slug}/`;

const faqItems = [
  { q: `Qual è il codice catastale di ${c.nome}?`, a: `Il codice catastale (o codice Belfiore) di ${c.nome} (${c.provincia}) è ${code}. Viene usato nelle posizioni 12-15 del codice fiscale per identificare chi è nato a ${c.nome}.` },
  { q: `${code} a quale comune corrisponde?`, a: `${code} è il codice catastale del comune di ${c.nome}, in provincia di ${c.provincia}.` },
  { q: `Dove si trova ${code} nel codice fiscale?`, a: `${code} occupa i 4 caratteri in posizione 12-15 del codice fiscale, subito prima del carattere di controllo finale. Identifica il comune di nascita, in questo caso ${c.nome}.` },
  { q: `${code} è il codice comune o il codice catastale di ${c.nome}?`, a: `${code} è al tempo stesso codice comune, codice catastale e codice Belfiore di ${c.nome}: sono tre nomi per lo stesso identificativo. Non va confuso con la visura catastale immobiliare, che è un'altra cosa.` },
];

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a },
  })),
};
const schemaArticle = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": `Codice Catastale ${c.nome}: ${code}`,
  "description": description,
  "url": url,
  "inLanguage": "it",
  "datePublished": "2026-07-21",
  "dateModified": "2026-07-21",
  "author": { "@type": "Organization", "name": "Calcolare Codice Fiscale" },
  "publisher": { "@type": "Organization", "name": "Calcolare Codice Fiscale" },
};
---

<Layout title={title} description={description} schemaJson={[schemaFAQ, schemaArticle]}
  breadcrumbs={[{name:'Home',url:'/'},{name:'Codice Catastale',url:'/codice-catastale/'},{name:c.nome,url:`/codice-catastale/${c.slug}/`}]}>

  <!-- Header -->
  <div class="bg-gradient-to-b from-brand-navy to-brand-navy-light rounded-2xl p-8 mb-8">
    <nav class="text-xs mb-4">
      <a href="/" class="text-white/50 hover:text-white/70">Home</a>
      <span class="mx-1.5 text-white/50">&rsaquo;</span>
      <a href="/codice-catastale/" class="text-white/50 hover:text-white/70">Codice Catastale</a>
      <span class="mx-1.5 text-white/50">&rsaquo;</span>
      <span class="text-white/80">{c.nome}</span>
    </nav>
    <h1 class="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">Codice Catastale {c.nome}: <span class="font-mono text-white">{code}</span></h1>
    <p class="text-white/60 text-sm mb-1">Il codice catastale (Belfiore) <span class="font-mono font-bold text-white/90">{code}</span> identifica {c.nome} ({c.provincia}) nel codice fiscale</p>
    <a href="/" class="mt-5 inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-5 py-2.5 text-sm text-white hover:bg-white/15 transition-colors">
      Calcola un codice fiscale
      <span class="text-white/60">&rarr;</span>
    </a>
  </div>

  <div class="space-y-8 text-sm text-slate-600 leading-relaxed">

    <section>
      <h2 class="text-xl font-heading font-bold text-slate-800 mb-3">{code}: il codice catastale di {c.nome}</h2>
      <p><strong>{code}</strong> è il codice catastale del comune di {c.nome}, in provincia di {c.provincia}. Nel codice fiscale occupa le posizioni 12-15 (i 4 caratteri che identificano il luogo di nascita), subito prima del carattere di controllo finale.</p>
      <p class="mt-3">Il codice {code} è indicato anche come <strong>codice comune</strong> o <strong>codice Belfiore</strong> di {c.nome}: sono denominazioni diverse per lo stesso identificativo assegnato dall'Agenzia delle Entrate.</p>
      <div class="mt-4 flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
        <p class="text-slate-700"><strong>Da non confondere:</strong> il codice catastale {code} nel codice fiscale non è la <em>visura catastale</em> immobiliare (dati di terreni e fabbricati). Qui si parla del codice del comune di nascita usato nel codice fiscale delle persone.</p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-heading font-bold text-slate-800 mb-3">Esempio pratico</h2>
      <p class="mb-3">Ecco come appare {code} nel codice fiscale di una persona nata a {c.nome}:</p>
      <EsempioCF cognome="Rossi" nome="Mario" sesso="M" giorno={1} mese={1} anno={1980} paese={c.nome} codiceCatastale={code} preposizione="a" />
    </section>

    {vicini.length > 0 && (
      <section>
        <h2 class="text-xl font-heading font-bold text-slate-800 mb-3">Altri comuni in provincia di {c.provincia}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {vicini.map(v => (
            <a href={`/codice-catastale/${v.slug}/`} class="block p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link transition-colors text-center">
              <div class="font-semibold text-sm text-brand-blue-link">{v.nome}</div>
              <div class="text-xs text-slate-500 font-mono mt-1">{v.codiceCatastale}</div>
            </a>
          ))}
        </div>
      </section>
    )}
  </div>

  <div class="my-10 min-h-[90px]"></div>

  <!-- FAQ -->
  <section>
    <h2 class="text-xl font-heading font-bold text-slate-800 mb-4">Domande Frequenti</h2>
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="divide-y divide-slate-100">
        {faqItems.map(({ q, a }) => (
          <details class="group">
            <summary class="px-4 py-3 cursor-pointer font-medium text-sm text-slate-800 hover:bg-slate-50 list-none flex justify-between items-center">
              {q}
              <span class="text-slate-500 text-xs group-open:rotate-180 transition-transform">&#9660;</span>
            </summary>
            <p class="px-4 pb-3 text-sm text-slate-600">{a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>

  <!-- Next-step (leva PV/session) -->
  <section class="mt-8">
    <h2 class="text-lg font-heading font-bold text-slate-800 mb-3">Prossimi passi</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <a href="/" class="block p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link hover:shadow-sm transition-all">
        <div class="font-semibold text-sm text-brand-blue-link mb-1">Calcola un CF con {c.nome} &rarr;</div>
        <div class="text-xs text-slate-500">Inserisci nome, cognome e data: il codice {code} è già pronto</div>
      </a>
      <a href="/verifica-codice-fiscale/" class="block p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link hover:shadow-sm transition-all">
        <div class="font-semibold text-sm text-brand-blue-link mb-1">Verifica un codice fiscale &rarr;</div>
        <div class="text-xs text-slate-500">Controlla se un CF di {c.nome} è formalmente corretto</div>
      </a>
      <a href="/cerca-codice-belfiore/" class="block p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link hover:shadow-sm transition-all">
        <div class="font-semibold text-sm text-brand-blue-link mb-1">Cerca un altro comune &rarr;</div>
        <div class="text-xs text-slate-500">Trova il codice catastale di qualsiasi comune italiano</div>
      </a>
    </div>
  </section>

  <!-- Approfondisci -->
  <section class="mt-8">
    <h2 class="text-lg font-heading font-bold text-slate-800 mb-3">Approfondisci</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { href: '/codice-belfiore/', title: 'Cos’è il codice Belfiore', desc: 'Il codice catastale di nascita e dove si trova nel CF' },
        { href: '/codice-catastale/', title: 'Tutti i comuni', desc: 'Directory dei codici catastali per comune' },
        { href: '/omocodia-codice-fiscale/', title: 'Omocodia del CF', desc: 'Quando il CF ha lettere al posto delle cifre' },
        { href: '/come-leggere-codice-fiscale/', title: 'Come leggere il CF', desc: 'Il significato di ogni carattere' },
      ].map(({ href, title, desc }) => (
        <a href={href} class="block p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link hover:shadow-sm transition-all">
          <div class="font-semibold text-sm text-brand-blue-link mb-1">{title} &rarr;</div>
          <div class="text-xs text-slate-500">{desc}</div>
        </a>
      ))}
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Build + typecheck**

Run: `npm run check && npm run build`
Expected: `astro check` 0 nuovi errori; build genera 20 pagine sotto `/codice-catastale/` (oltre alla home hub che non esiste ancora → arriva in Task 5). Nessun errore di link/route.

Verifica conteggio:
```bash
ls dist/codice-catastale/ | grep -c .
```
Expected: `20` (una cartella per comune).

- [ ] **Step 5: Commit**

```bash
git add src/components/EsempioCF.astro src/pages/codice-catastale/[comune].astro
git commit -m "feat: pagina per-comune /codice-catastale/[comune]/"
```

---

## Task 5: Hub /codice-catastale/

**Files:**
- Create: `src/pages/codice-catastale/index.astro`

**Interfaces:**
- Consumes: `resolveComuni` (Task 3); `Layout`.

- [ ] **Step 1: Crea l'hub**

```astro
---
// src/pages/codice-catastale/index.astro
import Layout from '../../layouts/Layout.astro';
import { resolveComuni } from '../../lib/comuniCatastale';

const comuni = resolveComuni().sort((a, b) => a.nome.localeCompare(b.nome, 'it'));

const title = 'Codice Catastale dei Comuni: Cerca il Codice Belfiore | Codice Fiscale';
const description = 'Il codice catastale (o codice Belfiore) è il codice del comune usato nel codice fiscale. Trova il codice catastale del tuo comune e scopri dove si trova nel CF.';

const faqItems = [
  { q: 'Cos’è il codice catastale di un comune?', a: 'Il codice catastale (o codice Belfiore) è un codice di una lettera e tre cifre (es. H501 per Roma) che identifica ogni comune italiano. Nel codice fiscale occupa le posizioni 12-15 e indica il comune di nascita.' },
  { q: 'Il codice catastale è uguale al codice Belfiore?', a: 'Sì. "Codice catastale", "codice comune" e "codice Belfiore" sono tre nomi per lo stesso identificativo del comune usato nel codice fiscale.' },
  { q: 'Il codice catastale è la visura catastale?', a: 'No. Il codice catastale nel codice fiscale è il codice del comune di nascita. La visura catastale immobiliare (dati di terreni e fabbricati) è un documento diverso, dell’Agenzia delle Entrate.' },
];
const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
};
---

<Layout title={title} description={description} schemaJson={schemaFAQ}
  breadcrumbs={[{name:'Home',url:'/'},{name:'Codice Catastale',url:'/codice-catastale/'}]}>

  <div class="bg-gradient-to-b from-brand-navy to-brand-navy-light rounded-2xl p-8 mb-8">
    <h1 class="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">Codice Catastale dei Comuni</h1>
    <p class="text-white/60 text-sm">Il codice del comune (Belfiore) usato nel codice fiscale. Trova quello del tuo comune.</p>
  </div>

  <div class="space-y-8 text-sm text-slate-600 leading-relaxed">
    <section>
      <p>Il <strong>codice catastale</strong> — chiamato anche <strong>codice Belfiore</strong> o codice comune — è formato da una lettera e tre cifre (per esempio <span class="font-mono">H501</span> per Roma). Nel codice fiscale occupa le <strong>posizioni 12-15</strong> e identifica il comune di nascita. Non va confuso con la visura catastale immobiliare.</p>
    </section>

    <section>
      <h2 class="text-xl font-heading font-bold text-slate-800 mb-3">Comuni</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {comuni.map(c => (
          <a href={`/codice-catastale/${c.slug}/`} class="flex items-baseline justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link transition-colors">
            <span class="font-semibold text-sm text-brand-blue-link">{c.nome}</span>
            <span class="text-xs text-slate-500 font-mono">{c.codiceCatastale}</span>
          </a>
        ))}
      </div>
    </section>

    <section>
      <h2 class="text-lg font-heading font-bold text-slate-800 mb-3">Strumenti</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href="/cerca-codice-belfiore/" class="block p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link hover:shadow-sm transition-all">
          <div class="font-semibold text-sm text-brand-blue-link mb-1">Cerca codice Belfiore &rarr;</div>
          <div class="text-xs text-slate-500">Digita un comune, ottieni il codice</div>
        </a>
        <a href="/codice-belfiore/" class="block p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link hover:shadow-sm transition-all">
          <div class="font-semibold text-sm text-brand-blue-link mb-1">Cos’è il codice Belfiore &rarr;</div>
          <div class="text-xs text-slate-500">La guida al codice catastale nel CF</div>
        </a>
      </div>
    </section>
  </div>
</Layout>
```

- [ ] **Step 2: Build + typecheck**

Run: `npm run check && npm run build`
Expected: 0 nuovi errori; esiste `dist/codice-catastale/index.html`; i link ai 20 comuni risolvono.

- [ ] **Step 3: Commit**

```bash
git add src/pages/codice-catastale/index.astro
git commit -m "feat: hub /codice-catastale/ con directory comuni"
```

---

## Task 6: Cross-link da /codice-belfiore/ + verifica finale

**Files:**
- Modify: `src/pages/codice-belfiore.astro` (solo aggiunta di un link — NO title/H1/description)

**Interfaces:**
- Nessuna nuova interfaccia.

- [ ] **Step 1: Individua un punto di link esistente**

Run: `grep -n "Approfondisci\|StrumentiCorrelati\|grid" src/pages/codice-belfiore.astro | head`
Expected: trovare una sezione "Approfondisci"/griglia di link esistente dove inserire una card.

- [ ] **Step 2: Aggiungi una card link all'hub**

Nella sezione griglia di approfondimenti/strumenti di `src/pages/codice-belfiore.astro`, aggiungi (adattando le classi a quelle già usate nella griglia trovata allo Step 1) una card:

```astro
<a href="/codice-catastale/" class="block p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-blue-link hover:shadow-sm transition-all">
  <div class="font-semibold text-sm text-brand-blue-link mb-1">Codice catastale per comune &rarr;</div>
  <div class="text-xs text-slate-500">Directory dei codici catastali dei comuni italiani</div>
</a>
```

Vincolo: **non toccare** `title`, `<h1>`, né `description` della pagina (regge pos ~8 su Bing/Google per "codice belfiore").

- [ ] **Step 3: Verifica finale completa**

Run: `npm test && npm run check && npm run build`
Expected:
- Test: tutti verdi (suite esistenti + le 3 nuove).
- `astro check`: 0 nuovi errori.
- Build: successo. Conteggio pagine cresciuto di 21 (20 comuni + 1 hub) rispetto a prima della feature.

Verifica no-regressione title codice-belfiore:
```bash
git diff --stat src/pages/codice-belfiore.astro
grep -c "Codice Belfiore" dist/codice-belfiore/index.html
```
Expected: il diff tocca solo la griglia link; il grep resta > 0 (h1/title intatti).

- [ ] **Step 4: Commit**

```bash
git add src/pages/codice-belfiore.astro
git commit -m "feat: link da codice-belfiore all'hub codice catastale"
```

---

## Post-deploy (fuori dal piano di codice — checklist operativa)

Dopo il merge + deploy Vercel della Wave 0:
1. `node seo-reports/indexnow-submit.mjs` — submit delle 21 URL nuove a Bing (istantaneo).
2. GSC: submit `/codice-catastale/` + gli URL dei 20 comuni (o via sitemap).
3. Re-check ~7gg: index Bing delle nuove pagine. Re-check ~14gg: ranking "codice catastale [città]" (roma/milano SV 1.600).
4. **Allarme cannibalizzazione:** verificare che `/codice-belfiore/` non scenda da pos ~8 su "codice belfiore".
5. Se Wave 0 ranka come i paesi → aggiungere Wave 1 a `comuniPriority.ts` e ripetere.

---

## Self-Review (fatto in fase di scrittura)

- **Spec coverage:** route per-comune (Task 4), hub (Task 5), `comuniPriority` staging (Task 3), fonte comuni.json build-time (Task 2), slug+collisioni (Task 1+3), disambiguazione visura (Task 4/5), next-step PV/session (Task 4), anti-cannibalizzazione (Task 6), test/build (tutti i task).
- **Deviazioni dallo spec (segnalate all'utente):** (1) rimosso il blocco "varianti omocodia del codice" — nessuna lib riutilizzabile + intento non cercato → sostituito con cross-link a `/omocodia/`. (2) rimosso il mapping provincia→regione per la Wave 0 — hub raggruppato alfabeticamente, provincia mostrata; regione rimandata.
- **Placeholder scan:** nessun TBD/TODO; codice completo in ogni step.
- **Type consistency:** `ComunePage` / `Comune` / `ComunePriority` coerenti tra i task; `resolveComuni`/`comuniVicini`/`findComune`/`comuneSlug` usati con le firme dichiarate.

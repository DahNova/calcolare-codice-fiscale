# Stranieri SEO Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the stranieri section into the most complete Italian resource for foreign fiscal codes, capturing Z-code long-tail traffic.

**Architecture:** Two levels: (1) enhanced hub page at `/codice-fiscale-stranieri/` with full searchable table of 216 countries by continent, (2) 20 dedicated country pages at `/codice-fiscale-estero/[slug]/` with unique content, examples, and FAQ schema.

**Tech Stack:** Astro 5 (SSG), React 19 (islands), Tailwind CSS 3, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-20-stranieri-seo-redesign.md`

---

### Task 1: Create the countries data file (`paesiEsteri.ts`)

**Files:**
- Create: `src/data/paesiEsteri.ts`

This is the foundation — all 216 countries with continent classification, slugs, and `hasDedicatedPage` flags. Every subsequent task depends on this.

- [ ] **Step 1: Create `src/data/` directory and `paesiEsteri.ts`**

Create the file with the `PaeseEstero` interface and the full array. Countries are sourced from `public/data/comuni.json` (entries with `provincia: "EE"`). The continent classification must be manually assigned.

The file exports:
- `PaeseEstero` interface
- `paesiEsteri: PaeseEstero[]` — all 216 countries
- `paesiPerContinente` — a `Map<string, PaeseEstero[]>` grouped by continent, sorted alphabetically within each group
- `CONTINENTI` — ordered array `['Europa', 'Africa', 'Asia', 'Americhe', 'Oceania']`

Continent rules (based on Z-code ranges and geography):
- Z1xx = mostly Europe (Z100-Z160)
- Z2xx = mostly Asia (Z200-Z259)
- Z3xx = mostly Africa (Z300-Z368)
- Z4xx = North America (Z400-Z404)
- Z5xx = Central America/Caribbean (Z500-Z533)
- Z6xx = South America (Z600-Z614)
- Z7xx = Oceania (Z700-Z735)

Group Z4xx, Z5xx, Z6xx together as "Americhe".

`hasDedicatedPage: true` for these 20 slugs: `romania, albania, germania, svizzera, marocco, francia, regno-unito, ucraina, stati-uniti, cina, india, filippine, bangladesh, moldova, spagna, polonia, brasile, argentina, tunisia, egitto`

Slug generation rule: lowercase, replace spaces with `-`, strip accents, strip apostrophes. Examples:
- "Stati Uniti d'America" -> "stati-uniti"
- "Bosnia-Erzegovina" -> "bosnia-erzegovina"
- "Cina" -> "cina"

- [ ] **Step 2: Validate data completeness**

Run: `npx tsx -e "import { paesiEsteri } from './src/data/paesiEsteri'; console.log('Total:', paesiEsteri.length); console.log('Dedicated:', paesiEsteri.filter(p => p.hasDedicatedPage).length); console.log('Continents:', [...new Set(paesiEsteri.map(p => p.continente))].sort());"`

Expected:
```
Total: 216
Dedicated: 20
Continents: [ 'Africa', 'Americhe', 'Asia', 'Europa', 'Oceania' ]
```

- [ ] **Step 3: Commit**

```bash
git add src/data/paesiEsteri.ts
git commit -m "feat: add paesiEsteri data with continent classification for 216 countries"
```

---

### Task 2: Create the country content data (`countryContent.ts`)

**Files:**
- Create: `src/data/countryContent.ts`

Hand-written, unique content for each of the 20 dedicated country pages. This is the most content-intensive task.

- [ ] **Step 1: Create `countryContent.ts` with the `CountryContent` interface and all 20 entries**

The file must export:
- `export interface CountryContent { ... }` (named type export)
- `export const countryContent: CountryContent[] = [...]` (named array export)

Each entry must have genuinely unique `comunita` text (2-3 sentences about the community in Italy). The `faqExtra` field is optional but adds value.

Example entry for Romania:

```typescript
{
  slug: 'romania',
  codiceCatastale: 'Z129',
  continente: 'Europa',
  nomeCompleto: 'Romania',
  nomeBreve: 'Romania',
  preposizione: 'in',
  articolo: 'la',
  esempioNome: 'Andrei Popescu',
  esempioSesso: 'M',
  esempioData: '10 luglio 1988',
  comunita: 'La comunita romena in Italia e la piu numerosa tra quelle straniere, con oltre un milione di residenti regolari. I cittadini romeni sono presenti in tutte le regioni, con concentrazioni maggiori in Lazio, Lombardia e Piemonte. Dal 2007, in quanto cittadini UE, possono soggiornare liberamente in Italia.',
  faqExtra: {
    q: 'I cittadini romeni in Italia hanno bisogno di un permesso di soggiorno?',
    a: 'No. Dal 1 gennaio 2007 la Romania e membro dell\'Unione Europea, quindi i cittadini romeni possono soggiornare liberamente in Italia. Devono comunque richiedere il codice fiscale per rapporti con la pubblica amministrazione.'
  },
}
```

Key grammar notes for Italian prepositions:
- "in" for most countries: in Romania, in Francia, in Germania
- "negli" for: negli Stati Uniti
- "nel" for: nel Regno Unito, nel Bangladesh
- "nelle" for: nelle Filippine
- "a" for: none in our list (used for cities)

Key article notes:
- "la": la Romania, la Francia, la Germania, la Svizzera, la Cina, la Spagna, la Polonia, la Tunisia, la Moldova
- "il": il Marocco, il Regno Unito, il Bangladesh, il Brasile
- "l'": l'Albania, l'Ucraina, l'India, l'Argentina, l'Egitto
- "le": le Filippine
- "gli": gli Stati Uniti

- [ ] **Step 2: Validate all 20 entries exist and slugs match paesiEsteri**

Run: `npx tsx -e "import { countryContent } from './src/data/countryContent'; import { paesiEsteri } from './src/data/paesiEsteri'; const slugs = paesiEsteri.filter(p => p.hasDedicatedPage).map(p => p.slug); const contentSlugs = countryContent.map(c => c.slug); const missing = slugs.filter(s => !contentSlugs.includes(s)); console.log('Content entries:', countryContent.length); console.log('Missing:', missing.length ? missing : 'none');"`

Expected:
```
Content entries: 20
Missing: none
```

- [ ] **Step 3: Commit**

```bash
git add src/data/countryContent.ts
git commit -m "feat: add unique content for 20 dedicated country pages"
```

---

### Task 3: Create the `EsempioCF` shared component

**Files:**
- Create: `src/components/EsempioCF.astro`

Extract the color-coded CF breakdown pattern from the existing `codice-fiscale-stranieri.astro` page (lines 73-86) into a reusable Astro component.

- [ ] **Step 1: Create `EsempioCF.astro`**

Props interface:

```typescript
interface Props {
  cognome: string;      // "Schmidt"
  nome: string;         // "Maria"
  sesso: 'M' | 'F';
  giorno: number;       // 15
  mese: number;         // 3 (marzo)
  anno: number;         // 1990
  paese: string;        // "Germania"
  codiceCatastale: string; // "Z112"
}
```

The component:
1. Imports `calcolaCodiceFiscale` from `../lib/codiceFiscale`
2. Computes the full CF at build time
3. Splits it into color-coded parts: cognome (3, red), nome (3, blue), data (5, green), codice catastale (4, purple), check digit (1, orange)
4. Renders the visual breakdown using the same Tailwind classes as the existing example on `codice-fiscale-stranieri.astro:73-86`

```astro
---
import { calcolaCodiceFiscale } from '../lib/codiceFiscale';

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
const cf = calcolaCodiceFiscale({ cognome, nome, sesso, giorno, mese, anno, codiceCatastale });
const parts = {
  cog: cf.slice(0, 3),
  nom: cf.slice(3, 6),
  data: cf.slice(6, 11),
  cat: cf.slice(11, 15),
  check: cf.slice(15, 16),
};

const MESI_NOMI: Record<number, string> = {
  1:'Gennaio',2:'Febbraio',3:'Marzo',4:'Aprile',5:'Maggio',6:'Giugno',
  7:'Luglio',8:'Agosto',9:'Settembre',10:'Ottobre',11:'Novembre',12:'Dicembre',
};
const giornoDisplay = sesso === 'F' ? giorno + 40 : giorno;
---

<div class="bg-gray-50 rounded-xl p-5">
  <p class="font-medium mb-3">{nome} {cognome}, {sesso === 'M' ? 'nato' : 'nata'} il {giorno} {MESI_NOMI[mese]?.toLowerCase()} {anno} in {paese}:</p>
  <div class="font-mono text-xl font-bold tracking-widest text-center mb-4">
    <span class="text-red-600">{parts.cog}</span><span class="text-blue-600">{parts.nom}</span><span class="text-green-600">{parts.data}</span><span class="text-purple-600">{parts.cat}</span><span class="text-orange-500">{parts.check}</span>
  </div>
  <div class="grid grid-cols-2 gap-2 text-xs">
    <div><span class="text-red-600 font-semibold">{parts.cog}</span> = Cognome {cognome}</div>
    <div><span class="text-blue-600 font-semibold">{parts.nom}</span> = Nome {nome}</div>
    <div><span class="text-green-600 font-semibold">{parts.data.slice(0,2)}</span> = Anno {anno}</div>
    <div><span class="text-green-600 font-semibold">{parts.data.slice(2,3)}</span> = {MESI_NOMI[mese]}</div>
    <div><span class="text-green-600 font-semibold">{parts.data.slice(3,5)}</span> = Giorno {giorno}{sesso === 'F' ? ` + 40 (femmina)` : ''}</div>
    <div><span class="text-purple-600 font-semibold">{parts.cat}</span> = {paese}</div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

Note: Astro only compiles components when they're imported and rendered, so a build here won't validate the component. Real validation happens when the hub page (Task 5) and country pages (Task 6) use it.

```bash
git add src/components/EsempioCF.astro
git commit -m "feat: add reusable EsempioCF component for color-coded CF breakdown"
```

---

### Task 4: Create the `SearchPaesi` React island

**Files:**
- Create: `src/components/SearchPaesi.tsx`

A lightweight React component that adds **search/filter only** to the hub page. The full country table is SSG-rendered by Astro (critical for SEO — Google must see all 216 countries and anchor IDs in the static HTML). React only adds the search input and hides/shows rows.

**SSG strategy:** The hub page (`Task 5`) renders the complete table in Astro HTML. The `SearchPaesi` component renders just a search input and uses DOM manipulation to filter the existing SSG table rows. This means:
- Without JS: full table is visible (SEO-safe, all anchors crawlable)
- With JS: search input appears and filters the table interactively

- [ ] **Step 1: Create `SearchPaesi.tsx`**

```tsx
import { useState, useEffect } from 'react';

export default function SearchPaesi() {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const q = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Find all country rows in the SSG table
    const rows = document.querySelectorAll<HTMLTableRowElement>('[data-paese]');
    const sections = document.querySelectorAll<HTMLElement>('[data-continente]');

    if (q.length < 2) {
      rows.forEach(r => r.style.display = '');
      sections.forEach(s => s.style.display = '');
      return;
    }

    rows.forEach(row => {
      const nome = (row.dataset.paese || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const codice = (row.dataset.codice || '').toLowerCase();
      row.style.display = (nome.includes(q) || codice.includes(q)) ? '' : 'none';
    });

    // Hide continent sections where all rows are hidden
    sections.forEach(section => {
      const visibleRows = section.querySelectorAll('tr[data-paese]:not([style*="display: none"])');
      section.style.display = visibleRows.length > 0 ? '' : 'none';
    });
  }, [query]);

  return (
    <div className="mb-6">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Cerca paese o codice Z (es. Germania, Z112)..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
        aria-label="Cerca un paese estero"
      />
    </div>
  );
}
```

- [ ] **Step 2: Build to verify no errors**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchPaesi.tsx
git commit -m "feat: add SearchPaesi React island for country table filtering"
```

---

### Task 5: Rewrite the hub page (`codice-fiscale-stranieri.astro`)

**Files:**
- Modify: `src/pages/codice-fiscale-stranieri.astro` (complete rewrite)

This replaces the existing page with the full 216-country hub.

- [ ] **Step 1: Rewrite `codice-fiscale-stranieri.astro`**

The new page structure:

```
---
Frontmatter:
  - Import Layout, SearchPaesi, EsempioCF, paesiEsteri data
  - Define schema (FAQPage with 6-7 questions)
  - Prepare serializable paesi array for SearchPaesi prop
---

Layout (new title + description from spec)
  Breadcrumb
  H1 + subtitle
  CTA box (link to calculator)

  Intro section (keep existing "La Struttura e Identica" + "I Codici Z" content)

  EsempioCF component (keep existing Germania example: Maria Schmidt)

  Quick-jump nav: Europa | Africa | Asia | Americhe | Oceania

  SearchPaesi component (client:visible, receives all 216 countries)

  "Come Richiedere il Codice Fiscale" section (keep existing)

  FAQ section (expand to 6-7 questions, covering broad + specific)

  CTA to calculator
```

Key details:
- Title: `"Codice Fiscale per Nati all'Estero — Tutti i Codici Catastali dei Paesi Esteri"`
- Description: `"Tabella completa di tutti i 216 codici catastali per paesi esteri nel codice fiscale italiano. Cerca per paese o codice Z. Guida al CF per stranieri."`
- **The full 216-country table is rendered as static SSG HTML by Astro** — this is critical for SEO (Google must crawl all country names, Z-codes, and anchor IDs)
- Each continent section is wrapped in a `<div data-continente="europa">` for SearchPaesi to target
- Each table row has `data-paese="Germania"` and `data-codice="Z112"` attributes for SearchPaesi filtering
- Each row has `id="z112"` (lowercase Z-code) as anchor
- The `<SearchPaesi client:visible />` component renders only the search input — it filters by toggling `display:none` on existing SSG rows
- For the 20 countries with dedicated pages, the country name in the table row is a link to `/codice-fiscale-estero/[slug]/`
- Keep existing content sections (intro, example, how to request) but replace the old 28-country table with the full SSG table
- Expand FAQ to include: "Qual e il codice catastale della Germania?", "Quanti sono i codici Z per paesi esteri?" etc.

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds, `/codice-fiscale-stranieri/` is generated

- [ ] **Step 3: Preview and spot-check**

Run: `npm run preview` (in background)
Check: open `http://localhost:4321/codice-fiscale-stranieri/` — verify continent sections render, search works, links to country pages appear for the 20 dedicated countries.

- [ ] **Step 4: Commit**

```bash
git add src/pages/codice-fiscale-stranieri.astro
git commit -m "feat: rewrite stranieri hub with full 216-country searchable table"
```

---

### Task 6: Create the dynamic country page template

**Files:**
- Create: `src/pages/codice-fiscale-estero/[slug].astro`

This generates 20 static pages at build time using `getStaticPaths`.

- [ ] **Step 1: Create `src/pages/codice-fiscale-estero/[slug].astro`**

The frontmatter must include a helper function for Italian article contractions ("del", "della", "dell'", "degli", "delle"):

```typescript
// Helper: Italian "di + articolo" contraction
// articoloDi("la", "Romania") => "della Romania"
// articoloDi("l'", "Albania") => "dell'Albania"
// articoloDi("gli", "Stati Uniti") => "degli Stati Uniti"
// articoloDi("le", "Filippine") => "delle Filippine"
// articoloDi("il", "Marocco") => "del Marocco"
function articoloDi(articolo: string, nome: string): string {
  switch (articolo) {
    case "l'": return `dell'${nome}`;
    case 'la': return `della ${nome}`;
    case 'le': return `delle ${nome}`;
    case 'gli': return `degli ${nome}`;
    case 'il': return `del ${nome}`;
    default: return `di ${nome}`;
  }
}
```

Use `articoloDi()` consistently in all schema text, title, and description.

Full frontmatter:

```astro
---
import Layout from '../../layouts/Layout.astro';
import EsempioCF from '../../components/EsempioCF.astro';
import { paesiEsteri } from '../../data/paesiEsteri';
import { countryContent } from '../../data/countryContent';
import type { CountryContent } from '../../data/countryContent';

export function getStaticPaths() {
  return countryContent.map(c => ({
    params: { slug: c.slug },
    props: { content: c },
  }));
}

function articoloDi(articolo: string, nome: string): string {
  switch (articolo) {
    case "l'": return `dell'${nome}`;
    case 'la': return `della ${nome}`;
    case 'le': return `delle ${nome}`;
    case 'gli': return `degli ${nome}`;
    case 'il': return `del ${nome}`;
    default: return `di ${nome}`;
  }
}

interface Props { content: CountryContent; }
const { content } = Astro.props;
const c = content;
const diPaese = articoloDi(c.articolo, c.nomeBreve);

// Parse example date for CF calculation
const mesiMap: Record<string, number> = {
  'gennaio':1,'febbraio':2,'marzo':3,'aprile':4,'maggio':5,'giugno':6,
  'luglio':7,'agosto':8,'settembre':9,'ottobre':10,'novembre':11,'dicembre':12,
};
const dataParts = c.esempioData.split(' ');
const esGiorno = parseInt(dataParts[0]);
const esMese = mesiMap[dataParts[1].toLowerCase()];
const esAnno = parseInt(dataParts[2]);
const esNomeParts = c.esempioNome.split(' ');
const esCognome = esNomeParts.length > 1 ? esNomeParts.slice(1).join(' ') : esNomeParts[0];
const esNome = esNomeParts[0];

// Related countries: up to 4 from same continent with dedicated pages
let related = paesiEsteri
  .filter(p => p.hasDedicatedPage && p.slug !== c.slug && p.continente === c.continente);
// Supplement from other continents if fewer than 4
if (related.length < 4) {
  const others = paesiEsteri.filter(p => p.hasDedicatedPage && p.slug !== c.slug && p.continente !== c.continente);
  related = [...related, ...others].slice(0, 4);
}
const relatedContent = related.map(r => {
  const rc = countryContent.find(cc => cc.slug === r.slug);
  return { slug: r.slug, nome: rc?.nomeBreve || r.nome, codice: r.codiceCatastale };
});

// Schema
const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": `Qual e il codice catastale ${diPaese} nel codice fiscale?`,
      "acceptedAnswer": { "@type": "Answer", "text": `Il codice catastale ${diPaese} e ${c.codiceCatastale}. Viene usato nel codice fiscale italiano al posto del codice di un comune per le persone nate all'estero.` }
    },
    {
      "@type": "Question",
      "name": `Come si calcola il codice fiscale per chi e nato ${c.preposizione} ${c.nomeBreve}?`,
      "acceptedAnswer": { "@type": "Answer", "text": `Il calcolo segue la stessa procedura dei nati in Italia: 3 lettere dal cognome, 3 dal nome, data di nascita codificata, e il codice catastale ${c.codiceCatastale} (${c.nomeBreve}) al posto del codice di un comune italiano.` }
    },
    {
      "@type": "Question",
      "name": `${c.codiceCatastale} a quale stato corrisponde nel codice fiscale?`,
      "acceptedAnswer": { "@type": "Answer", "text": `Il codice ${c.codiceCatastale} corrisponde a ${c.nomeCompleto}. E un codice catastale assegnato dall'Agenzia delle Entrate per identificare le persone nate ${c.preposizione} ${c.nomeBreve} nel codice fiscale italiano.` }
    },
    ...(c.faqExtra ? [{
      "@type": "Question",
      "name": c.faqExtra.q,
      "acceptedAnswer": { "@type": "Answer", "text": c.faqExtra.a }
    }] : []),
  ],
};

const schemaArticle = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": `Codice Fiscale ${c.nomeBreve} (${c.codiceCatastale}) — Calcolo e Guida`,
  "description": `Il codice catastale ${diPaese} e ${c.codiceCatastale}. Calcola il codice fiscale per chi e nato ${c.preposizione} ${c.nomeBreve}.`,
  "url": `https://www.calcolare-codice-fiscale.it/codice-fiscale-estero/${c.slug}/`,
  "inLanguage": "it",
  "datePublished": "2026-03-20",
  "dateModified": "2026-03-20",
  "author": { "@type": "Organization", "name": "Calcolare Codice Fiscale" },
  "publisher": { "@type": "Organization", "name": "Calcolare Codice Fiscale" },
};

const title = `Codice Fiscale ${c.nomeBreve} (${c.codiceCatastale}) — Calcolo e Guida`;
const description = `Il codice catastale ${diPaese} e ${c.codiceCatastale}. Calcola il codice fiscale per chi e nato ${c.preposizione} ${c.nomeBreve}: esempio pratico, guida e FAQ.`;
---
```

The template body follows the page template from the spec:
1. Breadcrumb: Home > Nati all'Estero > [Country]
2. H1 + subtitle
3. CTA box linking to calculator
4. "Il Codice Catastale [Z-code]" section (2-3 paragraphs explaining what the code means)
5. EsempioCF component with the country's example data
6. "Comunita [Country] in Italia" section (renders `c.comunita`)
7. "Come Richiedere il Codice Fiscale" section (shared content: AE in Italy, Consolato abroad)
8. FAQ section using `<details>` elements
9. Related countries links
10. CTA to calculator

- [ ] **Step 2: Build and verify all 20 pages generate**

Run: `npm run build 2>&1 | grep "codice-fiscale-estero"`
Expected: 20 pages listed in build output

- [ ] **Step 3: Spot-check a few pages**

Run: `npm run preview` and check:
- `http://localhost:4321/codice-fiscale-estero/romania/`
- `http://localhost:4321/codice-fiscale-estero/stati-uniti/`
- `http://localhost:4321/codice-fiscale-estero/germania/`

Verify: H1 correct, CF example renders, breadcrumbs work, FAQ opens/closes, related countries link correctly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/codice-fiscale-estero/
git commit -m "feat: add 20 dedicated country pages for foreign fiscal codes"
```

---

### Task 7: (No-op — removed)

The footer already has a "Stranieri" link at `Layout.astro:147` pointing to `/codice-fiscale-stranieri/`. No additional footer link is needed — the hub page is already linked. Task skipped.

---

### Task 8: Full build and link verification

**Files:** None (verification only)

- [ ] **Step 1: Clean build**

Run: `npm run build`
Expected: All pages build without errors. The build output should show 6 original pages + 20 new country pages = 26+ pages total.

- [ ] **Step 2: Run existing tests**

Run: `npm test`
Expected: All existing tests pass (codiceFiscale, verifica, inverso tests).

- [ ] **Step 3: Verify sitemap includes new pages**

Run: `cat dist/sitemap-index.xml` then inspect the sitemap file to verify `/codice-fiscale-estero/romania/`, `/codice-fiscale-estero/germania/`, etc. are included.

- [ ] **Step 4: Verify internal links**

Check that:
- Hub page links to all 20 country pages (look for `/codice-fiscale-estero/` in the rendered HTML)
- Country pages link back to hub (`/codice-fiscale-stranieri/`)
- Country pages link to related countries
- Breadcrumbs are correct on all country pages

Run: `grep -r "codice-fiscale-estero" dist/codice-fiscale-stranieri/index.html | head -5`
Expected: Links to country pages found

Run: `grep "codice-fiscale-stranieri" dist/codice-fiscale-estero/romania/index.html`
Expected: Link back to hub found

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete stranieri SEO redesign — hub + 20 country pages"
```

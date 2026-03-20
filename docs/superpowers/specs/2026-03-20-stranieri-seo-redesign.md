# Spec: SEO Redesign — Codice Fiscale Stranieri / Paesi Esteri

**Date:** 2026-03-20
**Status:** Draft
**Goal:** Capture long-tail organic traffic for Z-code and "codice fiscale estero" queries by transforming the stranieri section into the most complete resource on the Italian web.

---

## Context

### Current State
- `/codice-fiscale-stranieri/` gets 1,286 impressions (28 days) at position 10.6 for Z-code queries
- The page shows only 28 countries in a static table
- 216 countries exist in `public/data/comuni.json` (field `provincia: "EE"`)
- Almost zero clicks because ranking is bottom of page 1 / top of page 2

### Competitive Landscape (from SERP research)
- **calcolocf.com**: Only competitor with per-country pages, but uses query-string URLs (`?comune=romania`), ~150 words, zero schema
- **ilcodicefiscale.it**: Similar thin pages with query strings
- **help.studiok.it**: Most complete table (~200 countries by continent) but ancient design, no search, no schema
- **codicefiscale.com**: Market leader, but ZERO content on foreign countries
- **No competitor** combines: rich per-country content + searchable table + calculator + schema markup

### SERP Opportunities
- Z-code queries ("z112 codice fiscale") are confused with "codice tributo" results — disambiguation opportunity
- "codice catastale paesi esteri" top results are government PDFs and clunky interfaces
- "codice fiscale estero" (3,600 vol) and "calcolo codice fiscale estero" (9,900 vol) dominated by calculators, not reference content

---

## Architecture

Two-level approach:

### Level 1: Enhanced Hub Page (`/codice-fiscale-stranieri/`)

Transform from a guide with 28 countries into THE definitive reference for all foreign fiscal codes.

**Structure:**
1. Intro section (existing content, slightly expanded)
2. Example section (existing, keep as-is)
3. Quick-jump index: Europa | Africa | Americhe | Asia | Oceania
4. Client-side search input (filters table in real-time by country name or Z-code)
5. Full table of ALL 216 countries, grouped by continent under H3 headings
6. Each continent section has its own anchor (`#europa`, `#africa`, etc.)
7. Each country row has an anchor (`#z112`, `#z404`, etc.)
8. For the top 15-20 countries (Level 2), table rows link to their dedicated page
9. Existing FAQ section (keep, expand with 2-3 more questions)
10. CTA to calculator

**Table columns:** Paese | Codice Catastale | Link (for top countries only)

**Data source:** Import `paesiEsteri.ts` in frontmatter, group by continent at build time. No `getStaticPaths` needed here — this is a single static page, not a dynamic route.

**Search/filter component:** A small React island (`<SearchPaesi client:visible />`) using the existing `@astrojs/react` integration. The full country data is passed as a prop (SSG-rendered HTML table is the default; React enhances with filter). This approach reuses the project's existing React setup and hydration pattern (`client:visible` for lazy hydration since the search is below the fold).

### Level 2: Dedicated Country Pages (`/codice-fiscale-estero/[slug]/`)

Individual pages for 15-20 countries with demonstrated search volume or high immigrant population in Italy.

**Initial country list (prioritized by search volume + immigrant community size):**

| # | Country | Code | Volume | Rationale |
|---|---------|------|--------|-----------|
| 1 | Romania | Z129 | 880 | Largest immigrant community in Italy |
| 2 | Albania | Z100 | 880 | 2nd largest community |
| 3 | Germania | Z112 | 590 | 192 impressions already, highest |
| 4 | Svizzera | Z133 | 480 | Large AIRE community |
| 5 | Marocco | Z330 | — | 3rd largest immigrant community |
| 6 | Francia | Z110 | 390 | Neighbor, large community |
| 7 | Regno Unito | Z114 | 390 | Post-Brexit CF needs |
| 8 | Ucraina | Z138 | — | 58 impressions, growing community |
| 9 | Stati Uniti | Z404 | 210 | High search volume |
| 10 | Cina | Z210 | — | Large immigrant community |
| 11 | India | Z222 | — | Growing community |
| 12 | Filippine | Z216 | — | Large community (calcolocf.com data) |
| 13 | Bangladesh | Z249 | — | Growing community |
| 14 | Moldavia | Z140 | — | 7 impressions at position 4.1 |
| 15 | Spagna | Z131 | — | Neighbor, AIRE community |
| 16 | Polonia | Z127 | — | EU community |
| 17 | Brasile | Z602 | — | Large AIRE/immigrant community |
| 18 | Argentina | Z600 | 390 | Large Italian-origin community |
| 19 | Tunisia | Z352 | — | Proximity, immigrant community |
| 20 | Egitto | Z336 | — | 10 impressions, growing community |

**URL structure:** `/codice-fiscale-estero/romania/` (clean, path-based slug)

**Page template (per country):**

```
Breadcrumb: Home > Nati all'Estero (/codice-fiscale-stranieri/) > [Country]
Note: "Nati all'Estero" links to the hub page. The different URL bases
(stranieri vs estero) are intentional for keyword targeting:
- /codice-fiscale-stranieri/ targets "codice fiscale stranieri"
- /codice-fiscale-estero/[slug]/ targets "codice fiscale estero [country]"

H1: Codice Fiscale [Country] — Codice Catastale [Z-code]
Subtitle: Come calcolare il CF per chi e' nato in [Country]

CTA box: link to calculator with "nato all'estero" hint

Section: Il Codice Catastale [Z-code]
  - What it is, where it appears in the CF
  - Visual example of a CF with the Z-code highlighted

Section: Esempio Pratico
  - Full CF calculation example for a fictional person born in [Country]
  - Rendered by a shared `<EsempioCF />` Astro component that takes name, surname, sex, date, country, Z-code as props and outputs the color-coded breakdown (extract pattern from existing stranieri page)

Section: Comunita' [Country] in Italia (unique per country)
  - 2-3 sentences about the community size/presence
  - Mention of AIRE if relevant (for EU/American countries)

Section: Come Richiedere il Codice Fiscale
  - In Italy: Agenzia delle Entrate
  - Abroad: Consolato/Ambasciata
  - (adapt existing content from stranieri page)

FAQ section (3-4 questions, Schema FAQPage):
  - "Qual e' il codice catastale di/del [Country]?" -> [Z-code]
  - "Come si calcola il CF per chi e' nato in [Country]?" -> standard process + Z-code
  - "[Z-code] a quale stato corrisponde?" -> [Country] (catches reverse queries)
  - Country-specific question if relevant

CTA: Calcola il tuo codice fiscale ->  /

Related countries: links to up to 4 other country pages from the same continent that have `hasDedicatedPage: true`. If the continent has fewer than 2 dedicated pages, supplement with countries from neighboring continents (e.g., Africa pages can link to Americhe). Selection is automatic based on `paesiEsteri.ts` data — no manual curation needed.

Schema: FAQPage + BreadcrumbList + Article
```

**Content length target:** 400-600 words per page (vs competitor's 150).
**Content must be genuinely unique per page**, not just template-swapped.

---

## Data Architecture

### New file: `src/data/paesiEsteri.ts`

Static data mapping for all 216 countries with continent classification:

```typescript
export interface PaeseEstero {
  nome: string;
  slug: string;           // URL slug: "romania", "stati-uniti"
  codiceCatastale: string; // "Z129"
  continente: 'Europa' | 'Asia' | 'Africa' | 'Americhe' | 'Oceania';
  hasDedicatedPage: boolean; // true for the top 20
}
```

This file is the single source of truth for continent classification and slug mapping. The country names and Z-codes are validated against `comuni.json` at build time.

### Country content: `src/data/countryContent.ts`

Per-country unique content for the 20 dedicated pages:

```typescript
export interface CountryContent {
  slug: string;
  codiceCatastale: string;  // "Z129" — duplicated from paesiEsteri for self-contained rendering
  continente: string;       // "Europa" — needed for related countries lookup
  nomeCompleto: string;     // "Stati Uniti d'America"
  nomeBreve: string;        // "Stati Uniti"
  preposizione: string;     // "negli" (negli Stati Uniti), "in" (in Romania)
  articolo: string;         // "gli" (gli Stati Uniti), "la" (la Romania)
  esempioNome: string;      // "John Smith"
  esempioSesso: 'M' | 'F';
  esempioData: string;      // "15 marzo 1990"
  comunita: string;         // 2-3 sentences about community in Italy (unique, hand-written)
  faqExtra?: { q: string; a: string }; // country-specific FAQ
}
```

---

## Implementation Scope

### Files to create:
- `src/data/` directory (does not exist yet)
- `src/data/paesiEsteri.ts` — continent mapping for all 216 countries
- `src/data/countryContent.ts` — unique content for top 20 countries
- `src/components/SearchPaesi.tsx` — React search/filter island for hub page
- `src/components/EsempioCF.astro` — shared CF example breakdown component
- `src/pages/codice-fiscale-estero/[slug].astro` — dynamic country page template (uses `getStaticPaths` to generate the 20 pages with `hasDedicatedPage: true`)

### Files to modify:
- `src/pages/codice-fiscale-stranieri.astro` — complete rewrite with full table, search, continent grouping
- `src/layouts/Layout.astro` — add "Paesi Esteri" to footer links
- `astro.config.mjs` — no changes needed (sitemap auto-discovers new pages)

### Files NOT modified:
- Calculator form (already supports foreign countries)
- `comuni.json` (data source stays as-is)
- Other existing pages

---

## SEO Specifications

### Hub page (`/codice-fiscale-stranieri/`)
- **Title:** "Codice Fiscale per Nati all'Estero — Tutti i Codici Catastali dei Paesi Esteri"
- **Description:** "Tabella completa di tutti i 216 codici catastali per paesi esteri nel codice fiscale italiano. Cerca per paese o codice Z. Guida al CF per stranieri."
- **Schema:** FAQPage + BreadcrumbList

### Country pages (`/codice-fiscale-estero/[slug]/`)
- **Title pattern:** "Codice Fiscale [Country] ([Z-code]) — Calcolo e Guida"
- **Description pattern:** "Il codice catastale [della/del] [Country] e' [Z-code]. Calcola il codice fiscale per chi e' nato [in/nel/negli] [Country]: esempio pratico, guida e FAQ."
- **Schema:** FAQPage + BreadcrumbList + Article
- **Internal links:** Hub page links to all 20 country pages; each country page links back to hub + 3-4 related countries

### Canonical URLs
All new pages inherit canonical tags from `Layout.astro` (already handles this via `Astro.url.pathname` + `Astro.site`). No additional work needed.

### Anchor strategy for hub page
- Each continent heading: `id="europa"`, `id="africa"`, etc.
- Each country row: `id="z112"`, `id="z404"`, etc.
- These enable Google to deep-link to specific sections

---

## What This Does NOT Include

- No changes to the calculator form or its logic
- No changes to the homepage or other existing pages
- No new JavaScript frameworks or dependencies
- No server-side rendering (stays fully static SSG)
- No automated content generation — all country content is hand-written

---

## Success Metrics (30-60 days post-deploy)

- Hub page position for Z-code queries: from 10.6 to < 7
- New impressions from country-specific pages
- Total stranieri section impressions: from 1,286 to 3,000+
- First clicks from "codice fiscale estero" and "calcolo codice fiscale estero"

# Design: calcolare-codice-fiscale.it

**Data:** 2026-03-02
**Dominio:** calcolare-codice-fiscale.it
**Deploy:** Vercel
**Stack:** Astro + React Islands + Tailwind CSS

---

## Obiettivo

Ricreare e migliorare il sito codicefiscaleonline.com con focus su:
- SEO avanzato (meta, schema markup, sitemap, contenuto)
- Performance ottimali (Core Web Vitals, Astro static)
- UX moderna rispetto al sito originale (datato, design anni 2000)
- Monetizzazione con Google AdSense + cookie banner GDPR leggero

---

## Struttura del Progetto

```
calcolare-codice-fiscale/
├── src/
│   ├── pages/
│   │   ├── index.astro           → Calcola CF (homepage)
│   │   ├── inverso.astro         → Decodifica CF (/inverso)
│   │   ├── verifica.astro        → Valida CF (/verifica)
│   │   ├── come-si-calcola.astro → Articolo algoritmo (/come-si-calcola)
│   │   └── 404.astro
│   ├── components/
│   │   ├── CalcolaForm.tsx       → Form calcolo CF (React island)
│   │   ├── InversoForm.tsx       → Form decodifica CF (React island)
│   │   ├── VerificaForm.tsx      → Form verifica CF (React island)
│   │   ├── CookieBanner.tsx      → Banner GDPR leggero (vanilla-like React)
│   │   └── AdBanner.astro        → Slot AdSense
│   ├── layouts/
│   │   └── Layout.astro          → Template base con meta/schema/AdSense
│   ├── lib/
│   │   ├── codiceFiscale.ts      → Algoritmo calcolo CF (DM 12/03/1974)
│   │   ├── inverso.ts            → Algoritmo decodifica CF
│   │   └── verifica.ts           → Algoritmo check digit
│   └── data/
│       └── comuni.json           → ~8100 comuni + stati esteri (codice catastale ISTAT)
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

**Dipendenze:**
- `astro`
- `@astrojs/react`
- `@astrojs/tailwind`
- `@astrojs/sitemap`
- `react`, `react-dom`
- `tailwindcss`

---

## Pagine e URL

| Pagina | URL | Scopo |
|---|---|---|
| Homepage | `/` | Calcolo CF principale |
| Inverso | `/inverso` | Decodifica CF → dati anagrafici |
| Verifica | `/verifica` | Validazione sintattica CF |
| Articolo | `/come-si-calcola` | SEO long-tail, spiega algoritmo |
| 404 | `/404` | Pagina non trovata |

---

## Strategia SEO

### Meta tag per pagina

| Pagina | `<title>` | `<meta description>` |
|---|---|---|
| `/` | Calcola Codice Fiscale Online — Gratis e Immediato | Calcola il tuo codice fiscale online in pochi secondi. Inserisci nome, cognome, data e luogo di nascita. Strumento gratuito e aggiornato 2026. |
| `/inverso` | Decodifica Codice Fiscale — Leggi i Dati dal CF | Inserisci un codice fiscale e scopri nome, cognome, data e comune di nascita. Decodifica inversa gratuita. |
| `/verifica` | Verifica Codice Fiscale — Controlla se è Valido | Verifica se un codice fiscale italiano è valido. Controllo del carattere di controllo in tempo reale. |
| `/come-si-calcola` | Come si Calcola il Codice Fiscale — Guida Completa | Guida completa all'algoritmo del codice fiscale italiano: cognome, nome, data, comune, carattere di controllo. |

### Schema Markup

- `/` → `WebApplication` (name, description, applicationCategory: "FinanceApplication")
- `/come-si-calcola` → `Article` + `FAQPage`
- Tutte le pagine → `BreadcrumbList`

### Tecnico

- `sitemap.xml` generata da `@astrojs/sitemap`
- `robots.txt`: tutto indicizzabile
- Canonical URL su ogni pagina
- `lang="it"` su `<html>`
- Open Graph tags (og:title, og:description, og:url)

### Performance

- Astro genera HTML statico → LCP ottimale
- Zero JS sulle sezioni statiche (articoli, FAQ, layout)
- React solo su form interattivi (`client:load`)
- Font di sistema (nessuna richiesta a Google Fonts)
- Nessuna immagine pesante (solo SVG/icone)

---

## Algoritmo Core — `src/lib/codiceFiscale.ts`

Implementa il D.M. 12/03/1974:

1. **Cognome:** estrae consonanti → vocali → `X` se < 3 caratteri
2. **Nome:** se ≥ 4 consonanti usa 1ª, 3ª, 4ª; altrimenti consonanti + vocali + `X`
3. **Anno:** ultime 2 cifre dell'anno di nascita
4. **Mese:** lettera da tabella `A B C D E H L M P R S T`
5. **Giorno:** per femmine aggiunge 40
6. **Comune:** lookup su `comuni.json` → codice catastale (es. Roma = H501)
7. **Check digit:** somma posizioni pari e dispari con tabelle di conversione → lettera finale

### `src/data/comuni.json` — struttura

```json
[
  { "nome": "Roma", "provincia": "RM", "codiceCatastale": "H501" },
  { "nome": "Milano", "provincia": "MI", "codiceCatastale": "F205" }
]
```

Fonte dati: ISTAT pubblici (~8100 comuni italiani + ~250 stati esteri con codice `Z***`).

### Gestione nati all'estero

Toggle "NATO ALL'ESTERO" nel form: sostituisce campo Comune/Provincia con campo Stato (lookup su stati esteri con codice catastale `Z***`).

---

## UI/UX

### Visual

- **Palette:** blu istituzionale (`#003087`) + bianco + verde CTA (`#1a7a4a`)
- **Font:** sistema (`-apple-system, Segoe UI, Helvetica Neue, sans-serif`)
- **Layout:** centrato, max-width 720px, mobile-first, responsive

### Homepage `/` — layout verticale

```
[Navbar: logo | Inverso | Verifica | Come si calcola]

[H1: Calcola il Codice Fiscale Online]
[Sottotitolo: Gratis, immediato, aggiornato 2026]

[FORM]
  Nome ___________   Cognome ___________
  Sesso [M / F]      Data di nascita [gg/mm/aaaa]
  Comune _________ (autocomplete)   Provincia [auto]
  [ ] Nato all'estero → mostra Stato

[BOTTONE: CALCOLA IL CODICE FISCALE]

[RISULTATO]
  Il tuo codice fiscale è:
  ┌─────────────────────┐
  │  RSSMRA80A01H501U   │  [Copia]
  └─────────────────────┘

[Ad Slot — banner AdSense]

[Cos'è il codice fiscale — ~200 parole]
[FAQ — 5 domande con schema FAQPage]
```

### Miglioramenti UX vs sito originale

- Autocomplete sul campo Comune (fuzzy search locale, zero backend)
- Provincia si auto-compila dal Comune selezionato
- Data di nascita: `<input type="date">` nativo (vs 3 dropdown separati)
- Risultato con bottone "Copia negli appunti" (Clipboard API)
- Validazione in tempo reale (errori inline, no alert)
- Mobile responsive (il sito originale non lo è)

---

## AdSense + Cookie Banner

- Cookie banner leggero implementato in React (no CMP di terze parti con 852 partner)
- Consenso salvato in `localStorage`
- AdSense caricato solo dopo consenso cookie
- Banner posizionati: dopo il risultato del calcolo, sidebar su desktop

---

## Approccio Scelto

**Opzione A — Astro Multi-Page + React Islands**

Ogni pagina è HTML statico generato da Astro. I form interattivi sono React islands (`client:load`). Questo garantisce:
- SEO ottimale con URL semantici per ogni feature
- Performance ottime (zero JS inutile)
- Scalabilità futura (aggiunta pagine facile)

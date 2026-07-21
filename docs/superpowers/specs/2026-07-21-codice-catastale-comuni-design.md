# Design — Cluster programmatico "Codice Catastale [Comune]"

**Data:** 2026-07-21
**Stato:** approvato (brainstorming) → pronto per writing-plans
**Owner:** Claudio Novaglio
**Sito:** calcolare-codice-fiscale.it (Astro 5 + React 19 + Tailwind, Vercel)

---

## 1. Obiettivo

Creare un cluster di pagine programmatiche **`/codice-catastale/[comune]/`** più un **hub `/codice-catastale/`**, che catturi il bacino di ricerca "codice catastale" — ad oggi non presidiato — replicando il pattern già validato delle pagine-paese `/codice-fiscale-estero/[slug]/` (che rankano pos 4-6).

Il deploy è **curato e a scaglioni** (~300 comuni totali, non i 7.896), per non intaccare il quality-signal del dominio giovane (142 giorni).

### Perché ora / dati a supporto (DataForSEO, Google IT, LOW competition)

| Query | SV/mese |
|---|---|
| codice catastale comune (+ varianti sinonime) | 3.600 |
| codice catastale (head) | 2.400 |
| codice catastale roma | 1.600 |
| codice catastale milano | 1.600 |
| codice catastale comune di roma | 1.000 |
| codice catastale napoli / torino / bologna | 720 cad. |
| codice catastale h501 (per-codice) | 480 |

Bacino addressabile ~21k SV solo tra teste + per-città top. Cluster suggestions sum ~40k SV.

### Due vincoli scoperti in fase di ricerca

1. **Terminologia = "codice catastale", NON "codice belfiore".** "codice catastale milano" 1.600 vs "codice belfiore milano" 70 (23×). Title/H1/URL delle nuove pagine devono essere brandizzati **codice catastale**; "belfiore" resta termine secondario nel corpo.
2. **Ambiguità di intento.** "codice catastale" ha due significati: (a) il codice Belfiore del comune usato nel CF *[il nostro]*; (b) la visura catastale immobiliare *[Agenzia delle Entrate, fuori verticale]*. Le pagine devono disambiguare esplicitamente per non attrarre/rankare sull'intento sbagliato.

### Sinergia col check del 21 lug

Le pagine info sono mono-pagina e diluiscono le PV/session (il KPI AdSense). Mitigazione **dentro il template**: ogni pagina ha next-step nativi (calcola/verifica/cerca) che costruiscono profondità di navigazione — risolve al contempo la raccomandazione #2 del report performance.

---

## 2. Architettura & routing

### 2.1 Route nuove

- **`/codice-catastale/[comune]/`** — pagina per-comune. Specchia `src/pages/codice-fiscale-estero/[slug].astro`: `getStaticPaths()` che itera il **set curato** (non tutti i comuni).
- **`/codice-catastale/`** — hub/directory. Target teste "codice catastale" (2.400) + "codice catastale comune" (3.600).

### 2.2 Fonte dati (già nel repo)

- `public/data/comuni.json` — array di 8.112 record `{ nome, provincia, codiceCatastale }` (7.896 comuni A001–Y999 + 216 esteri Z), da ANPR/ISTAT/Agenzia Entrate (CC BY). Casi noti: Roma→H501, Milano→F205.
- Va letto a **build-time** in `getStaticPaths` (import JSON via Vite/Astro o `fs`). Single source of truth: non duplicare i codici altrove.

### 2.3 Manopola di staging

- Nuovo `src/data/comuniPriority.ts` — lista **ordinata** di comuni del set curato, ciascuno con un tag `wave: 0 | 1 | 2` a fini di record-keeping. È l'unico punto da editare per pubblicare una nuova ondata.
- Generato **una volta** dai top ~300 comuni per popolazione (ranking ISTAT noto). Il record di ogni comune è risolto contro `comuni.json` (match su nome+provincia) per ottenere `codiceCatastale`; se il match fallisce, il build deve fallire in modo esplicito (no pagina silenziosamente mancante).
- **Gating semplice, un solo meccanismo:** `getStaticPaths` genera una pagina per **ogni** record presente in `comuniPriority.ts`. Pubblicare un'ondata = aggiungere i suoi record al file. Il tag `wave` è solo documentazione, non filtra il build. Così "cosa è live" = "cosa è nel file", senza flag di ondata attiva da tenere sincronizzato.

### 2.4 Slug & collisioni

- Slug = kebab del nome (`Reggio nell'Emilia` → `reggio-nell-emilia`).
- Comuni omonimi: se due comuni nel set curato producono lo stesso slug, suffisso con la provincia (`/codice-catastale/livo-co/`, `/codice-catastale/livo-tn/`). Nel set top-300 le collisioni tra grandi città sono rare; la logica di dedup va comunque implementata e testata.

---

## 3. Template per-comune — blocchi di contenuto

Tutto generato da dati strutturati + logica esistente (niente prosa vuota → non thin):

1. **Hero** — "Codice Catastale [Comune]: [CODE]" + provincia/regione + "occupa le posizioni 12-15 del codice fiscale". CTA "Vai al calcolatore".
2. **Il codice + disambiguazione** — [CODE] è il codice catastale/Belfiore di [Comune] (prov). Blocco esplicito: **non** è la visura catastale immobiliare dell'Agenzia; è l'identificativo del luogo di nascita nel CF.
3. **Esempio pratico** — worked-example CF col codice del comune, riusa il componente `EsempioCF`. Unico per comune (codice diverso → CF diverso).
4. **Omocodia del codice** — le varianti omocodiche di [CODE] generate con la lib già testata (`src/lib/`), cross-link a `/omocodia-codice-fiscale/`. Unico per codice.
5. **Comuni vicini** — grid di link interni ai comuni della stessa provincia **presenti nel set pubblicato** (mesh del cluster).
6. **Next-step nativi (leva PV/session)** — "Calcola un CF con [Comune]" → `/`; "Verifica un CF" → `/verifica-codice-fiscale/`; "Cerca un altro comune" → `/cerca-codice-belfiore/`.
7. **FAQ generata** (4 Q&A dai dati): "Qual è il codice catastale di [Comune]?", "[CODE] a quale comune corrisponde?", "Dove si trova [CODE] nel codice fiscale?", "[CODE] è codice comune o codice catastale?".
8. **Approfondisci** — grid verso pagine-concetto (come da pattern paese): tabelle, come-leggere, codice-belfiore, omocodia.

Schema JSON-LD: **FAQPage + Article**; breadcrumb Home › Codice Catastale › [Comune].

---

## 4. Hub `/codice-catastale/`

- Explainer "cos'è il codice catastale (Belfiore)" con la disambiguazione (Belfiore-nel-CF vs visura immobiliare).
- **Directory** dei comuni pubblicati, raggruppati per regione, con codice a fianco.
- Link al **concetto** `/codice-belfiore/` e ai **tool** `cerca-codice-belfiore` / `cerca-comune-da-codice`.
- Schema: FAQPage + breadcrumb. Target "codice catastale" + "codice catastale comune".

---

## 5. Mappa anti-cannibalizzazione

| Pagina | Possiede | Ruolo |
|---|---|---|
| `/codice-belfiore/` (esistente, pos 8,2 su "codice belfiore" 880) | "codice belfiore" | Concetto/definizione. **Non si tocca** (regge Bing). Diventa genitore che linka all'hub. |
| `/codice-catastale/` (nuovo) | "codice catastale", "codice catastale comune" | Hub/directory del cluster. |
| `/codice-catastale/[comune]/` (nuovo) | "codice catastale [città]" | Risposta specifica per comune. |
| `cerca-codice-belfiore`, `cerca-comune-da-codice` (esistenti) | intento "strumento" | Tool interattivi; le pagine statiche li linkano come "cerca un altro comune". |

- **Disciplina:** nessuna sovrapposizione di title tra i tre livelli (concetto / hub / per-comune).
- **Rischio residuo monitorato:** l'hub non deve erodere "codice belfiore" — verifica a ogni ondata che `/codice-belfiore/` non scenda da pos ~8.

---

## 6. SEO

- **Title:** `Codice Catastale [Comune] ([PROV]): [CODE] | Codice Fiscale`
- **H1:** `Codice Catastale [Comune]: [CODE]`
- **URL:** `/codice-catastale/[slug]/`
- **Meta description:** template con codice + provincia + contesto CF (posizioni 12-15).
- Bing-first (linea del sito, Bing-eco 78% del traffico). Submit IndexNow + GSC a ogni ondata.

---

## 7. Scaglioni (staging)

- **Wave 0 — pilota (~20 comuni):** i top per popolazione — Roma, Milano, Napoli, Torino, Palermo, Genova, Bologna, Firenze, Bari, Catania, Venezia, Verona, Messina, Padova, Trieste, Brescia, Prato, Parma, Modena, Reggio Calabria. Valida index (Bing ~7gg) + ranking (~14gg) **prima** di scalare.
- **Wave 1 (~+90):** restanti capoluoghi di provincia (107 totali) + top per popolazione fino a ~110.
- **Wave 2 (~+190):** fino a ~300 comuni.
- **Cadenza:** un'ondata ogni ~2-3 settimane, **gate sull'esito della precedente** (segnale Bing 14gg validato dal modello paesi).
- **Hard stop a ~300**, NON 7.896. Espansione oltre solo post-AdSense e solo se il modello resta pulito (no perdita di quality-signal, no cannibalizzazione).

---

## 8. Test & validazione

- **Unit:** generazione slug + dedup collisioni; correttezza lookup codice (casi noti Roma→H501, Milano→F205); le varianti omocodia riusano la lib già testata (no nuovi test sulla logica omocodia, solo sull'uso).
- **Build:** `getStaticPaths` produce esattamente il conteggio del set curato dell'ondata attiva; 0 link interni rotti (i "comuni vicini" linkano solo pagine pubblicate); `astro check` + build con **0 nuovi errori** (stessa disciplina del batch 24 giu).
- **Post-deploy per ondata:** IndexNow submit; re-check index Bing ~7gg, ranking ~14gg; **allarme cannibalizzazione** su "codice belfiore" (`/codice-belfiore/` non deve scendere da pos ~8).

---

## 9. Fuori scope (YAGNI)

- Non tutti i 7.896 comuni (solo set curato ~300).
- Nessun arricchimento popolazione automatizzato in `comuni.json` (la priorità vive in `comuniPriority.ts`, lista curata).
- Nessuna modifica a `/codice-belfiore/`, ai tool `cerca-*`, o ai title esistenti che rankano su Bing.
- Nessun attacco ai bacini "controllo CF" (22k) / "generatore" (49k) — sono altri cicli.

---

## 10. Criteri di successo

- Wave 0: almeno i comuni top (roma/milano) entrano in classifica su Bing entro ~14gg (modello paesi validato) e su Google entro ~3-4 settimane.
- Nessuna regressione di `/codice-belfiore/` su "codice belfiore".
- Contributo misurabile al traffico search nel check successivo, con next-step delle nuove pagine che non peggiorano (idealmente migliorano) le PV/session del cluster.

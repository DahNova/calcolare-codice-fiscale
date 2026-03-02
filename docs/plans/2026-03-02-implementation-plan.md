# Calcolare Codice Fiscale — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build calcolare-codice-fiscale.it, un sito Astro statico per il calcolo del codice fiscale italiano con SEO ottimizzato, AdSense e cookie banner GDPR.

**Architecture:** Multi-page Astro (static export) con React islands per i form interattivi. Algoritmo CF in TypeScript puro testato con Vitest. Database comuni (~8100 voci) servito come file statico da `/public/data/comuni.json` e caricato client-side on-demand.

**Tech Stack:** Astro 4.x, React 18, Tailwind CSS 3, TypeScript, Vitest, @astrojs/react, @astrojs/tailwind, @astrojs/sitemap

---

### Task 1: Inizializzare il progetto Astro

**Files:**
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `vitest.config.ts`

**Step 1: Scaffold progetto Astro**

Eseguire nella directory `/c/Progetti_WSL/calcolare-codice-fiscale/`:

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-git --install
```

Se chiede conferma su "directory not empty", rispondere `y`.

**Step 2: Installare integrazioni e devtools**

```bash
npm install @astrojs/react @astrojs/tailwind @astrojs/sitemap react react-dom
npm install -D @types/react @types/react-dom tailwindcss vitest @vitest/ui
```

**Step 3: Sostituire astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://calcolare-codice-fiscale.it',
  integrations: [
    react(),
    tailwind(),
    sitemap(),
  ],
  output: 'static',
});
```

**Step 4: Creare tailwind.config.mjs**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#003087',
          green: '#1a7a4a',
          'green-hover': '#15633c',
        },
      },
    },
  },
  plugins: [],
};
```

**Step 5: Creare vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

**Step 6: Aggiungere script test in package.json**

Aprire `package.json` e aggiungere alla sezione `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 7: Verificare che il dev server parta**

```bash
npm run dev
```
Atteso: server Astro su `http://localhost:4321` senza errori.

**Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Astro project with React, Tailwind, Sitemap, Vitest"
```

---

### Task 2: Preparare comuni.json

**Files:**
- Create: `public/data/comuni.json`
- Create: `scripts/build-comuni.ts`

**Step 1: Creare directory**

```bash
mkdir -p public/data scripts
```

**Step 2: Creare script per generare comuni.json**

Creare `scripts/build-comuni.ts`:

```ts
/**
 * Scarica e formatta i comuni italiani + stati esteri.
 * Eseguire con: npx tsx scripts/build-comuni.ts
 *
 * Fonte: npm package 'codice-fiscale-utils' (licenza MIT)
 * che contiene i dati ISTAT/Agenzia Entrate.
 */

const OUTPUT = 'public/data/comuni.json';

// Fonte affidabile pubblica con codici catastali
const URL = 'https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json';

async function main() {
  console.log('Scaricando comuni...');
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: any[] = await res.json();

  const comuni = data
    .filter((c) => c.codiceCatastale)
    .map((c) => ({
      nome: c.nome as string,
      provincia: (c.sigla ?? c.provincia?.sigla ?? '') as string,
      codiceCatastale: c.codiceCatastale as string,
    }));

  // Stati esteri (codici Z001-Z401 Agenzia Entrate)
  const statiEsteri = [
    { nome: 'Afghanistan', provincia: 'EE', codiceCatastale: 'Z200' },
    { nome: 'Albania', provincia: 'EE', codiceCatastale: 'Z100' },
    { nome: 'Algeria', provincia: 'EE', codiceCatastale: 'Z301' },
    { nome: 'Argentina', provincia: 'EE', codiceCatastale: 'Z600' },
    { nome: 'Australia', provincia: 'EE', codiceCatastale: 'Z700' },
    { nome: 'Austria', provincia: 'EE', codiceCatastale: 'Z102' },
    { nome: 'Belgio', provincia: 'EE', codiceCatastale: 'Z103' },
    { nome: 'Brasile', provincia: 'EE', codiceCatastale: 'Z602' },
    { nome: 'Bulgaria', provincia: 'EE', codiceCatastale: 'Z104' },
    { nome: 'Canada', provincia: 'EE', codiceCatastale: 'Z401' },
    { nome: 'Cina', provincia: 'EE', codiceCatastale: 'Z210' },
    { nome: 'Colombia', provincia: 'EE', codiceCatastale: 'Z604' },
    { nome: 'Croazia', provincia: 'EE', codiceCatastale: 'Z149' },
    { nome: 'Danimarca', provincia: 'EE', codiceCatastale: 'Z107' },
    { nome: 'Ecuador', provincia: 'EE', codiceCatastale: 'Z605' },
    { nome: 'Egitto', provincia: 'EE', codiceCatastale: 'Z336' },
    { nome: 'Etiopia', provincia: 'EE', codiceCatastale: 'Z315' },
    { nome: 'Filippine', provincia: 'EE', codiceCatastale: 'Z216' },
    { nome: 'Finlandia', provincia: 'EE', codiceCatastale: 'Z109' },
    { nome: 'Francia', provincia: 'EE', codiceCatastale: 'Z110' },
    { nome: 'Germania', provincia: 'EE', codiceCatastale: 'Z112' },
    { nome: 'Ghana', provincia: 'EE', codiceCatastale: 'Z320' },
    { nome: 'Giappone', provincia: 'EE', codiceCatastale: 'Z219' },
    { nome: 'Grecia', provincia: 'EE', codiceCatastale: 'Z115' },
    { nome: 'India', provincia: 'EE', codiceCatastale: 'Z222' },
    { nome: 'Iran', provincia: 'EE', codiceCatastale: 'Z224' },
    { nome: 'Iraq', provincia: 'EE', codiceCatastale: 'Z225' },
    { nome: 'Irlanda', provincia: 'EE', codiceCatastale: 'Z116' },
    { nome: 'Israele', provincia: 'EE', codiceCatastale: 'Z228' },
    { nome: 'Kosovo', provincia: 'EE', codiceCatastale: 'Z160' },
    { nome: 'Libia', provincia: 'EE', codiceCatastale: 'Z326' },
    { nome: 'Lussemburgo', provincia: 'EE', codiceCatastale: 'Z119' },
    { nome: 'Macedonia del Nord', provincia: 'EE', codiceCatastale: 'Z148' },
    { nome: 'Marocco', provincia: 'EE', codiceCatastale: 'Z330' },
    { nome: 'Messico', provincia: 'EE', codiceCatastale: 'Z608' },
    { nome: 'Moldova', provincia: 'EE', codiceCatastale: 'Z140' },
    { nome: 'Nigeria', provincia: 'EE', codiceCatastale: 'Z335' },
    { nome: 'Norvegia', provincia: 'EE', codiceCatastale: 'Z125' },
    { nome: 'Paesi Bassi', provincia: 'EE', codiceCatastale: 'Z126' },
    { nome: 'Pakistan', provincia: 'EE', codiceCatastale: 'Z236' },
    { nome: 'Peru', provincia: 'EE', codiceCatastale: 'Z611' },
    { nome: 'Polonia', provincia: 'EE', codiceCatastale: 'Z127' },
    { nome: 'Portogallo', provincia: 'EE', codiceCatastale: 'Z128' },
    { nome: 'Regno Unito', provincia: 'EE', codiceCatastale: 'Z114' },
    { nome: 'Repubblica Ceca', provincia: 'EE', codiceCatastale: 'Z156' },
    { nome: 'Romania', provincia: 'EE', codiceCatastale: 'Z129' },
    { nome: 'Russia', provincia: 'EE', codiceCatastale: 'Z154' },
    { nome: 'Senegal', provincia: 'EE', codiceCatastale: 'Z343' },
    { nome: 'Serbia', provincia: 'EE', codiceCatastale: 'Z158' },
    { nome: 'Slovacchia', provincia: 'EE', codiceCatastale: 'Z155' },
    { nome: 'Slovenia', provincia: 'EE', codiceCatastale: 'Z150' },
    { nome: 'Somalia', provincia: 'EE', codiceCatastale: 'Z347' },
    { nome: 'Spagna', provincia: 'EE', codiceCatastale: 'Z131' },
    { nome: 'Sri Lanka', provincia: 'EE', codiceCatastale: 'Z209' },
    { nome: 'Stati Uniti d\'America', provincia: 'EE', codiceCatastale: 'Z404' },
    { nome: 'Sudafrica', provincia: 'EE', codiceCatastale: 'Z347' },
    { nome: 'Svezia', provincia: 'EE', codiceCatastale: 'Z132' },
    { nome: 'Svizzera', provincia: 'EE', codiceCatastale: 'Z133' },
    { nome: 'Tunisia', provincia: 'EE', codiceCatastale: 'Z352' },
    { nome: 'Turchia', provincia: 'EE', codiceCatastale: 'Z243' },
    { nome: 'Ucraina', provincia: 'EE', codiceCatastale: 'Z138' },
    { nome: 'Ungheria', provincia: 'EE', codiceCatastale: 'Z134' },
    { nome: 'Venezuela', provincia: 'EE', codiceCatastale: 'Z614' },
  ];

  const all = [...comuni, ...statiEsteri];

  const { writeFileSync } = await import('fs');
  writeFileSync(OUTPUT, JSON.stringify(all));
  console.log(`✓ Scritti ${all.length} record in ${OUTPUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

**Step 3: Installare tsx ed eseguire lo script**

```bash
npm install -D tsx
npx tsx scripts/build-comuni.ts
```

Atteso: `✓ Scritti XXXX record in public/data/comuni.json`

**Step 4: Verificare il file**

```bash
wc -c public/data/comuni.json   # Dovrebbe essere > 300000 bytes
node -e "const d=require('./public/data/comuni.json'); console.log(d.length, d[0])"
```

Atteso: numero > 8000, e un oggetto con `nome`, `provincia`, `codiceCatastale`.

**Fallback manuale:** Se lo script fallisce (la sorgente è cambiata), installare il package alternativo:
```bash
npm install codice-fiscale-utils
node -e "const m = require('codice-fiscale-utils'); require('fs').writeFileSync('public/data/comuni.json', JSON.stringify(m.municipalities))"
```

**Step 5: Commit**

```bash
git add public/data/comuni.json scripts/build-comuni.ts
git commit -m "feat: add comuni italiani + stati esteri JSON dataset"
```

---

### Task 3: Algoritmo codiceFiscale.ts (TDD)

**Files:**
- Create: `src/lib/__tests__/codiceFiscale.test.ts`
- Create: `src/lib/codiceFiscale.ts`

**Step 1: Creare directory test**

```bash
mkdir -p src/lib/__tests__
```

**Step 2: Scrivere i test (PRIMA dell'implementazione)**

Creare `src/lib/__tests__/codiceFiscale.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calcolaCodiceFiscale } from '../codiceFiscale';

describe('calcolaCodiceFiscale', () => {
  it('calcola CF classico: Mario Rossi, M, 1/1/1980, Roma', () => {
    expect(calcolaCodiceFiscale({
      cognome: 'Rossi', nome: 'Mario', sesso: 'M',
      giorno: 1, mese: 1, anno: 1980, codiceCatastale: 'H501',
    })).toBe('RSSMRA80A01H501U');
  });

  it('produce sempre 16 caratteri', () => {
    const cf = calcolaCodiceFiscale({
      cognome: 'Bianchi', nome: 'Anna', sesso: 'F',
      giorno: 15, mese: 6, anno: 1995, codiceCatastale: 'F205',
    });
    expect(cf).toHaveLength(16);
  });

  it('aggiunge 40 al giorno per sesso femminile', () => {
    const cf = calcolaCodiceFiscale({
      cognome: 'Bianchi', nome: 'Anna', sesso: 'F',
      giorno: 15, mese: 6, anno: 1995, codiceCatastale: 'F205',
    });
    expect(cf.substring(9, 11)).toBe('55'); // 15 + 40 = 55
  });

  it('NON aggiunge 40 per sesso maschile', () => {
    const cf = calcolaCodiceFiscale({
      cognome: 'Rossi', nome: 'Mario', sesso: 'M',
      giorno: 5, mese: 3, anno: 1985, codiceCatastale: 'H501',
    });
    expect(cf.substring(9, 11)).toBe('05');
  });

  it('codifica nome con 4+ consonanti: usa 1a, 3a, 4a consonante', () => {
    // "Roberto" → consonanti R,B,R,T (4 consonanti) → usa R, R, T
    const cf = calcolaCodiceFiscale({
      cognome: 'Verdi', nome: 'Roberto', sesso: 'M',
      giorno: 1, mese: 1, anno: 1980, codiceCatastale: 'H501',
    });
    expect(cf.substring(3, 6)).toBe('RRT');
  });

  it('integra con X quando nome/cognome ha pochi caratteri', () => {
    // Cognome "Fo": F + O → FOX
    const cf = calcolaCodiceFiscale({
      cognome: 'Fo', nome: 'Io', sesso: 'M',
      giorno: 1, mese: 1, anno: 1980, codiceCatastale: 'H501',
    });
    expect(cf.substring(0, 3)).toBe('FOX');
  });

  it('codifica tutti i mesi correttamente', () => {
    const mesiAttesi: Record<number, string> = {
      1:'A', 2:'B', 3:'C', 4:'D', 5:'E', 6:'H',
      7:'L', 8:'M', 9:'P', 10:'R', 11:'S', 12:'T',
    };
    for (const [mese, lettera] of Object.entries(mesiAttesi)) {
      const cf = calcolaCodiceFiscale({
        cognome: 'Rossi', nome: 'Mario', sesso: 'M',
        giorno: 1, mese: Number(mese), anno: 1980, codiceCatastale: 'H501',
      });
      expect(cf[8], `mese ${mese}`).toBe(lettera);
    }
  });

  it('usa solo le ultime 2 cifre dell\'anno', () => {
    const cf = calcolaCodiceFiscale({
      cognome: 'Rossi', nome: 'Mario', sesso: 'M',
      giorno: 1, mese: 1, anno: 2005, codiceCatastale: 'H501',
    });
    expect(cf.substring(6, 8)).toBe('05');
  });

  it('include il codice catastale in maiuscolo', () => {
    const cf = calcolaCodiceFiscale({
      cognome: 'Rossi', nome: 'Mario', sesso: 'M',
      giorno: 1, mese: 1, anno: 1980, codiceCatastale: 'h501', // minuscolo
    });
    expect(cf.substring(11, 15)).toBe('H501');
  });
});
```

**Step 3: Eseguire i test — devono FALLIRE**

```bash
npm test
```
Atteso: `FAIL` con `Cannot find module '../codiceFiscale'`.

**Step 4: Implementare codiceFiscale.ts**

Creare `src/lib/codiceFiscale.ts`:

```ts
const MESI: Record<number, string> = {
  1:'A', 2:'B', 3:'C', 4:'D', 5:'E', 6:'H',
  7:'L', 8:'M', 9:'P', 10:'R', 11:'S', 12:'T',
};

// Tabella valori per posizioni DISPARI (1-based index = 1,3,5,...,15)
const ODD: Record<string, number> = {
  '0':1,'1':0,'2':5,'3':7,'4':9,'5':13,'6':15,'7':17,'8':19,'9':21,
  A:1,B:0,C:5,D:7,E:9,F:13,G:15,H:17,I:19,J:21,
  K:2,L:4,M:18,N:20,O:11,P:3,Q:6,R:8,S:12,T:14,
  U:16,V:10,W:22,X:25,Y:24,Z:23,
};

function consonanti(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, '').replace(/[AEIOU]/g, '');
}

function vocali(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, '').replace(/[^AEIOU]/g, '');
}

function encodeCognome(cognome: string): string {
  return (consonanti(cognome) + vocali(cognome) + 'XXX').substring(0, 3);
}

function encodeNome(nome: string): string {
  const c = consonanti(nome);
  const v = vocali(nome);
  if (c.length >= 4) return c[0] + c[2] + c[3];
  return (c + v + 'XXX').substring(0, 3);
}

function encodeData(giorno: number, mese: number, anno: number, sesso: 'M' | 'F'): string {
  const aa = String(anno).slice(-2);
  const mm = MESI[mese];
  const gg = sesso === 'F'
    ? String(giorno + 40).padStart(2, '0')
    : String(giorno).padStart(2, '0');
  return aa + mm + gg;
}

function checkDigit(parziale: string): string {
  let sum = 0;
  for (let i = 0; i < parziale.length; i++) {
    const ch = parziale[i];
    if (i % 2 === 0) {
      // indice 0-based pari = posizione 1-based dispari → usa ODD
      sum += ODD[ch] ?? 0;
    } else {
      // posizione 1-based pari → valore semplice
      sum += /[0-9]/.test(ch) ? parseInt(ch) : ch.charCodeAt(0) - 65;
    }
  }
  return String.fromCharCode(65 + (sum % 26));
}

export interface InputCF {
  cognome: string;
  nome: string;
  sesso: 'M' | 'F';
  giorno: number;
  mese: number;
  anno: number;
  codiceCatastale: string;
}

export function calcolaCodiceFiscale(input: InputCF): string {
  const p1 = encodeCognome(input.cognome);
  const p2 = encodeNome(input.nome);
  const p3 = encodeData(input.giorno, input.mese, input.anno, input.sesso);
  const p4 = input.codiceCatastale.toUpperCase();
  const parziale = p1 + p2 + p3 + p4;
  return parziale + checkDigit(parziale);
}
```

**Step 5: Eseguire i test — devono PASSARE**

```bash
npm test
```
Atteso: tutti i test `PASS`.

**Step 6: Commit**

```bash
git add src/lib/codiceFiscale.ts src/lib/__tests__/codiceFiscale.test.ts
git commit -m "feat: implement codice fiscale algorithm with TDD (DM 12/03/1974)"
```

---

### Task 4: Algoritmo verifica.ts (TDD)

**Files:**
- Create: `src/lib/__tests__/verifica.test.ts`
- Create: `src/lib/verifica.ts`

**Step 1: Scrivere i test**

Creare `src/lib/__tests__/verifica.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { verificaCodiceFiscale } from '../verifica';

describe('verificaCodiceFiscale', () => {
  it('valida un CF corretto', () => {
    expect(verificaCodiceFiscale('RSSMRA80A01H501U')).toBe(true);
  });

  it('rifiuta CF con check digit sbagliato', () => {
    expect(verificaCodiceFiscale('RSSMRA80A01H501Z')).toBe(false);
  });

  it('rifiuta CF troppo corto', () => {
    expect(verificaCodiceFiscale('RSSMRA80A01H501')).toBe(false);
  });

  it('rifiuta CF troppo lungo', () => {
    expect(verificaCodiceFiscale('RSSMRA80A01H501UU')).toBe(false);
  });

  it('rifiuta CF con caratteri speciali', () => {
    expect(verificaCodiceFiscale('RSSMRA80A01H501!')).toBe(false);
  });

  it('accetta lettere minuscole (case insensitive)', () => {
    expect(verificaCodiceFiscale('rssmra80a01h501u')).toBe(true);
  });

  it('ignora spazi iniziali e finali', () => {
    expect(verificaCodiceFiscale('  RSSMRA80A01H501U  ')).toBe(true);
  });

  it('valida stringa vuota come falsa', () => {
    expect(verificaCodiceFiscale('')).toBe(false);
  });
});
```

**Step 2: Eseguire i test — devono FALLIRE**

```bash
npm test
```
Atteso: FAIL con `Cannot find module '../verifica'`.

**Step 3: Implementare verifica.ts**

Creare `src/lib/verifica.ts`:

```ts
const ODD: Record<string, number> = {
  '0':1,'1':0,'2':5,'3':7,'4':9,'5':13,'6':15,'7':17,'8':19,'9':21,
  A:1,B:0,C:5,D:7,E:9,F:13,G:15,H:17,I:19,J:21,
  K:2,L:4,M:18,N:20,O:11,P:3,Q:6,R:8,S:12,T:14,
  U:16,V:10,W:22,X:25,Y:24,Z:23,
};

export function verificaCodiceFiscale(cf: string): boolean {
  const s = cf.toUpperCase().trim();
  if (s.length !== 16) return false;
  if (!/^[A-Z0-9]{15}[A-Z]$/.test(s)) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const ch = s[i];
    if (i % 2 === 0) {
      sum += ODD[ch] ?? 0;
    } else {
      sum += /[0-9]/.test(ch) ? parseInt(ch) : ch.charCodeAt(0) - 65;
    }
  }
  return s[15] === String.fromCharCode(65 + (sum % 26));
}
```

**Step 4: Eseguire i test — devono PASSARE**

```bash
npm test
```
Atteso: tutti PASS.

**Step 5: Commit**

```bash
git add src/lib/verifica.ts src/lib/__tests__/verifica.test.ts
git commit -m "feat: implement codice fiscale validation (check digit)"
```

---

### Task 5: Algoritmo inverso.ts (TDD)

**Files:**
- Create: `src/lib/__tests__/inverso.test.ts`
- Create: `src/lib/inverso.ts`

**Note:** `inverso.ts` NON importa comuni.json per mantenere la libreria testabile in Node puro. Il lookup comune → nome avviene nel componente React a runtime.

**Step 1: Scrivere i test**

Creare `src/lib/__tests__/inverso.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { decodificaCodiceFiscale } from '../inverso';

describe('decodificaCodiceFiscale', () => {
  it('decodifica sesso maschile', () => {
    expect(decodificaCodiceFiscale('RSSMRA80A01H501U')?.sesso).toBe('M');
  });

  it('decodifica sesso femminile quando giorno > 40', () => {
    // giorno "55" nel CF → 55 > 40 → F, giorno reale = 55 - 40 = 15
    // Costruiamo un CF con giorno 55: BNCNNA95H55F205?
    // (il check digit non è validato da inverso.ts)
    const result = decodificaCodiceFiscale('BNCNNA95H55F205X');
    expect(result?.sesso).toBe('F');
    expect(result?.giorno).toBe(15);
  });

  it('decodifica giorno per maschio senza sottrarre 40', () => {
    expect(decodificaCodiceFiscale('RSSMRA80A01H501U')?.giorno).toBe(1);
  });

  it('decodifica mese correttamente', () => {
    expect(decodificaCodiceFiscale('RSSMRA80A01H501U')?.mese).toBe(1); // A = Gennaio
  });

  it('decodifica anno con best-guess centuries', () => {
    // "80" → 1980 (80 > currentYearSuffix che è 26)
    expect(decodificaCodiceFiscale('RSSMRA80A01H501U')?.annoCompleto).toBe(1980);
  });

  it('anni recenti (00-26) → 2000s', () => {
    // "05" → 2005
    const result = decodificaCodiceFiscale('RSSMRA05A01H501U');
    expect(result?.annoCompleto).toBe(2005);
  });

  it('estrae codice catastale', () => {
    expect(decodificaCodiceFiscale('RSSMRA80A01H501U')?.codiceCatastale).toBe('H501');
  });

  it('restituisce null per CF troppo corto', () => {
    expect(decodificaCodiceFiscale('TOOSHORT')).toBeNull();
  });

  it('restituisce null per mese non valido (es. Z)', () => {
    expect(decodificaCodiceFiscale('RSSMRA80Z01H501U')).toBeNull();
  });
});
```

**Step 2: Eseguire i test — devono FALLIRE**

```bash
npm test
```
Atteso: FAIL.

**Step 3: Implementare inverso.ts**

Creare `src/lib/inverso.ts`:

```ts
const MESI_INVERSO: Record<string, number> = {
  A:1, B:2, C:3, D:4, E:5, H:6,
  L:7, M:8, P:9, R:10, S:11, T:12,
};

export interface DatiCF {
  sesso: 'M' | 'F';
  giorno: number;
  mese: number;
  annoCompleto: number;
  codiceCatastale: string;
}

export function decodificaCodiceFiscale(cf: string): DatiCF | null {
  const s = cf.toUpperCase().trim();
  if (s.length !== 16) return null;

  const annoNum = parseInt(s.substring(6, 8));
  const meseChar = s[8];
  const giornoParsed = parseInt(s.substring(9, 11));
  const codiceCatastale = s.substring(11, 15);

  const mese = MESI_INVERSO[meseChar];
  if (!mese) return null;

  const sesso: 'M' | 'F' = giornoParsed > 40 ? 'F' : 'M';
  const giorno = sesso === 'F' ? giornoParsed - 40 : giornoParsed;

  const currentSuffix = new Date().getFullYear() % 100;
  const annoCompleto = annoNum <= currentSuffix ? 2000 + annoNum : 1900 + annoNum;

  return { sesso, giorno, mese, annoCompleto, codiceCatastale };
}
```

**Step 4: Eseguire i test — devono PASSARE**

```bash
npm test
```
Atteso: tutti PASS.

**Step 5: Commit**

```bash
git add src/lib/inverso.ts src/lib/__tests__/inverso.test.ts
git commit -m "feat: implement codice fiscale inverse decoding"
```

---

### Task 6: CookieBanner.tsx

**Files:**
- Create: `src/components/CookieBanner.tsx`

**Step 1: Creare il banner GDPR**

Creare `src/components/CookieBanner.tsx`:

```tsx
import { useState, useEffect } from 'react';

const KEY = 'cf_cookie_consent';

function loadAdSense(publisherId: string) {
  if (document.getElementById('adsense-script')) return;
  const s = document.createElement('script');
  s.id = 'adsense-script';
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  s.setAttribute('crossorigin', 'anonymous');
  document.head.appendChild(s);
}

// Sostituire con il proprio publisher ID dopo approvazione AdSense
const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(KEY);
    if (consent === 'accepted') {
      loadAdSense(ADSENSE_PUBLISHER_ID);
    } else if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(KEY, 'accepted');
    setVisible(false);
    loadAdSense(ADSENSE_PUBLISHER_ID);
  }

  function decline() {
    localStorage.setItem(KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-50 border-t border-gray-700">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm flex-1 text-gray-200">
          Utilizziamo cookie tecnici e, previo consenso, cookie di Google AdSense per
          mostrare annunci pertinenti. Nessun dato viene condiviso con terze parti senza
          il tuo consenso.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm border border-gray-500 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Rifiuta
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-[#1a7a4a] hover:bg-[#15633c] rounded-lg font-semibold transition-colors"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/CookieBanner.tsx
git commit -m "feat: add GDPR cookie banner with AdSense lazy loading"
```

---

### Task 7: Layout.astro

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `public/favicon.svg`

**Step 1: Creare favicon SVG**

Creare `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#003087"/>
  <text x="16" y="23" text-anchor="middle" font-family="monospace" font-size="13"
    font-weight="bold" fill="white">CF</text>
</svg>
```

**Step 2: Creare Layout.astro**

Creare `src/layouts/Layout.astro`:

```astro
---
import CookieBanner from '../components/CookieBanner';

export interface Props {
  title: string;
  description: string;
  canonicalUrl?: string;
  schemaJson?: object | object[];
}

const { title, description, canonicalUrl, schemaJson } = Astro.props;
const siteUrl = 'https://calcolare-codice-fiscale.it';
const canonical = canonicalUrl ?? siteUrl + Astro.url.pathname;
const schemas = schemaJson
  ? Array.isArray(schemaJson) ? schemaJson : [schemaJson]
  : [];
---

<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="it_IT" />

    <!-- Schema.org JSON-LD -->
    {schemas.map(s => (
      <script type="application/ld+json" set:html={JSON.stringify(s)} />
    ))}

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-gray-50 text-gray-900 min-h-screen flex flex-col">

    <!-- Navbar -->
    <header class="bg-[#003087] text-white shadow-md">
      <nav class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" class="text-xl font-bold tracking-tight hover:opacity-90 flex items-center gap-2">
          <span class="bg-white text-[#003087] px-2 py-0.5 rounded text-sm font-mono font-black">CF</span>
          <span>Calcolare Codice Fiscale</span>
        </a>
        <ul class="hidden sm:flex gap-5 text-sm font-medium">
          <li><a href="/inverso" class="hover:underline opacity-90 hover:opacity-100">Inverso</a></li>
          <li><a href="/verifica" class="hover:underline opacity-90 hover:opacity-100">Verifica</a></li>
          <li><a href="/come-si-calcola" class="hover:underline opacity-90 hover:opacity-100">Come si calcola</a></li>
        </ul>
      </nav>
    </header>

    <!-- Main -->
    <main class="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 py-6 text-center text-sm text-gray-500 mt-auto">
      <p class="mb-1">
        Strumento gratuito per il calcolo del codice fiscale italiano —
        D.M. 12/03/1974
      </p>
      <p class="flex justify-center gap-3 text-xs">
        <a href="/" class="hover:underline">Calcola CF</a>
        <span>·</span>
        <a href="/inverso" class="hover:underline">Inverso</a>
        <span>·</span>
        <a href="/verifica" class="hover:underline">Verifica</a>
        <span>·</span>
        <a href="/come-si-calcola" class="hover:underline">Come si calcola</a>
      </p>
    </footer>

    <!-- Cookie Banner (React island) -->
    <CookieBanner client:load />

  </body>
</html>

<style is:global>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
</style>
```

**Step 3: Commit**

```bash
git add src/layouts/Layout.astro public/favicon.svg
git commit -m "feat: add base Layout with SEO meta, navbar, footer and cookie banner"
```

---

### Task 8: CalcolaForm.tsx

**Files:**
- Create: `src/components/CalcolaForm.tsx`

**Step 1: Creare il form principale**

Creare `src/components/CalcolaForm.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react';
import { calcolaCodiceFiscale, type InputCF } from '../lib/codiceFiscale';

interface Comune {
  nome: string;
  provincia: string;
  codiceCatastale: string;
}

interface Errors {
  nome?: string;
  cognome?: string;
  data?: string;
  comune?: string;
}

export default function CalcolaForm() {
  const [comuni, setComuni] = useState<Comune[]>([]);
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [sesso, setSesso] = useState<'M' | 'F'>('M');
  const [dataStr, setDataStr] = useState('');
  const [comuneQuery, setComuneQuery] = useState('');
  const [selectedComune, setSelectedComune] = useState<Comune | null>(null);
  const [natoEstero, setNatoEstero] = useState(false);
  const [suggestions, setSuggestions] = useState<Comune[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [risultato, setRisultato] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/comuni.json')
      .then(r => r.json())
      .then((data: Comune[]) => setComuni(data));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function onComuneInput(query: string) {
    setComuneQuery(query);
    setSelectedComune(null);
    if (query.length < 2) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    const filtered = comuni
      .filter(c => c.nome.toLowerCase().startsWith(q))
      .slice(0, 8);
    setSuggestions(filtered);
  }

  function selectComune(c: Comune) {
    setComuneQuery(c.nome);
    setSelectedComune(c);
    setSuggestions([]);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!nome.trim()) e.nome = 'Il nome è obbligatorio';
    if (!cognome.trim()) e.cognome = 'Il cognome è obbligatorio';
    if (!dataStr) e.data = 'La data di nascita è obbligatoria';
    if (!selectedComune) e.comune = natoEstero
      ? 'Seleziona uno stato estero dalla lista'
      : 'Seleziona un comune dalla lista';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const [anno, mese, giorno] = dataStr.split('-').map(Number);
    const input: InputCF = {
      cognome, nome, sesso, giorno, mese, anno,
      codiceCatastale: selectedComune!.codiceCatastale,
    };
    setRisultato(calcolaCodiceFiscale(input));
    setCopied(false);
  }

  async function copy() {
    if (!risultato) return;
    await navigator.clipboard.writeText(risultato);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fieldClass = (field: keyof Errors) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Nome *
          </label>
          <input type="text" value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="es. Mario"
            className={fieldClass('nome')} />
          {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
        </div>

        {/* Cognome */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Cognome *
          </label>
          <input type="text" value={cognome}
            onChange={e => setCognome(e.target.value)}
            placeholder="es. Rossi"
            className={fieldClass('cognome')} />
          {errors.cognome && <p className="text-red-500 text-xs mt-1">{errors.cognome}</p>}
        </div>

        {/* Sesso */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Sesso *
          </label>
          <select value={sesso} onChange={e => setSesso(e.target.value as 'M' | 'F')}
            className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]">
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
          </select>
        </div>

        {/* Data di nascita */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Data di nascita *
          </label>
          <input type="date" value={dataStr}
            min="1900-01-01"
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setDataStr(e.target.value)}
            className={fieldClass('data')} />
          {errors.data && <p className="text-red-500 text-xs mt-1">{errors.data}</p>}
        </div>
      </div>

      {/* Toggle nato all'estero */}
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input type="checkbox" checked={natoEstero}
          onChange={e => {
            setNatoEstero(e.target.checked);
            setComuneQuery('');
            setSelectedComune(null);
          }}
          className="rounded border-gray-300" />
        Nato/a all'estero
      </label>

      {/* Comune / Stato estero */}
      <div ref={dropdownRef} className="relative">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          {natoEstero ? 'Stato estero *' : 'Comune di nascita *'}
        </label>
        <input
          type="text"
          value={comuneQuery}
          onChange={e => onComuneInput(e.target.value)}
          placeholder={natoEstero ? 'es. Francia' : 'es. Roma'}
          autoComplete="off"
          className={fieldClass('comune')} />
        {selectedComune && (
          <p className="text-xs text-gray-400 mt-1">
            Prov: <strong>{selectedComune.provincia}</strong>
            {' '}— Cod. catastale: <code>{selectedComune.codiceCatastale}</code>
          </p>
        )}
        {errors.comune && <p className="text-red-500 text-xs mt-1">{errors.comune}</p>}
        {suggestions.length > 0 && (
          <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map(c => (
              <li key={c.codiceCatastale}
                onMouseDown={() => selectComune(c)}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex justify-between gap-2">
                <span>{c.nome}</span>
                <span className="text-gray-400 text-xs shrink-0">{c.provincia}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <button type="submit"
        className="w-full bg-[#1a7a4a] hover:bg-[#15633c] text-white font-semibold py-3 rounded-lg transition-colors text-base mt-2">
        Calcola il Codice Fiscale
      </button>

      {/* Risultato */}
      {risultato && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Il tuo codice fiscale è:</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-3xl font-mono font-bold text-[#003087] tracking-widest">
              {risultato}
            </span>
            <button type="button" onClick={copy}
              className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors font-medium">
              {copied ? '✓ Copiato!' : 'Copia'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Calcolato secondo il D.M. 12/03/1974. In rari casi di omocodia il codice
            assegnato dall'Agenzia delle Entrate potrebbe differire.
          </p>
        </div>
      )}
    </form>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/CalcolaForm.tsx
git commit -m "feat: add CalcolaForm React island with autocomplete and clipboard copy"
```

---

### Task 9: Homepage index.astro

**Files:**
- Create: `src/pages/index.astro`

**Step 1: Creare la homepage**

Creare `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import CalcolaForm from '../components/CalcolaForm';

const schemaWebApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Calcola Codice Fiscale Online",
  "url": "https://calcolare-codice-fiscale.it",
  "description": "Calcola il codice fiscale italiano online gratis. Strumento aggiornato.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
  "inLanguage": "it",
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Come si calcola il codice fiscale?",
      "acceptedAnswer": { "@type": "Answer", "text": "Il codice fiscale si calcola partendo da 3 lettere del cognome, 3 del nome, 2 cifre dell'anno, 1 lettera del mese, 2 cifre del giorno (+ 40 per le donne), il codice catastale del comune e un carattere di controllo finale." }
    },
    {
      "@type": "Question",
      "name": "Il codice fiscale calcolato online è valido?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sì, nella quasi totalità dei casi. In rari casi di omocodia (due persone con lo stesso CF teorico) l'Agenzia delle Entrate assegna un codice modificato che non può essere calcolato con formule standard." }
    },
    {
      "@type": "Question",
      "name": "Cosa succede se sono nato all'estero?",
      "acceptedAnswer": { "@type": "Answer", "text": "I nati all'estero usano un codice catastale speciale che inizia con Z (es. Z110 per la Francia). Seleziona 'Nato all'estero' nel form e scegli il paese." }
    },
    {
      "@type": "Question",
      "name": "Il codice fiscale rivela il sesso?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sì. Il giorno di nascita per le donne viene aumentato di 40. Quindi un uomo nato il 5 ha '05' nel CF, mentre una donna nata il 5 ha '45'." }
    },
    {
      "@type": "Question",
      "name": "Posso decodificare un codice fiscale esistente?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sì, usa la pagina Codice Fiscale Inverso per estrarre data di nascita, sesso e comune da un CF esistente." }
    },
  ],
};
---

<Layout
  title="Calcola Codice Fiscale Online — Gratis e Immediato"
  description="Calcola il tuo codice fiscale online in pochi secondi. Inserisci nome, cognome, data e luogo di nascita. Strumento gratuito e aggiornato 2026."
  schemaJson={[schemaWebApp, schemaFAQ]}
>
  <h1 class="text-3xl font-bold text-[#003087] mb-1">Calcola il Codice Fiscale Online</h1>
  <p class="text-gray-500 mb-6 text-sm">
    Gratis, immediato, aggiornato 2026 — calcolo secondo il D.M. 12/03/1974
  </p>

  <CalcolaForm client:load />

  <!-- Slot AdSense (caricato solo dopo consenso cookie) -->
  <div class="my-8 min-h-[90px] flex items-center justify-center">
    <ins class="adsbygoogle"
      style="display:block;width:100%"
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot="XXXXXXXXXX"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  </div>

  <!-- Testo SEO -->
  <section class="mt-2">
    <h2 class="text-xl font-bold text-gray-800 mb-3">Cos'è il Codice Fiscale?</h2>
    <div class="text-gray-700 text-sm leading-relaxed space-y-3">
      <p>
        Il <strong>codice fiscale</strong> è un codice alfanumerico di 16 caratteri utilizzato
        in Italia per identificare univocamente i cittadini a fini fiscali e amministrativi.
        Introdotto nel 1973 con il D.P.R. 605, è richiesto per qualsiasi rapporto con la
        Pubblica Amministrazione, banche, datori di lavoro e il Servizio Sanitario Nazionale.
      </p>
      <p>
        La sua struttura segue le regole del <strong>D.M. 12/03/1974</strong>: le prime tre
        lettere derivano dal cognome, le successive tre dal nome, poi troviamo anno e mese di
        nascita, il giorno (aumentato di 40 per le donne), il codice catastale del comune e
        infine un carattere di controllo per verificare la correttezza del codice.
      </p>
    </div>
  </section>

  <!-- Link alle altre pagine -->
  <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
    {[
      { href: '/inverso', title: 'Codice Fiscale Inverso', desc: 'Estrai i dati da un CF esistente' },
      { href: '/verifica', title: 'Verifica Codice Fiscale', desc: 'Controlla se un CF è valido' },
      { href: '/come-si-calcola', title: 'Come si calcola', desc: 'Guida completa all\'algoritmo' },
    ].map(({ href, title, desc }) => (
      <a href={href}
        class="block p-4 border border-gray-200 rounded-lg hover:border-[#003087] hover:bg-blue-50 transition-colors group">
        <div class="font-semibold text-sm text-[#003087] group-hover:underline">{title}</div>
        <div class="text-xs text-gray-500 mt-1">{desc}</div>
      </a>
    ))}
  </div>

  <!-- FAQ -->
  <section class="mt-8">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Domande Frequenti</h2>
    <div class="space-y-2">
      {[
        { q: "Come si calcola il codice fiscale?", a: "Si calcola partendo da 3 lettere del cognome, 3 del nome, 2 cifre dell'anno, 1 lettera del mese, 2 cifre del giorno (+40 per donne), codice catastale del comune e carattere di controllo." },
        { q: "Il codice calcolato è valido per usi ufficiali?", a: "È valido nella quasi totalità dei casi. In rari casi di omocodia l'Agenzia delle Entrate assegna un codice modificato." },
        { q: "Cosa succede se sono nato all'estero?", a: "Usa l'opzione 'Nato all'estero' e seleziona il paese. I nati all'estero hanno codici catastali speciali che iniziano con Z." },
        { q: "Il codice fiscale dipende dal sesso?", a: "Sì. Il giorno di nascita per le donne viene aumentato di 40, rendendo il sesso immediatamente riconoscibile." },
        { q: "Posso decodificare un CF esistente?", a: "Sì! Usa la nostra pagina Codice Fiscale Inverso per estrarre data, sesso e comune da un CF." },
      ].map(({ q, a }) => (
        <details class="border border-gray-200 rounded-lg group">
          <summary class="px-4 py-3 cursor-pointer font-medium text-sm text-gray-800 hover:bg-gray-50 list-none flex justify-between items-center">
            {q}
            <span class="text-gray-400 text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p class="px-4 pb-3 text-sm text-gray-600">{a}</p>
        </details>
      ))}
    </div>
  </section>
</Layout>
```

**Step 2: Avviare il dev server e verificare visivamente**

```bash
npm run dev
```

Aprire `http://localhost:4321` e verificare:
- Form renderizzato correttamente
- Autocomplete funzionante su Comune
- Calcolo CF funzionante (es. Mario Rossi, M, 1/1/1980, Roma → `RSSMRA80A01H501U`)
- Sezioni SEO e FAQ visibili sotto il form

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add homepage with CalcolaForm, SEO content, FAQ schema markup"
```

---

### Task 10: InversoForm.tsx + inverso.astro

**Files:**
- Create: `src/components/InversoForm.tsx`
- Create: `src/pages/inverso.astro`

**Step 1: Creare InversoForm.tsx**

Creare `src/components/InversoForm.tsx`:

```tsx
import { useState } from 'react';
import { decodificaCodiceFiscale } from '../lib/inverso';
import { verificaCodiceFiscale } from '../lib/verifica';

const MESI = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

export default function InversoForm() {
  const [cf, setCf] = useState('');
  const [error, setError] = useState('');
  const [dati, setDati] = useState<ReturnType<typeof decodificaCodiceFiscale>>(null);
  const [nomeComune, setNomeComune] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDati(null);
    setNomeComune('');

    if (!verificaCodiceFiscale(cf)) {
      setError('Codice fiscale non valido. Verifica che sia composto da 16 caratteri corretti.');
      return;
    }

    const result = decodificaCodiceFiscale(cf);
    if (!result) { setError('Impossibile decodificare il codice fiscale.'); return; }
    setDati(result);

    // Lookup asincrono del comune
    const res = await fetch('/data/comuni.json');
    const comuni: Array<{ nome: string; provincia: string; codiceCatastale: string }> = await res.json();
    const trovato = comuni.find(c => c.codiceCatastale === result.codiceCatastale);
    setNomeComune(trovato ? `${trovato.nome} (${trovato.provincia})` : `Codice: ${result.codiceCatastale}`);
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          Codice Fiscale
        </label>
        <input
          type="text"
          value={cf}
          onChange={e => { setCf(e.target.value.toUpperCase()); setError(''); }}
          maxLength={16}
          placeholder="es. RSSMRA80A01H501U"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-lg uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#003087]"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{cf.length}/16</p>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <button type="submit"
        className="w-full bg-[#1a7a4a] hover:bg-[#15633c] text-white font-semibold py-3 rounded-lg transition-colors">
        Decodifica Codice Fiscale
      </button>

      {dati && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Dati estratti dal codice fiscale
          </h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">Sesso:</dt>
            <dd className="font-medium">{dati.sesso === 'M' ? 'Maschile' : 'Femminile'}</dd>
            <dt className="text-gray-500">Data di nascita:</dt>
            <dd className="font-medium">{dati.giorno} {MESI[dati.mese]} {dati.annoCompleto}</dd>
            <dt className="text-gray-500">Luogo di nascita:</dt>
            <dd className="font-medium">{nomeComune || '...'}</dd>
          </dl>
          <p className="text-xs text-gray-400 mt-3">
            * L'anno potrebbe essere {dati.annoCompleto} o {dati.annoCompleto - 100} in caso di omonimia.
            Non è possibile risalire al nome o cognome esatti.
          </p>
        </div>
      )}
    </form>
  );
}
```

**Step 2: Creare inverso.astro**

Creare `src/pages/inverso.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import InversoForm from '../components/InversoForm';
---

<Layout
  title="Decodifica Codice Fiscale — Leggi i Dati dal CF"
  description="Inserisci un codice fiscale e scopri data di nascita, sesso e comune. Decodifica inversa gratuita e immediata."
>
  <nav class="text-xs text-gray-400 mb-4">
    <a href="/" class="hover:underline">Home</a>
    <span class="mx-1">›</span>
    <span>Codice Fiscale Inverso</span>
  </nav>

  <h1 class="text-3xl font-bold text-[#003087] mb-1">Decodifica Codice Fiscale</h1>
  <p class="text-gray-500 mb-6 text-sm">
    Inserisci un codice fiscale per estrarne data di nascita, sesso e comune.
  </p>

  <InversoForm client:load />

  <section class="mt-8 text-sm text-gray-700 space-y-3">
    <h2 class="text-xl font-bold text-gray-800">Come funziona la decodifica?</h2>
    <p>
      Il <strong>codice fiscale inverso</strong> analizza i 16 caratteri del CF per
      estrarne le informazioni anagrafiche codificate: <strong>sesso</strong>,
      <strong>data di nascita</strong> completa e <strong>comune o stato estero di nascita</strong>.
    </p>
    <p>
      Non è possibile risalire al nome o al cognome esatti: la codifica di questi dati
      non è univocamente reversibile, poiché persone diverse possono condividere le stesse
      tre lettere iniziali.
    </p>
  </section>
</Layout>
```

**Step 3: Commit**

```bash
git add src/components/InversoForm.tsx src/pages/inverso.astro
git commit -m "feat: add codice fiscale inverso page with decodifica component"
```

---

### Task 11: VerificaForm.tsx + verifica.astro

**Files:**
- Create: `src/components/VerificaForm.tsx`
- Create: `src/pages/verifica.astro`

**Step 1: Creare VerificaForm.tsx**

Creare `src/components/VerificaForm.tsx`:

```tsx
import { useState } from 'react';
import { verificaCodiceFiscale } from '../lib/verifica';

export default function VerificaForm() {
  const [cf, setCf] = useState('');
  const [result, setResult] = useState<boolean | null>(null);

  function handleChange(value: string) {
    const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCf(upper);
    if (upper.length === 16) {
      setResult(verificaCodiceFiscale(upper));
    } else {
      setResult(null);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          Codice Fiscale da verificare
        </label>
        <input
          type="text"
          value={cf}
          onChange={e => handleChange(e.target.value)}
          maxLength={16}
          placeholder="es. RSSMRA80A01H501U"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono text-xl uppercase text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#003087]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>La verifica è automatica al completamento dei 16 caratteri</span>
          <span>{cf.length}/16</span>
        </div>
      </div>

      {result === true && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 font-bold text-lg">✓ Codice Fiscale Valido</p>
          <p className="text-green-600 text-sm mt-1">
            Il carattere di controllo è corretto secondo il D.M. 12/03/1974.
          </p>
        </div>
      )}

      {result === false && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-700 font-bold text-lg">✗ Codice Fiscale Non Valido</p>
          <p className="text-red-600 text-sm mt-1">
            Il carattere di controllo non corrisponde. Verifica di aver inserito il CF correttamente.
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Creare verifica.astro**

Creare `src/pages/verifica.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import VerificaForm from '../components/VerificaForm';
---

<Layout
  title="Verifica Codice Fiscale — Controlla se è Valido"
  description="Verifica se un codice fiscale italiano è valido. Controllo del carattere di controllo in tempo reale, gratuito e immediato."
>
  <nav class="text-xs text-gray-400 mb-4">
    <a href="/" class="hover:underline">Home</a>
    <span class="mx-1">›</span>
    <span>Verifica Codice Fiscale</span>
  </nav>

  <h1 class="text-3xl font-bold text-[#003087] mb-1">Verifica Codice Fiscale</h1>
  <p class="text-gray-500 mb-6 text-sm">
    Inserisci un codice fiscale per verificarne la validità in tempo reale.
  </p>

  <VerificaForm client:load />

  <section class="mt-8 text-sm text-gray-700 space-y-3">
    <h2 class="text-xl font-bold text-gray-800">Come funziona la verifica?</h2>
    <p>
      La verifica controlla la correttezza del <strong>carattere di controllo</strong>
      (il 16° carattere del CF), calcolato con un algoritmo definito dal D.M. 12/03/1974.
    </p>
    <p>
      Un CF formalmente valido non garantisce che sia effettivamente assegnato a una
      persona reale dall'Agenzia delle Entrate. Per una verifica ufficiale, usa il
      servizio dell'Agenzia delle Entrate.
    </p>
  </section>
</Layout>
```

**Step 3: Commit**

```bash
git add src/components/VerificaForm.tsx src/pages/verifica.astro
git commit -m "feat: add real-time codice fiscale verification page"
```

---

### Task 12: come-si-calcola.astro

**Files:**
- Create: `src/pages/come-si-calcola.astro`

**Step 1: Creare la pagina articolo**

Creare `src/pages/come-si-calcola.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';

const schemaArticle = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Come si Calcola il Codice Fiscale — Guida Completa all'Algoritmo",
  "description": "Guida dettagliata all'algoritmo di calcolo del codice fiscale italiano, con esempi passo per passo per cognome, nome, data, comune e carattere di controllo.",
  "url": "https://calcolare-codice-fiscale.it/come-si-calcola",
  "inLanguage": "it",
  "datePublished": "2026-01-01",
  "dateModified": "2026-03-01",
  "author": { "@type": "Organization", "name": "Calcolare Codice Fiscale" },
  "publisher": { "@type": "Organization", "name": "Calcolare Codice Fiscale" },
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quante lettere si prendono dal cognome per il codice fiscale?",
      "acceptedAnswer": { "@type": "Answer", "text": "Si prendono 3 lettere: prima le consonanti nell'ordine in cui appaiono, poi le vocali. Se i caratteri sono ancora meno di 3, si aggiunge X." }
    },
    {
      "@type": "Question",
      "name": "Come viene codificato il mese nel codice fiscale?",
      "acceptedAnswer": { "@type": "Answer", "text": "Ogni mese corrisponde a una lettera: Gennaio=A, Febbraio=B, Marzo=C, Aprile=D, Maggio=E, Giugno=H, Luglio=L, Agosto=M, Settembre=P, Ottobre=R, Novembre=S, Dicembre=T." }
    },
    {
      "@type": "Question",
      "name": "Perché il giorno di nascita delle donne è diverso nel CF?",
      "acceptedAnswer": { "@type": "Answer", "text": "Per le donne il giorno di nascita viene aumentato di 40. Questo permette di distinguere il sesso direttamente dalla lettura del codice fiscale." }
    },
    {
      "@type": "Question",
      "name": "Come si calcola il carattere di controllo del codice fiscale?",
      "acceptedAnswer": { "@type": "Answer", "text": "Si sommano i valori dei 15 caratteri usando due tabelle: una per le posizioni dispari e una per le posizioni pari. La somma modulo 26 dà la lettera finale (A=0, B=1, ..., Z=25)." }
    },
  ],
};
---

<Layout
  title="Come si Calcola il Codice Fiscale — Guida Completa 2026"
  description="Guida completa all'algoritmo del codice fiscale italiano: cognome, nome, data di nascita, comune di nascita e carattere di controllo. Con esempi pratici."
  schemaJson={[schemaArticle, schemaFAQ]}
>
  <nav class="text-xs text-gray-400 mb-4">
    <a href="/" class="hover:underline">Home</a>
    <span class="mx-1">›</span>
    <span>Come si calcola il codice fiscale</span>
  </nav>

  <article>
    <h1 class="text-3xl font-bold text-[#003087] mb-4">
      Come si Calcola il Codice Fiscale
    </h1>

    <!-- Esempio visivo struttura CF -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-center">
      <div class="font-mono text-2xl font-bold tracking-widest mb-3">
        <span class="text-red-600">RSS</span><span class="text-blue-600">MRA</span><span
          class="text-green-600">80A01</span><span class="text-purple-600">H501</span><span
          class="text-orange-500">U</span>
      </div>
      <div class="flex justify-center flex-wrap gap-4 text-xs font-semibold">
        <span class="text-red-600">Cognome (3)</span>
        <span class="text-blue-600">Nome (3)</span>
        <span class="text-green-600">Data (5)</span>
        <span class="text-purple-600">Comune (4)</span>
        <span class="text-orange-500">Check (1)</span>
      </div>
      <p class="text-xs text-gray-500 mt-2">Esempio: Mario Rossi, M, 1 Gennaio 1980, Roma</p>
    </div>

    <div class="space-y-8 text-sm text-gray-700 leading-relaxed">

      <!-- Cognome -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-2">1. Codifica del Cognome</h2>
        <p>Si estraggono prima le <strong>consonanti</strong> del cognome nell'ordine in cui appaiono,
        poi le <strong>vocali</strong>, fino ad avere 3 caratteri. Se ancora mancano, si aggiunge <code class="bg-gray-100 px-1 rounded">X</code>.</p>
        <div class="mt-3 overflow-x-auto">
          <table class="text-xs border-collapse w-full">
            <thead><tr class="bg-gray-100">
              <th class="border border-gray-200 px-3 py-1.5 text-left">Cognome</th>
              <th class="border border-gray-200 px-3 py-1.5">Consonanti</th>
              <th class="border border-gray-200 px-3 py-1.5">Vocali</th>
              <th class="border border-gray-200 px-3 py-1.5 font-bold">Risultato</th>
            </tr></thead>
            <tbody>
              {[
                ['Rossi', 'R, S, S', 'O, I', 'RSS'],
                ['Bianchi', 'B, N, C, H', 'I, A, I', 'BNC'],
                ['Fo', 'F', 'O', 'FOX'],
                ['Ali', 'L', 'A, I', 'LAI'],
              ].map(([cog, cons, voc, ris]) => (
                <tr>
                  <td class="border border-gray-200 px-3 py-1.5 font-medium">{cog}</td>
                  <td class="border border-gray-200 px-3 py-1.5 text-center">{cons}</td>
                  <td class="border border-gray-200 px-3 py-1.5 text-center">{voc}</td>
                  <td class="border border-gray-200 px-3 py-1.5 text-center font-mono font-bold text-red-600">{ris}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Nome -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-2">2. Codifica del Nome</h2>
        <p>Se il nome ha <strong>4 o più consonanti</strong>, si prendono la <strong>1ª, la 3ª e la 4ª</strong>.
        Altrimenti si procede come per il cognome (consonanti + vocali + X).</p>
        <div class="mt-3 overflow-x-auto">
          <table class="text-xs border-collapse w-full">
            <thead><tr class="bg-gray-100">
              <th class="border border-gray-200 px-3 py-1.5 text-left">Nome</th>
              <th class="border border-gray-200 px-3 py-1.5">Consonanti</th>
              <th class="border border-gray-200 px-3 py-1.5">Regola</th>
              <th class="border border-gray-200 px-3 py-1.5 font-bold">Risultato</th>
            </tr></thead>
            <tbody>
              {[
                ['Mario', 'M, R', '< 4 consonanti → cons+voc', 'MRA'],
                ['Roberto', 'R, B, R, T', '≥ 4 → 1ª, 3ª, 4ª = R,R,T', 'RRT'],
                ['Anna', 'N, N', '< 4 → NN + vocale A', 'NNA'],
                ['Luca', 'L, C', '< 4 → LC + vocale U', 'LCU'],
              ].map(([n, c, r, res]) => (
                <tr>
                  <td class="border border-gray-200 px-3 py-1.5 font-medium">{n}</td>
                  <td class="border border-gray-200 px-3 py-1.5 text-center">{c}</td>
                  <td class="border border-gray-200 px-3 py-1.5 text-center">{r}</td>
                  <td class="border border-gray-200 px-3 py-1.5 text-center font-mono font-bold text-blue-600">{res}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Anno -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-2">3. Anno di Nascita</h2>
        <p>Si usano le <strong>ultime due cifre</strong> dell'anno. 1980 → <code class="bg-gray-100 px-1 rounded font-mono">80</code>,
        2005 → <code class="bg-gray-100 px-1 rounded font-mono">05</code>.</p>
      </section>

      <!-- Mese -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-2">4. Mese di Nascita</h2>
        <p>Ogni mese ha una lettera corrispondente:</p>
        <div class="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
          {[
            ['Gen','A'],['Feb','B'],['Mar','C'],['Apr','D'],
            ['Mag','E'],['Giu','H'],['Lug','L'],['Ago','M'],
            ['Set','P'],['Ott','R'],['Nov','S'],['Dic','T'],
          ].map(([mese, lettera]) => (
            <div class="border border-gray-200 rounded p-2 text-center text-xs">
              <div class="text-gray-500">{mese}</div>
              <div class="font-mono font-bold text-green-700 text-base">{lettera}</div>
            </div>
          ))}
        </div>
      </section>

      <!-- Giorno -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-2">5. Giorno di Nascita</h2>
        <p>Per i <strong>maschi</strong>: giorno invariato, con zero iniziale se necessario (es. 5 → <code class="bg-gray-100 px-1 rounded font-mono">05</code>).</p>
        <p class="mt-1">Per le <strong>femmine</strong>: giorno + 40 (es. 15 → <code class="bg-gray-100 px-1 rounded font-mono">55</code>). Questo rende il sesso immediatamente riconoscibile.</p>
      </section>

      <!-- Comune -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-2">6. Codice Catastale del Comune</h2>
        <p>Ogni comune italiano ha un <strong>codice catastale</strong> univoco: una lettera seguita da 3 cifre.
        Per chi è nato all'estero si usano codici che iniziano con <code class="bg-gray-100 px-1 rounded font-mono">Z</code>.</p>
        <ul class="mt-2 space-y-1 text-xs">
          <li>Roma → <code class="bg-gray-100 px-1 rounded font-mono">H501</code></li>
          <li>Milano → <code class="bg-gray-100 px-1 rounded font-mono">F205</code></li>
          <li>Napoli → <code class="bg-gray-100 px-1 rounded font-mono">F839</code></li>
          <li>Francia → <code class="bg-gray-100 px-1 rounded font-mono">Z110</code></li>
        </ul>
      </section>

      <!-- Check digit -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-2">7. Carattere di Controllo</h2>
        <p>I 15 caratteri precedenti vengono sommati usando due tabelle di conversione:
        una per le <strong>posizioni dispari</strong> (1ª, 3ª, 5ª, ...) e una per le
        <strong>posizioni pari</strong> (2ª, 4ª, ...). La somma modulo 26 dà la lettera finale.</p>
        <p class="mt-2">Questo carattere permette di rilevare errori di trascrizione del codice fiscale.</p>
      </section>

    </div>

    <!-- CTA -->
    <div class="mt-10 p-5 bg-green-50 border border-green-200 rounded-xl text-center">
      <p class="font-semibold text-green-800 mb-2">Pronto a calcolare il tuo codice fiscale?</p>
      <a href="/"
        class="inline-block bg-[#1a7a4a] hover:bg-[#15633c] text-white px-6 py-2.5 rounded-lg transition-colors font-medium text-sm">
        Vai al Calcolatore →
      </a>
    </div>

    <!-- FAQ -->
    <section class="mt-10">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Domande Frequenti</h2>
      <div class="space-y-2">
        {[
          { q: "Quante lettere si prendono dal cognome?", a: "3 lettere: prima le consonanti nell'ordine, poi le vocali, poi X se serve." },
          { q: "Come viene codificato il mese?", a: "Con una lettera: A=Gen, B=Feb, C=Mar, D=Apr, E=Mag, H=Giu, L=Lug, M=Ago, P=Set, R=Ott, S=Nov, T=Dic." },
          { q: "Perché il giorno delle donne è diverso?", a: "Per le femmine si aggiunge 40 al giorno reale, rendendo il sesso leggibile direttamente dal CF." },
          { q: "Come si calcola il carattere di controllo?", a: "Somma di valori dei 15 caratteri con tabelle diverse per posizioni pari/dispari, modulo 26." },
        ].map(({ q, a }) => (
          <details class="border border-gray-200 rounded-lg">
            <summary class="px-4 py-3 cursor-pointer font-medium text-sm text-gray-800 hover:bg-gray-50 list-none">
              {q}
            </summary>
            <p class="px-4 pb-3 text-sm text-gray-600">{a}</p>
          </details>
        ))}
      </div>
    </section>
  </article>
</Layout>
```

**Step 2: Commit**

```bash
git add src/pages/come-si-calcola.astro
git commit -m "feat: add SEO article on CF algorithm with Article + FAQPage schema"
```

---

### Task 13: 404.astro + robots.txt

**Files:**
- Create: `src/pages/404.astro`
- Create: `public/robots.txt`

**Step 1: Creare 404.astro**

Creare `src/pages/404.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout
  title="Pagina non trovata — Calcolare Codice Fiscale"
  description="La pagina richiesta non esiste."
>
  <div class="text-center py-20">
    <p class="text-7xl font-black text-[#003087] mb-4">404</p>
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Pagina non trovata</h1>
    <p class="text-gray-500 mb-8">La pagina che cerchi non esiste o è stata spostata.</p>
    <a href="/"
      class="bg-[#1a7a4a] text-white px-6 py-3 rounded-lg hover:bg-[#15633c] transition-colors font-medium">
      Torna alla Home
    </a>
  </div>
</Layout>
```

**Step 2: Creare robots.txt**

Creare `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://calcolare-codice-fiscale.it/sitemap-index.xml
```

**Step 3: Commit**

```bash
git add src/pages/404.astro public/robots.txt
git commit -m "feat: add 404 page and robots.txt"
```

---

### Task 14: Build finale e configurazione Vercel

**Files:**
- Create: `vercel.json`

**Step 1: Creare vercel.json**

Creare `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

**Step 2: Eseguire tutti i test**

```bash
npm test
```
Atteso: tutti i test PASS, nessun errore.

**Step 3: Eseguire la build di produzione**

```bash
npm run build
```
Atteso: directory `dist/` creata senza errori. Verificare:
```bash
ls dist/
# Atteso: index.html, inverso/index.html, verifica/index.html, come-si-calcola/index.html
# sitemap-index.xml, sitemap-0.xml, robots.txt, favicon.svg, data/comuni.json
```

**Step 4: Verificare il sitemap**

```bash
cat dist/sitemap-0.xml
```
Atteso: lista di URL con le 4 pagine principali.

**Step 5: Commit finale**

```bash
git add vercel.json
git commit -m "feat: add Vercel config and verify production build"
```

---

## Post-Deploy Checklist

- [ ] Sostituire `ca-pub-XXXXXXXXXXXXXXXX` con il publisher ID AdSense reale in `CookieBanner.tsx`
- [ ] Sostituire `data-ad-slot="XXXXXXXXXX"` con lo slot ID reale in `index.astro`
- [ ] Pushare il repo su GitHub e collegarlo a Vercel
- [ ] Impostare il dominio custom `calcolare-codice-fiscale.it` in Vercel
- [ ] Inviare la sitemap a Google Search Console: `https://calcolare-codice-fiscale.it/sitemap-index.xml`
- [ ] Verificare lo schema markup con il [Rich Results Test](https://search.google.com/test/rich-results) di Google
- [ ] Eseguire Lighthouse su tutte le pagine (target: 90+ su tutti i punteggi)
- [ ] Testare il cookie banner su mobile

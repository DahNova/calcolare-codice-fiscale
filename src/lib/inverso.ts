/** Decodifica un codice fiscale italiano in dati anagrafici parziali. */

import { paesiEsteri } from '../data/paesiEsteri';

const MESI_INVERSO: Record<string, number> = {
  A:1, B:2, C:3, D:4, E:5, H:6,
  L:7, M:8, P:9, R:10, S:11, T:12,
};

/**
 * Tabella di sostituzione dell'omocodia (D.M. 12/03/1974): quando due persone
 * generano lo stesso CF, l'Agenzia sostituisce le cifre con lettere partendo
 * dall'ultima posizione numerica. Per decodificare si fa il percorso inverso.
 */
const OMOCODIA_INVERSA: Record<string, string> = {
  L: '0', M: '1', N: '2', P: '3', Q: '4',
  R: '5', S: '6', T: '7', U: '8', V: '9',
};

/** Posizioni (0-based) che nel CF standard contengono cifre. */
const POSIZIONI_NUMERICHE = [6, 7, 9, 10, 12, 13, 14];

/**
 * Riporta un codice omocodice alla forma standard, riconvertendo le lettere
 * sostitutive nelle cifre originali. Un CF gia' standard resta invariato.
 * Il carattere di controllo NON viene ricalcolato: serve solo per leggere.
 */
export function normalizzaOmocodia(cf: string): string {
  const s = cf.toUpperCase().trim();
  if (s.length !== 16) return s;
  const chars = s.split('');
  for (const i of POSIZIONI_NUMERICHE) {
    const c = chars[i];
    if (c >= 'A' && c <= 'Z') {
      const cifra = OMOCODIA_INVERSA[c];
      if (cifra !== undefined) chars[i] = cifra;
    }
  }
  return chars.join('');
}

export interface DatiCF {
  sesso: 'M' | 'F';
  giorno: number;
  mese: number;
  annoCompleto: number;
  codiceCatastale: string;
  /** true se il codice conteneva lettere sostitutive (omocodia). */
  omocodia: boolean;
}

export function decodificaCodiceFiscale(cf: string): DatiCF | null {
  const originale = cf.toUpperCase().trim();
  if (originale.length !== 16) return null;
  const s = normalizzaOmocodia(originale);
  const omocodia = s !== originale;

  const annoNum = parseInt(s.substring(6, 8), 10);
  const meseChar = s[8];
  const giornoParsed = parseInt(s.substring(9, 11), 10);
  const codiceCatastale = s.substring(11, 15);

  const mese = MESI_INVERSO[meseChar];
  if (!mese) return null;
  if (Number.isNaN(annoNum) || Number.isNaN(giornoParsed)) return null;

  const sesso: 'M' | 'F' = giornoParsed > 40 ? 'F' : 'M';
  const giorno = sesso === 'F' ? giornoParsed - 40 : giornoParsed;
  if (giorno < 1 || giorno > 31) return null;

  // Best-guess century: if year suffix <= current year suffix → 2000s, else 1900s
  const currentSuffix = new Date().getFullYear() % 100;
  const annoCompleto = annoNum <= currentSuffix ? 2000 + annoNum : 1900 + annoNum;

  return { sesso, giorno, mese, annoCompleto, codiceCatastale, omocodia };
}

export interface LuogoEstero {
  nome: string;
  slug: string;
  codiceCatastale: string;
  /** Percorso della scheda paese, solo se esiste una pagina dedicata. */
  href: string | null;
}

/**
 * Risolve un codice catastale estero (Z + 3 cifre) nello stato corrispondente.
 * Restituisce null per i codici dei comuni italiani o per codici Z sconosciuti.
 */
export function luogoEstero(codiceCatastale: string): LuogoEstero | null {
  const code = codiceCatastale.toUpperCase();
  if (!/^Z\d{3}$/.test(code)) return null;
  const p = paesiEsteri.find(x => x.codiceCatastale === code);
  if (!p) return null;
  return {
    nome: p.nome,
    slug: p.slug,
    codiceCatastale: p.codiceCatastale,
    href: p.hasDedicatedPage ? `/codice-fiscale-estero/${p.slug}/` : null,
  };
}

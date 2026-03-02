/** Decodifica un codice fiscale italiano in dati anagrafici parziali. */

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

  const annoNum = parseInt(s.substring(6, 8), 10);
  const meseChar = s[8];
  const giornoParsed = parseInt(s.substring(9, 11), 10);
  const codiceCatastale = s.substring(11, 15);

  const mese = MESI_INVERSO[meseChar];
  if (!mese) return null;

  const sesso: 'M' | 'F' = giornoParsed > 40 ? 'F' : 'M';
  const giorno = sesso === 'F' ? giornoParsed - 40 : giornoParsed;

  // Best-guess century: if year suffix <= current year suffix → 2000s, else 1900s
  const currentSuffix = new Date().getFullYear() % 100;
  const annoCompleto = annoNum <= currentSuffix ? 2000 + annoNum : 1900 + annoNum;

  return { sesso, giorno, mese, annoCompleto, codiceCatastale };
}

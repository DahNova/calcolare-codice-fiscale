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

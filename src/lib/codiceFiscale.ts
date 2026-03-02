const MESI: Record<number, string> = {
  1:'A', 2:'B', 3:'C', 4:'D', 5:'E', 6:'H',
  7:'L', 8:'M', 9:'P', 10:'R', 11:'S', 12:'T',
};

// Values for characters at ODD positions (1-based: positions 1,3,5,...,15)
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
      // 0-based even index = 1-based odd position → use ODD table
      sum += ODD[ch] ?? 0;
    } else {
      // 1-based even position → simple value
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

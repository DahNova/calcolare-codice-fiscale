/** Verifica la validità sintattica di un codice fiscale italiano (DM 12/03/1974). */

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
      // 0-based even index = 1-based odd position → ODD table
      sum += ODD[ch] ?? 0;
    } else {
      // 1-based even position → simple value
      sum += /[0-9]/.test(ch) ? parseInt(ch, 10) : ch.charCodeAt(0) - 65;
    }
  }
  return s[15] === String.fromCharCode(65 + (sum % 26));
}

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

  it('integra con X quando cognome ha pochi caratteri', () => {
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
      giorno: 1, mese: 1, anno: 1980, codiceCatastale: 'h501', // minuscolo input
    });
    expect(cf.substring(11, 15)).toBe('H501');
  });
});

import { describe, it, expect } from 'vitest';
import { decodificaCodiceFiscale } from '../inverso';

describe('decodificaCodiceFiscale', () => {
  it('decodifica sesso maschile', () => {
    expect(decodificaCodiceFiscale('RSSMRA80A01H501U')?.sesso).toBe('M');
  });

  it('decodifica sesso femminile quando giorno > 40', () => {
    // day "55" in CF → 55 > 40 → F, real day = 55 - 40 = 15
    // BNCNNA95H55F205X (check digit may not be valid — inverso.ts doesn't validate)
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
    // "80" → 1980 (80 > currentYearSuffix which is 26)
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

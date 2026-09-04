import { describe, it, expect } from 'vitest';
import { decodificaCodiceFiscale, luogoEstero, normalizzaOmocodia } from '../inverso';

describe('normalizzaOmocodia', () => {
  it('lascia invariato un CF standard', () => {
    expect(normalizzaOmocodia('RSSMRA80A01H501U')).toBe('RSSMRA80A01H501U');
  });

  it('riconverte la lettera sostitutiva nell\'ultima cifra del codice catastale', () => {
    // H501 → H50M (1 → M)
    expect(normalizzaOmocodia('RSSMRA80A01H50MX')).toBe('RSSMRA80A01H501X');
  });

  it('riconverte anno e giorno omocodici', () => {
    // 80 → UL, 01 → LM
    expect(normalizzaOmocodia('RSSMRAULALMH501X')).toBe('RSSMRA80A01H501X');
  });

  it('non tocca la lettera del mese ne\' la lettera iniziale del codice catastale', () => {
    // posizione 8 (mese) = L (luglio) e posizione 11 = H restano lettere
    expect(normalizzaOmocodia('RSSMRA80L01H501X')).toBe('RSSMRA80L01H501X');
  });
});

describe('decodificaCodiceFiscale con omocodia', () => {
  it('decodifica un omocodice come il CF standard e lo segnala', () => {
    const std = decodificaCodiceFiscale('RSSMRA80A01H501U');
    const omo = decodificaCodiceFiscale('RSSMRAULALMH50MX');
    expect(omo).not.toBeNull();
    expect(omo?.annoCompleto).toBe(std?.annoCompleto);
    expect(omo?.giorno).toBe(std?.giorno);
    expect(omo?.mese).toBe(std?.mese);
    expect(omo?.codiceCatastale).toBe('H501');
    expect(omo?.omocodia).toBe(true);
    expect(std?.omocodia).toBe(false);
  });

  it('restituisce null invece di NaN se anno o giorno non sono decodificabili', () => {
    // 'AB' non e' una coppia omocodica valida
    expect(decodificaCodiceFiscale('RSSMRAABA01H501U')).toBeNull();
  });

  it('restituisce null per giorno fuori intervallo', () => {
    expect(decodificaCodiceFiscale('RSSMRA80A35H501U')).toBeNull();
  });
});

describe('luogoEstero', () => {
  it('risolve un codice Z nello stato e nella scheda paese', () => {
    const r = luogoEstero('Z129');
    expect(r?.nome).toBe('Romania');
    expect(r?.slug).toBe('romania');
    expect(r?.href).toBe('/codice-fiscale-estero/romania/');
  });

  it('restituisce href null per uno stato senza pagina dedicata', () => {
    const r = luogoEstero('Z101'); // Andorra
    expect(r?.nome).toBe('Andorra');
    expect(r?.href).toBeNull();
  });

  it('restituisce null per un codice di comune italiano', () => {
    expect(luogoEstero('H501')).toBeNull();
  });

  it('restituisce null per un codice Z sconosciuto', () => {
    expect(luogoEstero('Z999')).toBeNull();
  });

  it('accetta il codice in minuscolo', () => {
    expect(luogoEstero('z129')?.nome).toBe('Romania');
  });
});

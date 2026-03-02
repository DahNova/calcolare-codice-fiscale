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

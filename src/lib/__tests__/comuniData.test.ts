import { describe, it, expect } from 'vitest';
import { findComune } from '../comuniData';

describe('findComune', () => {
  it('trova Roma con codice H501', () => {
    expect(findComune('Roma', 'RM')?.codiceCatastale).toBe('H501');
  });
  it('trova Milano con codice F205', () => {
    expect(findComune('Milano', 'MI')?.codiceCatastale).toBe('F205');
  });
  it('è case-insensitive sul nome', () => {
    expect(findComune('roma', 'RM')?.codiceCatastale).toBe('H501');
  });
  it('ritorna undefined per nome inesistente', () => {
    expect(findComune('Comunistaninesistente', 'XX')).toBeUndefined();
  });
});

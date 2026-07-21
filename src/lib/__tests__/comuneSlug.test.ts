import { describe, it, expect } from 'vitest';
import { comuneSlug } from '../comuneSlug';

describe('comuneSlug', () => {
  it('minuscola semplice', () => {
    expect(comuneSlug('Roma')).toBe('roma');
  });
  it('spazi in trattini', () => {
    expect(comuneSlug('Reggio di Calabria')).toBe('reggio-di-calabria');
  });
  it('rimuove accenti', () => {
    expect(comuneSlug('Forlì')).toBe('forli');
  });
  it("gestisce apostrofi", () => {
    expect(comuneSlug("Reggio nell'Emilia")).toBe('reggio-nell-emilia');
  });
  it('collassa separatori multipli', () => {
    expect(comuneSlug('San Giovanni  in Persiceto')).toBe('san-giovanni-in-persiceto');
  });
});

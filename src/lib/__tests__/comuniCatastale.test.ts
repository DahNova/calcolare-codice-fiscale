import { describe, it, expect } from 'vitest';
import { resolveComuni, comuniVicini, type ComunePage } from '../comuniCatastale';
import { comuniPriority } from '../../data/comuniPriority';

describe('resolveComuni', () => {
  const all = resolveComuni();

  it('risolve ogni comune in lista senza lanciare', () => {
    // Legato alla lista, non a un numero fisso: ogni ondata la allunga.
    expect(all.length).toBe(comuniPriority.length);
  });
  it('Roma -> slug roma, codice H501', () => {
    const roma = all.find(c => c.nome === 'Roma');
    expect(roma?.slug).toBe('roma');
    expect(roma?.codiceCatastale).toBe('H501');
  });
  it('Milano -> codice F205', () => {
    expect(all.find(c => c.nome === 'Milano')?.codiceCatastale).toBe('F205');
  });
  it('tutti gli slug sono unici', () => {
    const slugs = all.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('lancia su una entry duplicata esatta (stesso nome+provincia)', () => {
    expect(() =>
      resolveComuni([
        { nome: 'Roma', provincia: 'RM', wave: 0 },
        { nome: 'roma', provincia: 'RM', wave: 1 },
      ])
    ).toThrow(/duplicat/i);
  });
  it('suffissa gli slug collidenti di comuni diversi con la provincia', () => {
    // Due comuni omonimi in province diverse (case gestito dal dedup).
    const out = resolveComuni([
      { nome: 'Livo', provincia: 'CO', wave: 0 },
      { nome: 'Livo', provincia: 'TN', wave: 0 },
    ]);
    expect(out.map(c => c.slug).sort()).toEqual(['livo-co', 'livo-tn']);
  });
});

describe('comuniVicini', () => {
  it('ritorna comuni della stessa provincia, escluso sé stesso', () => {
    const fake: ComunePage[] = [
      { nome: 'A', provincia: 'MI', codiceCatastale: 'X001', slug: 'a' },
      { nome: 'B', provincia: 'MI', codiceCatastale: 'X002', slug: 'b' },
      { nome: 'C', provincia: 'RM', codiceCatastale: 'X003', slug: 'c' },
    ];
    const vicini = comuniVicini('a', fake);
    expect(vicini.map(v => v.slug)).toEqual(['b']);
  });
});

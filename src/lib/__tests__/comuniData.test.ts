import { describe, it, expect } from 'vitest';
import { findComune, type Comune } from '../comuniData';
import comuniRaw from '../../../public/data/comuni.json';

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

describe('integrità province in comuni.json', () => {
  // Il dataset di partenza portava le province storiche del registro Belfiore:
  // 250 comuni avevano la sigla sbagliata (Caserta marcata NA, Ivrea AO,
  // Olbia-Tempio e Ogliastra ancora esistenti). Riallineato all'elenco ISTAT
  // via codice catastale. Questi test impediscono la regressione.
  const comuni = (comuniRaw as Comune[]).filter(c => c.provincia !== 'EE');

  it('non contiene province abolite nel 2016', () => {
    const abolite = comuni.filter(c => ['OT', 'OG', 'VS', 'CI'].includes(c.provincia));
    expect(abolite).toEqual([]);
  });

  it('copre esattamente le 107 province attuali', () => {
    expect(new Set(comuni.map(c => c.provincia)).size).toBe(107);
  });

  it('assegna i capoluoghi alla propria provincia', () => {
    expect(findComune('Caserta', 'CE')?.codiceCatastale).toBe('B963');
    expect(findComune('Ivrea', 'TO')?.codiceCatastale).toBe('E379');
    expect(findComune('Olbia', 'SS')?.codiceCatastale).toBe('G015');
  });

  it('ha i conteggi provinciali ufficiali dove il dato era corrotto', () => {
    const per = (p: string) => comuni.filter(c => c.provincia === p).length;
    expect(per('CE')).toBe(104);
    expect(per('NA')).toBe(92);
    expect(per('TO')).toBe(312);
    expect(per('AO')).toBe(74);
  });
});

/**
 * Set curato del cluster codice catastale. La presenza di un record qui = pagina live.
 * Pubblicare una nuova ondata = aggiungere record. Il tag `wave` è solo documentazione.
 * `nome` + `provincia` DEVONO combaciare esattamente con public/data/comuni.json.
 */
export interface ComunePriority {
  nome: string;
  provincia: string;
  wave: number;
}

export const comuniPriority: ComunePriority[] = [
  { nome: 'Roma', provincia: 'RM', wave: 0 },
  { nome: 'Milano', provincia: 'MI', wave: 0 },
  { nome: 'Napoli', provincia: 'NA', wave: 0 },
  { nome: 'Torino', provincia: 'TO', wave: 0 },
  { nome: 'Palermo', provincia: 'PA', wave: 0 },
  { nome: 'Genova', provincia: 'GE', wave: 0 },
  { nome: 'Bologna', provincia: 'BO', wave: 0 },
  { nome: 'Firenze', provincia: 'FI', wave: 0 },
  { nome: 'Bari', provincia: 'BA', wave: 0 },
  { nome: 'Catania', provincia: 'CT', wave: 0 },
  { nome: 'Venezia', provincia: 'VE', wave: 0 },
  { nome: 'Verona', provincia: 'VR', wave: 0 },
  { nome: 'Messina', provincia: 'ME', wave: 0 },
  { nome: 'Padova', provincia: 'PD', wave: 0 },
  { nome: 'Trieste', provincia: 'TS', wave: 0 },
  { nome: 'Brescia', provincia: 'BS', wave: 0 },
  { nome: 'Prato', provincia: 'PO', wave: 0 },
  { nome: 'Parma', provincia: 'PR', wave: 0 },
  { nome: 'Modena', provincia: 'MO', wave: 0 },
  { nome: 'Reggio di Calabria', provincia: 'RC', wave: 0 },
];

import { useState } from 'react';
import { decodificaCodiceFiscale } from '../lib/inverso';
import { verificaCodiceFiscale } from '../lib/verifica';

const MESI = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

export default function InversoForm() {
  const [cf, setCf] = useState('');
  const [error, setError] = useState('');
  const [dati, setDati] = useState<ReturnType<typeof decodificaCodiceFiscale>>(null);
  const [nomeComune, setNomeComune] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDati(null);
    setNomeComune('');

    if (!verificaCodiceFiscale(cf)) {
      setError('Codice fiscale non valido. Verifica che sia composto da 16 caratteri corretti.');
      return;
    }

    const result = decodificaCodiceFiscale(cf);
    if (!result) { setError('Impossibile decodificare il codice fiscale.'); return; }
    setDati(result);

    // Lookup asincrono del comune
    const res = await fetch('/data/comuni.json');
    const comuni: Array<{ nome: string; provincia: string; codiceCatastale: string }> = await res.json();
    const trovato = comuni.find(c => c.codiceCatastale === result.codiceCatastale);
    setNomeComune(trovato ? `${trovato.nome} (${trovato.provincia})` : `Codice: ${result.codiceCatastale}`);
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          Codice Fiscale
        </label>
        <input
          type="text"
          value={cf}
          onChange={e => { setCf(e.target.value.toUpperCase()); setError(''); }}
          maxLength={16}
          placeholder="es. RSSMRA80A01H501U"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-lg uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{cf.length}/16</p>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <button type="submit"
        className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-semibold py-3 rounded-lg transition-colors">
        Decodifica Codice Fiscale
      </button>

      {dati && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Dati estratti dal codice fiscale
          </h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">Sesso:</dt>
            <dd className="font-medium">{dati.sesso === 'M' ? 'Maschile' : 'Femminile'}</dd>
            <dt className="text-gray-500">Data di nascita:</dt>
            <dd className="font-medium">{dati.giorno} {MESI[dati.mese]} {dati.annoCompleto}</dd>
            <dt className="text-gray-500">Luogo di nascita:</dt>
            <dd className="font-medium">{nomeComune || '...'}</dd>
          </dl>
          <p className="text-xs text-gray-400 mt-3">
            * L'anno potrebbe essere {dati.annoCompleto} o {dati.annoCompleto - 100} in caso di omonimia.
            Non è possibile risalire al nome o cognome esatti.
          </p>
        </div>
      )}
    </form>
  );
}

import { useState, useEffect, useRef } from 'react';
import { decodificaCodiceFiscale } from '../lib/inverso';
import { verificaCodiceFiscale } from '../lib/verifica';

type Comune = { nome: string; provincia: string; codiceCatastale: string };

const MESI = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

export default function InversoForm() {
  const [cf, setCf] = useState('');
  const [error, setError] = useState('');
  const [dati, setDati] = useState<ReturnType<typeof decodificaCodiceFiscale>>(null);
  const [nomeComune, setNomeComune] = useState('');
  const comuniRef = useRef<Comune[]>([]);

  // Load comuni once on mount
  useEffect(() => {
    fetch('/data/comuni.json')
      .then(r => r.json())
      .then((data: Comune[]) => { comuniRef.current = data; });
  }, []);

  function handleSubmit(e: React.FormEvent) {
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

    const trovato = comuniRef.current.find(c => c.codiceCatastale === result.codiceCatastale);
    setNomeComune(trovato ? `${trovato.nome} (${trovato.provincia})` : `Codice: ${result.codiceCatastale}`);
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_8px_32px_-4px_rgba(15,23,42,0.06)] space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-slate-700 mb-1">
          Codice Fiscale
        </label>
        <input
          type="text"
          value={cf}
          onChange={e => { setCf(e.target.value.toUpperCase()); setError(''); }}
          maxLength={16}
          placeholder="es. RSSMRA80A01H501U"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 font-mono text-lg tracking-wide uppercase bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-brand-blue-link focus:bg-white transition-colors"
        />
        <p className="text-xs text-slate-500 mt-1 text-right">{cf.length}/16</p>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <button type="submit"
        className="w-full bg-gradient-to-b from-brand-blue-link to-brand-blue hover:from-blue-500 hover:to-blue-700 text-white font-heading font-bold py-3.5 rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-colors">
        Decodifica Codice Fiscale
      </button>

      {dati && (
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-slate-800 text-sm">
            Dati estratti dal codice fiscale
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Sesso</p>
              <p className="text-base font-semibold text-slate-900">{dati.sesso === 'M' ? 'Maschile' : 'Femminile'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Data di nascita</p>
              <p className="text-base font-semibold text-slate-900">{dati.giorno} {MESI[dati.mese]} {dati.annoCompleto}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Luogo di nascita</p>
              <p className="text-base font-semibold text-slate-900">{nomeComune || '...'}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            * L'anno potrebbe essere {dati.annoCompleto} o {dati.annoCompleto - 100} in caso di omonimia.
            Non è possibile risalire al nome o cognome esatti.
          </p>
        </div>
      )}
    </form>
  );
}

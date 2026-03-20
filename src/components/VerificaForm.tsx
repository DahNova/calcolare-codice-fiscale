import { useState } from 'react';
import { verificaCodiceFiscale } from '../lib/verifica';

export default function VerificaForm() {
  const [cf, setCf] = useState('');
  const [result, setResult] = useState<boolean | null>(null);

  function handleChange(value: string) {
    const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCf(upper);
    if (upper.length === 16) {
      setResult(verificaCodiceFiscale(upper));
    } else {
      setResult(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_8px_32px_-4px_rgba(15,23,42,0.06)] space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-slate-700 mb-1">
          Codice Fiscale da verificare
        </label>
        <input
          type="text"
          value={cf}
          onChange={e => handleChange(e.target.value)}
          maxLength={16}
          placeholder="es. RSSMRA80A01H501U"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 font-mono text-lg tracking-wide uppercase text-center bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-brand-blue-link focus:bg-white transition-colors"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>La verifica è automatica al completamento dei 16 caratteri</span>
          <span>{cf.length}/16</span>
        </div>
      </div>

      {result === true && (
        <div className="p-5 bg-green-50 border border-green-200 rounded-2xl text-center">
          <p className="text-green-700 font-heading font-bold text-lg">✓ Codice Fiscale Valido</p>
          <p className="text-green-600 text-sm mt-1">
            Il carattere di controllo è corretto secondo il D.M. 12/03/1974.
          </p>
        </div>
      )}

      {result === false && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-700 font-heading font-bold text-lg">✗ Codice Fiscale Non Valido</p>
          <p className="text-red-600 text-sm mt-1">
            Il carattere di controllo non corrisponde. Verifica di aver inserito il CF correttamente.
          </p>
        </div>
      )}
    </div>
  );
}

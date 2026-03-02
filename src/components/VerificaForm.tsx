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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          Codice Fiscale da verificare
        </label>
        <input
          type="text"
          value={cf}
          onChange={e => handleChange(e.target.value)}
          maxLength={16}
          placeholder="es. RSSMRA80A01H501U"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono text-xl uppercase text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>La verifica è automatica al completamento dei 16 caratteri</span>
          <span>{cf.length}/16</span>
        </div>
      </div>

      {result === true && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 font-bold text-lg">✓ Codice Fiscale Valido</p>
          <p className="text-green-600 text-sm mt-1">
            Il carattere di controllo è corretto secondo il D.M. 12/03/1974.
          </p>
        </div>
      )}

      {result === false && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-700 font-bold text-lg">✗ Codice Fiscale Non Valido</p>
          <p className="text-red-600 text-sm mt-1">
            Il carattere di controllo non corrisponde. Verifica di aver inserito il CF correttamente.
          </p>
        </div>
      )}
    </div>
  );
}

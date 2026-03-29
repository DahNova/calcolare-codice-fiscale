import { useState, useEffect } from 'react';

interface Comune {
  nome: string;
  provincia: string;
  codiceCatastale: string;
}

interface PaeseEstero {
  nome: string;
  codiceCatastale: string;
  continente: string;
}

export default function CercaComuneDaCodice({ paesiEsteri }: { paesiEsteri: PaeseEstero[] }) {
  const [codice, setCodice] = useState('');
  const [result, setResult] = useState<{ tipo: 'comune'; nome: string; provincia: string } | { tipo: 'paese'; nome: string; continente: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [comuni, setComuni] = useState<Comune[]>([]);

  useEffect(() => {
    fetch('/data/comuni.json')
      .then(r => r.json())
      .then(setComuni);
  }, []);

  useEffect(() => {
    const q = codice.trim().toUpperCase();
    if (q.length !== 4) {
      setResult(null);
      setNotFound(false);
      return;
    }

    // Check comuni
    const comune = comuni.find(c => c.codiceCatastale === q);
    if (comune) {
      setResult({ tipo: 'comune', nome: comune.nome, provincia: comune.provincia });
      setNotFound(false);
      return;
    }

    // Check paesi esteri
    const paese = paesiEsteri.find(p => p.codiceCatastale === q);
    if (paese) {
      setResult({ tipo: 'paese', nome: paese.nome, continente: paese.continente });
      setNotFound(false);
      return;
    }

    setResult(null);
    setNotFound(true);
  }, [codice, comuni, paesiEsteri]);

  return (
    <div>
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        <input
          type="text"
          value={codice}
          onChange={e => setCodice(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="Inserisci codice catastale (es. H501, Z112)..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-brand-blue-link pl-11 font-mono text-base tracking-wider"
          aria-label="Inserisci un codice catastale"
          maxLength={4}
        />
      </div>

      {result?.tipo === 'comune' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-lg">✓</span>
            <span className="font-semibold text-green-800">Comune italiano</span>
          </div>
          <p className="text-sm text-slate-700">
            Il codice <span className="font-mono font-bold">{codice.trim().toUpperCase()}</span> corrisponde a <strong>{result.nome}</strong> ({result.provincia}).
          </p>
        </div>
      )}

      {result?.tipo === 'paese' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600 text-lg">✓</span>
            <span className="font-semibold text-blue-800">Stato estero</span>
          </div>
          <p className="text-sm text-slate-700">
            Il codice <span className="font-mono font-bold">{codice.trim().toUpperCase()}</span> corrisponde a <strong>{result.nome}</strong> ({result.continente}).
          </p>
        </div>
      )}

      {notFound && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm text-amber-800">
            Nessun comune o stato estero trovato per il codice <span className="font-mono font-bold">{codice.trim().toUpperCase()}</span>. Verifica di aver inserito correttamente il codice di 4 caratteri.
          </p>
        </div>
      )}
    </div>
  );
}

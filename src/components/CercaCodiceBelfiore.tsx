import { useState, useEffect, useMemo } from 'react';

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

interface Risultato {
  tipo: 'comune' | 'paese';
  nome: string;
  codice: string;
  extra: string; // provincia or continente
}

export default function CercaCodiceBelfiore({ paesiEsteri }: { paesiEsteri: PaeseEstero[] }) {
  const [query, setQuery] = useState('');
  const [comuni, setComuni] = useState<Comune[]>([]);

  useEffect(() => {
    fetch('/data/comuni.json')
      .then(r => r.json())
      .then(setComuni);
  }, []);

  const risultati = useMemo(() => {
    const q = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (q.length < 2) return [];

    const results: Risultato[] = [];

    // Search paesi esteri
    for (const p of paesiEsteri) {
      const nome = p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (nome.includes(q)) {
        results.push({ tipo: 'paese', nome: p.nome, codice: p.codiceCatastale, extra: p.continente });
      }
    }

    // Search comuni
    for (const c of comuni) {
      const nome = c.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (nome.includes(q)) {
        results.push({ tipo: 'comune', nome: c.nome, codice: c.codiceCatastale, extra: c.provincia });
      }
      if (results.length >= 20) break;
    }

    return results.slice(0, 20);
  }, [query, comuni, paesiEsteri]);

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
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cerca comune o paese (es. Milano, Germania, Roma)..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-brand-blue-link pl-11"
          aria-label="Cerca un comune o paese"
        />
      </div>

      {risultati.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2.5 font-medium text-slate-600">Nome</th>
                <th className="px-4 py-2.5 font-medium text-slate-600">Codice Belfiore</th>
                <th className="px-4 py-2.5 font-medium text-slate-600 hidden sm:table-cell">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {risultati.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-slate-800">{r.nome}</span>
                    <span className="text-slate-500 ml-1.5 text-xs">({r.extra})</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold text-brand-blue-link">{r.codice}</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.tipo === 'paese' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {r.tipo === 'paese' ? 'Stato estero' : 'Comune'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {query.trim().length >= 2 && risultati.length === 0 && comuni.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm text-amber-800">
            Nessun risultato trovato per "<strong>{query.trim()}</strong>". Verifica l'ortografia e riprova.
          </p>
        </div>
      )}
    </div>
  );
}

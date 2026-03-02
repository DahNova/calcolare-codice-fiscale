import { useState, useEffect, useRef } from 'react';
import { calcolaCodiceFiscale, type InputCF } from '../lib/codiceFiscale';

interface Comune {
  nome: string;
  provincia: string;
  codiceCatastale: string;
}

interface Errors {
  nome?: string;
  cognome?: string;
  data?: string;
  comune?: string;
}

export default function CalcolaForm() {
  const [comuni, setComuni] = useState<Comune[]>([]);
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [sesso, setSesso] = useState<'M' | 'F'>('M');
  const [dataStr, setDataStr] = useState('');
  const [comuneQuery, setComuneQuery] = useState('');
  const [selectedComune, setSelectedComune] = useState<Comune | null>(null);
  const [natoEstero, setNatoEstero] = useState(false);
  const [suggestions, setSuggestions] = useState<Comune[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [risultato, setRisultato] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch comuni on first mount
  useEffect(() => {
    fetch('/data/comuni.json')
      .then(r => r.json())
      .then((data: Comune[]) => setComuni(data));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function onComuneInput(query: string) {
    setComuneQuery(query);
    setSelectedComune(null);
    if (query.length < 2) { setSuggestions([]); return; }

    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtered = comuni.filter(c => {
      const nomeNorm = c.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // For estero: only show Z codes; for italia: only show non-Z codes
      const isEstero = c.codiceCatastale.startsWith('Z');
      if (natoEstero !== isEstero) return false;
      return nomeNorm.startsWith(q);
    }).slice(0, 8);

    setSuggestions(filtered);
  }

  function selectComune(c: Comune) {
    setComuneQuery(c.nome);
    setSelectedComune(c);
    setSuggestions([]);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!nome.trim()) e.nome = 'Il nome è obbligatorio';
    if (!cognome.trim()) e.cognome = 'Il cognome è obbligatorio';
    if (!dataStr) e.data = 'La data di nascita è obbligatoria';
    if (!selectedComune) e.comune = natoEstero
      ? 'Seleziona uno stato estero dalla lista'
      : 'Seleziona un comune dalla lista';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const [anno, mese, giorno] = dataStr.split('-').map(Number);
    const input: InputCF = {
      cognome, nome, sesso, giorno, mese, anno,
      codiceCatastale: selectedComune!.codiceCatastale,
    };
    setRisultato(calcolaCodiceFiscale(input));
    setCopied(false);
  }

  async function copy() {
    if (!risultato) return;
    await navigator.clipboard.writeText(risultato);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fieldClass = (field: keyof Errors) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Nome *
          </label>
          <input type="text" value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="es. Mario"
            className={fieldClass('nome')} />
          {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
        </div>

        {/* Cognome */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Cognome *
          </label>
          <input type="text" value={cognome}
            onChange={e => setCognome(e.target.value)}
            placeholder="es. Rossi"
            className={fieldClass('cognome')} />
          {errors.cognome && <p className="text-red-500 text-xs mt-1">{errors.cognome}</p>}
        </div>

        {/* Sesso */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Sesso *
          </label>
          <select value={sesso} onChange={e => setSesso(e.target.value as 'M' | 'F')}
            className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
          </select>
        </div>

        {/* Data di nascita */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Data di nascita *
          </label>
          <input type="date" value={dataStr}
            min="1900-01-01"
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setDataStr(e.target.value)}
            className={fieldClass('data')} />
          {errors.data && <p className="text-red-500 text-xs mt-1">{errors.data}</p>}
        </div>
      </div>

      {/* Toggle nato all'estero */}
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input type="checkbox" checked={natoEstero}
          onChange={e => {
            setNatoEstero(e.target.checked);
            setComuneQuery('');
            setSelectedComune(null);
            setSuggestions([]);
          }}
          className="rounded border-gray-300" />
        Nato/a all'estero
      </label>

      {/* Comune / Stato estero autocomplete */}
      <div ref={dropdownRef} className="relative">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          {natoEstero ? 'Stato estero *' : 'Comune di nascita *'}
        </label>
        <input
          type="text"
          value={comuneQuery}
          onChange={e => onComuneInput(e.target.value)}
          placeholder={natoEstero ? 'es. Francia' : 'es. Roma'}
          autoComplete="off"
          className={fieldClass('comune')} />
        {selectedComune && (
          <p className="text-xs text-gray-400 mt-1">
            {natoEstero
              ? `Codice: ${selectedComune.codiceCatastale}`
              : `Prov: ${selectedComune.provincia} — Codice catastale: ${selectedComune.codiceCatastale}`
            }
          </p>
        )}
        {errors.comune && <p className="text-red-500 text-xs mt-1">{errors.comune}</p>}
        {suggestions.length > 0 && (
          <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map(c => (
              <li key={c.codiceCatastale}
                onMouseDown={() => selectComune(c)}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex justify-between gap-2">
                <span>{c.nome}</span>
                {!natoEstero && <span className="text-gray-400 text-xs shrink-0">{c.provincia}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <button type="submit"
        className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-semibold py-3 rounded-lg transition-colors text-base mt-2">
        Calcola il Codice Fiscale
      </button>

      {/* Risultato */}
      {risultato && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Il tuo codice fiscale è:</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-3xl font-mono font-bold text-brand-blue tracking-widest">
              {risultato}
            </span>
            <button type="button" onClick={copy}
              className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors font-medium">
              {copied ? '✓ Copiato!' : 'Copia'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Calcolato secondo il D.M. 12/03/1974. In rari casi di omocodia il codice
            assegnato dall'Agenzia delle Entrate potrebbe differire.
          </p>
        </div>
      )}
    </form>
  );
}

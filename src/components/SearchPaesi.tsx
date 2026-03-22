import { useState, useEffect } from 'react';

export default function SearchPaesi() {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const q = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const rows = document.querySelectorAll<HTMLTableRowElement>('[data-paese]');
    const sections = document.querySelectorAll<HTMLElement>('[data-continente]');

    if (q.length < 2) {
      rows.forEach(r => r.style.display = '');
      sections.forEach(s => s.style.display = '');
      return;
    }

    rows.forEach(row => {
      const nome = (row.dataset.paese || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const codice = (row.dataset.codice || '').toLowerCase();
      row.style.display = (nome.includes(q) || codice.includes(q)) ? '' : 'none';
    });

    // Hide continent sections where all rows are hidden
    sections.forEach(section => {
      const visibleRows = section.querySelectorAll('tr[data-paese]:not([style*="display: none"])');
      section.style.display = visibleRows.length > 0 ? '' : 'none';
    });
  }, [query]);

  return (
    <div className="mb-6 relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Cerca paese o codice Z (es. Germania, Z112)..."
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-brand-blue-link pl-11"
        aria-label="Cerca un paese estero"
      />
    </div>
  );
}

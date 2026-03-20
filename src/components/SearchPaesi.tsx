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
    <div className="mb-6">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Cerca paese o codice Z (es. Germania, Z112)..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
        aria-label="Cerca un paese estero"
      />
    </div>
  );
}

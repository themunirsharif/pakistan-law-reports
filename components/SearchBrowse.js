'use client';

import { useState, useMemo } from 'react';

const PAGE_SIZE = 25;

function stampText(court) {
  if (!court || court === 'Not specified') return 'PLR';
  const words = court.replace('High Court', 'HC').split(' ');
  return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
}

export default function SearchBrowse({ judgments, courts, years }) {
  const [query, setQuery] = useState('');
  const [court, setCourt] = useState('');
  const [year, setYear] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return judgments.filter((j) => {
      if (court && j.court !== court) return false;
      if (year && j.year !== year) return false;
      if (q) {
        const hay = `${j.title} ${j.citation} ${j.excerpt} ${j.labels.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [judgments, query, court, year]);

  const shown = filtered.slice(0, visible);

  return (
    <>
      <div className="search-wrap">
        <input
          type="text"
          className="search-input"
          placeholder="Search by case name, citation, or keyword…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          aria-label="Search judgments"
        />
        <div className="filter-row">
          <select
            className="filter-select"
            value={court}
            onChange={(e) => {
              setCourt(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            aria-label="Filter by court"
          >
            <option value="">All courts</option>
            {courts.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            aria-label="Filter by year"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="results-section">
        <p className="results-count">
          {filtered.length.toLocaleString()} judgment{filtered.length !== 1 ? 's' : ''} found
        </p>

        {shown.length === 0 && (
          <div className="empty-state">
            No judgments match that search. Try a different keyword, or clear the filters above.
          </div>
        )}

        {shown.map((j) => (
          <a key={j.slug} href={`/judgments/${j.slug}`} className="judgment-card">
            <span className="stamp" aria-hidden="true">{stampText(j.court)}</span>
            <span>
              <h3 className="judgment-title">{j.title}</h3>
              <div className="judgment-meta">
                {[j.citation, j.court, j.year].filter(Boolean).join(' · ')}
              </div>
              <p className="judgment-excerpt">{j.excerpt}…</p>
            </span>
          </a>
        ))}

        {visible < filtered.length && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              style={{
                padding: '10px 24px',
                border: '1.5px solid var(--navy)',
                background: 'transparent',
                borderRadius: 3,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
              }}
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </>
  );
}

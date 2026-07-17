'use client';

import { useState, useMemo } from 'react';

const PAGE_SIZE = 50;

export default function AdvocateSearch({ advocates, division }) {
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const districts = useMemo(() => {
    const set = new Set(advocates.map((a) => a.district).filter(Boolean));
    return Array.from(set).sort();
  }, [advocates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return advocates.filter((a) => {
      if (district && a.district !== district) return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [advocates, query, district]);

  const shown = filtered.slice(0, visible);

  return (
    <>
      <div className="search-wrap" style={{ maxWidth: 500, margin: '0 0 24px' }}>
        <input
          type="text"
          className="search-input"
          placeholder={`Search advocate names in ${division}…`}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
          aria-label="Search advocate names"
        />
        {districts.length > 1 && (
          <div className="filter-row">
            <select
              className="filter-select"
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setVisible(PAGE_SIZE); }}
              aria-label="Filter by district"
            >
              <option value="">All districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="results-count">
        {filtered.length.toLocaleString()} advocate{filtered.length !== 1 ? 's' : ''} found
      </p>

      {shown.length === 0 && (
        <div className="empty-state">No advocates match that search.</div>
      )}

      <div className="lawyer-grid">
        {shown.map((a, i) => (
          <div key={`${a.registration_no}-${i}`} className="lawyer-card">
            <h3 className="lawyer-name">{a.name}</h3>
            <div className="lawyer-meta">
              {[a.district, a.enroll_type, `Reg. No. ${a.registration_no}`].filter(Boolean).join(' · ')}
            </div>
          </div>
        ))}
      </div>

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
    </>
  );
}

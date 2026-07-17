import { getAdvocateDivisions, divisionToSlug, getDivisionBySlug, getAdvocatesByDivision } from '../../../lib/data';

const PAGE_SIZE = 100;

export async function generateStaticParams() {
  return Object.keys(getAdvocateDivisions()).map((d) => ({ division: divisionToSlug(d) }));
}

export async function generateMetadata({ params }) {
  const division = getDivisionBySlug(params.division);
  if (!division) return { title: 'Division not found' };
  return {
    title: `Active Advocates — ${division}`,
    description: `Registered, active advocates in ${division} division, per the Sindh Bar Council.`,
    alternates: { canonical: `/lawyers/${params.division}` },
  };
}

export const dynamic = 'force-dynamic';

export default function DivisionAdvocatesPage({ params, searchParams }) {
  const division = getDivisionBySlug(params.division);
  if (!division) {
    return (
      <div className="content-page">
        <h1>Division not found</h1>
        <p><a href="/lawyers">Return to Lawyer Directory</a>.</p>
      </div>
    );
  }

  const all = getAdvocatesByDivision(division);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const currentPage = Math.min(totalPages, Math.max(1, parseInt(searchParams?.page, 10) || 1));
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = all.slice(start, start + PAGE_SIZE);
  const slug = divisionToSlug(division);

  return (
    <div className="results-section" style={{ paddingTop: 48, maxWidth: 800, margin: '0 auto' }}>
      <p style={{ fontSize: '0.85rem' }}><a href="/lawyers">← Lawyer Directory</a></p>
      <h1 style={{ marginBottom: 6 }}>Active Advocates — {division}</h1>
      <p className="results-count">
        {all.length.toLocaleString()} registered, active advocates — showing {start + 1}-
        {Math.min(start + PAGE_SIZE, all.length)}
      </p>
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: 24 }}>
        Sourced from the Sindh Bar Council&apos;s public advocate verification records. Only
        currently-active enrollments are listed. Pakistan Law Reports does not independently
        verify these records — for official confirmation, consult the{' '}
        <a href="https://advocates.sindhbarcouncil.org/verification/enrollments_search.php?page=search" target="_blank" rel="noopener noreferrer">
          Sindh Bar Council&apos;s own verification tool
        </a>.
      </p>

      <div className="lawyer-grid">
        {pageItems.map((a, i) => (
          <div key={`${a.registration_no}-${i}`} className="lawyer-card">
            <h3 className="lawyer-name">{a.name}</h3>
            <div className="lawyer-meta">
              {[a.district, a.enroll_type, `Reg. No. ${a.registration_no}`].filter(Boolean).join(' · ')}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          {currentPage > 1 && (
            <a href={`/lawyers/${slug}?page=${currentPage - 1}`} style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 3 }}>
              ← Previous
            </a>
          )}
          <span style={{ padding: '8px 16px', color: 'var(--ink-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a href={`/lawyers/${slug}?page=${currentPage + 1}`} style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 3 }}>
              Next →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}

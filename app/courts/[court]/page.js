import { getAllCourts, courtToSlug, getCourtBySlug, getJudgmentsByCourt } from '../../../lib/data';

const PAGE_SIZE = 100;

export async function generateStaticParams() {
  return getAllCourts().map((c) => ({ court: courtToSlug(c) }));
}

export async function generateMetadata({ params }) {
  const court = getCourtBySlug(params.court);
  if (!court) return { title: 'Court not found' };
  return {
    title: `${court} Judgments`,
    description: `Browse judgments from the ${court}, reported on Pakistan Law Reports.`,
    alternates: { canonical: `/courts/${params.court}` },
  };
}

export const dynamic = 'force-dynamic';

export default function CourtPage({ params, searchParams }) {
  const court = getCourtBySlug(params.court);
  if (!court) {
    return (
      <div className="content-page">
        <h1>Court not found</h1>
        <p><a href="/">Return to search</a>.</p>
      </div>
    );
  }

  const allJudgments = getJudgmentsByCourt(court);
  const totalPages = Math.max(1, Math.ceil(allJudgments.length / PAGE_SIZE));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, parseInt(searchParams?.page, 10) || 1)
  );
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageJudgments = allJudgments.slice(start, start + PAGE_SIZE);
  const courtSlug = courtToSlug(court);

  return (
    <div className="results-section" style={{ paddingTop: 48 }}>
      <h1 style={{ marginBottom: 6 }}>{court}</h1>
      <p className="results-count">
        {allJudgments.length.toLocaleString()} judgments — showing {start + 1}-
        {Math.min(start + PAGE_SIZE, allJudgments.length)}
      </p>

      {pageJudgments.map((j) => (
        <a key={j.slug} href={`/judgments/${j.slug}`} className="judgment-card">
          <span>
            <h3 className="judgment-title">{j.title}</h3>
            <div className="judgment-meta">
              {[j.citation, j.year].filter(Boolean).join(' · ')}
            </div>
            <p className="judgment-excerpt">{j.excerpt}…</p>
          </span>
        </a>
      ))}

      {totalPages > 1 && (
        <nav
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginTop: 32,
            flexWrap: 'wrap',
          }}
        >
          {currentPage > 1 && (
            <a href={`/courts/${courtSlug}?page=${currentPage - 1}`} style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 3 }}>
              ← Previous
            </a>
          )}
          <span style={{ padding: '8px 16px', color: 'var(--ink-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a href={`/courts/${courtSlug}?page=${currentPage + 1}`} style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 3 }}>
              Next →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}

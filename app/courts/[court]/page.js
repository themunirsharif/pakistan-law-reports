import { getAllCourts, courtToSlug, getCourtBySlug, getJudgmentsByCourt } from '../../../lib/data';

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

export default function CourtPage({ params }) {
  const court = getCourtBySlug(params.court);
  if (!court) {
    return (
      <div className="content-page">
        <h1>Court not found</h1>
        <p><a href="/">Return to search</a>.</p>
      </div>
    );
  }

  const judgments = getJudgmentsByCourt(court);

  return (
    <div className="results-section" style={{ paddingTop: 48 }}>
      <h1 style={{ marginBottom: 6 }}>{court}</h1>
      <p className="results-count">{judgments.length.toLocaleString()} judgments</p>

      {judgments.map((j) => (
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
    </div>
  );
}

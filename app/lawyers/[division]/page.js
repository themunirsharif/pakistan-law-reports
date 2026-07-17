import { getAdvocateDivisions, divisionToSlug, getDivisionBySlug, getAdvocatesByDivision } from '../../../lib/data';
import AdvocateSearch from '../../../components/AdvocateSearch';

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

export default function DivisionAdvocatesPage({ params }) {
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

  return (
    <div className="results-section" style={{ paddingTop: 48, maxWidth: 800, margin: '0 auto' }}>
      <p style={{ fontSize: '0.85rem' }}><a href="/lawyers">← Lawyer Directory</a></p>
      <h1 style={{ marginBottom: 6 }}>Active Advocates — {division}</h1>
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: 24 }}>
        Sourced from the Sindh Bar Council&apos;s public advocate verification records. Only
        currently-active enrollments are listed. Pakistan Law Reports does not independently
        verify these records — for official confirmation, consult the{' '}
        <a href="https://advocates.sindhbarcouncil.org/verification/enrollments_search.php?page=search" target="_blank" rel="noopener noreferrer">
          Sindh Bar Council&apos;s own verification tool
        </a>.
      </p>

      <AdvocateSearch advocates={all} division={division} />
    </div>
  );
}

import { getCaseHighlights } from '../../lib/data';

export const metadata = {
  title: 'Case Highlights',
  description: 'Plain-language explainers of notable Pakistani court judgments, written from the full judgment text.',
};

export default function CaseHighlightsPage() {
  const highlights = getCaseHighlights();

  return (
    <div className="content-page" style={{ maxWidth: 760 }}>
      <h1>Case Highlights</h1>
      <p>
        Plain-language explainers of notable judgments, written after reading the full judgment
        text — not a substitute for the actual opinion, which you can always read in full via the
        link below each summary.
      </p>

      {highlights.map((h) => (
        <div
          key={h.slug}
          style={{
            marginTop: 28, padding: 20, background: 'var(--paper-raised)',
            border: '1px solid var(--line)', borderRadius: 3,
          }}
        >
          <h2 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{h.title}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
            {h.citation} · {h.court}
          </p>
          <p style={{ marginBottom: 14 }}>{h.explainer}</p>
          <a href={`/judgments/${h.slug}`} style={{ fontSize: '0.9rem' }}>Read the full judgment →</a>
        </div>
      ))}
    </div>
  );
}

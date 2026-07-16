import { getAllSlugs, getJudgmentBySlug, getRelatedJudgments } from '../../../lib/data';
import JudgmentActions from '../../../components/JudgmentActions';

const TOPIC_CLASS = {
  'Criminal Law': 'topic-criminal',
  'Constitutional Law': 'topic-constitutional',
  'Family Law': 'topic-family',
  'Property & Rent': 'topic-property',
  'Tax Law': 'topic-tax',
  'Banking & Corporate': 'topic-banking',
  'Labour & Service': 'topic-labour',
  'Company Law': 'topic-company',
  'Succession & Inheritance': 'topic-succession',
  'Civil Law': 'topic-civil',
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const j = getJudgmentBySlug(params.slug);
  if (!j) return { title: 'Judgment not found' };

  const descBase = j.excerpt || j.title;
  const description = `${j.title}${j.citation ? ` (${j.citation})` : ''}${j.court ? ` — ${j.court}` : ''}. ${descBase}`.slice(0, 160);

  return {
    title: j.title,
    description,
    alternates: { canonical: `/judgments/${j.slug}` },
    openGraph: {
      title: `${j.title} | Pakistan Law Reports`,
      description,
      type: 'article',
    },
  };
}

export default function JudgmentPage({ params }) {
  const j = getJudgmentBySlug(params.slug);

  if (!j) {
    return (
      <div className="content-page">
        <h1>Judgment not found</h1>
        <p>This judgment may have been moved or removed. <a href="/">Return to search</a>.</p>
      </div>
    );
  }

  const related = getRelatedJudgments(j, 5);
  const pageUrl = `https://pakistanlawreports.com/judgments/${j.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: j.title,
    legislationIdentifier: j.citation || undefined,
    datePublished: j.year || undefined,
    about: j.court || undefined,
    inLanguage: 'en',
  };

  return (
    <div className="judgment-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="judgment-header">
        <h1>{j.title}</h1>
        <div className="tag-row">
          {j.citation && <span className="tag">{j.citation}</span>}
          {j.court && j.court !== 'Not specified' && <span className="tag outline">{j.court}</span>}
          {j.topic && j.topic !== 'General' && (
            <span className={`tag ${TOPIC_CLASS[j.topic] || ''}`}>{j.topic}</span>
          )}
          {j.year && <span className="tag outline">{j.year}</span>}
        </div>
        {j.judges && (
          <p style={{ marginTop: 14, fontSize: '0.92rem', color: 'var(--ink-muted)' }}>
            <strong>Bench:</strong> {j.judges}
          </p>
        )}
        <JudgmentActions title={j.title} citation={j.citation} court={j.court} year={j.year} url={pageUrl} />
      </div>

      <article className="judgment-body">{j.full_text}</article>

      {j.has_full_text === false && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 3,
            fontSize: '0.9rem',
          }}
        >
          Full judgment text for this case is not yet available on Pakistan Law Reports.
          {j.source_url ? (
            <>
              {' '}
              <a href={j.source_url} target="_blank" rel="noopener noreferrer">
                View the full order on the official Sindh High Court portal
              </a>.
            </>
          ) : (
            ' Check the official Sindh High Court case law portal for the complete order.'
          )}
        </div>
      )}

      <div className="source-note">
        This judgment is reproduced from a publicly available source for informational purposes
        and does not constitute legal advice. If you believe this listing contains an error,{' '}
        <a href="/contact">let us know</a>.
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Related judgments</h2>
          {related.map((r) => (
            <a key={r.slug} href={`/judgments/${r.slug}`} className="judgment-card">
              <span>
                <h3 className="judgment-title" style={{ fontSize: '0.95rem' }}>{r.title}</h3>
                <div className="judgment-meta">
                  {[r.citation, r.court, r.year].filter(Boolean).join(' · ')}
                </div>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

      {j.has_full_text === false && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 3,
            fontSize: '0.9rem',
          }}
        >
          Full judgment text for this case is not yet available on Pakistan Law Reports.
          {j.source_url ? (
            <>
              {' '}
              <a href={j.source_url} target="_blank" rel="noopener noreferrer">
                View the full order on the official Sindh High Court portal
              </a>.
            </>
          ) : (
            ' Check the official Sindh High Court case law portal for the complete order.'
          )}
        </div>
      )}

      <div className="source-note">
        This judgment is reproduced from a publicly available source for informational purposes
        and does not constitute legal advice. If you believe this listing contains an error,{' '}
        <a href="/contact">let us know</a>.
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Related judgments</h2>
          {related.map((r) => (
            <a key={r.slug} href={`/judgments/${r.slug}`} className="judgment-card">
              <span>
                <h3 className="judgment-title" style={{ fontSize: '0.95rem' }}>{r.title}</h3>
                <div className="judgment-meta">
                  {[r.citation, r.court, r.year].filter(Boolean).join(' · ')}
                </div>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

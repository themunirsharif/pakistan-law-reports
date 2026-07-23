import { getNonJudgmentEntries } from '../../lib/data';

export const metadata = {
  title: 'Statutes, Forms & Legal Resources',
  description: 'Statutes, government forms, and informational legal articles - separate from our case law database.',
};

const TYPE_LABELS = {
  STATUTE: { label: 'Statute / Ordinance', icon: '📜' },
  FORM: { label: 'Form / Template', icon: '📋' },
  ARTICLE: { label: 'Informational Article', icon: '📄' },
  OTHER: { label: 'Other Legal Document', icon: '🗂️' },
};

export default function LegalTextsPage() {
  const entries = getNonJudgmentEntries();

  const grouped = {};
  entries.forEach((e) => {
    const type = e.content_type || 'OTHER';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(e);
  });

  return (
    <div className="content-page" style={{ maxWidth: 800 }}>
      <h1>Statutes, Forms & Legal Resources</h1>
      <p>
        This page separates statutes, government forms, and informational articles from our
        main case law database, so each type of content is labeled honestly rather than
        presented as a court judgment.
      </p>

      {Object.keys(grouped).length === 0 ? (
        <p style={{ color: 'var(--ink-muted)' }}>Nothing has been sorted into this section yet.</p>
      ) : (
        Object.entries(grouped).map(([type, items]) => {
          const meta = TYPE_LABELS[type] || TYPE_LABELS.OTHER;
          return (
            <div key={type} style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>
                {meta.icon} {meta.label} ({items.length})
              </h2>
              {items.map((item) => (
                <a key={item.slug} href={`/judgments/${item.slug}`} className="judgment-card">
                  <span>
                    <h3 className="judgment-title" style={{ fontSize: '0.95rem' }}>{item.title}</h3>
                    {item.citation && <div className="judgment-meta">{item.citation}</div>}
                  </span>
                </a>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}

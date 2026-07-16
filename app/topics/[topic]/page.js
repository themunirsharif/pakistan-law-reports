import { getAllTopics, topicToSlug, getTopicBySlug, getJudgmentsByTopic } from '../../../lib/data';

const PAGE_SIZE = 100;

export async function generateStaticParams() {
  return getAllTopics().map((t) => ({ topic: topicToSlug(t) }));
}

export async function generateMetadata({ params }) {
  const topic = getTopicBySlug(params.topic);
  if (!topic) return { title: 'Topic not found' };
  return {
    title: `${topic} Judgments`,
    description: `Browse ${topic} judgments and case law, reported on Pakistan Law Reports.`,
    alternates: { canonical: `/topics/${params.topic}` },
  };
}

export const dynamic = 'force-dynamic';

export default function TopicPage({ params, searchParams }) {
  const topic = getTopicBySlug(params.topic);
  if (!topic) {
    return (
      <div className="content-page">
        <h1>Topic not found</h1>
        <p><a href="/">Return to search</a>.</p>
      </div>
    );
  }

  const allJudgments = getJudgmentsByTopic(topic);
  const totalPages = Math.max(1, Math.ceil(allJudgments.length / PAGE_SIZE));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, parseInt(searchParams?.page, 10) || 1)
  );
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageJudgments = allJudgments.slice(start, start + PAGE_SIZE);
  const slug = topicToSlug(topic);

  return (
    <div className="results-section" style={{ paddingTop: 48 }}>
      <h1 style={{ marginBottom: 6 }}>{topic}</h1>
      <p className="results-count">
        {allJudgments.length.toLocaleString()} judgments — showing {start + 1}-
        {Math.min(start + PAGE_SIZE, allJudgments.length)}
      </p>

      {pageJudgments.map((j) => (
        <a key={j.slug} href={`/judgments/${j.slug}`} className="judgment-card">
          <span>
            <h3 className="judgment-title">{j.title}</h3>
            <div className="judgment-meta">
              {[j.citation, j.court, j.year].filter(Boolean).join(' · ')}
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
            <a href={`/topics/${slug}?page=${currentPage - 1}`} style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 3 }}>
              ← Previous
            </a>
          )}
          <span style={{ padding: '8px 16px', color: 'var(--ink-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a href={`/topics/${slug}?page=${currentPage + 1}`} style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 3 }}>
              Next →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}

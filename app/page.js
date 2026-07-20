import { getAllJudgments, getAllCourts, getAllYears, getAllTopics, getStats, getLatestUpdate, getTopicCounts, topicToSlug, getLatestJudgments, getAllLawyers } from '../lib/data';
import SearchBrowse from '../components/SearchBrowse';

const TOPIC_ICONS = {
  'Criminal Law': '⚖️',
  'Constitutional Law': '📜',
  'Family Law': '👨‍👩‍👧',
  'Property & Rent': '🏠',
  'Tax Law': '💰',
  'Banking & Corporate': '🏦',
  'Labour & Service': '👷',
  'Company Law': '🏢',
  'Succession & Inheritance': '📋',
  'Civil Law': '🗂️',
  'General': '📄',
};

export default function HomePage() {
  const judgments = getAllJudgments();
  const courts = getAllCourts();
  const years = getAllYears();
  const topics = getAllTopics();
  const stats = getStats();
  const latestUpdate = getLatestUpdate();
  const topicCounts = getTopicCounts();
  const latestJudgments = getLatestJudgments(8);
  const lawyers = getAllLawyers();
  const featuredLawyers = lawyers.slice(0, 3);

  const topTopics = topics
    .filter((t) => t !== 'General')
    .sort((a, b) => (topicCounts[b] || 0) - (topicCounts[a] || 0));

  return (
    <>
      <div className="announcement-bar">
        <span className="announcement-badge">
          {latestUpdate && latestUpdate.added > 0 ? 'UPDATED TODAY' : 'LIVE'}
        </span>
        <span className="announcement-text">
          {latestUpdate && latestUpdate.added > 0 ? (
            <>
              <strong>{latestUpdate.added} new judgments</strong> added on {latestUpdate.date} —
              Pakistan Law Reports now covers <strong>{stats.total.toLocaleString()} cases</strong>,
              updated daily, free to search.
            </>
          ) : (
            <>
              Pakistan Law Reports now covers <strong>{stats.total.toLocaleString()} cases</strong> across
              every major court in Pakistan — updated daily, free to search.
            </>
          )}
        </span>
      </div>

      <section className="hero">
        <h1>Search Pakistani case law, free.</h1>
        <p className="lede">
          A free, searchable archive of judgments from the Supreme Court and High Courts of
          Pakistan — built for lawyers, students, journalists, and the public.
        </p>

        <div className="stat-row">
          <div className="stat">
            <span className="stat-num">{stats.total.toLocaleString()}</span>
            <span className="stat-label">Judgments</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.courts}</span>
            <span className="stat-label">Courts</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.years[stats.years.length - 1]}–{stats.years[0]}</span>
            <span className="stat-label">Year range</span>
          </div>
        </div>

        <div style={{ marginTop: 40, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          {featuredLawyers.length > 0 && (
            <>
              <h2 style={{ fontSize: '1rem', marginBottom: 14 }}>Featured Lawyers</h2>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                {featuredLawyers.map((l, i) => (
                  <a
                    key={i}
                    href={`/lawyers/profile/${l.slug}`}
                    style={{
                      padding: '14px 20px', border: '1px solid var(--line)', borderRadius: 3,
                      background: 'var(--paper-raised)', textDecoration: 'none', minWidth: 180,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--navy)' }}>{l.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                      {[l.city, l.practice_area].filter(Boolean).join(' · ')}
                    </div>
                  </a>
                ))}
                <a
                  href="/lawyers"
                  style={{
                    padding: '14px 20px', border: '1px dashed var(--line)', borderRadius: 3,
                    display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--ink-muted)',
                  }}
                >
                  See full directory →
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="lawyer-cta-banner">
        <p className="lawyer-cta-text">
          📌 <strong>Are you a lawyer?</strong> Get listed for free — submit your profile, license
          number, and practice area for review.
        </p>
        <a href="/lawyers" className="lawyer-cta-button">Get Listed →</a>
      </div>

      <section className="topic-browse">
        <h2>Browse by legal topic</h2>
        <div className="topic-grid">
          {topTopics.map((t) => (
            <a key={t} href={`/topics/${topicToSlug(t)}`} className="topic-card">
              <span className="topic-icon" aria-hidden="true">{TOPIC_ICONS[t] || '📄'}</span>
              <span className="topic-name">{t}</span>
              <span className="topic-count">{(topicCounts[t] || 0).toLocaleString()} cases</span>
            </a>
          ))}
        </div>
      </section>

      {latestJudgments.length > 0 && (
        <section className="latest-judgments">
          <h2>Latest judgments</h2>
          <div className="latest-grid">
            {latestJudgments.map((j) => (
              <a key={j.slug} href={`/judgments/${j.slug}`} className="latest-card">
                <span className="latest-title">{j.title}</span>
                <span className="latest-meta">
                  {[j.citation, j.court, j.year].filter(Boolean).join(' · ')}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <div style={{ paddingTop: 8 }}>
        <SearchBrowse judgments={judgments} courts={courts} years={years} topics={topics} />
      </div>
    </>
  );
}

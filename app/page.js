import { getAllJudgments, getAllCourts, getAllYears, getAllTopics, getStats, getLatestUpdate, getTopicCounts, topicToSlug } from '../lib/data';
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
      </section>

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

      <div style={{ paddingTop: 8 }}>
        <SearchBrowse judgments={judgments} courts={courts} years={years} topics={topics} />
      </div>
    </>
  );
}

import { getAllJudgments, getAllCourts, getAllYears, getStats } from '../lib/data';
import SearchBrowse from '../components/SearchBrowse';

export default function HomePage() {
  const judgments = getAllJudgments();
  const courts = getAllCourts();
  const years = getAllYears();
  const stats = getStats();

  return (
    <>
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

      <div style={{ paddingTop: 32 }}>
        <SearchBrowse judgments={judgments} courts={courts} years={years} />
      </div>
    </>
  );
}

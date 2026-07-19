import { getAllTopics, getJudgmentsByTopic } from '../../lib/data';
import CaseFinder from '../../components/CaseFinder';

export const metadata = {
  title: 'Find Related Judgments',
  description: 'Describe a general legal situation and find related judgments in our database.',
};

export default function FindCasesPage() {
  const topics = getAllTopics().filter((t) => t !== 'General');

  // Pre-load a manageable slice per topic (client component picks 8 to show)
  const topicJudgments = {};
  topics.forEach((t) => {
    topicJudgments[t] = getJudgmentsByTopic(t).slice(0, 20);
  });

  return (
    <div className="content-page" style={{ maxWidth: 700 }}>
      <h1>Find Related Judgments</h1>
      <p dir="rtl" lang="ur" style={{ fontFamily: 'var(--font-body), "Noto Nastaliq Urdu", sans-serif', color: 'var(--navy)', fontWeight: 600, fontSize: '1.3rem', marginTop: -12 }}>
        متعلقہ فیصلے تلاش کریں
      </p>
      <p>
        Describe a general legal situation, and we&apos;ll search our database for judgments that
        may be related to that topic.
      </p>

      <CaseFinder topicJudgments={topicJudgments} />
    </div>
  );
}

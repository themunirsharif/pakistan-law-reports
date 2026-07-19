'use client';

import { useState } from 'react';

// Broader, everyday-language keywords than the strict classification regex -
// real people describe problems informally, not in legal terminology.
const TOPIC_KEYWORDS = {
  'Family Law': ['divorce', 'khula', 'husband', 'wife', 'custody', 'child', 'marriage', 'dowry', 'maintenance', 'alimony', 'separated', 'nikah'],
  'Criminal Law': ['arrested', 'police', 'fir', 'jail', 'bail', 'stolen', 'theft', 'assault', 'beaten', 'threatened', 'accused', 'charged', 'crime'],
  'Property & Rent': ['landlord', 'tenant', 'rent', 'deposit', 'evict', 'lease', 'property dispute', 'plot', 'possession of house', 'sale deed'],
  'Labour & Service': ['fired', 'terminated', 'job', 'salary', 'employer', 'employee', 'workplace', 'pension', 'promotion', 'service matter'],
  'Succession & Inheritance': ['inheritance', 'will', 'father died', 'mother died', 'legal heirs', 'succession', 'estate', 'property after death'],
  'Tax Law': ['tax', 'fbr', 'income tax', 'sales tax', 'audit notice', 'customs'],
  'Banking & Corporate': ['bank', 'loan', 'default', 'cheque bounced', 'recovery of loan', 'nab'],
  'Company Law': ['company', 'business partner', 'shareholder', 'winding up', 'partnership dispute'],
  'Constitutional Law': ['fundamental rights', 'constitution', 'government action', 'writ petition', 'illegal detention', 'police misconduct'],
  'Civil Law': ['contract', 'agreement broken', 'sue', 'lawsuit', 'breach', 'damages', 'compensation'],
};

function findMatchingTopic(text) {
  const lower = text.toLowerCase();
  let bestTopic = null;
  let bestScore = 0;

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return bestScore > 0 ? bestTopic : null;
}

export default function CaseFinder({ topicJudgments, topicToSlug }) {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const matchedTopic = findMatchingTopic(description);
    setResult(matchedTopic);

    // Track only the matched TOPIC category, never the person's actual
    // description - keeps analytics useful without storing sensitive
    // personal details.
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'case_finder_search', {
        matched_topic: matchedTopic || 'no_match',
      });
    }
  };

  const matches = result ? (topicJudgments[result] || []).slice(0, 8) : [];

  return (
    <div>
      <div
        style={{
          background: '#fff8e1', border: '1px solid #e4c869', borderRadius: 3,
          padding: 16, marginBottom: 24, fontSize: '0.88rem',
        }}
      >
        <strong>This is not legal advice.</strong> This tool searches our database for judgments
        that may relate to the general topic of what you describe — it does not analyze your
        specific situation or tell you what your legal rights are. For advice on your actual
        case, please consult a licensed advocate. Do not include personal details, names, or
        anything identifying in your description.
      </div>

      <form onSubmit={handleSearch} className="form-card" style={{ maxWidth: 600 }}>
        <div className="form-row">
          <label>Briefly describe the general situation (no personal details)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. landlord won't return my security deposit after I moved out"
            required
            minLength={10}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 28px' }}>
          Find Related Judgments
        </button>
      </form>

      {result !== null && (
        <div style={{ marginTop: 24 }}>
          {result ? (
            <>
              <p style={{ fontSize: '0.92rem' }}>
                This looks related to <strong>{result}</strong>. Here are some judgments in that
                area:
              </p>
              {matches.map((j) => (
                <a key={j.slug} href={`/judgments/${j.slug}`} className="judgment-card">
                  <span>
                    <h3 className="judgment-title" style={{ fontSize: '0.95rem' }}>{j.title}</h3>
                    <div className="judgment-meta">
                      {[j.citation, j.court, j.year].filter(Boolean).join(' · ')}
                    </div>
                  </span>
                </a>
              ))}
              <p style={{ marginTop: 16 }}>
                <a href={`/topics/${topicToSlug(result)}`}>See all {result} judgments →</a>
              </p>
            </>
          ) : (
            <p>
              We couldn&apos;t confidently match this to a topic in our database. Try adding a
              bit more detail, or{' '}
              <a href="/">browse and search all judgments directly</a>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

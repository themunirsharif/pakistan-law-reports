'use client';

import { useState } from 'react';

const TOPIC_KEYWORDS = {
  'Family Law': [
    'divorce', 'khula', 'husband', 'wife', 'custody', 'child', 'children', 'marriage', 'dowry',
    'maintenance', 'alimony', 'separated', 'nikah', 'talaq', 'shohar', 'biwi', 'bacha', 'bachay',
    'bachon', 'shaadi', 'haq mehr', 'haq meher', 'nafqa', 'walida', 'khula lena', 'domestic violence',
    'domestic abuse', 'guardian', 'guardianship', 'visitation', 'access to child', 'child support',
    'second marriage', 'early marriage', 'child marriage', 'forced marriage', 'nikah nama',
    'shadi', 'talaq nama', 'ruksati', 'in-laws', 'sasural', 'mother in law', 'saas',
  ],
  'Criminal Law': [
    'arrested', 'police', 'fir', 'jail', 'bail', 'stolen', 'theft', 'assault', 'beaten',
    'threatened', 'accused', 'charged', 'crime', 'giraftar', 'zamanat', 'chori', 'maara',
    'dhamki', 'thana', 'mulzim', 'domestic violence', 'domestic abuse', 'beat me', 'hit me',
    'abusive husband', 'wife beating', 'harassment', 'violence', 'child abuse', 'sexual abuse',
    'molestation', 'rape', 'zina', 'kidnapping', 'kidnapped', 'missing person', 'gum ho gaya',
    'missing child', 'bacha gum', 'murder', 'qatal', 'blackmail', 'blackmailing', 'extortion',
    'cybercrime', 'online fraud', 'fraud', 'dhoka dahi', 'false case', 'jhoota case',
    'honor killing', 'karo kari', 'torture', 'gang rape', 'attempted rape', 'child marriage case',
    'suicide', 'khudkushi', 'acid attack', 'abduction',
  ],
  'Property & Rent': [
    'landlord', 'tenant', 'rent', 'deposit', 'evict', 'lease', 'property dispute', 'plot',
    'possession of house', 'sale deed', 'makan malik', 'kiraya', 'kirayedar', 'zamin', 'jaidad',
    'qabza', 'illegal possession', 'fraud property', 'fake registry', 'registry fraud',
    'property fraud', 'boundary dispute', 'inherited property', 'ancestral property',
  ],
  'Labour & Service': [
    'fired', 'terminated', 'job', 'salary', 'employer', 'employee', 'workplace', 'pension',
    'promotion', 'service matter', 'naukri', 'tankhwa', 'malik', 'nikal diya', 'company ne nikala',
    'unpaid salary', 'salary not paid', 'wrongful termination', 'workplace harassment',
    'gratuity', 'provident fund', 'notice period',
  ],
  'Succession & Inheritance': [
    'inheritance', 'will', 'father died', 'mother died', 'legal heirs', 'succession', 'estate',
    'property after death', 'warasat', 'wirasat', 'wasiyat', 'abu ka intiqal', 'walid ka inteqal',
    'mirasi', 'share in property', 'brother took my share', 'sister denied inheritance',
  ],
  'Tax Law': ['tax', 'fbr', 'income tax', 'sales tax', 'audit notice', 'customs', 'tax notice'],
  'Banking & Corporate': [
    'bank', 'loan', 'default', 'cheque bounced', 'recovery of loan', 'nab', 'qarza', 'karza',
    'cheque dishonour', 'bounced cheque', 'credit card fraud', 'account frozen',
  ],
  'Company Law': ['company', 'business partner', 'shareholder', 'winding up', 'partnership dispute', 'partner ne dhoka'],
  'Constitutional Law': [
    'fundamental rights', 'constitution', 'government action', 'writ petition', 'illegal detention',
    'police misconduct', 'huqooq', 'sarkar ne', 'human rights violation', 'wrongly detained',
  ],
  'Civil Law': ['contract', 'agreement broken', 'sue', 'lawsuit', 'breach', 'damages', 'compensation', 'muqadma', 'adalat', 'case'],
};

function findMatchingTopic(text) {
  const lower = text.toLowerCase();
  let bestTopic = null;
  let bestScore = 0;
  let matchedKeywords = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const found = keywords.filter((kw) => lower.includes(kw));
    if (found.length > bestScore) {
      bestScore = found.length;
      bestTopic = topic;
      matchedKeywords = found;
    }
  }

  return { topic: bestScore > 0 ? bestTopic : null, matchedKeywords };
}

function slugifyTopic(topic) {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CaseFinder({ topicJudgments }) {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const { topic: matchedTopic, matchedKeywords } = findMatchingTopic(description);
    setResult(matchedTopic);

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'case_finder_search', {
        matched_topic: matchedTopic || 'no_match',
        matched_keywords: matchedKeywords.join(', ') || 'none',
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
        <p style={{ margin: '0 0 8px' }}>
          <strong>This is not legal advice.</strong> This tool searches our database for
          judgments that may relate to the general topic of what you describe — it does not
          analyze your specific situation or tell you what your legal rights are. For advice on
          your actual case, please consult a licensed advocate. Do not include personal details,
          names, or anything identifying in your description.
        </p>
        <p dir="rtl" lang="ur" style={{ margin: 0, fontFamily: 'var(--font-body), "Noto Nastaliq Urdu", sans-serif' }}>
          <strong>یہ قانونی مشورہ نہیں ہے۔</strong> یہ ٹول آپ کے بیان کردہ عمومی موضوع سے متعلق
          فیصلے تلاش کرتا ہے — یہ آپ کی مخصوص صورتحال کا تجزیہ نہیں کرتا۔ اپنے کیس کے بارے میں
          مشورے کے لیے کسی وکیل سے رجوع کریں۔ اپنی تفصیل میں ذاتی معلومات یا نام شامل نہ کریں۔
        </p>
      </div>

      <form onSubmit={handleSearch} className="form-card" style={{ maxWidth: 600 }}>
        <div className="form-row">
          <label>
            Briefly describe the general situation (no personal details)
            <br />
            <span dir="rtl" lang="ur" style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              اپنا مسئلہ مختصراً بیان کریں (ذاتی تفصیلات شامل نہ کریں) — اردو، رومن اردو، یا انگریزی میں لکھ سکتے ہیں
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. landlord won't return my security deposit / makan malik security deposit wapis nahi kar raha"
            required
            minLength={10}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 28px' }}>
          Find Related Judgments <span dir="rtl" lang="ur">/ متعلقہ فیصلے تلاش کریں</span>
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
                <a href={`/topics/${slugifyTopic(result)}`}>See all {result} judgments →</a>
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

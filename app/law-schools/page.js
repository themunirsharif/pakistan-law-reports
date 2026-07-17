import { getAllLawSchools } from '../../lib/data';

export const metadata = {
  title: 'Law Schools in Pakistan',
  description: 'A directory of law schools, law colleges, and university law departments across Pakistan.',
};

export default function LawSchoolsPage() {
  const schools = getAllLawSchools();
  const sorted = schools.slice().sort((a, b) => a.city.localeCompare(b.city));

  return (
    <div className="content-page" style={{ maxWidth: 800 }}>
      <h1>Law Schools in Pakistan</h1>
      <p>
        A directory of law schools, law colleges, and university law departments across Pakistan
        — compiled for students researching legal education options. Institutions are regulated
        by the Pakistan Bar Council and the Higher Education Commission (HEC); Pakistan Law
        Reports does not independently verify accreditation status, and prospective students
        should confirm current recognition directly with HEC and PBC before enrolling.
      </p>

      <div className="lawyer-grid" style={{ marginTop: 24 }}>
        {sorted.map((s, i) => (
          <div key={i} className="lawyer-card">
            <h3 className="lawyer-name">{s.name}</h3>
            <div className="lawyer-meta">
              {[s.university, s.city, s.founded && `Est. ${s.founded}`].filter(Boolean).join(' · ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { getAllLawyers, getAdvocateDivisions, divisionToSlug } from '../../lib/data';
import LawyerSubmissionForm from '../../components/LawyerSubmissionForm';

export const metadata = {
  title: 'Lawyer Directory',
  description: 'A curated directory of lawyers across Pakistan, listed by city and practice area.',
};

export default function LawyersPage() {
  const lawyers = getAllLawyers();
  const divisionCounts = getAdvocateDivisions();
  const divisions = Object.keys(divisionCounts).sort((a, b) => divisionCounts[b] - divisionCounts[a]);

  return (
    <div className="content-page" style={{ maxWidth: 800 }}>
      <h1>Lawyer Directory</h1>
      <p>
        A free, curated directory of lawyers across Pakistan. This list is manually reviewed
        rather than self-submitted, so every entry has been checked before it&apos;s added.
      </p>

      {divisions.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 6 }}>Verified Active Advocates</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: 16 }}>
            Sourced from the Sindh Bar Council&apos;s public verification records — currently
            active, registered advocates only. Browse by division:
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {divisions.map((d) => (
              <a
                key={d}
                href={`/lawyers/${divisionToSlug(d)}`}
                style={{
                  padding: '10px 18px',
                  border: '1px solid var(--line)',
                  borderRadius: 3,
                  background: 'var(--paper-raised)',
                  fontSize: '0.9rem',
                }}
              >
                {d} <span style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>({divisionCounts[d].toLocaleString()})</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {lawyers.length === 0 ? (
        <div style={{ marginTop: 32 }}>
          <p style={{ marginBottom: 8, textAlign: 'center' }}>
            <strong>This directory is just getting started.</strong>
          </p>
          <p style={{ color: 'var(--ink-muted)', textAlign: 'center', marginBottom: 24 }}>
            Are you a lawyer in Pakistan interested in being listed? Submit your details below.
          </p>
          <LawyerSubmissionForm />
        </div>
      ) : (
        <div className="lawyer-grid">
          {lawyers.map((l, i) => (
            <a key={i} href={`/lawyers/profile/${l.slug}`} className="lawyer-card" style={{ display: 'block', textDecoration: 'none' }}>
              <h3 className="lawyer-name">{l.name}</h3>
              <div className="lawyer-meta">
                {[l.city, l.practice_area].filter(Boolean).join(' · ')}
              </div>
              {l.bio && <p className="lawyer-bio">{l.bio}</p>}
              {l.contact && <p className="lawyer-contact">{l.contact}</p>}
            </a>
          ))}
        </div>
      )}

      <p style={{ marginTop: 32, fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
        Pakistan Law Reports does not verify bar council registration or vouch for the quality of
        any listed lawyer&apos;s services. This directory is provided for informational purposes only.
      </p>

      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Official Bar Council updates</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', marginBottom: 20 }}>
          Live updates from official sources, embedded directly — not reproduced or edited by
          Pakistan Law Reports.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          <div>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>
              Sindh Bar Council
            </p>
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FSindhBarCouncilOfficial%2F&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false"
              width="100%"
              height="500"
              style={{ border: 'none', overflow: 'hidden', borderRadius: 3 }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Sindh Bar Council Facebook updates"
            />
          </div>
          <div>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>
              Karachi Bar Association
            </p>
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FKarachiBarAssociationKba%2F&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false"
              width="100%"
              height="500"
              style={{ border: 'none', overflow: 'hidden', borderRadius: 3 }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Karachi Bar Association Facebook updates"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

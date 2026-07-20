import { getAllLawyers, getLawyerBySlug } from '../../../../lib/data';

export async function generateStaticParams() {
  return getAllLawyers().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }) {
  const lawyer = getLawyerBySlug(params.slug);
  if (!lawyer) return { title: 'Lawyer not found' };
  return {
    title: lawyer.name,
    description: `${lawyer.name}${lawyer.city ? ` — ${lawyer.city}` : ''}${lawyer.practice_area ? `, ${lawyer.practice_area}` : ''}. Listed on Pakistan Law Reports' free lawyer directory.`,
    alternates: { canonical: `/lawyers/profile/${params.slug}` },
  };
}

export default function LawyerProfilePage({ params }) {
  const lawyer = getLawyerBySlug(params.slug);

  if (!lawyer) {
    return (
      <div className="content-page">
        <h1>Lawyer not found</h1>
        <p><a href="/lawyers">Return to Lawyer Directory</a>.</p>
      </div>
    );
  }

  return (
    <div className="content-page" style={{ maxWidth: 700 }}>
      <p style={{ fontSize: '0.85rem' }}><a href="/lawyers">← Lawyer Directory</a></p>
      <h1>{lawyer.name}</h1>
      <p style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
        {[lawyer.city, lawyer.practice_area].filter(Boolean).join(' · ')}
      </p>

      {lawyer.bio && <p style={{ marginTop: 20 }}>{lawyer.bio}</p>}
      {lawyer.contact && (
        <p style={{ marginTop: 16 }}>
          <strong>Contact:</strong> {lawyer.contact}
        </p>
      )}

      <p style={{ marginTop: 32, fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
        Pakistan Law Reports does not verify bar council registration or vouch for the quality of
        this lawyer&apos;s services. This listing is provided for informational purposes only.
      </p>
    </div>
  );
}

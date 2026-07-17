export const metadata = {
  title: 'Legal Resources',
  description: 'Practical legal information and links to official Pakistani government resources.',
};

export default function ResourcesPage() {
  return (
    <div className="content-page">
      <h1>Legal Resources</h1>
      <p>
        General information on common legal processes in Pakistan, and links to official
        government resources. This is informational only and does not constitute legal advice —
        for anything specific to your situation, consult a licensed advocate.
      </p>

      <h2>Filing an FIR (First Information Report)</h2>
      <p>
        A First Information Report is the document police prepare when they first receive
        information about a cognizable offence. Under Pakistani law, a police officer in charge of
        a station is generally required to register an FIR when informed of a cognizable offence,
        free of cost. If a station refuses, a complainant can approach a higher police officer, a
        magistrate, or file a private complaint under the Criminal Procedure Code. The FIR should
        record the date, time, and place of occurrence, the informant&apos;s statement, and be
        signed by the informant after it is read back to them.
      </p>

      <h2>Bail — the basics</h2>
      <p>
        Bail in Pakistan is broadly divided into bailable and non-bailable offences. In bailable
        offences, bail is a right and must be granted. In non-bailable offences, bail is at the
        court&apos;s discretion, weighing factors like the nature of the offence, evidence, and
        flight risk. Applications are typically made first before a Sessions Court, and if
        refused, can be pursued before the relevant High Court.
      </p>

      <h2>Small claims and civil suits</h2>
      <p>
        Civil disputes — property, contracts, recovery of money — are generally filed as a suit
        before the civil court with jurisdiction over the matter, under the Civil Procedure Code.
        Many provinces also have simplified small-claims procedures for lower-value disputes,
        intended to resolve matters faster than a full civil suit.
      </p>

      <h2>Family law — khula and dissolution of marriage</h2>
      <p>
        Family matters, including dissolution of marriage, custody, and maintenance, are handled
        by Family Courts under the Family Courts Act. A wife seeking dissolution through khula
        does not need to prove fault by the husband; courts have generally held that an
        irreconcilable breakdown of the marriage is sufficient grounds.
      </p>

      <h2>Official government resources</h2>
      <ul>
        <li>
          <a href="https://www.supremecourt.gov.pk" target="_blank" rel="noopener noreferrer">
            Supreme Court of Pakistan
          </a>
        </li>
        <li>
          <a href="https://www.pakistanbarcouncil.org" target="_blank" rel="noopener noreferrer">
            Pakistan Bar Council
          </a>
        </li>
        <li>
          <a href="https://na.gov.pk" target="_blank" rel="noopener noreferrer">
            National Assembly of Pakistan (legislation)
          </a>
        </li>
        <li>
          <a href="https://www.hec.gov.pk" target="_blank" rel="noopener noreferrer">
            Higher Education Commission (for verifying law school accreditation)
          </a>
        </li>
      </ul>

      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: 32 }}>
        Laws and procedures can change, and their application varies by case. Always verify
        current requirements with a licensed advocate or the relevant court/authority directly.
      </p>
    </div>
  );
}

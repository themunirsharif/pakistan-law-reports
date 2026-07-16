export const metadata = {
  title: 'Contact',
  description: 'Get in touch with Pakistan Law Reports.',
};

export default function ContactPage() {
  return (
    <div className="content-page">
      <h1>Contact Us</h1>
      <p>Have a question, correction, or suggestion? We&apos;d love to hear from you.</p>
      <p>
        <strong>Email:</strong>{' '}
        <a href="mailto:contact@pakistanlawreports.com">contact@pakistanlawreports.com</a>
      </p>
      <p>
        We try to respond to genuine inquiries as quickly as we can. Please note we cannot provide
        legal advice or represent you in any legal matter — for that, please consult a licensed
        advocate.
      </p>
      <p>
        If you&apos;ve found an error in a judgment listing, or believe content should be removed
        or corrected, please email us with details and we&apos;ll look into it promptly.
      </p>
    </div>
  );
}

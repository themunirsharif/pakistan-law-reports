import { Lora, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const display = Lora({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://pakistanlawreports.com'),
  title: {
    default: 'Pakistan Law Reports — Free Pakistani Case Law & Judgments',
    template: '%s | Pakistan Law Reports',
  },
  description:
    'A free, searchable archive of Pakistani case law and judgments from the Supreme Court and High Courts of Pakistan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <div className="site-shell">
          <header className="site-header">
            <a href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 60 60" width="34" height="34">
                  <circle cx="30" cy="30" r="28" fill="var(--navy)" />
                  <line x1="30" y1="16" x2="30" y2="42" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="20" x2="44" y2="20" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="30" cy="17" r="2" fill="var(--gold)" />
                  <path d="M16 20 L12 32 Q16 40 20 32 Z" fill="none" stroke="var(--gold)" strokeWidth="1.3" />
                  <path d="M44 20 L40 32 Q44 40 48 32 Z" fill="none" stroke="var(--gold)" strokeWidth="1.3" />
                  <rect x="24" y="41" width="12" height="4" rx="1" fill="var(--gold)" />
                </svg>
              </span>
              <span className="brand-text">
                <span className="brand-name">Pakistan Law Reports</span>
                <span className="brand-tag">Judgments &amp; Pakistani case law</span>
              </span>
            </a>
            <nav className="site-nav">
              <a href="/">Search</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </nav>
          </header>

          <main>{children}</main>

          <footer className="site-footer">
            <div className="footer-inner">
              <p>Pakistan Law Reports — a free public resource for Pakistani case law and judgments.</p>
              <nav className="footer-nav">
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy Policy</a>
              </nav>
              <p className="footer-fine">
                Judgments are provided for informational purposes only and do not constitute legal advice.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

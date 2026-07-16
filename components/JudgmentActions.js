'use client';

import { useState } from 'react';

export default function JudgmentActions({ title, citation, court, year, url }) {
  const [copied, setCopied] = useState(false);

  const citationText = [title, citation, court, year].filter(Boolean).join(' — ');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail in some browser contexts - fail silently
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${citationText}\n${url}`)}`;

  return (
    <div className="judgment-actions">
      <button type="button" className="action-btn" onClick={copyToClipboard}>
        {copied ? '✓ Copied' : '📋 Copy citation'}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="action-btn whatsapp"
      >
        Share on WhatsApp
      </a>
      <button type="button" className="action-btn" onClick={() => window.print()}>
        🖨️ Print
      </button>
    </div>
  );
}

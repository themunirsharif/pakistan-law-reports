'use client';

import { useState } from 'react';

// Replace this with your actual Formspree form ID once created (see setup instructions)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdnypvk';

export default function LawyerSubmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.target;
    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        let detail = '';
        try {
          const body = await res.json();
          if (body?.errors?.length) {
            detail = body.errors.map((er) => er.message).join('; ');
          } else if (body?.error) {
            detail = body.error;
          }
        } catch {
          // response wasn't JSON - fall through to generic message
        }
        setError(
          detail
            ? `Submission failed: ${detail}`
            : `Submission failed (status ${res.status}). Please try again, or email contact@pakistanlawreports.com directly.`
        );
      }
    } catch (networkErr) {
      setError(`Network error: ${networkErr.message}. Please try again, or email contact@pakistanlawreports.com directly.`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          padding: 24, background: 'var(--paper-raised)', border: '1px solid var(--line)',
          borderRadius: 3, textAlign: 'center',
        }}
      >
        <p style={{ marginBottom: 0 }}>
          <strong>Thanks — your submission has been received.</strong> We review every submission
          (including verifying your license number) before it&apos;s published. If approved,
          your profile will appear in the directory soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <p style={{ marginBottom: 20, fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
        Every submission is reviewed — including verifying your license number — before
        publishing. Nothing goes live automatically.
      </p>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 10, borderRadius: 3, marginBottom: 16, fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <div className="form-row">
        <label>Full Name *</label>
        <input type="text" name="name" required />
      </div>
      <div className="form-row">
        <label>City *</label>
        <input type="text" name="city" required />
      </div>
      <div className="form-row">
        <label>Practice Area *</label>
        <input type="text" name="practice_area" required placeholder="e.g. Family Law, Criminal Defense" />
      </div>
      <div className="form-row">
        <label>Bar Council License / Registration Number *</label>
        <input type="text" name="license_number" required />
      </div>
      <div className="form-row">
        <label>Email *</label>
        <input type="email" name="email" required />
      </div>
      <div className="form-row">
        <label>Phone (optional, shown on your public profile if provided)</label>
        <input type="text" name="phone" />
      </div>
      <div className="form-row">
        <label>Photo</label>
        <input type="file" name="photo" accept="image/*" />
      </div>
      <div className="form-row">
        <label>Short Bio / Notable Achievements (self-reported)</label>
        <textarea name="bio" placeholder="This will be shown as self-reported, not independently verified." />
      </div>
      <div className="form-row">
        <label>Case Citations You&apos;d Like Included (optional, one per line)</label>
        <textarea name="case_citations" placeholder="e.g. PLD 2020 Lahore 716" />
      </div>

      <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '10px 28px' }}>
        {loading ? 'Submitting...' : 'Submit for Review'}
      </button>
    </form>
  );
}

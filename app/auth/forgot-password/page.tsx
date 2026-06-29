'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/* ─────────────────────────────────────────────
   Styles — scoped under .rp-fp-root
   Reuses the same RotaPay design tokens as
   the registration page for visual consistency.
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

  /* ── Design tokens ── */
  .rp-fp-root {
    --rp-primary:            #005ea3;
    --rp-secondary:          #006d30;
    --rp-tertiary:           #006a44;
    --rp-error:              #ba1a1a;
    --rp-surface:            #fbf9f8;
    --rp-surface-container:  #efeded;
    --rp-surface-high:       #eae8e7;
    --rp-surface-lowest:     #ffffff;
    --rp-on-surface:         #1b1c1c;
    --rp-on-surface-var:     #404752;
    --rp-outline:            #707783;
    --rp-outline-var:        #c0c7d4;
    --rp-gradient:           linear-gradient(135deg, #005ea3 0%, #006d30 100%);
  }

  .dark .rp-fp-root,
  .rp-fp-root.dark {
    --rp-surface:            #1b1c1c;
    --rp-surface-container:  #252626;
    --rp-surface-high:       #2e2f2f;
    --rp-surface-lowest:     #141515;
    --rp-on-surface:         #e3e2e1;
    --rp-on-surface-var:     #c4c6d0;
    --rp-outline:            #8d9199;
    --rp-outline-var:        #44474f;
    --rp-primary:            #a0c9ff;
    --rp-secondary:          #6aff90;
  }

  /* ── Base ── */
  .rp-fp-root * {
    font-family: 'Montserrat', sans-serif;
    box-sizing: border-box;
  }

  /* ── Page shell ── */
  .rp-fp-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--rp-surface-lowest);
    padding: 24px 16px;
  }

  /* ── Logo block ── */
  .rp-fp-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 32px;
  }

  .rp-fp-logo-icon {
    width: 44px;
    height: 44px;
    background: var(--rp-gradient);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    flex-shrink: 0;
  }

  .rp-fp-logo-text {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--rp-on-surface);
  }

  .rp-fp-tagline {
    display: block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--rp-on-surface-var);
    margin-top: 2px;
  }

  /* ── Card ── */
  .rp-fp-card {
    width: 100%;
    max-width: 440px;
    background: var(--rp-surface-lowest);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 16px;
    padding: 36px 28px 28px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  }

  /* ── Typography ── */
  .rp-fp-heading {
    font-size: 22px;
    font-weight: 700;
    color: var(--rp-on-surface);
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }

  .rp-fp-subheading {
    font-size: 14px;
    color: var(--rp-on-surface-var);
    margin: 0 0 24px;
    font-weight: 400;
    line-height: 1.5;
  }

  .rp-fp-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--rp-on-surface-var);
    margin-bottom: 6px;
  }

  /* ── Input ── */
  .rp-fp-input-wrap {
    position: relative;
    margin-bottom: 20px;
  }

  .rp-fp-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--rp-outline);
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .rp-fp-input {
    width: 100%;
    padding: 11px 12px 11px 38px;
    background: var(--rp-surface-container);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Montserrat', sans-serif;
    color: var(--rp-on-surface);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .rp-fp-input:focus {
    border-color: var(--rp-primary);
    box-shadow: 0 0 0 3px rgba(0, 94, 163, 0.12);
  }

  .dark .rp-fp-input:focus {
    box-shadow: 0 0 0 3px rgba(160, 201, 255, 0.15);
  }

  .rp-fp-input::placeholder {
    color: var(--rp-outline);
  }

  .rp-fp-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ── Submit button ── */
  .rp-fp-btn {
    width: 100%;
    padding: 13px;
    background: var(--rp-gradient);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Montserrat', sans-serif;
    letter-spacing: 0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 14px rgba(0, 94, 163, 0.22);
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    margin-bottom: 20px;
  }

  .rp-fp-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 94, 163, 0.3);
  }

  .rp-fp-btn:active:not(:disabled) {
    transform: scale(0.99);
  }

  .rp-fp-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* ── Divider ── */
  .rp-fp-divider {
    border-top: 1px solid var(--rp-outline-var);
    padding-top: 20px;
    text-align: center;
  }

  /* ── Back link ── */
  .rp-fp-back {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 600;
    color: var(--rp-primary);
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .rp-fp-back:hover {
    opacity: 0.75;
    text-decoration: underline;
  }

  /* ── Success state ── */
  .rp-fp-success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(0, 109, 48, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: var(--rp-secondary);
  }

  .dark .rp-fp-success-icon {
    background: rgba(106, 255, 144, 0.12);
  }

  .rp-fp-success-email {
    font-size: 14px;
    font-weight: 700;
    color: var(--rp-on-surface);
    margin: 4px 0 12px;
    word-break: break-all;
  }

  .rp-fp-success-hint {
    font-size: 13px;
    color: var(--rp-on-surface-var);
    line-height: 1.65;
    margin: 0 0 28px;
  }

  /* ── Responsive ── */
  @media (min-width: 480px) {
    .rp-fp-card {
      padding: 40px 36px 32px;
    }
  }

  /* ── Spin animation ── */
  @keyframes rp-spin {
    to { transform: rotate(360deg); }
  }
  .rp-spin {
    animation: rp-spin 0.8s linear infinite;
  }
`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    const result = await requestPasswordReset(email);
    if (result.success) {
      setIsSubmitted(true);
    }
    setIsLoading(false);
  };

  return (
    <>
      <style>{styles}</style>

      <div className="rp-fp-root">
        <div className="rp-fp-shell">

          {/* Logo */}
          <div className="rp-fp-logo">
            <img
              src="/rotapay-logo.png"
              alt="RotaPay Logo"
              style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Card */}
          <div className="rp-fp-card">

            {!isSubmitted ? (
              /* ── Request form ── */
              <>
                <h1 className="rp-fp-heading">Reset Password</h1>
                <p className="rp-fp-subheading">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <label htmlFor="email" className="rp-fp-label">Email Address</label>
                  <div className="rp-fp-input-wrap">
                    <span className="rp-fp-input-icon">
                      <Mail size={16} aria-hidden="true" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      className="rp-fp-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="rp-fp-btn"
                    disabled={isLoading || !email}
                  >
                    {isLoading && (
                      <Loader2 size={16} className="rp-spin" aria-hidden="true" />
                    )}
                    {isLoading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              /* ── Success state ── */
              <>
                <div style={{ textAlign: 'center' }}>
                  <div className="rp-fp-success-icon">
                    <CheckCircle2 size={32} aria-hidden="true" />
                  </div>
                  <h1 className="rp-fp-heading">Check Your Email</h1>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--rp-on-surface-var)',
                      margin: '4px 0 4px',
                    }}
                  >
                    We&apos;ve sent a reset link to
                  </p>
                  <p className="rp-fp-success-email">{email}</p>
                  <p className="rp-fp-success-hint">
                    Click the link in your email to reset your password. If you don&apos;t see it,
                    check your spam folder.
                  </p>
                </div>
              </>
            )}

            {/* Back to sign in — always visible */}
            <div className="rp-fp-divider">
              <Link href="/auth/login" className="rp-fp-back">
                <ArrowLeft size={14} aria-hidden="true" />
                Back to sign in
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
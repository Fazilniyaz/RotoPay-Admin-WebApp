'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

  /* ── Tokens ── */
  .rp-ve-root {
    --rp-primary:           #005ea3;
    --rp-secondary:         #006d30;
    --rp-error:             #ba1a1a;
    --rp-error-container:   #ffdad6;
    --rp-surface:           #fbf9f8;
    --rp-surface-container: #efeded;
    --rp-surface-lowest:    #ffffff;
    --rp-surface-high:      #eae8e7;
    --rp-on-surface:        #1b1c1c;
    --rp-on-surface-var:    #404752;
    --rp-outline:           #707783;
    --rp-outline-var:       #c0c7d4;
    --rp-gradient:          linear-gradient(135deg, #007BD2 0%, #37D36B 100%);
  }

  .dark .rp-ve-root,
  .rp-ve-root.dark {
    --rp-surface:           #1b1c1c;
    --rp-surface-container: #252626;
    --rp-surface-lowest:    #141515;
    --rp-surface-high:      #2e2f2f;
    --rp-on-surface:        #e3e2e1;
    --rp-on-surface-var:    #c4c6d0;
    --rp-outline:           #8d9199;
    --rp-outline-var:       #44474f;
    --rp-primary:           #a0c9ff;
    --rp-secondary:         #6aff90;
    --rp-error:             #ffb4ab;
    --rp-error-container:   #93000a;
  }

  /* ── Base ── */
  .rp-ve-root * {
    font-family: 'Montserrat', sans-serif;
    box-sizing: border-box;
  }

  /* ── Page ── */
  .rp-ve-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #F7F9FC;
  }

  .dark .rp-ve-page {
    background: var(--rp-surface);
  }

  /* ── Ambient blobs ── */
  .rp-ve-blob {
    position: fixed;
    z-index: 0;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    pointer-events: none;
  }

  .rp-ve-blob-1 {
    width: 380px;
    height: 380px;
    top: -96px;
    left: -96px;
    background: #a0c9ff;
  }

  .rp-ve-blob-2 {
    width: 500px;
    height: 500px;
    bottom: -192px;
    right: -96px;
    background: #49e177;
  }

  /* ── Header ── */
  .rp-ve-header {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 50;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: rgba(251, 249, 248, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  .dark .rp-ve-header {
    background: rgba(27, 28, 28, 0.88);
  }

  .rp-ve-header-logo {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--rp-primary);
    text-decoration: none;
  }

  .rp-ve-header-help {
    font-size: 13px;
    font-weight: 600;
    color: var(--rp-on-surface-var);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
  }

  .rp-ve-header-help:hover { color: var(--rp-primary); }

  /* ── Main ── */
  .rp-ve-main {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 96px 20px 48px;
  }

  .rp-ve-inner {
    width: 100%;
    max-width: 480px;
    animation: rp-ve-fade-up 0.8s ease-out forwards;
  }

  /* ── Card ── */
  .rp-ve-card {
    background: var(--rp-surface-lowest);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 16px;
    padding: 32px 24px;
    box-shadow: 0 8px 32px -4px rgba(0, 123, 210, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* ── Logo inside card ── */
  .rp-ve-card-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 28px;
    width: 100%;
  }

  .rp-ve-logo-icon {
    width: 52px;
    height: 52px;
    background: var(--rp-gradient);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 28px;
    box-shadow: 0 6px 20px rgba(0,123,210,0.22);
    flex-shrink: 0;
  }

  .rp-ve-logo-text {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--rp-primary);
  }

  /* ── Status icon circle ── */
  .rp-ve-status-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  .rp-ve-status-icon--success {
    background: rgba(0, 109, 48, 0.10);
    color: var(--rp-secondary);
  }

  .dark .rp-ve-status-icon--success {
    background: rgba(106, 255, 144, 0.13);
    color: var(--rp-secondary);
  }

  .rp-ve-status-icon--error {
    background: var(--rp-error-container);
    color: var(--rp-error);
  }

  .dark .rp-ve-status-icon--error {
    background: rgba(186, 26, 26, 0.18);
  }

  .rp-ve-status-icon--loading {
    background: rgba(0, 94, 163, 0.10);
    color: var(--rp-primary);
  }

  /* ── Headings ── */
  .rp-ve-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
    color: var(--rp-primary);
    margin: 0 0 10px;
  }

  .rp-ve-title--error {
    color: var(--rp-error);
  }

  .rp-ve-title--loading {
    color: var(--rp-on-surface);
  }

  .rp-ve-body {
    font-size: 15px;
    color: var(--rp-on-surface-var);
    line-height: 1.65;
    margin: 0 0 24px;
    padding: 0 4px;
  }

  /* ── Buttons ── */
  .rp-ve-btn-primary {
    width: 100%;
    padding: 14px;
    background: var(--rp-gradient);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(0,123,210,0.22);
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    text-decoration: none;
    margin-top: 8px;
  }

  .rp-ve-btn-primary:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 8px 22px rgba(0,123,210,0.28);
  }

  .rp-ve-btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .rp-ve-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .rp-ve-btn-outline {
    flex: 1;
    padding: 12px;
    background: transparent;
    color: var(--rp-primary);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: border-color 0.2s, background 0.2s;
    text-decoration: none;
  }

  .rp-ve-btn-outline:hover {
    border-color: var(--rp-primary);
    background: rgba(0, 94, 163, 0.05);
  }

  .rp-ve-btn-row {
    display: flex;
    gap: 10px;
    width: 100%;
    margin-top: 8px;
  }

  /* ── Back link (text link style) ── */
  .rp-ve-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--rp-primary);
    text-decoration: none;
    margin-top: 16px;
    transition: opacity 0.15s;
  }

  .rp-ve-back-link:hover { opacity: 0.75; text-decoration: underline; }

  /* ── Countdown ── */
  .rp-ve-divider {
    width: 100%;
    border-top: 1px solid var(--rp-outline-var);
    margin-top: 24px;
    padding-top: 16px;
  }

  .rp-ve-countdown {
    font-size: 13px;
    color: var(--rp-on-surface-var);
    line-height: 1.5;
  }

  .rp-ve-countdown-num {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    font-size: 15px;
    color: var(--rp-primary);
  }

  /* ── Support line ── */
  .rp-ve-support {
    font-size: 13px;
    color: var(--rp-on-surface-var);
  }

  .rp-ve-support a {
    color: var(--rp-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .rp-ve-support a:hover { text-decoration: underline; }

  /* ── Toast ── */
  .rp-ve-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--rp-surface-lowest);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 12px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    z-index: 100;
    opacity: 0;
    transition: transform 0.35s ease, opacity 0.35s ease;
    white-space: nowrap;
    font-size: 13px;
    font-weight: 600;
    color: var(--rp-on-surface);
  }

  .rp-ve-toast.rp-ve-toast--show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  .rp-ve-toast-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--rp-secondary);
    flex-shrink: 0;
  }

  /* ── Footer ── */
  .rp-ve-footer {
    position: relative;
    z-index: 1;
    padding: 28px 20px;
    background: var(--rp-surface);
    border-top: 1px solid var(--rp-outline-var);
  }

  .rp-ve-footer-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
  }

  .rp-ve-footer-brand {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--rp-primary);
  }

  .rp-ve-footer-links {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .rp-ve-footer-links a {
    font-size: 13px;
    color: var(--rp-on-surface-var);
    text-decoration: none;
    transition: color 0.2s;
  }

  .rp-ve-footer-links a:hover { color: var(--rp-primary); }

  .rp-ve-footer-copy {
    font-size: 12px;
    color: var(--rp-on-surface-var);
    opacity: 0.6;
  }

  /* ── Loading spinner ── */
  @keyframes rp-ve-spin {
    to { transform: rotate(360deg); }
  }
  .rp-ve-spin { animation: rp-ve-spin 0.9s linear infinite; }

  /* ── Fade up ── */
  @keyframes rp-ve-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Responsive ── */
  @media (min-width: 480px) {
    .rp-ve-card { padding: 36px 36px 28px; }
    .rp-ve-header { padding: 0 40px; }
  }

  @media (min-width: 768px) {
    .rp-ve-footer-inner { flex-direction: row; justify-content: space-between; text-align: left; }
  }
`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(6);
  const [isResending, setIsResending] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { verifyEmail, resendVerification } = useAuth();

  /* ── Verify on mount ── */
  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');

      if (!tokenFromUrl) {
        setStatus('error');
        setMessage('No verification token found. The link may be incomplete.');
        return;
      }

      try {
        const result = await verifyEmail(tokenFromUrl);
        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(result.message || 'Email verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Email verification failed. Please try again.');
      }
    };

    verify();
  }, [verifyEmail]);

  /* ── Countdown + redirect on success ── */
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      router.push('/auth/login');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, router]);

  /* ── Resend handler (error state) ── */
  const handleResend = async () => {
    setIsResending(true);
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email') ?? '';
    await resendVerification(email);
    setIsResending(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  return (
    <>
      <style>{styles}</style>

      <div className="rp-ve-root">
        <div className="rp-ve-page">

          {/* ── Ambient blobs ── */}
          <div aria-hidden="true">
            <div className="rp-ve-blob rp-ve-blob-1" />
            <div className="rp-ve-blob rp-ve-blob-2" />
          </div>

          {/* ── Header ── */}
          <header className="rp-ve-header">
            <Link href="/" className="rp-ve-header-logo">RotaPay</Link>
            <a href="#" className="rp-ve-header-help">Need help?</a>
          </header>

          {/* ── Main ── */}
          <main className="rp-ve-main">
            <div className="rp-ve-inner">
              <div className="rp-ve-card">

                {/* Logo */}
                <div className="rp-ve-card-logo">
                  <img
                    src="/rotapay-logo.png"
                    alt="RotaPay Logo"
                    style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
                  />
                </div>

                {/* ── LOADING ── */}
                {status === 'loading' && (
                  <>
                    <div className="rp-ve-status-icon rp-ve-status-icon--loading">
                      <Loader2 size={38} className="rp-ve-spin" aria-label="Verifying" />
                    </div>
                    <h1 className="rp-ve-title rp-ve-title--loading">Verifying Email…</h1>
                    <p className="rp-ve-body">
                      Please wait while we verify your email address.
                    </p>
                  </>
                )}

                {/* ── SUCCESS ── */}
                {status === 'success' && (
                  <>
                    <div className="rp-ve-status-icon rp-ve-status-icon--success">
                      {/* SVG check_circle filled */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z" />
                      </svg>
                    </div>

                    <h1 className="rp-ve-title">Verification Successful</h1>
                    <p className="rp-ve-body">
                      Your email has been verified. You can now sign in to your account.
                    </p>

                    <Link href="/auth/login" className="rp-ve-btn-primary">
                      Back to Sign In
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>

                    {/* Countdown */}
                    <div className="rp-ve-divider">
                      <p className="rp-ve-countdown">
                        Redirecting to login in{' '}
                        <span className="rp-ve-countdown-num">{countdown}</span>{' '}
                        second{countdown !== 1 ? 's' : ''}…
                      </p>
                    </div>
                  </>
                )}

                {/* ── ERROR ── */}
                {status === 'error' && (
                  <>
                    <div className="rp-ve-status-icon rp-ve-status-icon--error">
                      {/* SVG error filled */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                    </div>

                    <h1 className="rp-ve-title rp-ve-title--error">Verification Failed</h1>
                    <p className="rp-ve-body">{message}</p>

                    {/* Resend CTA */}
                    <button
                      type="button"
                      className="rp-ve-btn-primary"
                      onClick={handleResend}
                      disabled={isResending}
                    >
                      {isResending
                        ? <><Loader2 size={16} className="rp-ve-spin" aria-hidden="true" /> Sending…</>
                        : <><Send size={16} aria-hidden="true" /> Resend Verification Email</>
                      }
                    </button>

                    {/* Secondary actions */}
                    <div className="rp-ve-btn-row">
                      <Link href="/auth/login" className="rp-ve-btn-outline">
                        <ArrowLeft size={14} aria-hidden="true" />
                        Back to Login
                      </Link>
                      <Link href="/auth/register" className="rp-ve-btn-outline">
                        Create Account
                      </Link>
                    </div>

                    {/* Support */}
                    <div className="rp-ve-divider">
                      <p className="rp-ve-support">
                        Still having trouble? <a href="#">Contact Support</a>
                      </p>
                    </div>
                  </>
                )}

              </div>
            </div>
          </main>

          {/* ── Footer ── */}
          <footer className="rp-ve-footer">
            <div className="rp-ve-footer-inner">
              <span className="rp-ve-footer-brand">RotaPay</span>
              <div className="rp-ve-footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Security</a>
              </div>
              <p className="rp-ve-footer-copy">© 2024 RotaPay Financial Systems. All rights reserved.</p>
            </div>
          </footer>

        </div>

        {/* ── Toast notification ── */}
        <div
          className={`rp-ve-toast${toastVisible ? ' rp-ve-toast--show' : ''}`}
          role="status"
          aria-live="polite"
        >
          <div className="rp-ve-toast-dot" aria-hidden="true" />
          Verification email sent successfully.
        </div>

      </div>
    </>
  );
}
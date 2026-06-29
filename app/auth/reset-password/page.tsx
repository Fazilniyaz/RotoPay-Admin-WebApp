'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, Check, X, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/* ─────────────────────────────────────────────
   Strength calculator (matches Stitch logic:
   +25 per criterion → 4 levels)
───────────────────────────────────────────── */
function calcStrength(p: string) {
  let score = 0;
  if (p.length >= 8) score += 25;
  if (p.match(/[a-z]/) && p.match(/[A-Z]/)) score += 25;
  if (p.match(/\d/)) score += 25;
  if (p.match(/[^a-zA-Z\d]/)) score += 25;
  return score;
}

function strengthMeta(score: number): { label: string; color: string } {
  if (score <= 25) return { label: 'Weak', color: '#ba1a1a' };
  if (score <= 50) return { label: 'Fair', color: '#ff8c00' };
  if (score <= 75) return { label: 'Good', color: '#005ea3' };
  return { label: 'Strong', color: '#006d30' };
}

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

  /* ── Tokens ── */
  .rp-rp-root {
    --rp-primary:           #005ea3;
    --rp-secondary:         #006d30;
    --rp-error:             #ba1a1a;
    --rp-surface:           #fbf9f8;
    --rp-surface-container: #efeded;
    --rp-surface-high:      #eae8e7;
    --rp-surface-highest:   #e4e2e2;
    --rp-surface-lowest:    #ffffff;
    --rp-on-surface:        #1b1c1c;
    --rp-on-surface-var:    #404752;
    --rp-outline:           #707783;
    --rp-outline-var:       #c0c7d4;
    --rp-gradient:          linear-gradient(135deg, #005ea3 0%, #006d30 100%);
    --rp-success:           #006d30;
  }

  .dark .rp-rp-root,
  .rp-rp-root.dark {
    --rp-surface:           #1b1c1c;
    --rp-surface-container: #252626;
    --rp-surface-high:      #2e2f2f;
    --rp-surface-highest:   #363737;
    --rp-surface-lowest:    #141515;
    --rp-on-surface:        #e3e2e1;
    --rp-on-surface-var:    #c4c6d0;
    --rp-outline:           #8d9199;
    --rp-outline-var:       #44474f;
    --rp-primary:           #a0c9ff;
    --rp-secondary:         #6aff90;
    --rp-success:           #6aff90;
  }

  /* ── Base ── */
  .rp-rp-root * {
    font-family: 'Montserrat', sans-serif;
    box-sizing: border-box;
  }

  /* ── Shell ── */
  .rp-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--rp-surface-lowest);
    padding: 32px 20px;
  }

  /* ── Logo ── */
  .rp-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 28px;
    animation: rp-slide-up 0.5s ease-out forwards;
  }

  .rp-logo-icon {
    width: 64px;
    height: 64px;
    background: var(--rp-gradient);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0, 94, 163, 0.28);
    margin-bottom: 10px;
    color: #fff;
    font-size: 32px;
  }

  .rp-logo-name {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--rp-primary);
  }

  /* ── Card ── */
  .rp-card {
    width: 100%;
    max-width: 480px;
    background: rgba(255, 255, 255, 0.90);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 16px;
    padding: 32px 28px 24px;
    box-shadow: 0 8px 32px rgba(0, 123, 210, 0.10);
    animation: rp-slide-up 0.5s ease-out forwards;
    transition: border-color 0.4s, box-shadow 0.4s;
    overflow: hidden;
  }

  .dark .rp-card {
    background: rgba(36, 37, 37, 0.92);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  }

  .rp-card.rp-card--success {
    border-color: rgba(0, 109, 48, 0.4);
    box-shadow: 0 8px 32px rgba(0, 109, 48, 0.15);
  }

  /* ── Card header ── */
  .rp-card-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .rp-heading {
    font-size: 22px;
    font-weight: 700;
    color: var(--rp-on-surface);
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }

  .rp-subheading {
    font-size: 14px;
    color: var(--rp-on-surface-var);
    margin: 0;
    line-height: 1.5;
    font-weight: 400;
  }

  /* ── Label ── */
  .rp-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--rp-on-surface-var);
    margin-bottom: 6px;
  }

  /* ── Input ── */
  .rp-field {
    margin-bottom: 16px;
  }

  .rp-input-wrap {
    position: relative;
  }

  .rp-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--rp-outline);
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .rp-input {
    width: 100%;
    padding: 12px 44px 12px 38px;
    background: var(--rp-surface-lowest);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Montserrat', sans-serif;
    color: var(--rp-on-surface);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .dark .rp-input {
    background: var(--rp-surface-container);
  }

  .rp-input:focus {
    border-color: var(--rp-primary);
    box-shadow: 0 0 0 4px rgba(0, 94, 163, 0.10);
  }

  .dark .rp-input:focus {
    box-shadow: 0 0 0 4px rgba(160, 201, 255, 0.13);
  }

  .rp-input::placeholder {
    color: var(--rp-outline);
  }

  .rp-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .rp-eye-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--rp-outline);
    display: flex;
    align-items: center;
    padding: 2px;
    transition: color 0.2s;
  }

  .rp-eye-btn:hover { color: var(--rp-primary); }

  /* ── Strength bar (Stitch style: single bar) ── */
  .rp-strength-wrap {
    margin-top: 8px;
  }

  .rp-strength-track {
    height: 6px;
    width: 100%;
    background: var(--rp-surface-highest);
    border-radius: 999px;
    overflow: hidden;
  }

  .rp-strength-fill {
    height: 100%;
    width: 0%;
    border-radius: 999px;
    transition: width 0.3s ease, background-color 0.3s ease;
  }

  .rp-strength-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    align-items: center;
  }

  .rp-strength-hint {
    font-size: 12px;
    color: var(--rp-on-surface-var);
    font-weight: 400;
  }

  .rp-strength-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* ── Checklist (existing functionality) ── */
  .rp-checklist {
    background: var(--rp-surface-container);
    border-left: 3px solid var(--rp-primary);
    border-radius: 0 8px 8px 0;
    padding: 12px 14px;
    margin-bottom: 16px;
    margin-top: -4px;
  }

  .dark .rp-checklist {
    background: var(--rp-surface-high);
  }

  .rp-checklist-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--rp-on-surface-var);
    margin: 0 0 10px;
  }

  .rp-check-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .rp-check-row:last-child { margin-bottom: 0; }

  /* ── Submit button ── */
  .rp-btn {
    width: 100%;
    padding: 14px;
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
    box-shadow: 0 4px 16px rgba(0, 94, 163, 0.24);
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    margin-top: 8px;
    margin-bottom: 20px;
  }

  .rp-btn:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 6px 22px rgba(0, 94, 163, 0.32);
  }

  .rp-btn:active:not(:disabled) { transform: scale(0.98); }

  .rp-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* ── Footer link ── */
  .rp-footer-link {
    border-top: 1px solid var(--rp-outline-var);
    padding-top: 16px;
    text-align: center;
  }

  .rp-back-link {
    font-size: 13px;
    font-weight: 600;
    color: var(--rp-primary);
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .rp-back-link:hover {
    opacity: 0.75;
    text-decoration: underline;
  }

  /* ── Card footer (outside card) ── */
  .rp-page-footer {
    margin-top: 20px;
    text-align: center;
    font-size: 13px;
    color: var(--rp-on-surface-var);
    animation: rp-slide-up 0.5s ease-out forwards;
  }

  .rp-page-footer a {
    color: var(--rp-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .rp-page-footer a:hover { text-decoration: underline; }

  /* ── Success state ── */
  .rp-success-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 8px 0 16px;
  }

  .rp-success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(106, 255, 144, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: var(--rp-success);
  }

  .rp-success-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--rp-on-surface);
    margin: 0 0 10px;
  }

  .rp-success-desc {
    font-size: 14px;
    color: var(--rp-on-surface-var);
    margin: 0 0 28px;
    line-height: 1.65;
  }

  .rp-signin-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
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
    text-decoration: none;
    box-shadow: 0 4px 16px rgba(0, 94, 163, 0.22);
    transition: opacity 0.2s, transform 0.2s;
  }

  .rp-signin-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .rp-redirect-note {
    font-size: 12px;
    color: var(--rp-on-surface-var);
    margin-top: 12px;
  }

  /* ── Animation ── */
  @keyframes rp-slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes rp-spin {
    to { transform: rotate(360deg); }
  }

  .rp-spin { animation: rp-spin 0.8s linear infinite; }

  /* ── Responsive ── */
  @media (min-width: 480px) {
    .rp-card { padding: 36px 36px 28px; }
  }
`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
  }, []);

  /* Strength (Stitch-style 0–100 score) */
  const score = calcStrength(password);
  const { label: strengthLabel, color: strengthColor } = strengthMeta(score);

  /* Detailed checklist (existing functionality) */
  const checks = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
  const isStrong = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert('Invalid or expired reset link. Please request a new one.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!isStrong) {
      alert('Password does not meet strength requirements');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token, password);
    if (result.success) {
      setIsSubmitted(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    }
    setIsLoading(false);
  };

  return (
    <>
      <style>{styles}</style>

      <div className="rp-rp-root">
        <div className="rp-shell">

          {/* Logo */}
          <div className="rp-logo">
            <img
              src="/rotapay-logo.png"
              alt="RotaPay Logo"
              style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Card */}
          <div className={`rp-card${isSubmitted ? ' rp-card--success' : ''}`}>

            {!isSubmitted ? (
              /* ── Reset form ── */
              <>
                <div className="rp-card-header">
                  <h1 className="rp-heading">Set New Password</h1>
                  <p className="rp-subheading">Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>

                  {/* New Password */}
                  <div className="rp-field">
                    <label htmlFor="password" className="rp-label">New Password</label>
                    <div className="rp-input-wrap">
                      <span className="rp-input-icon"><Lock size={16} aria-hidden="true" /></span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="rp-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="rp-eye-btn"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Stitch-style single strength bar */}
                    {password.length > 0 && (
                      <div className="rp-strength-wrap">
                        <div className="rp-strength-track">
                          <div
                            className="rp-strength-fill"
                            style={{ width: `${score}%`, backgroundColor: strengthColor }}
                          />
                        </div>
                        <div className="rp-strength-meta">
                          <span className="rp-strength-hint">Password strength</span>
                          <span className="rp-strength-label" style={{ color: strengthColor }}>
                            {strengthLabel}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed checklist (existing functionality) */}
                  {password.length > 0 && (
                    <div className="rp-checklist">
                      <p className="rp-checklist-title">Requirements</p>
                      {([
                        ['hasLength', 'At least 8 characters'],
                        ['hasUpper', 'One uppercase letter'],
                        ['hasLower', 'One lowercase letter'],
                        ['hasNumber', 'One number'],
                      ] as const).map(([key, label]) => {
                        const passed = checks[key];
                        return (
                          <div key={key} className="rp-check-row">
                            {passed
                              ? <Check size={13} style={{ color: 'var(--rp-success)', flexShrink: 0 }} />
                              : <X size={13} style={{ color: 'var(--rp-outline)', flexShrink: 0 }} />
                            }
                            <span style={{ color: passed ? 'var(--rp-on-surface)' : 'var(--rp-on-surface-var)' }}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="rp-field">
                    <label htmlFor="confirmPassword" className="rp-label">Confirm New Password</label>
                    <div className="rp-input-wrap">
                      <span className="rp-input-icon"><Lock size={16} aria-hidden="true" /></span>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="rp-input"
                        style={{ paddingRight: '12px' }}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="rp-btn"
                    disabled={isLoading || !password || !confirmPassword || !isStrong}
                  >
                    {isLoading && <Loader2 size={16} className="rp-spin" aria-hidden="true" />}
                    {isLoading ? 'Resetting…' : 'Reset Password'}
                  </button>

                </form>

                {/* Back link */}
                <div className="rp-footer-link">
                  <Link href="/auth/login" className="rp-back-link">
                    Back to sign in
                  </Link>
                </div>
              </>
            ) : (
              /* ── Success state (Stitch style) ── */
              <div className="rp-success-body">
                <div className="rp-success-icon">
                  <CheckCircle2 size={44} aria-hidden="true" />
                </div>
                <h2 className="rp-success-title">Password Reset Successfully!</h2>
                <p className="rp-success-desc">
                  Your credentials have been updated. You can now sign in with your new password.
                </p>
                <Link href="/auth/login" className="rp-signin-btn">
                  Go to Sign In
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <p className="rp-redirect-note">Redirecting automatically in a few seconds…</p>
              </div>
            )}

          </div>

          {/* Page footer */}
          <div className="rp-page-footer">
            Need help? <a href="#">Contact Support</a>
          </div>

        </div>
      </div>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

/* ─────────────────────────────────────────────
   Password strength helper
───────────────────────────────────────────── */
function getStrength(val: string): { level: number; label: string; color: string } {
  if (!val) return { level: 0, label: '', color: '' };
  const len = val.length;
  if (len > 12 && /[A-Z]/.test(val) && /[0-9]/.test(val))
    return { level: 4, label: 'Strong', color: 'var(--rp-secondary)' };
  if (len > 8)
    return { level: 3, label: 'Good', color: '#eab308' };
  if (len > 5)
    return { level: 2, label: 'Fair', color: '#f97316' };
  return { level: 1, label: 'Weak', color: '#ef4444' };
}

/* ─────────────────────────────────────────────
   Styles (scoped under .rp-root)
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

  /* ── Design tokens ── */
  :root {
    --rp-primary:           #005ea3;
    --rp-primary-dim:       #a0c9ff;
    --rp-secondary:         #006d30;
    --rp-tertiary:          #006a44;
    --rp-error:             #ba1a1a;
    --rp-surface:           #fbf9f8;
    --rp-surface-container: #efeded;
    --rp-surface-high:      #eae8e7;
    --rp-surface-highest:   #e4e2e2;
    --rp-surface-low:       #f5f3f3;
    --rp-surface-lowest:    #ffffff;
    --rp-on-surface:        #1b1c1c;
    --rp-on-surface-var:    #404752;
    --rp-outline:           #707783;
    --rp-outline-var:       #c0c7d4;
    --rp-gradient:          linear-gradient(135deg, #005ea3 0%, #006d30 100%);
  }

  .dark {
    --rp-surface:           #1b1c1c;
    --rp-surface-container: #252626;
    --rp-surface-high:      #2e2f2f;
    --rp-surface-highest:   #363737;
    --rp-surface-low:       #202121;
    --rp-surface-lowest:    #141515;
    --rp-on-surface:        #e3e2e1;
    --rp-on-surface-var:    #c4c6d0;
    --rp-outline:           #8d9199;
    --rp-outline-var:       #44474f;
    --rp-primary:           #a0c9ff;
    --rp-secondary:         #6aff90;
    --rp-tertiary:          #42e09c;
  }

  /* ── Root ── */
  .rp-root * {
    font-family: 'Montserrat', sans-serif;
    box-sizing: border-box;
  }

  /* ── Layout ── */
  .rp-layout {
    display: flex;
    min-height: 100vh;
    background: var(--rp-surface);
    color: var(--rp-on-surface);
  }

  /* ── Left Banner ── */
  .rp-banner {
    display: none;
  }

  .rp-banner-inner {
    background: var(--rp-gradient);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 44px;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .rp-banner-dots {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }

  .rp-banner-logo {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
  }

  .rp-banner-logo-icon {
    width: 48px;
    height: 48px;
    background: rgba(255,255,255,0.15);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .rp-banner-logo-text {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #fff;
  }

  .rp-banner-headline {
    position: relative;
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0 0 16px;
  }

  .rp-banner-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.85);
    line-height: 1.7;
    margin: 0;
  }

  .rp-feature-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
  }

  .rp-feature {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .rp-feature-icon {
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
  }

  .rp-feature-title {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 2px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .rp-feature-desc {
    font-size: 13px;
    color: rgba(255,255,255,0.75);
    margin: 0;
    line-height: 1.6;
  }

  .rp-banner-stats {
    position: relative;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(255,255,255,0.2);
    padding-top: 24px;
  }

  .rp-stat-num {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
    line-height: 1;
  }

  .rp-stat-label {
    font-size: 10px;
    color: rgba(255,255,255,0.65);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 4px;
  }

  /* ── Right form column ── */
  .rp-form-col {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background: var(--rp-surface-lowest);
  }

  /* ── Unverified banner ── */
  .rp-unverified-bar {
    background: #fff8e1;
    border-bottom: 1px solid #f59e0b44;
    padding: 12px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .dark .rp-unverified-bar {
    background: #2d2200;
    border-color: #78350f44;
  }

  .rp-unverified-bar-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .rp-unverified-msg {
    font-size: 13px;
    font-weight: 500;
    color: #92400e;
    line-height: 1.5;
  }

  .dark .rp-unverified-msg {
    color: #fbbf24;
  }

  .rp-resend-btn {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--rp-tertiary);
    border: 1px solid var(--rp-tertiary);
    border-radius: 8px;
    padding: 6px 14px;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .rp-resend-btn:hover {
    background: rgba(0,106,68,0.08);
  }

  /* ── Form inner ── */
  .rp-form-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
  }

  .rp-form-inner {
    width: 100%;
    max-width: 420px;
  }

  /* Mobile logo */
  .rp-mobile-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 28px;
  }

  .rp-mobile-logo-icon {
    width: 40px;
    height: 40px;
    background: var(--rp-gradient);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 22px;
  }

  .rp-mobile-logo-text {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--rp-primary);
  }

  /* Headings */
  .rp-heading {
    font-size: 26px;
    font-weight: 700;
    color: var(--rp-on-surface);
    margin: 0 0 4px;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .rp-subheading {
    font-size: 14px;
    color: var(--rp-on-surface-var);
    margin: 0 0 24px;
    font-weight: 400;
  }

  /* Fields */
  .rp-field {
    margin-bottom: 14px;
  }

  .rp-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--rp-on-surface-var);
    display: block;
    margin-bottom: 6px;
  }

  .rp-input-wrap {
    position: relative;
  }

  .rp-input-wrap .rp-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--rp-outline);
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .rp-input-wrap input,
  .rp-input-wrap .rp-input {
    width: 100%;
    padding: 11px 12px 11px 38px;
    background: var(--rp-surface-container);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Montserrat', sans-serif;
    color: var(--rp-on-surface);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    box-sizing: border-box;
  }

  .rp-input-wrap input:focus {
    border-color: var(--rp-primary);
    box-shadow: 0 0 0 3px rgba(0,94,163,0.12);
  }

  .dark .rp-input-wrap input:focus {
    box-shadow: 0 0 0 3px rgba(160,201,255,0.15);
  }

  .rp-input-wrap input::placeholder {
    color: var(--rp-outline);
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

  .rp-eye-btn:hover {
    color: var(--rp-primary);
  }

  .rp-confirm-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--rp-secondary);
    display: flex;
    align-items: center;
  }

  /* Strength meter */
  .rp-strength-bar {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .rp-strength-seg {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--rp-surface-high);
    transition: background 0.3s;
  }

  .rp-strength-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }

  .rp-strength-text {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .rp-min-chars {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--rp-error);
  }

  /* Terms */
  .rp-terms {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0 6px;
  }

  .rp-terms input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin-top: 2px;
    accent-color: var(--rp-primary);
    flex-shrink: 0;
  }

  .rp-terms-label {
    font-size: 13px;
    color: var(--rp-on-surface-var);
    line-height: 1.5;
  }

  .rp-terms-label a {
    color: var(--rp-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .rp-terms-label a:hover {
    text-decoration: underline;
  }

  /* Submit button */
  .rp-submit-btn {
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
    box-shadow: 0 4px 14px rgba(0,94,163,0.25);
    transition: transform 0.15s, box-shadow 0.15s;
    margin-bottom: 16px;
    text-decoration: none;
  }

  .rp-submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,94,163,0.3);
  }

  .rp-submit-btn:active {
    transform: scale(0.99);
  }

  .rp-submit-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  /* Divider */
  .rp-divider {
    position: relative;
    margin: 4px 0 14px;
    text-align: center;
  }

  .rp-divider::before {
    content: '';
    position: absolute;
    inset: 50% 0 auto;
    border-top: 1px solid var(--rp-outline-var);
  }

  .rp-divider span {
    position: relative;
    background: var(--rp-surface-lowest);
    padding: 0 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--rp-on-surface-var);
  }

  /* Google */
  .rp-google-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 18px;
  }

  .rp-google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: var(--rp-surface-lowest);
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 10px;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Montserrat', sans-serif;
    color: var(--rp-on-surface);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .rp-google-btn:hover {
    background: var(--rp-surface-container);
    border-color: var(--rp-outline);
  }

  /* Bottom link */
  .rp-bottom-link {
    text-align: center;
    font-size: 13px;
    color: var(--rp-on-surface-var);
    padding-top: 14px;
    border-top: 1px solid var(--rp-outline-var);
  }

  .rp-bottom-link a {
    color: var(--rp-primary);
    font-weight: 700;
    text-decoration: none;
  }

  .rp-bottom-link a:hover {
    text-decoration: underline;
  }

  /* ── Success screen ── */
  .rp-success-card {
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 16px;
    padding: 40px 32px;
    text-align: center;
    background: var(--rp-surface-lowest);
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }

  .rp-success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(0,109,48,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: var(--rp-secondary);
  }

  .dark .rp-success-icon {
    background: rgba(106,255,144,0.12);
    color: var(--rp-secondary);
  }

  .rp-success-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--rp-on-surface);
    margin: 0 0 8px;
  }

  .rp-success-email {
    font-size: 14px;
    font-weight: 600;
    color: var(--rp-on-surface);
    margin: 4px 0 16px;
  }

  .rp-success-hint {
    font-size: 13px;
    color: var(--rp-on-surface-var);
    margin: 0 0 28px;
    line-height: 1.6;
  }

  .rp-outline-btn {
    width: 100%;
    padding: 11px;
    background: transparent;
    border: 1.5px solid var(--rp-outline-var);
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Montserrat', sans-serif;
    color: var(--rp-on-surface);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 10px;
    transition: border-color 0.2s, background 0.2s;
  }

  .rp-outline-btn:hover {
    border-color: var(--rp-primary);
    background: var(--rp-surface-container);
  }

  .rp-outline-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Footer */
  .rp-footer {
    text-align: center;
    padding: 16px;
    border-top: 1px solid var(--rp-outline-var);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--rp-outline);
  }

  /* ── Responsive ── */
  @media (min-width: 768px) {
    .rp-banner {
      display: flex;
      width: 45%;
      min-width: 380px;
      max-width: 520px;
      min-height: 100vh;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
    }

    .rp-mobile-logo {
      display: none;
    }

    .rp-form-content {
      padding: 48px 48px;
    }

    .rp-footer {
      display: none;
    }

    .rp-unverified-bar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  @media (min-width: 1200px) {
    .rp-form-content {
      padding: 48px 72px;
    }
  }
`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const router = useRouter();
  const { register, resendVerification, googleLogin } = useAuth();

  const strength = getStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('unverified') === 'true') {
      const savedEmail = sessionStorage.getItem('unverifiedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setShowSuccess(true);
        sessionStorage.removeItem('unverifiedEmail');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }
    setIsLoading(true);
    const result = await register(email, password, displayName);
    if (result.success || result.isUnverified) {
      setShowSuccess(true);
    }
    setIsLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      router.push('/dashboard');
    } else if (result.isUnverified) {
      if (result.email) sessionStorage.setItem('unverifiedEmail', result.email);
      router.push('/auth/register?unverified=true');
    }
    setIsLoading(false);
  };

  const segColor = (idx: number) =>
    strength.level >= idx ? strength.color : 'var(--rp-surface-high)';

  /* ── Success screen ── */
  if (showSuccess) {
    return (
      <>
        <style>{styles}</style>
        <div
          className="rp-root"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--rp-surface)',
            padding: '24px 16px',
          }}
        >
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <div className="rp-success-card">
              <div className="rp-success-icon">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="rp-success-title">Check Your Email</h2>
              <p style={{ fontSize: '14px', color: 'var(--rp-on-surface-var)', margin: '0 0 4px' }}>
                We&apos;ve sent a verification link to
              </p>
              <p className="rp-success-email">{email}</p>
              <p className="rp-success-hint">
                Click the link in your email to verify your account and start using RotaPay.
              </p>

              <button
                className="rp-submit-btn"
                onClick={() => router.push('/auth/login')}
              >
                Back to Sign In
              </button>

              <button
                className="rp-outline-btn"
                disabled={isResending}
                onClick={async () => {
                  setIsResending(true);
                  await resendVerification(email);
                  setIsResending(false);
                }}
              >
                {isResending && <Loader2 size={16} className="animate-spin" />}
                {isResending ? 'Resending…' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Main registration page ── */
  return (
    <>
      <style>{styles}</style>
      <div className="rp-root rp-layout">

        {/* ── LEFT BANNER ── */}
        <div className="rp-banner">
          <div className="rp-banner-inner">
            <div className="rp-banner-dots" aria-hidden="true" />

            {/* Logo */}
            <div className="rp-banner-logo">
              <img
                src="/rotapay-logo.png"
                alt="RotaPay Icon"
                style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* Middle */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px', padding: '40px 0' }}>
              <div>
                <h2 className="rp-banner-headline">Financial precision,<br />delivered.</h2>
                <p className="rp-banner-sub">
                  Experience the future of high-performance payroll. Join professionals who demand clarity, speed, and effortless financial control.
                </p>
              </div>

              <div className="rp-feature-list">
                {[
                  { icon: '⚡', title: 'Real-time', desc: 'Instant shift tracking and live labour cost dashboards.' },
                  { icon: '🔒', title: 'Secure', desc: 'Bank-grade encryption protecting every transaction.' },
                  { icon: '📱', title: 'Mobile-first', desc: 'Clock in, swap shifts, and view payslips from any device.' },
                  { icon: '🌍', title: 'Multi-site', desc: 'Unlimited locations under one account with role-based access.' },
                ].map(({ icon, title, desc }) => (
                  <div className="rp-feature" key={title}>
                    <div className="rp-feature-icon">{icon}</div>
                    <div>
                      <p className="rp-feature-title">{title}</p>
                      <p className="rp-feature-desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="rp-banner-stats">
              {[['Free', '14-Day Trial'], ['No', 'Credit Card'], ['24/7', 'Support']].map(([num, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div className="rp-stat-num">{num}</div>
                  <div className="rp-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM COLUMN ── */}
        <div className="rp-form-col">

          {/* Unverified email banner — shown when redirected from login */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('unverified') === 'true' && (
            <div className="rp-unverified-bar">
              <div className="rp-unverified-bar-row">
                <AlertTriangle size={18} style={{ color: '#b45309', flexShrink: 0, marginTop: 1 }} />
                <p className="rp-unverified-msg">
                  Your email isn&apos;t verified yet. Check your inbox or resend the verification email.
                </p>
              </div>
              <button
                className="rp-resend-btn"
                onClick={async () => {
                  setIsResending(true);
                  await resendVerification(email);
                  setIsResending(false);
                }}
                disabled={isResending}
              >
                {isResending ? 'Resending…' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          <div className="rp-form-content">
            <div className="rp-form-inner">

              {/* Mobile logo */}
              <div className="rp-mobile-logo">
                <img
                  src="/rotapay-logo.png"
                  alt="RotaPay Icon"
                  style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
                />
              </div>

              <h1 className="rp-heading">Create Account</h1>
              <p className="rp-subheading">Join RotaPay and take control of your finances</p>

              <form onSubmit={handleSubmit} noValidate>

                {/* Full Name */}
                <div className="rp-field">
                  <label htmlFor="displayName" className="rp-label">
                    Full Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(Optional)</span>
                  </label>
                  <div className="rp-input-wrap">
                    <span className="rp-icon"><User size={16} /></span>
                    <input
                      id="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isLoading}
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="rp-field">
                  <label htmlFor="email" className="rp-label">Email Address</label>
                  <div className="rp-input-wrap">
                    <span className="rp-icon"><Mail size={16} /></span>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="rp-field">
                  <label htmlFor="password" className="rp-label">Password</label>
                  <div className="rp-input-wrap">
                    <span className="rp-icon"><Lock size={16} /></span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                      style={{ paddingRight: '40px' }}
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

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <>
                      <div className="rp-strength-bar">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="rp-strength-seg"
                            style={{ background: segColor(i) }}
                          />
                        ))}
                      </div>
                      <div className="rp-strength-meta">
                        <span
                          className="rp-strength-text"
                          style={{ color: strength.color }}
                        >
                          {strength.label}
                        </span>
                        <span className="rp-min-chars">Min. 8 chars</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="rp-field">
                  <label htmlFor="confirmPassword" className="rp-label">Confirm Password</label>
                  <div className="rp-input-wrap">
                    <span className="rp-icon"><Lock size={16} /></span>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    {passwordsMatch && (
                      <span className="rp-confirm-icon">
                        <CheckCircle2 size={18} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div className="rp-terms">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="terms" className="rp-terms-label">
                    I agree to the{' '}
                    <a href="#">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#">Privacy Policy</a>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="rp-submit-btn"
                  disabled={isLoading}
                  style={{ marginTop: '14px' }}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? 'Creating account…' : 'Create Account'}
                </button>

              </form>

              {/* Divider */}
              <div className="rp-divider">
                <span>Or sign up with</span>
              </div>

              {/* Google */}
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <div className="rp-google-wrap">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google sign-up failed')}
                    theme="outline"
                    size="large"
                    text="continue_with"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="rp-google-btn"
                  style={{ marginBottom: '18px' }}
                  onClick={() => toast.info('Google sign-up not configured')}
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5hTrSgfY15a5yzowdq1sENT0dP2LnWA18-Ofpa-3EP3hykLmJdcPnZdEFq1TG-eGF1UyZ7Y8niB7lGXZG3NeVtS_uF7SPvGqwp7QMJPJLQIUnBfzr8qBw2mfDNtXWd_OYB0XsVbsAuH7SwqKL1tIR3TQuf-yNVXwGD_sVmLhMB3sIwyYhJMJZtOdo8LQlZz5lhPZnjwBq5hmHIU-Junixm9q3VTFlj75AE9ofAZ6G1R8E3h-PnYvwFd5HkmY2zRRe07_iVHeUjI8"
                    alt="Google"
                    style={{ width: 18, height: 18 }}
                  />
                  Continue with Google
                </button>
              )}

              {/* Bottom link */}
              <div className="rp-bottom-link">
                Already have an account?{' '}
                <Link href="/auth/login">Sign in</Link>
              </div>

            </div>
          </div>

          {/* Mobile footer */}
          <footer className="rp-footer">© 2024 RotaPay Precision Payroll</footer>
        </div>

      </div>
    </>
  );
}
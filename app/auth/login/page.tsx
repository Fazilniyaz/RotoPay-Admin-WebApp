'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, Eye, EyeOff, Clock, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

const features = [
  {
    icon: Clock,
    title: 'Smart Rota Scheduling',
    desc: 'Build and publish rotas in minutes with drag-and-drop simplicity and conflict detection.',
  },
  {
    icon: TrendingUp,
    title: 'Automated Payroll',
    desc: 'Wages calculated automatically from shift data. No manual entry, no errors.',
  },
  {
    icon: Users,
    title: 'Team Management',
    desc: 'Manage contracts, availability, and absences in one place for your entire workforce.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance Ready',
    desc: 'Built-in Working Time Directive rules and pay compliance checks to keep you protected.',
  },
];

const stats = [
  { value: '2,400+', label: 'Businesses' },
  { value: '98%', label: 'Uptime SLA' },
  { value: '£0', label: 'Setup Fee' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in your credentials');
      return;
    }
    setIsLoading(true);
    const result = await login(email, password);
    if (result.success) {
      router.push('/dashboard');
    } else if (result.isUnverified) {
      sessionStorage.setItem('unverifiedEmail', email);
      router.push('/auth/register?unverified=true');
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

        .rp {
          --rp-blue:       #005EA3;
          --rp-blue-mid:   #007BD2;
          --rp-green:      #00C281;
          --rp-grad:       linear-gradient(160deg, #005EA3 0%, #007BD2 40%, #00C281 100%);
          --rp-btn-grad:   linear-gradient(90deg, #005EA3 0%, #00C281 100%);
          --rp-font:       'Montserrat', sans-serif;
          --rp-mono:       'JetBrains Mono', monospace;
          --rp-bg:         #F7F9FC;
          --rp-input-bg:   #ffffff;
          --rp-border:     #C0C7D4;
          --rp-border-foc: #005EA3;
          --rp-text:       #1B1C1C;
          --rp-muted:      #404752;
          --rp-subtle:     #707783;
          --rp-divider:    #E4E2E2;
          --rp-shadow:     0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
          --rp-shadow-lg:  0 4px 12px -2px rgba(0,123,210,0.28);
          --rp-focus-ring: rgba(0,94,163,0.18);
        }

        html.dark .rp,
        body.dark  .rp,
        .dark      .rp {
          --rp-bg:         #0F1117;
          --rp-input-bg:   #1E2130;
          --rp-border:     #2E3348;
          --rp-border-foc: #007BD2;
          --rp-text:       #E8EAF0;
          --rp-muted:      #9BA3BA;
          --rp-subtle:     #6B748A;
          --rp-divider:    #252839;
          --rp-shadow:     0 1px 3px rgba(0,0,0,0.35);
          --rp-shadow-lg:  0 4px 16px -2px rgba(0,123,210,0.35);
          --rp-focus-ring: rgba(0,123,210,0.25);
        }

        .rp * { font-family: var(--rp-font); box-sizing: border-box; }

        .rp {
          display: flex;
          min-height: 100dvh;
          background: var(--rp-bg);
          color: var(--rp-text);
        }

        .rp-banner {
          display: none;
          position: sticky;
          top: 0;
          height: 100dvh;
          overflow: hidden;
          width: 45%;
          min-width: 400px;
          max-width: 520px;
          flex-shrink: 0;
          background: var(--rp-grad);
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 44px;
        }
        @media (min-width: 960px) { .rp-banner { display: flex; } }

        .rp-blob { position: absolute; border-radius: 50%; pointer-events: none; }
        .rp-blob-1 { top:-80px; right:-80px; width:320px; height:320px; background:rgba(255,255,255,0.10); filter:blur(60px); }
        .rp-blob-2 { bottom:-80px; left:-80px; width:240px; height:240px; background:rgba(0,194,129,0.20); filter:blur(50px); }

        /* Pure-white logo on the gradient banner (crisp in light & dark themes). */
        .rp-banner-logo img { height:52px; width:auto; object-fit:contain; filter:brightness(0) invert(1); }
        .rp-banner-tagline  { margin-top:10px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:rgba(255,255,255,0.70); }
        .rp-banner-headline { font-size:26px; font-weight:800; color:#fff; line-height:1.25; margin:0 0 10px; }
        .rp-banner-sub      { font-size:13px; color:rgba(255,255,255,0.80); line-height:1.7; margin:0 0 28px; }

        .rp-feature { display:flex; gap:14px; align-items:flex-start; margin-bottom:20px; }
        .rp-feature:last-child { margin-bottom:0; }
        .rp-feature-icon { width:40px; height:40px; flex-shrink:0; border-radius:8px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; transition:transform 0.25s ease; }
        .rp-feature:hover .rp-feature-icon { transform:scale(1.08); }
        .rp-feature-title { font-size:13px; font-weight:700; color:#fff; margin:0 0 3px; }
        .rp-feature-desc  { font-size:12px; color:rgba(255,255,255,0.72); line-height:1.6; margin:0; }

        .rp-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; border-top:1px solid rgba(255,255,255,0.20); padding-top:24px; }
        .rp-stat-value { font-family:var(--rp-mono); font-size:26px; font-weight:500; color:#fff; line-height:1; }
        .rp-stat-label { font-size:10px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:rgba(255,255,255,0.65); margin-top:4px; }

        .rp-col {
          flex:1;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:32px 20px;
          min-height:100dvh;
          overflow-y:auto;
          background:var(--rp-bg);
        }
        @media (min-width: 600px) { .rp-col { padding:40px 48px; } }

        .rp-form-card { width:100%; max-width:420px; animation:rpFadeIn 0.4s ease both; }

        .rp-mobile-logo { display:flex; flex-direction:column; align-items:center; gap:6px; margin-bottom:28px; text-align:center; }
        .rp-mobile-logo img { height:44px; width:auto; object-fit:contain; }
        /* On the dark form background the coloured logo would merge — flip it to white. */
        .dark .rp-mobile-logo img { filter:brightness(0) invert(1); }
        @media (min-width: 960px) { .rp-mobile-logo { display:none; } }

        .rp-heading    { font-size:28px; font-weight:800; color:var(--rp-blue-mid); margin:0 0 4px; line-height:1.2; }
        .rp-subheading { font-size:14px; color:var(--rp-muted); margin:0 0 28px; font-weight:400; }

        .rp-field  { margin-bottom:16px; }
        .rp-label  { display:block; font-size:12px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--rp-muted); margin-bottom:6px; }

        .rp-input-wrap { position:relative; }
        .rp-input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--rp-subtle); pointer-events:none; display:flex; align-items:center; }
        .rp-input-icon-right { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:4px; color:var(--rp-subtle); display:flex; align-items:center; border-radius:4px; transition:color 0.2s; }
        .rp-input-icon-right:hover { color:var(--rp-text); }

        .rp-input {
          width:100%;
          padding:11px 12px 11px 38px;
          background:var(--rp-input-bg);
          border:1px solid var(--rp-border);
          border-radius:8px;
          font-family:var(--rp-font);
          font-size:14px;
          color:var(--rp-text);
          transition:border-color 0.2s, box-shadow 0.2s;
          outline:none;
          box-shadow:var(--rp-shadow);
        }
        .rp-input.has-eye   { padding-right:38px; }
        .rp-input::placeholder { color:var(--rp-subtle); }
        .rp-input:focus     { border-color:var(--rp-border-foc); box-shadow:0 0 0 3px var(--rp-focus-ring); }
        .rp-input:disabled  { opacity:0.6; cursor:not-allowed; }

        .rp-pw-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
        .rp-forgot { font-size:12px; font-weight:700; color:var(--rp-blue); text-decoration:none; }
        .rp-forgot:hover { text-decoration:underline; }

        .rp-remember { display:flex; align-items:center; gap:8px; margin-bottom:20px; }
        .rp-remember input[type="checkbox"] { width:16px; height:16px; accent-color:var(--rp-blue); cursor:pointer; flex-shrink:0; }
        .rp-remember label { font-size:13px; color:var(--rp-muted); cursor:pointer; }

        .rp-btn-primary {
          width:100%;
          padding:13px 20px;
          background:var(--rp-btn-grad);
          color:#fff;
          border:none;
          border-radius:8px;
          font-family:var(--rp-font);
          font-size:15px;
          font-weight:700;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
          margin-bottom:16px;
        }
        .rp-btn-primary:hover:not(:disabled) { transform:scale(1.02); box-shadow:var(--rp-shadow-lg); }
        .rp-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }

        .rp-divider { position:relative; text-align:center; margin:4px 0 16px; }
        .rp-divider::before { content:''; position:absolute; top:50%; left:0; right:0; border-top:1px solid var(--rp-divider); }
        .rp-divider span { position:relative; background:var(--rp-bg); padding:0 12px; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--rp-subtle); }

        .rp-google-wrap { display:flex; justify-content:center; margin-bottom:20px; }

        .rp-bottom-link { text-align:center; font-size:13px; color:var(--rp-muted); padding-top:16px; border-top:1px solid var(--rp-divider); margin-bottom:16px; }
        .rp-bottom-link a { color:var(--rp-blue); font-weight:700; text-decoration:none; }
        .rp-bottom-link a:hover { text-decoration:underline; }

        .rp-footer { display:flex; flex-direction:column; align-items:center; gap:6px; }
        .rp-footer-links { display:flex; flex-wrap:wrap; justify-content:center; gap:4px 16px; }
        .rp-footer-links a { font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:var(--rp-subtle); text-decoration:none; transition:color 0.2s; }
        .rp-footer-links a:hover { color:var(--rp-blue); }
        .rp-footer-copy { font-size:11px; color:var(--rp-subtle); opacity:0.7; }

        @keyframes rpFadeIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rp-form-card    { animation:none; }
          .rp-btn-primary  { transition:none; }
          .rp-feature-icon { transition:none; }
        }
      `}</style>

      <div className="rp">

        {/* ── LEFT BANNER ── */}
        <aside className="rp-banner" aria-hidden="true">
          <div className="rp-blob rp-blob-1" />
          <div className="rp-blob rp-blob-2" />

          <div className="rp-banner-logo" style={{ position: 'relative', zIndex: 1 }}>
            <img src="/rotapay-logo.png" alt="RotaPay" />
            <p className="rp-banner-tagline">Precision Payroll &amp; Time Management</p>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="rp-banner-headline">The smarter way to run your workforce</h2>
            <p className="rp-banner-sub">
              Rotas, payroll, and HR in one platform — built for shift-based businesses across the UK.
            </p>
            <nav aria-label="Platform features">
              {features.map(({ icon: Icon, title, desc }) => (
                <div className="rp-feature" key={title}>
                  <div className="rp-feature-icon">
                    <Icon size={18} color="white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="rp-feature-title">{title}</p>
                    <p className="rp-feature-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="rp-stats" style={{ position: 'relative', zIndex: 1 }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="rp-stat-value">{value}</div>
                <div className="rp-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── RIGHT FORM ── */}
        <main className="rp-col">
          <div className="rp-form-card">

            {/* Mobile logo */}
            <div className="rp-mobile-logo">
              <img src="/rotapay-logo.png" alt="RotaPay" />
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--rp-muted)', margin: 0 }}>
                Precision Payroll &amp; Time Management
              </p>
            </div>

            <h1 className="rp-heading">Sign In</h1>
            <p className="rp-subheading">Enter your credentials to access your dashboard</p>

            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="rp-field">
                <label className="rp-label" htmlFor="login-email">Email Address</label>
                <div className="rp-input-wrap">
                  <span className="rp-input-icon">
                    <Mail size={16} aria-hidden="true" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    className="rp-input"
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
                <div className="rp-pw-row">
                  <label className="rp-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="rp-forgot">
                    Forgot password?
                  </Link>
                </div>
                <div className="rp-input-wrap" style={{ marginTop: 6 }}>
                  <span className="rp-input-icon">
                    <Lock size={16} aria-hidden="true" />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="rp-input has-eye"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="rp-input-icon-right"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="rp-remember">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember this device</label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="rp-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="rp-divider">
              <span>Or continue with</span>
            </div>

            {/* Google OAuth */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <div className="rp-google-wrap">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign-in failed. Please try again.')}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>
            )}

            {/* Create account */}
            <p className="rp-bottom-link">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register">Create account</Link>
            </p>

            {/* Footer */}
            <footer className="rp-footer">
              <nav className="rp-footer-links" aria-label="Legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
              </nav>
              <p className="rp-footer-copy">
                {`© ${new Date().getFullYear()} RotaPay. All rights reserved.`}
              </p>
            </footer>

          </div>
        </main>

      </div>
    </>
  );
}
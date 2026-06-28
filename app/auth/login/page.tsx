'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Clock, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Fill your credentials');
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

  const features = [
    { icon: Clock, title: 'Smart Rota Scheduling', desc: 'Build and publish rotas in minutes, not hours. Drag-and-drop simplicity with conflict detection.' },
    { icon: TrendingUp, title: 'Automated Payroll', desc: 'Wages calculated automatically from shift data. No manual entry, no errors.' },
    { icon: Users, title: 'Team Management', desc: 'Manage contracts, availability, and absences in one place for your entire workforce.' },
    { icon: ShieldCheck, title: 'Compliance Ready', desc: 'Built-in Working Time Directive rules and pay compliance checks to keep you protected.' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .rp-root * { font-family: 'Poppins', sans-serif; }

        /* Full viewport layout — no scroll on the outer shell */
        .rp-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        /* LEFT: fixed-height banner, content spread top-to-bottom with space-between */
        .rp-banner {
          display: none;
        }

        /* RIGHT: scrollable column, centers content when content < 100vh */
        .rp-form-col {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          box-sizing: border-box;
          background: hsl(var(--background));
        }

        .rp-form-inner {
          width: 100%;
          max-width: 380px;
        }

        @media (min-width: 900px) {
          .rp-banner {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 45%;
            min-width: 400px;
            max-width: 540px;
            height: 100vh;
            flex-shrink: 0;
            background: linear-gradient(160deg, #1e40af 0%, #1d4ed8 40%, #0d9488 100%);
            padding: 48px 44px;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
          }
          .rp-form-col {
            padding: 32px 48px;
          }
        }

        .rp-banner-bg {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          background-image:
            radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, white 0.5px, transparent 0.5px);
          background-size: 60px 60px, 45px 45px, 30px 30px;
          pointer-events: none;
        }

        .rp-feature { display: flex; gap: 14px; align-items: flex-start; }
        .rp-feature-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .rp-input-wrap { position: relative; }
        .rp-input-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: hsl(var(--muted-foreground)); pointer-events: none; }
        .rp-input-wrap input { padding-left: 38px; border-radius: 0 !important; font-family: 'Poppins', sans-serif; font-size: 14px; }

        .rp-btn { border-radius: 0 !important; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 0.01em; height: 44px; width: 100%; }

        .rp-divider { position: relative; }
        .rp-divider::before { content: ''; position: absolute; inset: 50% 0 auto; border-top: 1px solid hsl(var(--border)); }
        .rp-divider span { position: relative; display: flex; justify-content: center; }
        .rp-divider span em { background: hsl(var(--card)); padding: 0 10px; font-style: normal; font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: hsl(var(--muted-foreground)); }

        .rp-google-wrap { display: flex; justify-content: center; }
        .rp-demo { border: 1px solid hsl(var(--warning) / 0.35); background: hsl(var(--warning) / 0.05); padding: 14px 18px; }
        .rp-label { font-size: 13px; font-weight: 600; letter-spacing: 0.01em; margin-bottom: 6px; display: block; }
        .rp-heading { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
        .rp-subheading { font-size: 13px; color: hsl(var(--muted-foreground)); margin: 0 0 20px; font-weight: 400; }
        .rp-link { font-size: 13px; color: hsl(var(--primary)); font-weight: 500; text-decoration: none; }
        .rp-link:hover { text-decoration: underline; }
        .rp-field { margin-bottom: 14px; }

        .rp-stat-num { font-size: 30px; font-weight: 800; color: white; line-height: 1; }
        .rp-stat-label { font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 500; margin-top: 3px; letter-spacing: 0.03em; }
      `}</style>

      <div className="rp-root rp-layout">

        {/* ── LEFT BANNER ── */}
        <div className="rp-banner">
          <div className="rp-banner-bg" aria-hidden="true" />

          {/* Top: logo */}
          <div style={{ position: 'relative' }}>
            <img src="/rotapay-logo.png" alt="RotaPay" style={{ height: '46px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Employee Finance &amp; Time Management
            </p>
          </div>

          {/* Middle: headline + features */}
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px', padding: '36px 0' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'white', lineHeight: 1.25, margin: '0 0 10px' }}>
                The smarter way to run your workforce
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0 }}>
                Rotas, payroll, and HR in one platform — built for shift-based businesses across the UK.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {features.map(({ icon: Icon, title, desc }) => (
                <div className="rp-feature" key={title}>
                  <div className="rp-feature-icon">
                    <Icon style={{ width: '18px', height: '18px', color: 'white' }} aria-hidden="true" />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{title}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: stats */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '24px' }}>
            {[['2,400+', 'Businesses'], ['98%', 'Uptime SLA'], ['£0', 'Setup Fee']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="rp-stat-num">{num}</div>
                <div className="rp-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="rp-form-col">
          <div className="rp-form-inner animate-fade-in">

            {/* Mobile-only logo */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }} className="md:hidden">
              <img src="/rotapay-logo.png" alt="RotaPay" style={{ height: '46px', width: 'auto', margin: '0 auto 4px' }} />
              <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Professional Workforce Management</p>
            </div>

            <h1 className="rp-heading">Sign In</h1>
            <p className="rp-subheading">Enter your credentials to access your dashboard</p>

            <div className="rp-field">
              <label htmlFor="email" className="rp-label">Email Address</label>
              <div className="rp-input-wrap">
                <Mail aria-hidden="true" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
            </div>

            <div className="rp-field">
              <label htmlFor="password" className="rp-label">Password</label>
              <div className="rp-input-wrap">
                <Lock aria-hidden="true" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-6px', marginBottom: '18px' }}>
              <Link href="/auth/forgot-password" className="rp-link" style={{ fontSize: '12px' }}>Forgot password?</Link>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading} className="rp-btn bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent" style={{ marginBottom: '14px' }}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="rp-divider" style={{ marginBottom: '14px' }}>
              <span><em>Or continue with</em></span>
            </div>

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <div className="rp-google-wrap" style={{ marginBottom: '16px' }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Google login failed')} theme="outline" size="large" text="continue_with" />
              </div>
            )}

            <div style={{ textAlign: 'center', paddingTop: '14px', borderTop: '1px solid hsl(var(--border) / 0.5)', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Don&apos;t have an account? </span>
              <Link href="/auth/register" className="rp-link">Create account</Link>
            </div>

            {/* <div className="rp-demo">
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}>Demo Credentials</p>
              <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                <p style={{ margin: '0 0 2px' }}><span style={{ fontWeight: 600 }}>Email:</span> demo@rotapay.com</p>
                <p style={{ margin: 0 }}><span style={{ fontWeight: 600 }}>Password:</span> Demo@123456</p>
              </div>
            </div> */}

          </div>
        </div>

      </div>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    setToken(tokenFromUrl);
  }, []);

  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isStrong = Object.values(passwordStrength).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert('Invalid reset link');
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
      setTimeout(() => router.push('/auth/login'), 2000);
    }

    setIsLoading(false);
  };

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .rp-root * { font-family: 'Poppins', sans-serif; }
    .rp-input-wrap { position: relative; }
    .rp-input-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--muted-foreground); pointer-events: none; }
    .rp-input-wrap input { padding-left: 38px; border-radius: 0 !important; font-family: 'Poppins', sans-serif; font-size: 14px; }
    .rp-btn { border-radius: 0 !important; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 0.01em; height: 44px; width: 100%; }
    .rp-card { border-radius: 0 !important; border: 1px solid hsl(var(--border) / 0.6); }
    .rp-label { font-size: 13px; font-weight: 600; letter-spacing: 0.01em; margin-bottom: 6px; display: block; }
    .rp-heading { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
    .rp-subheading { font-size: 13px; color: hsl(var(--muted-foreground)); margin: 0 0 20px; font-weight: 400; }
    .rp-tagline { font-size: 12px; color: hsl(var(--muted-foreground)); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; margin-top: 4px; }
    .rp-link { font-size: 13px; color: hsl(var(--primary)); font-weight: 500; text-decoration: none; }
    .rp-link:hover { text-decoration: underline; }
    .rp-strength-row { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 6px; }
    .rp-strength-row:last-child { margin-bottom: 0; }
  `;

  if (isSubmitted) {
    return (
      <>
        <style>{sharedStyles}</style>
        <div className="rp-root min-h-screen flex items-center justify-center bg-background px-4">
          <div className="w-full max-w-md animate-fade-in" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <img src="/rotapay-logo.png" alt="RotaPay" style={{ height: '52px', width: 'auto', margin: '0 auto 6px' }} />
              <p className="rp-tagline">Professional Workforce Management</p>
            </div>
            <div className="rp-card bg-card" style={{ padding: '40px 28px 32px', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'hsl(var(--success) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check style={{ width: '24px', height: '24px', color: 'hsl(var(--success))' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Password Reset Successful</h2>
              <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', margin: '0 0 4px' }}>Your password has been reset successfully.</p>
              <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', margin: 0 }}>Redirecting to login page...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{sharedStyles}</style>

      <div className="rp-root min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md animate-fade-in" style={{ paddingTop: '32px', paddingBottom: '32px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img src="/rotapay-logo.png" alt="RotaPay" style={{ height: '52px', width: 'auto', margin: '0 auto 6px' }} />
            <p className="rp-tagline">Professional Workforce Management</p>
          </div>

          {/* Card */}
          <div className="rp-card bg-card" style={{ padding: '28px 28px 24px' }}>
            <h1 className="rp-heading">Reset Password</h1>
            <p className="rp-subheading">Enter your new password</p>

            {/* New Password */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="password" className="rp-label">New Password</label>
              <div className="rp-input-wrap">
                <Lock aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Strength */}
            {password && (
              <div style={{ background: 'hsl(var(--muted) / 0.4)', padding: '12px 14px', marginBottom: '16px', borderLeft: '3px solid hsl(var(--primary))' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', margin: '0 0 10px' }}>
                  Password strength
                </p>
                {[
                  { key: 'hasLength', label: 'At least 8 characters' },
                  { key: 'hasUpper', label: 'One uppercase letter' },
                  { key: 'hasLower', label: 'One lowercase letter' },
                  { key: 'hasNumber', label: 'One number' },
                ].map(({ key, label }) => {
                  const passed = passwordStrength[key as keyof typeof passwordStrength];
                  return (
                    <div key={key} className="rp-strength-row">
                      {passed
                        ? <Check style={{ width: '13px', height: '13px', color: 'hsl(var(--success))', flexShrink: 0 }} />
                        : <X style={{ width: '13px', height: '13px', color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                      }
                      <span style={{ color: passed ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirm Password */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="confirmPassword" className="rp-label">Confirm Password</label>
              <div className="rp-input-wrap">
                <Lock aria-hidden="true" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Reset Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !password || !confirmPassword || !isStrong}
              className="rp-btn bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent"
              style={{ marginBottom: '20px' }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>

            {/* Back link */}
            <div style={{ borderTop: '1px solid hsl(var(--border) / 0.5)', paddingTop: '16px', textAlign: 'center' }}>
              <Link href="/auth/login" className="rp-link">Back to sign in</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
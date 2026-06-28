'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await requestPasswordReset(email);

    if (result.success) {
      setIsSubmitted(true);
    }

    setIsLoading(false);
  };

  return (
    <>
      <style>{`
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
        .rp-link { font-size: 13px; color: hsl(var(--primary)); font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
        .rp-link:hover { text-decoration: underline; }
      `}</style>

      <div className="rp-root min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md animate-fade-in" style={{ paddingTop: '32px', paddingBottom: '32px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img src="/rotapay-logo.png" alt="RotaPay" style={{ height: '52px', width: 'auto', margin: '0 auto 6px' }} />
            <p className="rp-tagline">Professional Workforce Management</p>
          </div>

          {/* Card */}
          <div className="rp-card bg-card" style={{ padding: '28px 28px 24px' }}>

            {!isSubmitted ? (
              <>
                <h1 className="rp-heading">Reset Password</h1>
                <p className="rp-subheading">Enter your email to receive a password reset link</p>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="email" className="rp-label">Email Address</label>
                  <div className="rp-input-wrap">
                    <Mail aria-hidden="true" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !email}
                  className="rp-btn bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent"
                  style={{ marginBottom: '20px' }}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </>
            ) : (
              <>
                <h1 className="rp-heading">Check Your Email</h1>
                <p className="rp-subheading">We&apos;ve sent you a password reset link</p>

                <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Mail style={{ width: '24px', height: '24px', color: 'hsl(var(--primary))' }} />
                  </div>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: '1.6' }}>
                    Click the link in your email to reset your password. If you don&apos;t see it, check your spam folder.
                  </p>
                </div>
              </>
            )}

            {/* Back to sign in */}
            <div style={{ borderTop: '1px solid hsl(var(--border) / 0.5)', paddingTop: '16px', textAlign: 'center' }}>
              <Link href="/auth/login" className="rp-link">
                <ArrowLeft style={{ width: '14px', height: '14px' }} aria-hidden="true" />
                Back to sign in
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
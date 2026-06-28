'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      setToken(tokenFromUrl);

      if (!tokenFromUrl) {
        setStatus('error');
        setMessage('No verification token found');
        return;
      }

      try {
        const result = await verifyEmail(tokenFromUrl);

        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully!');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Email verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Email verification failed. Please try again.');
      }
    };

    verify();
  }, [verifyEmail, router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .rp-root * { font-family: 'Poppins', sans-serif; }
        .rp-btn { border-radius: 0 !important; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; height: 44px; width: 100%; }
        .rp-card { border-radius: 0 !important; border: 1px solid hsl(var(--border) / 0.6); }
        .rp-tagline { font-size: 12px; color: hsl(var(--muted-foreground)); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; margin-top: 4px; }
      `}</style>

      <div className="rp-root min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md animate-fade-in" style={{ paddingTop: '32px', paddingBottom: '32px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img src="/rotapay-logo.png" alt="RotaPay" style={{ height: '52px', width: 'auto', margin: '0 auto 6px' }} />
            <p className="rp-tagline">Professional Workforce Management</p>
          </div>

          {/* Status Card */}
          <div className="rp-card bg-card" style={{ padding: '40px 28px 32px', textAlign: 'center' }}>

            {status === 'loading' && (
              <div>
                <Loader2 style={{ width: '48px', height: '48px', margin: '0 auto 20px', color: 'hsl(var(--primary))' }} className="animate-spin" />
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Verifying Email</h2>
                <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'hsl(var(--success) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle2 style={{ width: '28px', height: '28px', color: 'hsl(var(--success))' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Email Verified!</h2>
                <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', margin: '0 0 4px' }}>{message}</p>
                <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', margin: 0 }}>Redirecting to your dashboard...</p>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'hsl(var(--destructive) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <AlertCircle style={{ width: '28px', height: '28px', color: 'hsl(var(--destructive))' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Verification Failed</h2>
                <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', margin: '0 0 28px' }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link href="/auth/login" style={{ flex: 1 }}>
                    <Button variant="outline" className="rp-btn">Back to Login</Button>
                  </Link>
                  <Link href="/auth/register" style={{ flex: 1 }}>
                    <Button variant="outline" className="rp-btn">Create Account</Button>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
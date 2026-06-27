'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      // Get token from URL params client-side
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* RotaPay Header */}
        <div className="text-center space-y-3">
          <img src="/rotapay-logo.png" alt="RotaPay" className="h-16 w-auto mx-auto" />
          <p className="text-muted-foreground text-sm">Professional Workforce Management</p>
        </div>

        {/* Status Card */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-12 pb-8">
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                  <h2 className="text-xl font-bold mb-2">Verifying Email</h2>
                  <p className="text-muted-foreground">Please wait while we verify your email address...</p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
                  <p className="text-muted-foreground">{message}</p>
                </div>
                <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
                  <p className="text-muted-foreground">{message}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

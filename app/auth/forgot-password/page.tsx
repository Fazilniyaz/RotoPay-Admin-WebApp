'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* RotaPay Header */}
        <div className="text-center space-y-3">
          <img src="/rotapay-logo.png" alt="RotaPay" className="h-16 w-auto mx-auto" />
          <p className="text-muted-foreground text-sm">Professional Workforce Management</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {isSubmitted ? 'Check Your Email' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? 'We&apos;ve sent you a password reset link'
                : 'Enter your email to receive a password reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSubmitted ? (
              <>
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent font-semibold h-11"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Click the link in your email to reset your password. If you don&apos;t see it, check your spam folder.
                </p>
              </div>
            )}

            {/* Back to Sign In */}
            <Link href="/auth/login" className="flex items-center justify-center text-primary hover:underline text-sm font-medium gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

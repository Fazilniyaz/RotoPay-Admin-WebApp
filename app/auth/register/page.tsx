'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { register, resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);

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
      toast.error('Fill your credentials');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const result = await register(email, password, displayName);

    if (result.success) {
      setShowSuccess(true);
    } else if (result.isUnverified) {
      // If the backend says the account exists but is unverified
      setShowSuccess(true);
      // Optionally trigger resend here, but the user can click the button
    }

    setIsLoading(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-12 pb-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <div className="text-2xl">✓</div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Check Your Email</h2>
                <p className="text-muted-foreground">
                  We&apos;ve sent a verification link to <span className="font-semibold">{email}</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the link in your email to verify your account and get started.
              </p>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gradient-to-r from-primary to-accent"
              >
                Back to Sign In
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isResending}
                onClick={async () => {
                  setIsResending(true);
                  await resendVerification(email);
                  setIsResending(false);
                }}
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isResending ? 'Resending...' : 'Resend Verification Email'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* RotaPay Header */}
        <div className="text-center space-y-3">
          <img src="/rotapay-logo.png" alt="RotaPay" className="h-16 w-auto mx-auto" />
          <p className="text-muted-foreground text-sm">Professional Workforce Management</p>
        </div>

        {/* Register Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Sign up to get started with RotaPay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name Input */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-semibold">
                Full Name (Optional)
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

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

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Create Account Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent font-semibold h-11 mt-2"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            {/* Link to Sign In */}
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

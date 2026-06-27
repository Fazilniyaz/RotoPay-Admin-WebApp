'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Get token from URL params client-side to avoid Suspense issues
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="text-center space-y-3">
            <img src="/rotapay-logo.png" alt="RotaPay" className="h-16 w-auto mx-auto" />
            <p className="text-muted-foreground text-sm">Professional Workforce Management</p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-12 pb-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Password Reset Successful</h2>
                <p className="text-muted-foreground">Your password has been reset successfully.</p>
              </div>
              <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
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

        {/* Reset Password Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">
                New Password
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

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2 p-3 bg-muted-bg rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground">Password strength:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasLength ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    At least 8 characters
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasUpper ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    One uppercase letter
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasLower ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    One lowercase letter
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasNumber ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    One number
                  </div>
                </div>
              </div>
            )}

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

            {/* Reset Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !password || !confirmPassword || !isStrong}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent font-semibold h-11 mt-2"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>

            {/* Link to Sign In */}
            <Link href="/auth/login" className="block text-center text-sm text-primary hover:underline mt-4">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Loader2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* RotaPay Header */}
        <div className="text-center space-y-3">
          <img src="/rotapay-logo.png" alt="RotaPay" className="h-16 w-auto mx-auto" />
          <p className="text-muted-foreground text-sm">Professional Workforce Management</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {/* Sign In Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent font-semibold h-11 mt-2"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log('Google login failed')}
                  theme="outline"
                  size="large"
                  text="signin"
                />
              </div>
            )}

            {/* Links */}
            <div className="flex items-center justify-between text-sm">
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
              <Link href="/auth/register" className="text-primary hover:underline">
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground mb-2">DEMO CREDENTIALS</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold">Email:</span> demo@rotapay.com
              </p>
              <p>
                <span className="font-semibold">Password:</span> Demo@123456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/store/authStore';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = authStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          RotaPay
        </div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}

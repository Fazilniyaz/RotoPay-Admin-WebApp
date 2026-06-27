'use client';

import { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGreeting } from '@/lib/utils';

interface DashboardGreetingProps {
  user: User | null;
}

export function DashboardGreeting({ user }: DashboardGreetingProps) {
  const greeting = getGreeting();
  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-1">
          {greeting}, {user?.displayName || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      <Avatar className="h-16 w-16">
        <AvatarImage src={user?.profilePicture} alt={user?.displayName} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

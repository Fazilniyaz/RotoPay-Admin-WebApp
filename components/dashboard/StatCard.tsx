'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  trend?: 'up' | 'down';
  gradient?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend,
  gradient = true,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      const target = value;
      const increment = target / 20;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayValue(target);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 30);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(0);
    }
  }, [value]);

  return (
    <Card
      className={`border-border/50 overflow-hidden transition-all hover:shadow-lg ${
        gradient ? 'bg-gradient-to-br from-primary/5 to-accent/5' : ''
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2">
              <p className="text-3xl font-bold animate-count-up">
                {typeof value === 'number' ? displayValue : value}
              </p>
            </div>
            {change !== undefined && (
              <p className={`text-xs mt-2 ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}% vs last period
              </p>
            )}
          </div>
          <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-3">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

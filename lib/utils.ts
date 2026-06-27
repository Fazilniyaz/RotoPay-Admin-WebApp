import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatCurrency(value: number, currency: string = 'GBP'): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  });
  return formatter.format(value);
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-GB');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

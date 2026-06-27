'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authStore } from '@/store/authStore';
import {
  DollarSign,
  Clock,
  Calendar,
  Building2,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data for demonstration
const mockStats = [
  { title: 'Total Earnings (This Month)', value: 2450, icon: DollarSign, change: 12, trend: 'up' as const },
  { title: 'Hours Worked (This Week)', value: 38, icon: Clock, change: 5, trend: 'up' as const },
  { title: 'Upcoming Shifts (7 Days)', value: 5, icon: Calendar, change: 0, trend: 'up' as const },
  { title: 'Active Employers', value: 3, icon: Building2, change: 0, trend: 'up' as const },
];

const mockUpcomingShifts = [
  { id: 1, employer: 'Coffee Co', date: 'Today', time: '14:00-22:00', duration: '8h', earnings: '£80' },
  { id: 2, employer: 'Retail Plus', date: 'Tomorrow', time: '09:00-17:00', duration: '8h', earnings: '£96' },
  { id: 3, employer: 'Coffee Co', date: 'Mar 20', time: '10:00-18:00', duration: '8h', earnings: '£80' },
  { id: 4, employer: 'Delivery Co', date: 'Mar 21', time: '18:00-22:00', duration: '4h', earnings: '£60' },
  { id: 5, employer: 'Retail Plus', date: 'Mar 22', time: '09:00-17:00', duration: '8h', earnings: '£96' },
];

const mockActivities = [
  { id: 1, type: 'clock-in', description: 'Clocked in at Coffee Co', time: '2 hours ago' },
  { id: 2, type: 'shift-added', description: 'Shift added for Retail Plus', time: '5 hours ago' },
  { id: 3, type: 'earnings', description: 'Earned £80 from completed shift', time: '1 day ago' },
  { id: 4, type: 'clock-out', description: 'Clocked out from Delivery Co', time: '2 days ago' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = authStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
    setIsLoading(false);
  }, [isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Greeting */}
        <DashboardGreeting user={user} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, index) => (
            <div key={index} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        {/* Charts and Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income Chart */}
          <Card className="lg:col-span-2 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Income & Expense Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted-bg rounded-lg flex items-center justify-center text-muted-foreground">
                📊 Income Chart - Mock Data
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Weekly Total</p>
                  <p className="text-2xl font-bold">£456</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Target</p>
                  <p className="text-2xl font-bold">£2,000</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Months to Target</p>
                  <p className="text-2xl font-bold">5m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Overview */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Salary Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-32 bg-muted-bg rounded-lg flex items-center justify-center text-muted-foreground">
                🥧 Pie Chart
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projected Monthly</span>
                  <span className="font-bold">£3,200</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">YTD Earnings</span>
                  <span className="font-bold text-success">£12,450</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Shifts and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Shifts */}
          <Card className="lg:col-span-2 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Shifts
                </span>
                <Link href="/dashboard/shifts">
                  <span className="text-xs text-primary hover:underline">View All</span>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUpcomingShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted-bg transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{shift.employer}</p>
                      <p className="text-xs text-muted-foreground">
                        {shift.date} • {shift.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-muted-foreground">{shift.duration}</p>
                      <p className="text-sm font-bold text-success">{shift.earnings}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-sm">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/clock">
            <Button className="w-full h-24 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent hover:from-primary hover:to-accent text-white font-semibold rounded-xl">
              <Clock className="h-6 w-6 mb-2" />
              Clock In
            </Button>
          </Link>
          <Link href="/dashboard/shifts">
            <Button className="w-full h-24 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent hover:from-primary hover:to-accent text-white font-semibold rounded-xl">
              <Calendar className="h-6 w-6 mb-2" />
              Add Shift
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button className="w-full h-24 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent hover:from-primary hover:to-accent text-white font-semibold rounded-xl">
              <BarChart3 className="h-6 w-6 mb-2" />
              Reports
            </Button>
          </Link>
          <Link href="/dashboard/employers">
            <Button className="w-full h-24 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent hover:from-primary hover:to-accent text-white font-semibold rounded-xl">
              <Building2 className="h-6 w-6 mb-2" />
              Employers
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

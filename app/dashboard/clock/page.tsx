'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Play, Square, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const mockEmployers = [
  { id: 1, name: 'Coffee Co' },
  { id: 2, name: 'Retail Plus' },
  { id: 3, name: 'Delivery Co' },
];

const mockSessions = [
  {
    id: 1,
    employer: 'Coffee Co',
    clockInTime: '14:00',
    clockOutTime: '22:00',
    duration: '8h',
    earnings: '£80',
  },
  {
    id: 2,
    employer: 'Retail Plus',
    clockInTime: '09:00',
    clockOutTime: '17:00',
    duration: '8h',
    earnings: '£96',
  },
];

export default function ClockPage() {
  const [isClocked, setIsClocked] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update current time
  useState(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Clock In/Out</h1>
          <p className="text-muted-foreground">Track your working hours in real-time</p>
        </div>

        {/* Main Clock Card */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-8">
              {/* Large Time Display */}
              <div className="text-center space-y-4">
                <div className="text-7xl font-bold tracking-tight">{currentTime}</div>
                <div className="text-lg text-muted-foreground">
                  {new Date().toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {/* Employer Select */}
              {!isClocked && (
                <Select value={selectedEmployer} onValueChange={setSelectedEmployer}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select an employer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployers.map((employer) => (
                      <SelectItem key={employer.id} value={employer.id.toString()}>
                        {employer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {isClocked && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are currently clocked in at <strong>Coffee Co</strong>
                  </AlertDescription>
                </Alert>
              )}

              {/* Clock Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setIsClocked(true)}
                  disabled={!selectedEmployer || isClocked}
                  className="flex-1 h-16 bg-gradient-to-r from-primary to-accent text-white font-bold text-lg gap-2 rounded-xl hover:from-primary hover:to-accent"
                >
                  <Play className="h-6 w-6" />
                  Clock In
                </Button>
                <Button
                  onClick={() => {
                    setIsClocked(false);
                    setSelectedEmployer('');
                  }}
                  disabled={!isClocked}
                  variant="outline"
                  className="flex-1 h-16 font-bold text-lg gap-2 rounded-xl"
                >
                  <Square className="h-6 w-6" />
                  Clock Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Session */}
        {isClocked && (
          <Card className="border-primary/50 bg-primary/5 border-border/50">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clocked In</p>
                  <p className="text-2xl font-bold">14:00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">1h 45m</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Estimated Earnings</p>
                <p className="text-3xl font-bold text-success">£17.50</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Sessions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted-bg transition-colors"
                >
                  <div>
                    <p className="font-semibold">{session.employer}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.clockInTime} - {session.clockOutTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{session.duration}</Badge>
                    <p className="text-lg font-bold text-success mt-2">{session.earnings}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

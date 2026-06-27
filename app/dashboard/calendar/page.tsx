'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1)); // March 2024

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, () => null);
  const allDays = [...emptyDays, ...days];

  const mockEvents: Record<number, { type: 'shift' | 'event'; title: string; employer?: string }[]> = {
    18: [
      { type: 'shift', title: 'Work', employer: 'Coffee Co' },
      { type: 'event', title: 'Meeting' },
    ],
    19: [{ type: 'shift', title: 'Work', employer: 'Retail Plus' }],
    20: [{ type: 'shift', title: 'Work', employer: 'Coffee Co' }],
    21: [{ type: 'shift', title: 'Work', employer: 'Delivery Co' }],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">View your shifts and events</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        {/* Calendar */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>
              {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {allDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`aspect-square p-2 rounded-lg border border-border/50 min-h-24 flex flex-col ${
                    day ? 'bg-card hover:bg-muted-bg transition-colors' : 'bg-muted-bg/20'
                  }`}
                >
                  {day && (
                    <>
                      <span className="font-semibold text-xs mb-1">{day}</span>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {mockEvents[day]?.map((event, i) => (
                          <div
                            key={i}
                            className={`text-xs px-1.5 py-1 rounded truncate ${
                              event.type === 'shift'
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'bg-accent/10 text-accent'
                            }`}
                            title={event.employer ? `${event.title} - ${event.employer}` : event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: 'Today, 14:00', title: 'Coffee Co Shift', type: 'shift' },
                { date: 'Tomorrow, 09:00', title: 'Retail Plus Shift', type: 'shift' },
                { date: 'Mar 20, 10:00', title: 'Coffee Co Shift', type: 'shift' },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
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

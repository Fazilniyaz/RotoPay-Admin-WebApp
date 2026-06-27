'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockShifts = [
  {
    id: 1,
    employer: 'Coffee Co',
    date: '2024-03-18',
    startTime: '14:00',
    endTime: '22:00',
    hours: 8,
    earnings: 80,
    confirmed: true,
  },
  {
    id: 2,
    employer: 'Retail Plus',
    date: '2024-03-19',
    startTime: '09:00',
    endTime: '17:00',
    hours: 8,
    earnings: 96,
    confirmed: true,
  },
  {
    id: 3,
    employer: 'Coffee Co',
    date: '2024-03-20',
    startTime: '10:00',
    endTime: '18:00',
    hours: 8,
    earnings: 80,
    confirmed: false,
  },
];

export default function ShiftsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shifts</h1>
            <p className="text-muted-foreground">Manage and track all your work shifts</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold">£2,450</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-3xl font-bold">£456</p>
                </div>
                <Clock className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                  <p className="text-3xl font-bold">156h</p>
                </div>
                <Calendar className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shifts List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>All Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted-bg transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{shift.employer}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(shift.date).toLocaleDateString()} • {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{shift.hours}h</p>
                      <p className="text-sm text-success">£{shift.earnings}</p>
                    </div>
                    <Badge variant={shift.confirmed ? 'default' : 'secondary'}>
                      {shift.confirmed ? 'Confirmed' : 'Pending'}
                    </Badge>
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

'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockNotifications = [
  {
    id: 1,
    type: 'shift_reminder',
    title: 'Shift Reminder',
    message: 'Your shift at Coffee Co starts in 1 hour',
    read: false,
    timestamp: '5 minutes ago',
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Received',
    message: 'You received £96 from Retail Plus',
    read: false,
    timestamp: '1 hour ago',
  },
  {
    id: 3,
    type: 'shift_confirmed',
    title: 'Shift Confirmed',
    message: 'Your shift on March 20 has been confirmed',
    read: true,
    timestamp: '2 hours ago',
  },
  {
    id: 4,
    type: 'earnings',
    title: 'Earnings Update',
    message: 'You earned £256 this week',
    read: true,
    timestamp: '1 day ago',
  },
];

export default function NotificationsPage() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline">
              <Check className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card className="border-border/50">
          <CardContent className="divide-y divide-border/50 p-0">
            {mockNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No notifications yet</p>
              </div>
            ) : (
              mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted-bg transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

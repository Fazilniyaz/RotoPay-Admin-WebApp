'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Analyze your earnings and work patterns</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent text-white">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Report Tabs */}
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Weekly Earnings</p>
                  <p className="text-3xl font-bold mt-2">£456</p>
                  <p className="text-xs text-success mt-2">↑ 12% from last week</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Hours Worked</p>
                  <p className="text-3xl font-bold mt-2">38h</p>
                  <p className="text-xs text-success mt-2">↑ 5% from last week</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Avg. Hourly Rate</p>
                  <p className="text-3xl font-bold mt-2">£12</p>
                  <p className="text-xs text-muted-foreground mt-2">Across all employers</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted-bg rounded-lg flex items-center justify-center text-muted-foreground">
                  📊 Chart visualization
                </div>
              </CardContent>
            </Card>

            {/* Daily Details */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Daily Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: 'Monday', hours: 8, earnings: 96 },
                    { date: 'Tuesday', hours: 8, earnings: 80 },
                    { date: 'Wednesday', hours: 8, earnings: 80 },
                    { date: 'Thursday', hours: 7, earnings: 84 },
                    { date: 'Friday', hours: 7, earnings: 84 },
                    { date: 'Saturday', hours: 0, earnings: 0 },
                    { date: 'Sunday', hours: 0, earnings: 0 },
                  ].map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div>
                        <p className="font-semibold text-sm">{day.date}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{day.hours}h</p>
                          <p className="text-sm font-bold">£{day.earnings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-96 bg-muted-bg rounded-lg flex items-center justify-center text-muted-foreground">
                  📊 Monthly Report - Coming Soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-96 bg-muted-bg rounded-lg flex items-center justify-center text-muted-foreground">
                  📊 Yearly Report - Coming Soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

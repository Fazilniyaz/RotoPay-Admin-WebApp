'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockEmployers = [
  { id: 1, name: 'Coffee Co', store: 'Central', rate: 10, currency: 'GBP', active: true, totalEarnings: 450 },
  { id: 2, name: 'Retail Plus', store: 'Downtown', rate: 12, currency: 'GBP', active: true, totalEarnings: 720 },
  { id: 3, name: 'Delivery Co', store: 'Various', rate: 15, currency: 'GBP', active: false, totalEarnings: 300 },
];

export default function EmployersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employers</h1>
            <p className="text-muted-foreground">Manage your employer information</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Employer
          </Button>
        </div>

        {/* Employers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEmployers.map((employer) => (
            <Card key={employer.id} className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{employer.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{employer.store}</p>
                    </div>
                  </div>
                  <Badge variant={employer.active ? 'default' : 'secondary'}>
                    {employer.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Hourly Rate</p>
                    <p className="text-lg font-bold">
                      £{employer.rate}
                      <span className="text-xs text-muted-foreground">/h</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="text-lg font-bold text-success">£{employer.totalEarnings}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border/50">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

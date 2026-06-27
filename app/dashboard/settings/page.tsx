'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { authStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = authStore();
  const { logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const initials = user ? getInitials(user.displayName) : 'U';

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Profile Section */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profilePicture} alt={user?.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Avatar</Button>
            </div>

            <Separator />

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="font-semibold">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  defaultValue={user?.displayName}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email" className="font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold">Theme</Label>
                <p className="text-sm text-muted-foreground mt-1">Choose your preferred theme</p>
              </div>
              <ThemeToggle />
            </div>

            <Separator />

            {/* Currency */}
            <div>
              <Label htmlFor="currency" className="font-semibold">
                Currency
              </Label>
              <Select defaultValue="GBP">
                <SelectTrigger id="currency" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Language */}
            <div>
              <Label htmlFor="language" className="font-semibold">
                Language
              </Label>
              <Select defaultValue="en">
                <SelectTrigger id="language" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Date Format */}
            <div>
              <Label htmlFor="dateFormat" className="font-semibold">
                Date Format
              </Label>
              <Select defaultValue="DD/MM/YYYY">
                <SelectTrigger id="dateFormat" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Time Format */}
            <div>
              <Label htmlFor="timeFormat" className="font-semibold">
                Time Format
              </Label>
              <Select defaultValue="24h">
                <SelectTrigger id="timeFormat" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hour (14:30)</SelectItem>
                  <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold">Shift Reminders</Label>
                <p className="text-sm text-muted-foreground mt-1">Get notified before your shifts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold">Event Reminders</Label>
                <p className="text-sm text-muted-foreground mt-1">Get notified about scheduled events</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold">Payment Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">Get notified when you receive payments</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Account</CardTitle>
            <CardDescription>Manage your account access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <Button variant="outline" className="w-full text-destructive hover:text-destructive">
              Logout All Devices
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button
            onClick={() => setIsSaving(true)}
            className="bg-gradient-to-r from-primary to-accent text-white"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

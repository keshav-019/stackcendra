"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Github, Mail, Laptop, Check, LogOut, AlertTriangle, Monitor, Sun, Trash2 } from 'lucide-react';

export const AccountSection = () => {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name ?? 'John Doe');
  const email = session?.user?.email ?? 'john.doe@company.com';

  return (
    <Card className="bg-black/20 border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-1">Account</h2>
      <p className="text-sm text-gray-400 mb-6">Your name, email, and avatar. Concept UI — nothing here persists yet.</p>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16">
          {session?.user?.image && <AvatarImage src={session.user.image} alt={name} />}
          <AvatarFallback className="bg-gradient-ai text-white text-xl">
            {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold text-white">{name}</p>
          <p className="text-sm text-gray-400">{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Email</Label>
          <Input value={email} disabled className="bg-white/5 border-white/10 text-gray-400" />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button className="bg-gradient-ai hover:opacity-90">Save changes</Button>
      </div>
    </Card>
  );
};

export const SecuritySection = () => {
  const { data: session } = useSession();
  const provider = session?.user?.provider;
  const isSignedIn = !!session;
  const ProviderIcon = provider === 'google' ? Mail : Github;

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Password</h2>
        <p className="text-sm text-gray-400 mb-4">
          {isSignedIn
            ? `You're signed in with ${provider === 'google' ? 'Google' : 'GitHub'}, so there's no StackCendra password to manage.`
            : 'No password sign-in method is configured yet.'}
        </p>
        <Button variant="outline" disabled className="border-white/10 text-gray-500">
          Change password
        </Button>
      </Card>

      <Card className="bg-black/20 border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Two-factor authentication</h2>
            <p className="text-sm text-gray-400">
              {isSignedIn
                ? `Inherited from your ${provider === 'google' ? 'Google' : 'GitHub'} account.`
                : 'Adds a second step when signing in.'}
            </p>
          </div>
          <Switch checked={isSignedIn} disabled />
        </div>
      </Card>

      <Card className="bg-black/20 border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Sign-in method</h2>
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <ProviderIcon size={18} className="text-white" />
            <div>
              <p className="text-sm text-white">{provider === 'google' ? 'Google' : 'GitHub'}</p>
              <p className="text-xs text-gray-500">
                {isSignedIn ? `Signed in as ${session?.user?.name ?? session?.user?.email}` : 'Not signed in'}
              </p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-300 text-xs">
            <Check size={12} className="mr-1" />
            Active
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Chosen once at signup and used for every sign-in since. To switch providers, create a new account with the
          other one — StackCendra doesn't link multiple sign-in methods to a single account.
        </p>
      </Card>
    </div>
  );
};

export const NotificationsSection = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);

  return (
    <Card className="bg-black/20 border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-1">Notifications</h2>
      <p className="text-sm text-gray-400 mb-6">Personal notification preferences — these apply across every project.</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Email notifications</p>
            <p className="text-xs text-gray-500">Incident and CI/CD failure summaries.</p>
          </div>
          <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Desktop notifications</p>
            <p className="text-xs text-gray-500">Real-time alerts from the desktop app.</p>
          </div>
          <Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
        </div>
      </div>
    </Card>
  );
};

export const AppearanceSection = () => {
  const themes = [
    { id: 'dark', label: 'Dark', icon: Monitor, available: true },
    { id: 'light', label: 'Light', icon: Sun, available: false },
    { id: 'system', label: 'System', icon: Laptop, available: false },
  ];

  return (
    <Card className="bg-black/20 border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-1">Appearance</h2>
      <p className="text-sm text-gray-400 mb-6">
        StackCendra is dark-only for now — the whole design system is built around it. Light and system themes are
        planned but not implemented.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <div
              key={theme.id}
              className={cn(
                'rounded-lg border p-4 text-center',
                theme.available ? 'border-ai-primary bg-ai-primary/10' : 'border-white/10 bg-white/5 opacity-50'
              )}
            >
              <Icon size={20} className="mx-auto mb-2 text-white" />
              <p className="text-sm text-white">{theme.label}</p>
              {theme.available ? (
                <Badge className="bg-ai-primary/20 text-ai-primary text-[10px] mt-2">Active</Badge>
              ) : (
                <Badge variant="outline" className="border-white/20 text-gray-500 text-[10px] mt-2">
                  Coming soon
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export const SessionsSection = () => (
  <Card className="bg-black/20 border-white/10 p-6">
    <h2 className="text-lg font-semibold text-white mb-4">Sessions & devices</h2>
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-center gap-3">
        <Laptop size={18} className="text-gray-400" />
        <div>
          <p className="text-sm text-white">This browser session</p>
          <p className="text-xs text-gray-500">Web-only — no desktop app paired yet</p>
        </div>
      </div>
      <Badge variant="outline" className="border-white/20 text-gray-400 text-xs">
        Web
      </Badge>
    </div>
    <p className="text-xs text-gray-500 mt-3">
      SSH, terminals, and Docker control require the StackCendra desktop app. Pairing isn't wired up yet in this
      concept build.
    </p>
  </Card>
);

export const DangerZoneSection = () => (
  <div className="space-y-6">
    <Card className="bg-red-500/5 border-red-500/20 p-6">
      <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <LogOut size={18} className="text-red-400" />
        Sign out
      </h2>
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-gray-400">Sign out of StackCendra on this device.</p>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="border-red-500/30 text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={14} className="mr-2" />
          Sign out
        </Button>
      </div>
    </Card>

    <Card className="bg-red-500/5 border-red-500/20 p-6">
      <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <AlertTriangle size={18} className="text-red-400" />
        Delete account
      </h2>
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-gray-400">Permanently delete your account and all local project references.</p>
        <Button variant="outline" disabled className="border-red-500/20 text-red-400/50">
          <Trash2 size={14} className="mr-2" />
          Delete account
        </Button>
      </div>
    </Card>
  </div>
);

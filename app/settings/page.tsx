"use client";

import { Suspense } from 'react';
import { AccountSettingsShell } from '@/components/settings/AccountSettingsShell';

export default function SettingsPage() {
  return (
    <Suspense>
      <AccountSettingsShell defaultSection="integrations" />
    </Suspense>
  );
}

"use client";

import { Suspense } from 'react';
import { AccountSettingsShell } from '@/components/settings/AccountSettingsShell';

export default function ProfilePage() {
  return (
    <Suspense>
      <AccountSettingsShell defaultSection="account" />
    </Suspense>
  );
}

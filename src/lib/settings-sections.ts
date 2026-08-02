import {
  User,
  ShieldCheck,
  Bell,
  Palette,
  Laptop,
  AlertTriangle,
  Settings2,
  Plug,
  Users,
  KeyRound,
  History,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

export type SectionId =
  | 'account'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'sessions'
  | 'danger-zone'
  | 'general'
  | 'integrations'
  | 'team'
  | 'api-keys'
  | 'audit-log'
  | 'billing';

export interface SectionMeta {
  id: SectionId;
  label: string;
  icon: LucideIcon;
}

export interface SectionGroup {
  label: string;
  sections: SectionMeta[];
}

export const settingsSections: SectionGroup[] = [
  {
    label: 'Personal',
    sections: [
      { id: 'account', label: 'Account', icon: User },
      { id: 'security', label: 'Security', icon: ShieldCheck },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'sessions', label: 'Sessions & devices', icon: Laptop },
      { id: 'danger-zone', label: 'Danger zone', icon: AlertTriangle },
    ],
  },
  {
    label: 'Workspace',
    sections: [
      { id: 'general', label: 'General', icon: Settings2 },
      { id: 'integrations', label: 'Integrations', icon: Plug },
      { id: 'team', label: 'Team & members', icon: Users },
      { id: 'api-keys', label: 'API keys & tokens', icon: KeyRound },
      { id: 'audit-log', label: 'Audit log', icon: History },
      { id: 'billing', label: 'Plan & billing', icon: CreditCard },
    ],
  },
];

export const allSections: SectionMeta[] = settingsSections.flatMap((g) => g.sections);

import { Github, Gitlab, HardDrive } from 'lucide-react';
import type { ProjectProvider } from '@/lib/project-schema';

export const providerIcon = { github: Github, gitlab: Gitlab, none: HardDrive } as const satisfies Record<
  ProjectProvider,
  unknown
>;
export const providerLabel: Record<ProjectProvider, string> = { github: 'GitHub', gitlab: 'GitLab', none: 'Local only' };

// Fixed locale and time zone so server and client render the same string.
export function formatProjectDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
}

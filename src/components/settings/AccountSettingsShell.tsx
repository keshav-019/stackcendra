"use client";

import React, { useState } from 'react';
import { ProjectPageShell } from '@/components/projects/ProjectPageShell';
import { cn } from '@/lib/utils';
import { settingsSections, type SectionId } from '@/lib/settings-sections';
import {
  AccountSection,
  SecuritySection,
  NotificationsSection,
  AppearanceSection,
  SessionsSection,
  DangerZoneSection,
} from '@/components/settings/PersonalSections';
import {
  GeneralSection,
  IntegrationsSection,
  TeamSection,
  ApiKeysSection,
  AuditLogSection,
  BillingSection,
  type Edition,
} from '@/components/settings/WorkspaceSections';

interface AccountSettingsShellProps {
  defaultSection: SectionId;
}

export const AccountSettingsShell: React.FC<AccountSettingsShellProps> = ({ defaultSection }) => {
  const [activeSection, setActiveSection] = useState<SectionId>(defaultSection);
  const [edition, setEdition] = useState<Edition>('individual');

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSection />;
      case 'security':
        return <SecuritySection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'sessions':
        return <SessionsSection />;
      case 'danger-zone':
        return <DangerZoneSection />;
      case 'general':
        return <GeneralSection edition={edition} />;
      case 'integrations':
        return <IntegrationsSection />;
      case 'team':
        return <TeamSection edition={edition} />;
      case 'api-keys':
        return <ApiKeysSection />;
      case 'audit-log':
        return <AuditLogSection edition={edition} />;
      case 'billing':
        return <BillingSection edition={edition} onEditionChange={setEdition} />;
      default:
        return null;
    }
  };

  return (
    <ProjectPageShell breadcrumb={[{ label: 'Account & settings' }]} mainClassName="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Account & settings</h1>
        <p className="text-sm text-gray-400">Concept UI — most controls here don't persist yet.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-56 flex-shrink-0">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
            {settingsSections.map((group) => (
              <div key={group.label} className="flex-shrink-0 md:flex-shrink md:w-full">
                <p className="hidden md:block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">
                  {group.label}
                </p>
                <div className="flex md:flex-col gap-1">
                  {group.sections.map((section) => {
                    const Icon = section.icon;
                    const active = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors text-left',
                          active
                            ? 'bg-ai-primary/15 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5',
                          section.id === 'danger-zone' && !active && 'text-red-400/70 hover:text-red-300'
                        )}
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">{renderSection()}</div>
      </div>
    </ProjectPageShell>
  );
};

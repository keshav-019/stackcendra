import { describe, it, expect } from 'vitest';
import { settingsSections, allSections } from './settings-sections';

describe('settingsSections', () => {
  it('has exactly the Personal and Workspace groups', () => {
    expect(settingsSections.map((g) => g.label)).toEqual(['Personal', 'Workspace']);
  });

  it('every group has at least one section', () => {
    for (const group of settingsSections) {
      expect(group.sections.length).toBeGreaterThan(0);
    }
  });

  it('every section has a non-empty label and an icon component', () => {
    for (const section of allSections) {
      expect(section.label.length).toBeGreaterThan(0);
      expect(section.icon).toBeDefined();
    }
  });
});

describe('allSections', () => {
  it('has unique section ids (used as AccountSettingsShell switch keys)', () => {
    const ids = allSections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is the flattened concatenation of every group', () => {
    const expectedCount = settingsSections.reduce((sum, g) => sum + g.sections.length, 0);
    expect(allSections.length).toBe(expectedCount);
  });

  it('includes the sections AccountSettingsShell defaults to (account, integrations)', () => {
    const ids = allSections.map((s) => s.id);
    expect(ids).toContain('account');
    expect(ids).toContain('integrations');
  });
});

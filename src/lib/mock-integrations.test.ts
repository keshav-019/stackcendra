import { describe, it, expect } from 'vitest';
import { mockIntegrations, integrationCategories } from './mock-integrations';

describe('mockIntegrations', () => {
  it('has unique integration ids (used as React keys and connection-state lookup keys)', () => {
    const ids = mockIntegrations.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every tier is 1, 2, or 3', () => {
    for (const integration of mockIntegrations) {
      expect([1, 2, 3]).toContain(integration.tier);
    }
  });

  it('every integration has a non-empty name and description', () => {
    for (const integration of mockIntegrations) {
      expect(integration.name.length).toBeGreaterThan(0);
      expect(integration.description.length).toBeGreaterThan(0);
    }
  });

  it('every integration category appears in integrationCategories', () => {
    for (const integration of mockIntegrations) {
      expect(integrationCategories).toContain(integration.category);
    }
  });
});

describe('integrationCategories', () => {
  it('has no duplicate categories', () => {
    expect(new Set(integrationCategories).size).toBe(integrationCategories.length);
  });

  it('is derived from and matches every category actually used', () => {
    const usedCategories = new Set(mockIntegrations.map((i) => i.category));
    expect(new Set(integrationCategories)).toEqual(usedCategories);
  });
});

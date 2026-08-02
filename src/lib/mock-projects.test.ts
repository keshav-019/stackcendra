import { describe, it, expect } from 'vitest';
import { mockProjects, mockRemoteRepos } from './mock-projects';

describe('mockProjects', () => {
  it('has at least one project', () => {
    expect(mockProjects.length).toBeGreaterThan(0);
  });

  it('has unique project ids (used as route params in /projects/[id])', () => {
    const ids = mockProjects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique CI run ids across the whole dataset', () => {
    const runIds = mockProjects.flatMap((p) => p.ciRuns.map((r) => r.id));
    expect(new Set(runIds).size).toBe(runIds.length);
  });

  it('every AI fix suggestion references a CI run that actually exists on the same project', () => {
    for (const project of mockProjects) {
      const runIds = new Set(project.ciRuns.map((r) => r.id));
      for (const fix of project.aiFixes) {
        expect(runIds.has(fix.runId)).toBe(true);
      }
    }
  });

  it('every AI fix confidence is a percentage between 0 and 100', () => {
    for (const project of mockProjects) {
      for (const fix of project.aiFixes) {
        expect(fix.confidence).toBeGreaterThanOrEqual(0);
        expect(fix.confidence).toBeLessThanOrEqual(100);
      }
    }
  });

  it('a project with provider "none" has no repoFullName', () => {
    const localOnly = mockProjects.filter((p) => p.provider === 'none');
    for (const project of localOnly) {
      expect(project.repoFullName).toBeUndefined();
    }
  });

  it('a project with a Git provider has a repoFullName', () => {
    const withProvider = mockProjects.filter((p) => p.provider !== 'none');
    for (const project of withProvider) {
      expect(project.repoFullName).toBeTruthy();
    }
  });
});

describe('mockRemoteRepos', () => {
  it('provides repos for both connectable providers', () => {
    expect(mockRemoteRepos.github.length).toBeGreaterThan(0);
    expect(mockRemoteRepos.gitlab.length).toBeGreaterThan(0);
  });

  it('every repo full name follows the owner/repo shape', () => {
    for (const repos of Object.values(mockRemoteRepos)) {
      for (const repo of repos) {
        expect(repo.fullName).toMatch(/^[\w.-]+\/[\w.-]+$/);
      }
    }
  });
});

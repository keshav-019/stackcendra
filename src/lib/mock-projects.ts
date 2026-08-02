export type GitProvider = 'github' | 'gitlab' | 'none';

export interface CiRun {
  id: string;
  workflow: string;
  status: 'success' | 'failed' | 'running';
  branch: string;
  commitSha: string;
  commitMessage: string;
  triggeredBy: string;
  duration: string;
  timestamp: string;
}

export interface AiFixSuggestion {
  id: string;
  runId: string;
  title: string;
  rootCause: string;
  evidence: string[];
  confidence: number;
  filesChanged: string[];
  diff: string;
  risk: 'Low' | 'Medium' | 'High';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  provider: GitProvider;
  repoFullName?: string;
  branch: string;
  uncommittedFiles: number;
  commitsAheadOfOrigin: number;
  commitsBehindOrigin: number;
  lastCommitMessage: string;
  lastCommitAuthor: string;
  lastCommitTime: string;
  ciRuns: CiRun[];
  aiFixes: AiFixSuggestion[];
}

export const mockProjects: Project[] = [
  {
    id: 'ecommerce-api',
    name: 'E-Commerce API',
    description: 'Checkout, orders, and payment services for the storefront.',
    provider: 'github',
    repoFullName: 'acme-corp/ecommerce-api',
    branch: 'feature/payment-fix',
    uncommittedFiles: 3,
    commitsAheadOfOrigin: 1,
    commitsBehindOrigin: 2,
    lastCommitMessage: 'Fix timeout issues in payment service',
    lastCommitAuthor: 'Sarah Chen',
    lastCommitTime: '18 minutes ago',
    ciRuns: [
      {
        id: 'run-1042',
        workflow: 'CI / test-and-build',
        status: 'failed',
        branch: 'feature/payment-fix',
        commitSha: '8a41d2c',
        commitMessage: 'Increase payment gateway timeout',
        triggeredBy: 'Sarah Chen',
        duration: '4m 12s',
        timestamp: '22 minutes ago',
      },
      {
        id: 'run-1041',
        workflow: 'CI / test-and-build',
        status: 'success',
        branch: 'main',
        commitSha: '3fc99a1',
        commitMessage: 'Bump postgres client to 8.11',
        triggeredBy: 'Mike Rodriguez',
        duration: '3m 46s',
        timestamp: '3 hours ago',
      },
      {
        id: 'run-1040',
        workflow: 'CD / deploy-staging',
        status: 'success',
        branch: 'main',
        commitSha: 'e51a02b',
        commitMessage: 'Add circuit breaker to order handler',
        triggeredBy: 'Alex Kumar',
        duration: '6m 03s',
        timestamp: '1 day ago',
      },
    ],
    aiFixes: [
      {
        id: 'fix-1042',
        runId: 'run-1042',
        title: 'Payment gateway client rejects the new timeout value',
        rootCause:
          'The gateway SDK client caps request timeouts at 5000ms, but commit 8a41d2c sets PAYMENT_TIMEOUT_MS to 10000. The SDK silently clamps the value and the retry wrapper then double-fires requests, which is what failed the integration test.',
        evidence: [
          'Test failure: "expected 1 call to processPayment, received 2" in payment.test.ts:88',
          'PAYMENT_TIMEOUT_MS changed from 5000 to 10000 in the failing commit',
          'Vendor SDK changelog (v4.2) caps client-side timeout at 5000ms',
          'Retry wrapper in src/lib/retry.ts fires again once its own 5s timer elapses, independent of the SDK',
        ],
        confidence: 91,
        filesChanged: ['src/services/payment/client.ts', 'src/config/env.ts'],
        diff: `- const PAYMENT_TIMEOUT_MS = 10000;
+ const PAYMENT_TIMEOUT_MS = 5000; // vendor SDK v4.2 hard caps at 5000ms

- await retryWrapper(() => gateway.processPayment(payload), { timeoutMs: PAYMENT_TIMEOUT_MS });
+ await retryWrapper(() => gateway.processPayment(payload), {
+   timeoutMs: PAYMENT_TIMEOUT_MS,
+   respectInFlightRequest: true, // don't retry while the SDK call is still pending
+ });`,
        risk: 'Low',
      },
    ],
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Internal reporting frontend and aggregation jobs.',
    provider: 'gitlab',
    repoFullName: 'acme-corp/analytics-dashboard',
    branch: 'main',
    uncommittedFiles: 0,
    commitsAheadOfOrigin: 0,
    commitsBehindOrigin: 0,
    lastCommitMessage: 'Add weekly cohort chart',
    lastCommitAuthor: 'Lisa Park',
    lastCommitTime: '2 hours ago',
    ciRuns: [
      {
        id: 'run-902',
        workflow: 'pipeline / build-test-deploy',
        status: 'success',
        branch: 'main',
        commitSha: 'b02cde4',
        commitMessage: 'Add weekly cohort chart',
        triggeredBy: 'Lisa Park',
        duration: '2m 58s',
        timestamp: '2 hours ago',
      },
    ],
    aiFixes: [],
  },
  {
    id: 'user-service',
    name: 'User Service',
    description: 'Authentication, profile, and session management.',
    provider: 'none',
    branch: 'main',
    uncommittedFiles: 12,
    commitsAheadOfOrigin: 0,
    commitsBehindOrigin: 0,
    lastCommitMessage: 'Local only — no Git remote connected yet',
    lastCommitAuthor: '—',
    lastCommitTime: '—',
    ciRuns: [],
    aiFixes: [],
  },
];

export const mockRemoteRepos: Record<Exclude<GitProvider, 'none'>, { fullName: string; private: boolean; updated: string }[]> = {
  github: [
    { fullName: 'acme-corp/ecommerce-api', private: true, updated: '18 minutes ago' },
    { fullName: 'acme-corp/notification-service', private: true, updated: '1 day ago' },
    { fullName: 'acme-corp/infra-terraform', private: true, updated: '4 days ago' },
    { fullName: 'keshav-019/stackcendra', private: false, updated: '2 hours ago' },
  ],
  gitlab: [
    { fullName: 'acme-corp/analytics-dashboard', private: true, updated: '2 hours ago' },
    { fullName: 'acme-corp/data-pipeline', private: true, updated: '6 days ago' },
  ],
};

import {
  Github,
  Gitlab,
  Container,
  Boxes,
  Cloud,
  Database,
  Activity,
  BarChart3,
  Kanban,
  MessagesSquare,
  Layers,
  BellRing,
  type LucideIcon,
} from 'lucide-react';

export type IntegrationTier = 1 | 2 | 3;

export interface Integration {
  id: string;
  name: string;
  category: string;
  tier: IntegrationTier;
  icon: LucideIcon;
  description: string;
  connected: boolean;
}

export const mockIntegrations: Integration[] = [
  // Source control
  { id: 'github', name: 'GitHub', category: 'Source control', tier: 1, icon: Github, description: 'Repositories, pull requests, and Actions workflow status.', connected: true },
  { id: 'gitlab', name: 'GitLab', category: 'Source control', tier: 2, icon: Gitlab, description: 'Projects, merge requests, and pipeline status.', connected: false },
  { id: 'bitbucket', name: 'Bitbucket', category: 'Source control', tier: 3, icon: Github, description: 'Repositories and pipeline status.', connected: false },

  // Containers & orchestration
  { id: 'docker', name: 'Docker Engine', category: 'Containers & orchestration', tier: 1, icon: Container, description: 'Local container and Compose project management.', connected: true },
  { id: 'kubernetes', name: 'Kubernetes', category: 'Containers & orchestration', tier: 2, icon: Boxes, description: 'Cluster, workload, and rollout visibility.', connected: false },
  { id: 'helm', name: 'Helm', category: 'Containers & orchestration', tier: 2, icon: Boxes, description: 'Chart releases and values inspection.', connected: false },

  // Cloud providers
  { id: 'aws', name: 'Amazon Web Services', category: 'Cloud providers', tier: 1, icon: Cloud, description: 'EC2, CloudWatch, and Secrets Manager inventory.', connected: false },
  { id: 'gcp', name: 'Google Cloud Platform', category: 'Cloud providers', tier: 2, icon: Cloud, description: 'Compute Engine, GKE, and Cloud Logging.', connected: false },
  { id: 'azure', name: 'Microsoft Azure', category: 'Cloud providers', tier: 2, icon: Cloud, description: 'Virtual Machines, AKS, and Azure Monitor.', connected: false },

  // Infrastructure as code
  { id: 'terraform', name: 'Terraform', category: 'Infrastructure as code', tier: 2, icon: Layers, description: 'Plan and state visibility for provisioned infrastructure.', connected: false },
  { id: 'vault', name: 'HashiCorp Vault', category: 'Infrastructure as code', tier: 3, icon: Layers, description: 'Secret engine references for the automation vault.', connected: false },

  // Databases
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', tier: 1, icon: Database, description: 'Connection health and schema-aware configuration checks.', connected: true },
  { id: 'redis', name: 'Redis', category: 'Databases', tier: 1, icon: Database, description: 'Cache and queue health checks.', connected: false },

  // Observability
  { id: 'opentelemetry', name: 'OpenTelemetry', category: 'Observability', tier: 1, icon: Activity, description: 'Trace and metric correlation across services.', connected: true },
  { id: 'prometheus', name: 'Prometheus', category: 'Observability', tier: 2, icon: BarChart3, description: 'Metrics scraping and alerting rules.', connected: false },
  { id: 'grafana', name: 'Grafana', category: 'Observability', tier: 2, icon: BarChart3, description: 'Dashboard embedding for infrastructure health.', connected: false },
  { id: 'loki', name: 'Loki', category: 'Observability', tier: 2, icon: Activity, description: 'Log aggregation and correlation.', connected: false },
  { id: 'sentry', name: 'Sentry', category: 'Observability', tier: 2, icon: Activity, description: 'Error tracking linked to deployments.', connected: false },
  { id: 'datadog', name: 'Datadog', category: 'Observability', tier: 3, icon: BarChart3, description: 'APM and infrastructure monitoring.', connected: false },

  // Project management
  { id: 'linear', name: 'Linear', category: 'Project management', tier: 2, icon: Kanban, description: 'Issue and cycle tracking linked to incidents.', connected: false },
  { id: 'jira', name: 'Jira', category: 'Project management', tier: 2, icon: Kanban, description: 'Issue tracking linked to incidents and deployments.', connected: false },

  // Communication & incidents
  { id: 'slack', name: 'Slack', category: 'Communication & incidents', tier: 3, icon: MessagesSquare, description: 'Incident notifications and approval requests.', connected: false },
  { id: 'pagerduty', name: 'PagerDuty', category: 'Communication & incidents', tier: 3, icon: BellRing, description: 'On-call paging for critical incidents.', connected: false },
];

export const integrationCategories = Array.from(new Set(mockIntegrations.map((i) => i.category)));

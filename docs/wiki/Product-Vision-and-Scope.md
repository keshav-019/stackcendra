# Product Vision and Scope

## Vision

StackCendra gives engineering teams a continuous, explainable view of the path from source code to running production systems. It connects repository structure, runtime requirements, configuration, infrastructure, deployments, and telemetry so failures can be prevented or reproduced instead of investigated through disconnected tools.

## Positioning

StackCendra is not marketed as a replacement for GitHub, Docker Desktop, Datadog, Jira, Slack, and terminal clients simultaneously.

The initial position is:

> Detect, reproduce, and resolve environment-related failures across local development and production.

The broader platform exists to deepen that workflow, not to compete superficially in every adjacent product category.

## Problem statement

Modern applications fail at the boundaries between systems:

- a required environment variable exists locally but not in production;
- a runtime or database version differs between environments;
- a service listens on an undocumented port;
- dependency startup order differs from a developer's assumptions;
- a deployment changes code and configuration at the same time;
- logs describe symptoms without connecting them to the responsible change;
- reproducing production behavior risks exposing credentials or customer data.

Existing tools show fragments of the answer. StackCendra builds an evidence graph connecting those fragments.

## Target users

Primary:

- backend and DevOps engineers;
- platform engineering teams;
- startup engineering teams without dedicated SRE staff;
- agencies operating multiple client deployments;
- developers managing applications across several virtual machines;
- Docker Compose teams beginning to adopt Kubernetes.

Secondary, after the core workflow is proven:

- engineering managers reviewing deployment and incident outcomes;
- security and compliance teams reviewing policy and audit evidence;
- larger enterprises operating customer-hosted runners.

## Product outcomes

A successful StackCendra workflow lets a team:

1. understand what a repository needs to run;
2. create a reproducible local environment;
3. detect configuration or runtime drift before deployment;
4. execute controlled, auditable deployment actions;
5. correlate production symptoms with changes and environment state;
6. reproduce the failure locally without production secrets;
7. verify remediation and preserve regression evidence.

## Product wedge

The first public capability is intelligent project discovery. A user selects a directory and StackCendra identifies repositories, services, frameworks, package managers, runtimes, ports, data stores, and dependency relationships with evidence and confidence scores.

This wedge is appropriate because it:

- is useful without a cloud account;
- demonstrates serious local systems engineering;
- creates the data foundation for environment generation and drift analysis;
- can be evaluated using deterministic fixtures;
- avoids granting write access to infrastructure in the first release.

## Success measures

Early product measures:

- time from directory selection to useful project map;
- percentage of detected facts linked to source evidence;
- precision and recall on the maintained fixture repository;
- number of manual corrections required;
- time for a new contributor to understand and run a sample project;
- percentage of scans completed without network access;
- zero unauthorized file, secret, or command access.

Later measures:

- deployment failures prevented;
- mean time to a supported root-cause hypothesis;
- time to safe local reproduction;
- percentage of remediations verified automatically;
- audit completeness across approvals and execution.

## Explicit early non-goals

The initial releases will not:

- replace sprint-management products;
- provide built-in multiparty video infrastructure;
- autonomously execute production remediation;
- support every language, cloud, or CI provider;
- ingest unlimited production telemetry;
- synchronize production secret values automatically;
- require Kubernetes for local development;
- split every module into an independently deployed microservice;
- introduce a graph database before PostgreSQL relationships are insufficient.

## Product principles

- **Evidence before confidence:** explanations expose their sources and uncertainty.
- **Local-first for sensitive operations:** filesystem, terminal, SSH, and credentials remain device-controlled where possible.
- **Least privilege:** every capability is narrow, explicit, time-bound, and auditable.
- **Human-controlled automation:** generated actions are drafts until policy and approval requirements are satisfied.
- **Progressive architecture:** complexity follows measured demand.
- **Useful releases:** each release completes a user outcome rather than exposing disconnected infrastructure.

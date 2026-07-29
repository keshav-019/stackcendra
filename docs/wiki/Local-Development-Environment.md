# Local Development Environment

## Goal

A contributor should be able to prepare a Windows or Linux machine predictably, verify every prerequisite, and understand which services are active. Tool installation is part of Phase 0 and occurs only after architecture and version policies are documented.

## Foundation tool policy

Baseline selected on 2026-07-30:

| Tool | Policy | Phase 0 requirement |
| --- | --- | --- |
| Git | Recent supported stable | Required |
| GitHub CLI | Recent supported stable | Required for repository administration |
| Node.js | 24 LTS, exact patch pinned in repository metadata | Required |
| pnpm | Major 10 through Corepack, exact version pinned | Required |
| Next.js | 16.2 Active LTS with current security patch | Required after migration |
| React | 19.2 supported patch | Required after migration |
| Rust | Stable MSVC through rustup | Required |
| Tauri | Major 2 | Required |
| Docker Desktop | Current stable with Compose v2 | Required |
| WSL 2 | Current supported release on Windows | Required for Linux validation |
| PostgreSQL | Containerized supported release | Required when persistence begins |
| OpenTelemetry Collector | Containerized pinned image | Required when telemetry begins |
| Go | Current supported stable, exact version pinned | Install before active Go module work |
| Python | Supported stable line with per-project virtual environment | Install before active intelligence service work |
| Java | Supported LTS | Install when the flagship payment fixture begins |

Node.js 26 is the newest Current line, but Node.js recommends LTS for production applications. StackCendra therefore uses Node.js 24 LTS rather than following the newest Current major.

## Windows prerequisites for Tauri

- Microsoft Visual Studio C++ Build Tools with Desktop development for C++;
- Microsoft Edge WebView2 Runtime;
- Rust stable MSVC target;
- Node.js LTS;
- VBSCRIPT optional feature only when MSI packaging requires it.

Official reference: [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Machine audit at Phase 0 start

| Capability | Observed state |
| --- | --- |
| Git | 2.55.0 |
| GitHub CLI | Not installed |
| Node.js | 20.15.0; end-of-life and scheduled for replacement |
| npm | 10.7.0 |
| Corepack | Present |
| pnpm | Not activated |
| Rust/Cargo | Not installed |
| Docker | Not installed |
| Go | Not installed |
| Python | 3.12.4 |
| Java | OpenJDK 8; not the future fixture baseline |
| WSL | 2.7.11 |
| Visual Studio C++ tools | Present |
| WebView2 | Present |

## Installation order

1. Install the checksum-verified official Node.js 24 LTS release. A version manager may be introduced when the repository needs to test several Node lines.
2. Activate the pinned pnpm release through Corepack.
3. Install rustup and select the stable MSVC toolchain.
4. Install Docker Desktop using the WSL 2 backend.
5. Install GitHub CLI for authenticated repository administration.
6. Verify Git, GitHub CLI, C++ Build Tools, WebView2, WSL, Node, pnpm, Rust, Docker, and Compose.
7. Add Go, Python, or Java only when their first active module or fixture is introduced.

Installing every future runtime immediately is avoided because unused global toolchains create drift without improving the current phase.

## Version recording

The repository will record:

- Node and package-manager versions in `package.json`;
- a version-manager file for contributor tools;
- Rust channel and components in `rust-toolchain.toml`;
- container images by explicit version and eventually digest;
- Go version in `go.mod`;
- Python range in `pyproject.toml` plus a locked dependency set;
- Java toolchain version in the fixture build.

No setup instruction uses an unbounded `latest` tag in reproducible workflows.

## Package-manager policy

- pnpm is the only JavaScript package manager.
- `pnpm-lock.yaml` is committed.
- npm, Yarn, and Bun lockfiles are not maintained after migration.
- dependency installation in CI uses frozen-lockfile mode.
- workspace packages use explicit dependency declarations.
- package scripts do not download or execute unpinned remote code silently.

## Local service profiles

Local infrastructure uses Compose profiles:

- `core`: PostgreSQL, Redis when required, and OpenTelemetry Collector;
- `observability`: Prometheus, Grafana, Loki, and Tempo;
- `workflow`: Temporal and its dependencies;
- `full`: all implemented services;
- feature-specific profiles for integration tests.

The default developer command starts only what the current task needs.

## Verification checklist

Representative checks after installation:

```powershell
git --version
node --version
corepack --version
pnpm --version
rustup show
rustc --version
cargo --version
docker version
docker compose version
wsl --version
```

Repository-specific validation commands are added when the monorepo is established.

## Environment and secret policy

- `.env` files containing secrets are ignored.
- `.env.example` contains names and safe placeholders only.
- local secrets use the OS keychain or a documented development vault.
- test credentials are synthetic and scoped to disposable resources.
- telemetry exporters default to local endpoints.
- external AI providers are opt-in and receive minimized evidence.

## Supported developer platforms

Primary:

- Windows 11 with WSL 2;
- current mainstream Linux distributions.

Later:

- macOS when notarized desktop distribution becomes an active release goal.

Cross-platform behavior is validated with fixtures and CI; platform-specific implementations remain behind explicit interfaces.

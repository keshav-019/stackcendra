# Toolchain Setup Record

## Record

- **Machine:** Primary Windows development machine
- **Recorded:** 2026-07-30
- **Purpose:** StackCendra Phase 0 foundation

This page records observed tool versions. Repository version files become authoritative when the monorepo is established.

## Installed and verified

| Tool | Version | State |
| --- | --- | --- |
| Git | 2.55.0.windows.3 | Ready |
| GitHub CLI | 2.94.0 | Installed; authenticated as `keshav-019` |
| Node.js | 24.18.1 LTS | Installed; replaced end-of-life Node.js 20 |
| npm | 11.16.0 | Installed with Node.js |
| Corepack | 0.35.0 | Ready |
| pnpm | 10.34.5 | Prepared and enabled through Corepack |
| rustup | Stable MSVC channel | Ready |
| rustc | 1.97.1 | Ready |
| Cargo | 1.97.1 | Ready |
| rustfmt | 1.9.0-stable | Ready |
| Clippy | 0.1.97 | Ready |
| Docker CLI | 29.6.2 | Installed |
| Docker Compose | 5.3.1 | Installed |
| WSL | 2.7.11.0 | Ready for Docker's WSL 2 backend |
| Visual Studio C++ tools | Visual Studio 2022 Community | Tauri prerequisite present |
| WebView2 Runtime | 150.0.4078.105 | Tauri prerequisite present |

## Existing runtimes retained

| Tool | Version | Decision |
| --- | --- | --- |
| Python | 3.12.4 | Retain until the intelligence-service compatibility matrix selects its Python line |
| Java | Temurin OpenJDK 8u412 | Do not use as the future fixture baseline; install a supported LTS when the Java fixture begins |

Go is intentionally deferred until the Go control plane becomes active. Kubernetes, Terraform, cloud-provider CLIs, and observability services are also installed only when their release work begins.

## Docker first-launch gate

Docker Desktop was installed per-user with the WSL 2 backend. The CLI and Compose plugin are verified, but the Docker engine is not considered ready until the user:

1. launches Docker Desktop;
2. reviews and accepts or declines Docker's subscription agreement;
3. confirms the WSL 2 engine starts;
4. runs `docker version`;
5. runs a disposable hello-world verification.

StackCendra does not accept third-party agreements on the user's behalf.

## GitHub Wiki publication status

GitHub CLI authentication is complete. On July 30, 2026, GitHub reported the repository as public with `hasWikiEnabled: true`.

The one-time initial page has been created and the complete 41-file source has been published to `stackcendra.wiki.git`. The placeholder Home page was replaced while its initial commit was retained in history.

The recurring publication process is:

1. clone `git@github.com:keshav-019/stackcendra.wiki.git`;
2. copy the reviewed Markdown source from `docs/wiki`;
3. commit the exact source revision;
4. push the Wiki repository's default branch;
5. verify navigation and Mermaid rendering on GitHub.

Internal navigation uses absolute, extensionless hosted Wiki URLs because GitHub redirects `.md` Wiki URLs to raw Markdown rather than rendered pages.

## Reverification

After opening a fresh terminal:

```powershell
git --version
gh --version
gh auth status --hostname github.com
node --version
npm --version
corepack --version
pnpm --version
rustup show active-toolchain
rustc --version
cargo --version
rustfmt --version
cargo clippy --version
docker --version
docker compose version
wsl --version
```

Exact project versions will be pinned during P0-004 rather than relying on the machine record alone.

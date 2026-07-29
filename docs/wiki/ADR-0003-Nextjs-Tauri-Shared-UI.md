# ADR 0003: Use Next.js and Tauri with Shared UI

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

The current prototype is a Vite React single-page application. The target product needs a web dashboard, documentation and public pages, server-aware routing, and a desktop application with privileged local capabilities.

## Decision

Migrate the web application to the Next.js App Router and React 19.2. Use Tauri 2 for the desktop shell. Share product components, tokens, schemas, and client logic through workspace packages while keeping platform entry points and privileged capabilities explicit.

Next.js does not replace React; it supplies the application framework around React.

## Consequences

- Web routing and rendering follow Next.js conventions.
- Tauri loads a desktop-compatible frontend boundary and invokes explicit Rust commands.
- Shared UI cannot assume browser-only or desktop-only globals.
- Privileged operations never become ordinary browser APIs.
- Existing prototype components are evaluated and migrated selectively rather than copied wholesale.

## Alternatives considered

- Keep Vite for both web and Tauri.
- Use Electron for the desktop application.
- Maintain unrelated web and desktop interfaces.

Next.js supports the web product direction, while Tauri provides a smaller Rust-native security boundary aligned with the local-agent roadmap.

## Revisit when

Next.js prevents required desktop reuse or measured deployment constraints outweigh its web capabilities.

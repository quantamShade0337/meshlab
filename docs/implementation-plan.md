# Meshlab V1 implementation plan

## Foundation

- [x] Inspect the supplied product brief and empty repository.
- [x] Choose Next.js App Router, TypeScript, Tailwind CSS, and pnpm.
- [x] Establish a visual concept and centralized design direction.
- [x] Add shared UI primitives, application shell, and typed sample data.

## Authentication

- [x] Integrate Clerk with `ClerkProvider` and Next.js `proxy.ts`.
- [x] Add Clerk-powered `/login` and `/signup` routes.
- [x] Protect project and settings routes on the server.
- [x] Preserve intended redirects.
- [x] Add development-only guest mode with an explicit local session.
- [x] Document Clerk keys and social connection configuration.

## Product flow

- [x] Build the product-led landing page.
- [x] Build the projects dashboard and empty state.
- [x] Build new-project upload, validation, settings, and review states.
- [x] Add an asynchronous mock generation provider and status route.
- [x] Build project detail and viewport-first editor routes.
- [x] Add local editor persistence, undo/redo, and export records.
- [x] Build settings and help routes.

## Quality

- [x] Add focused unit tests for schemas and provider mappings.
- [ ] Add Playwright coverage for guest and authenticated route behavior.
- [x] Run lint, type checking, and the production build.
- [x] Verify landing, auth, dashboard, generation, and editor in-browser.

## Architecture notes

- Clerk is the production identity boundary. Application data reads must derive
  ownership from the verified Clerk user ID, never from a client-supplied ID.
- Guest mode is enabled only in development or by explicit configuration and
  stores sample state locally. It must not become an implicit production bypass.
- The first implementation uses a replaceable in-memory/local repository and a
  mock generation provider. Provider and persistence interfaces remain typed so
  external services can replace them without changing page components.

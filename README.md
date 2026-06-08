# Meshlab

Meshlab is a Next.js prototype for turning a reference image into an editable
3D project. It includes the landing page, project workflow, asynchronous
generation jobs, browser editor, exports, and Clerk-backed authentication.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Clerk authentication

Create a Clerk application and place its keys in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

The app supplies `/login` and `/signup` catch-all routes, wraps the application
with `ClerkProvider`, and protects `/projects/**` and `/settings/**` in
`src/proxy.ts`. Redirects back to the originally requested local path are
preserved.

Enable email/password or email-link sign-in in the Clerk dashboard. Google and
GitHub buttons appear only after those social connections are configured in
Clerk; no provider credentials are embedded in this repository.

## Development guest mode

With no Clerk keys, local development can use an explicit HTTP-only guest
session:

```bash
ENABLE_GUEST_MODE=true
```

Guest access is not an implicit auth bypass. It must be selected on `/login`
and is disabled in production unless
`ALLOW_INSECURE_GUEST_MODE_IN_PRODUCTION=true` is also set. Do not enable that
production override for a real deployment.

## Commands

```bash
pnpm lint
pnpm test
pnpm build
pnpm start
```

## Image-to-3D provider

`IMAGE_TO_3D_PROVIDER=mock` uses the deterministic local adapter. Source images
are decoded and validated server-side through `/api/uploads`; generation jobs
reference the resulting private source asset rather than trusting browser MIME
or dimensions. Jobs are created through `/api/generations`, persisted in the server process, polled
through a status endpoint, and support idempotency, cancellation, retry,
failure simulation, timeout simulation, capability discovery, and validated
model metadata.

The mock returns a bundled sample asset; it does not claim to reconstruct
arbitrary uploaded images. To connect a production service, implement
`src/providers/image-to-3d/real-provider-placeholder.ts` and map its
capabilities, statuses, errors, webhooks, and private asset URLs into the typed
provider contract. Provider credentials must remain server-side.

The in-memory repository is refresh-safe but not restart-safe. Replace it with
the production database before deploying multiple instances. Production data
access must derive ownership from the verified Clerk user ID rather than
accepting a user ID from the client.

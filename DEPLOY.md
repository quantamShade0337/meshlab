# Deploying Meshlab to Railway

Meshlab is a Next.js 16 app. Railway builds it with Nixpacks (`pnpm build`) and
serves it with `pnpm start`. `next start` binds `0.0.0.0` and reads Railway's
`PORT` automatically.

## 1. Create the service

1. New Project → Deploy from GitHub repo (select this repo).
2. Railway auto-detects Next.js. `railway.json` pins the build/start commands and
   a `/` health check.
3. Node is pinned to 22 via `.nvmrc`.

> pnpm's native build-script gate is pre-approved in `pnpm-workspace.yaml`
> (`allowBuilds` + `ignoredBuiltDependencies`), so `pnpm install` won't prompt.
> `sharp` and the depth-model runtime use prebuilt binaries — no native build.

## 2. Environment variables

Set these in the Railway service **Variables** tab (available at build + runtime).

### Required — authentication (Clerk)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` (or `pk_test_…`) |
| `CLERK_SECRET_KEY` | `sk_live_…` (or `sk_test_…`) |

> `NEXT_PUBLIC_*` values are inlined at **build** time. Set them before the first
> deploy; change → redeploy.

### Recommended
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/signup` |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.up.railway.app` |

### Optional — accurate 360° reconstruction (free Hugging Face Space)
| Variable | Value |
|---|---|
| `HF_TOKEN` | free token from huggingface.co/settings/tokens (read scope) |
| `HF_SPACE_ID` | defaults to `JeffreyXiang/TRELLIS` |

Without `HF_TOKEN`, "Generate accurate 360°" returns a clear error; everything
else (depth relief, lithophane, export, editor) works.

### Do NOT set in production
- `ENABLE_GUEST_MODE` (leave unset/false). Guest mode is dev-only and is refused
  in production unless `ALLOW_INSECURE_GUEST_MODE_IN_PRODUCTION=true` — don't.

## 3. Clerk dashboard
Add your Railway domain to the Clerk app's allowed origins, and set the sign-in /
sign-up paths to `/login` and `/signup`.

## What runs where
- **Fast tier** (depth relief, lithophane): 100% in the browser — zero server
  cost, no external calls.
- **Accurate 360°**: server-side call to the HF Space, then the GLB is returned
  to the browser.
- **Export** (STL/OBJ/GLB): in the browser.

## Known limitations (prototype scope)
- Uploaded images and generation jobs are held in **in-memory** stores
  (`globalThis` maps). They reset on every restart/redeploy and are **not shared
  across replicas** — keep `numReplicas: 1` (set in `railway.json`). Swap these
  for a database + object storage before scaling.
- The base generation pipeline (`/api/generations`) is a **mock**; the real
  shape work is the on-device depth/lithophane and the HF 360° path.
- Free HF Spaces are best-effort (cold starts, queues). For reliable 360° at
  scale, wire a paid provider behind `RealImageTo3DProviderPlaceholder`.

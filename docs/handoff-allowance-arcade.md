# Handoff — `allowance-arcade` (public demo deployment)

> **One repo, two Vercel projects.** This repo (`github.com/phenly/allowance-arcade`)
> is deployed by **two separate Vercel projects** that both auto-build `main`.
> This doc covers the **demo** project. Its twin is the real family app:
> [`handoff-chore-tracker.md`](./handoff-chore-tracker.md).
>
> ⚠️ **Come back to both docs whenever you change the demo *or* the core app** —
> a single push redeploys both projects, but they carry different domains and
> different env config, so a change that's fine for one can surprise the other.

## What this is

The **public-facing demo** of Allowance Arcade — what people hit from the README
"Try the live demo" link.

| | |
|---|---|
| Vercel project | `allowance-arcade` |
| Project ID | `prj_VsaSwwSfW2dV5HPRUbhZFS5QNjvh` |
| Team | `kevins-projects-5febbac9` (`team_hipKzuAiqORJMyfAAHBpdsV3`) |
| Git connection | `github.com/phenly/allowance-arcade`, branch `main`, **auto-deploys on push** |
| Custom domains | `arcade.pixelbytes.net` *(added 2026-09-16)*, `arcade.pixelbites.net` *(original, still live)* |
| Vercel URL | `allowance-arcade.vercel.app` |
| Env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Production + Preview) |

### DNS (both demo domains)
Both `arcade.*` hostnames are GoDaddy-managed apex domains with a host-level
`A` record → **`76.76.21.21`** (Vercel), and both are attached to this project:

- `arcade.pixelbytes.net` — GoDaddy `A / arcade / 76.76.21.21` (`pixelbytes.net` NS still at GoDaddy `ns27/ns28.domaincontrol.com`)
- `arcade.pixelbites.net` — same pattern on `pixelbites.net`

## Demo-vs-real mechanism (important)

Whether a build behaves as a sandbox is decided **at runtime by env vars**, in
`src/lib/supabase.js`:

```
IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true' || !VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY
```

- `IS_DEMO === true` → browser-local sample data via `src/lib/demoClient.js`, nothing hits a backend, and `App.jsx` shows the "Demo mode" banner.
- `IS_DEMO === false` → runs against the Supabase project named by the env vars.

⚠️ **Confirm before relying on it:** as observed, this project has **both**
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set and **no** `VITE_DEMO_MODE`,
which by the rule above means `IS_DEMO` is **false** — i.e. it runs against a
Supabase backend, not the browser-local sandbox. Verify in the Vercel dashboard
**which** Supabase project those creds point at (it should be a throwaway demo DB,
**not** the real family DB used by [`chore-tracker`](./handoff-chore-tracker.md)).
If you want the true browser-local sandbox described in `.env.example`, set
`VITE_DEMO_MODE=true` (or clear the Supabase creds) on this project.

## When you touch the demo

1. A push to `main` redeploys this project automatically (and `chore-tracker` too).
2. If you change demo/real gating (`src/lib/supabase.js`, `demoClient.js`) or env
   vars, re-check **both** projects' Vercel env settings.
3. Demo domains: changes to `arcade.pixelbytes.net` / `arcade.pixelbites.net`
   routing are Vercel-project domains here; DNS lives at GoDaddy.

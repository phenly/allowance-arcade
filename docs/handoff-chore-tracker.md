# Handoff — `chore-tracker` (real / core app deployment)

> **One repo, two Vercel projects.** This repo (`github.com/phenly/allowance-arcade`)
> is deployed by **two separate Vercel projects** that both auto-build `main`.
> This doc covers the **real family app**. Its twin is the public demo:
> [`handoff-allowance-arcade.md`](./handoff-allowance-arcade.md).
>
> ⚠️ **Come back to both docs whenever you change the core app *or* the demo** —
> a single push redeploys both projects, but they carry different domains and
> different env config, so a change that's fine for one can surprise the other.

## What this is

The **real Allowance Arcade app** — the instance backed by the live Supabase
database the family actually uses. It's the original project (created 2026-03-04,
originally named "chore-tracker" before the app was renamed Allowance Arcade).
This is the project the local repo's `.vercel/` is linked to.

| | |
|---|---|
| Vercel project | `chore-tracker` |
| Project ID | `prj_P55ymG5zSvaOXcfYOrGFONJA8mds` |
| Team | `kevins-projects-5febbac9` (`team_hipKzuAiqORJMyfAAHBpdsV3`) |
| Git connection | `github.com/phenly/allowance-arcade`, branch `main`, **auto-deploys on push** |
| Custom domains | none — served at the Vercel URL |
| Vercel URL | `chore-tracker-gold-rho.vercel.app` |
| Env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → **real** Supabase project (`dbgnbhcovx…`), all environments |

## Real-vs-demo mechanism (important)

Same codebase, same `main` build as the demo — the difference is **env vars** at
runtime (`src/lib/supabase.js`):

```
IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true' || !VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY
```

This project sets both Supabase creds (and no `VITE_DEMO_MODE`), so `IS_DEMO` is
false and it runs against the **real** backend. Treat its data as production —
the family relies on it. The public sandbox lives on the twin project,
[`allowance-arcade`](./handoff-allowance-arcade.md).

## Naming / linking gotchas (the thing to revisit)

- The Vercel **project name is still `chore-tracker`** even though the app is now
  "Allowance Arcade." Not renamed to avoid churn; rename in the Vercel dashboard
  if desired (frees the build URL `chore-tracker-*.vercel.app`).
- `.vercel/project.json` in this repo links here (`chore-tracker`). It is
  git-ignored. Both projects auto-deploy from GitHub regardless of the local link,
  so `git push` updates **both**; the local link only matters for manual
  `vercel …` CLI commands.
- **Two projects building one repo is redundant by design right now.** If you ever
  want to consolidate to a single project, that's a deliberate change (reconnect
  Git, move the `arcade.*` domains, delete one project) — not something to do
  casually, since it touches the live demo domains and this real app.

## When you touch the core app

1. A push to `main` redeploys this project automatically (and the demo too).
2. Verify Supabase env/schema changes against this project's **real** DB before
   pushing; a `main` change hits production immediately.
3. If you change demo/real gating (`src/lib/supabase.js`, `demoClient.js`),
   re-check **both** projects — see [`allowance-arcade`](./handoff-allowance-arcade.md).

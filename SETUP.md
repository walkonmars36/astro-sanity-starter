# New project setup

Cloning `astro-sanity-starter` + `sanity-studio-starter` does **not** leave
you in a runnable state. Three things are missing every time, and none of
them fail with an error that points back at what's actually wrong. Follow
this checklist in order rather than debugging from symptoms.

Assumes the usual folder structure: a parent project folder (e.g.
`client-name/`) containing `frontend/` and `studio/` as sibling clones,
each its own git repo.

## 1. Install dependencies — both repos

```bash
cd frontend && npm install
cd ../studio && npm install
```

Skipping either one gives `astro: command not found` or `sanity: command
not found`, which reads like a broken install rather than a missing step.

## 2. Create the Sanity project

```bash
cd studio
npx sanity init
```

Or via [sanity.io/manage](https://sanity.io/manage) if you prefer the UI.
Note the **project ID** it gives you.

Update `studio/sanity.config.ts`:

```ts
title: 'Client Name',
projectId: '<your-new-project-id>',
dataset: 'production',
```

## 3. Set up environment variables

```bash
cd frontend
cp .env.example .env
```

Fill in:

- `PUBLIC_SANITY_PROJECT_ID` — same ID as step 2
- `PUBLIC_SANITY_DATASET` — `production`, unless you set up something else
- `SANITY_API_READ_TOKEN` — see step 4

Without this file, every page 500s with a generic `Configuration must
contain projectId` error from `@sanity/client` — nothing about that error
points you back to `.env`.

## 4. Generate a read token

From `studio/`:

```bash
sanity debug --secrets
```

This gives you a management token. Use it to script a read-role API token:

```bash
curl -X POST https://api.sanity.io/v1/projects/<projectId>/tokens \
  -H "Authorization: Bearer <token from sanity debug --secrets>" \
  -H "Content-Type: application/json" \
  -d '{"label":"frontend-read","role":"read"}'
```

Or manually: sanity.io/manage → project → API → Tokens → Add API token →
Viewer. Paste the result into `SANITY_API_READ_TOKEN` in `frontend/.env`.

## 5. Seed test content

The starter's `testMessage` document type proves the frontend↔Studio
connection works, but a fresh dataset starts empty. Generate a **separate**
write-role token (Editor role, sanity.io/manage → API → Tokens), keep it
out of `frontend/.env` entirely, this is a local-only operation:

```bash
cd studio
SANITY_API_WRITE_TOKEN=<your-write-token> node --env-file=.env scripts/seed.mjs
```

(Node 20.6+ required for `--env-file`. On older Node, `npm install dotenv`
and add `import 'dotenv/config'` as the first line of `scripts/seed.mjs`
instead.)

Re-run any time the test document goes missing, it upserts rather than
duplicating.

## 6. Set CORS origins

sanity.io/manage → project → API → CORS Origins → Add:

- `http://localhost:4321` (or whatever port Astro actually binds to, see
  the port note below), allow credentials, save.

## 7. Run both dev servers

```bash
# terminal 1
cd studio && npm run dev

# terminal 2
cd frontend && npm run dev
```

Check the frontend terminal's output for which port it actually bound to.
Astro defaults to `4321`, but silently shifts to `4322`/`4323`/etc. if
that port's already taken, including by an unrelated project's dev server
running elsewhere. If Presentation mode 404s or looks dead, this port
mismatch is the most likely cause, `lsof -nP -iTCP:4321 -sTCP:LISTEN`
tells you what's actually holding the port.

## Hard rules

Not gotchas to remember case by case — do these every time, no exceptions.

- **Always pass the generic type argument to `loadQuery`.** `loadQuery({ query, ... })` with no generic infers `data` as `{}`, and every property access on it silently fails type-checking. Correct: `loadQuery<SomeQueryResult>({ query, ... })`, with `SomeQueryResult` describing exactly the fields actually read from that query, expand it as more fields get consumed, don't let it drift stale. Bitten twice across two projects now, treat this as non-negotiable rather than something to catch on review.

## Sanity stega encoding vs. enum/select fields

**The pattern:** Sanity's Visual Editing (Presentation tool / draft mode) stega-encodes
_every_ string value returned by a GROQ query, not just prose. It appends invisible
Unicode (zero-width space, zero-width joiner, `﻿`) to the end of the string so the
click-to-edit overlay can map rendered text back to its source field. This is enabled by
`frontend/src/sanity/lib/load-query.ts` via `stega: draftMode` whenever the Sanity
draft-mode/perspective cookie is present (i.e. any time content is viewed through the
Presentation tool, or a signed preview link).

This is invisible in a browser tab, a DevTools Elements panel screenshot, or a
`<title>` — but it's real text. It breaks anything that does an **exact** string
comparison or renders the value somewhere other than as visible prose:

- CSS attribute selectors, e.g. `[data-panel="sage"]` no longer matches `"sage" + 300
invisible chars`
- `===`/`!==` conditionals driving class names or layout (`mediaSide === "right"`)
- `<title>` / `<meta name="description">` — looks fine in the tab, but corrupts what a
  search engine or link-unfurl scraper actually indexes

**The rule:** any Sanity field that is an enum/select (`options.list` in the schema) or
otherwise consumed for _logic_ rather than _display_ — CSS selector, class name, JS
conditional, `<title>`/`<meta>` content — must be passed through `stegaClean()` (from
`@sanity/client/stega`) at the point it's destructured from the query result, before it's
used in any comparison or attribute. Prose fields meant to render as visible text
(`heading`, `body`, `eyebrow`, portable text, etc.) should be left un-cleaned, so
click-to-edit overlays keep working on them in Presentation mode.

```ts
const { panel: rawPanel = "none" } = Astro.props;
const panel = stegaClean(rawPanel); // safe to use in [data-panel=...] or ===
```

This starter doesn't ship example page-builder sections with enum/select fields out of
the box — apply the pattern the first time a component destructures a select/enum field
from `loadQuery`'s result and uses it for logic (a CSS selector, a class name, a JS
conditional, or `<title>`/`<meta>` content) rather than rendering it as prose.

**Why this can't leak into production by default:** `load-query.ts` passes
`stega: draftMode` on every fetch, where `draftMode` is derived from whether the signed,
secret-validated draft-mode cookie is present (`@sanity/preview-url-secret`). The
`@sanity/astro` integration's `stega: { studioUrl }` config in `astro.config.mjs` only
supplies the Studio URL for the overlay deep-link — it does not itself turn stega on;
`@sanity/client`'s default is `stega.enabled: false` unless a fetch call explicitly opts
in. So a real site visitor without that cookie always gets clean strings regardless of
what new fields get added later — the `stegaClean()` calls above exist for the
draft-mode/Presentation-tool case, not as a production safety net.

---

For less common gotchas (trailing whitespace in folder names, named vs.
default export mix-ups, the Presentation tool's known connection-drop
bug, etc.), see the running reference doc:
[Astro / Sanity — Quick Reference & Gotchas](https://app.notion.com/p/382e1ca30be581ffa97cca3a0d09a194)

# Astro Sanity Starter

A clean Astro frontend scaffold pre-configured for Sanity Visual Editing.
Built by 13foot3.

## What's included

- Astro in SSR/hybrid mode with Node adapter
- Full Sanity and Visual Editing package suite installed and wired
- Presentation tool configured with draft mode infrastructure
- `draft-mode.ts` and `load-query.ts` helpers
- API routes for draft mode enable/disable
- `SanityVisualEditing` and `DisableDraftMode` React components
- `image.ts` using `sanity:client` virtual module and `createImageUrlBuilder`
- 13foot3 CSS framework — `variables.css`, `global.css`, `utilities.css`,
  `components.css`
- `u-container` utility, CUBE CSS layer structure, Lumos-inspired responsive
  variable system
- Netlify-ready (netlify.toml included)

## Pair with

- [sanity-studio-starter](https://github.com/walkonmars36/sanity-studio-starter)
  — the companion Sanity Studio starter

## Recommended project structure

```
your-project/
├── frontend/   (astro-sanity-starter)
└── studio/     (sanity-studio-starter)
```
## Getting started

```bash
git clone https://github.com/walkonmars36/astro-sanity-starter.git
cd astro-sanity-starter
npm install
```

Add a `.env` file at the project root:

PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token

Then run:

```bash
npm run dev
```

Frontend runs on localhost:4321 by default.

## CSS framework

The `src/styles` folder contains the 13foot3 CSS framework:

- `variables.css` — brand design tokens. Replace this file per project
  with client colours, fonts, and type scale
- `global.css` — framework-level reset, base elements, spacing scale, and
  the Lumos-inspired container query responsive variable system. Unchanged
  across projects
- `utilities.css` — single-purpose utility classes including `u-container`.
  Unchanged across projects
- `components.css` — shared component styles (buttons etc). Unchanged
  across projects

On each new project, only `variables.css` needs to be defined. Everything
else is ready to go.

## Deployment

Configured for Netlify out of the box. Swap the Node adapter for your
preferred platform adapter if deploying elsewhere.

## Notes

- `image.ts` uses the `sanity:client` virtual module provided by
  `@sanity/astro` — there is no separate client file
- Always pass a generic type argument to `loadQuery` matching the query shape
- Visual Editing works automatically via stega encoding on string fields.
  Images require `createDataAttribute` from `@sanity/visual-editing`

## Built by

[13foot3](https://13foot3.com) — web design and development studio, Bristol.

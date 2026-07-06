# AGENTS.md

Static marketing site for **Deep Frontier Diving** — Astro 7, no UI framework, no backend.

## Commands

```bash
npm run dev       # dev server (http://localhost:4321)
npm run build     # static build → dist/
npm run preview   # serve built dist/ locally
```

No test, lint, or typecheck script is configured. Verify work with `npm run build` (it type-checks via Astro's strict tsconfig).

## CSS architecture (important — non-obvious)

Styles are **hand-written static files in `public/css/`**, served verbatim and linked by URL. They are NOT imported/bundled by Astro/Vite.

- `public/css/global.css` — design system + tokens, loaded on every page by `BaseLayout.astro`.
- One per-page file (`index.css`, `training.css`, …) opt-in via the `pageCss` prop on `BaseLayout` → renders as `<link rel="stylesheet" href={pageCss}>`.

➡️ To style something, edit the relevant `public/css/*.css` directly. Do **not** add `<style>` blocks or `import './x.css'` in components — that breaks the pattern. Design tokens (`--ink`, `--paper`, `--accent`, `--display`, `--sans`, …) live in `global.css` `:root`; legacy aliases (`--green`, `--off-white`, `--line`, …) are kept mapped for older pages.

Class convention is BEM-ish: `block__element--modifier` (double-dash modifiers, e.g. `btn--primary`, `nav__link--active`).

## Client-side JS

TypeScript in `src/scripts/`, wired into pages via `<script>import '../scripts/x.ts'</script>` (Astro bundles it). Key files:

- `index.ts` — contact form submit (POSTs to web3forms.com) **and** the homepage destinations shuffle. The shuffle keeps `#dest-kenya` first and `#dest-custom` last, shows 2 random others. **Do not remove those two IDs** or rename `.destinations__grid`.
- `blog.ts` — fetches the Medium feed (`@deepfrontier`) via `api.rss2json.com` at runtime and renders cards into `#blog-root`.

## View Transitions gotcha

`ClientRouter` (Astro view transitions) is enabled in `BaseLayout`. `Nav.astro` and `Footer.astro` use `transition:animate="slide"`, so they get swapped on navigation. The nav mobile-toggle click handler is therefore attached at `document` level (delegated) — keep it that way or the toggle dies after the first navigation.

## Deploy

`deploy.sh` uploads `dist/` over FTP (uses `lftp`, falls back to `curl`). Requires `FTP_HOST`, `FTP_USER`, `FTP_PASS` env vars (or `--host/--user/--pass` flags); `--remote-dir` defaults to `/`. Pass `--build` to build before uploading.

## Other facts

- **Fonts**: body is Segoe UI system stack; Archivo (700/800) for logo/wordmark only; Fraunces for display serif. Loaded via one Google Fonts `<link>` in `BaseLayout.astro` — match the existing weights if you change it.
- **Images**: two systems coexist — `public/img/*` referenced by raw URL in `style="background-image: url(...)"`, and `src/assets/img/*` imported through `astro:assets` `<Image>` for optimization (used for the logo variants).
- **Glyph mark**: the cuneiform logo is defined once as `<symbol id="glyph">` in `BaseLayout.astro` and reused via `<use href="#glyph">` in `Glyph.astro`.
- **Path alias** `@/*` → `src/*` is configured in tsconfig but unused; prefer relative imports to match the codebase.

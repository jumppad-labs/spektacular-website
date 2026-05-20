# Research: 000002_static-site-generation

## Alternatives considered and rejected

### Option A: Standalone Tailwind CLI build step

Run the Tailwind CSS CLI as a separate build step (Makefile / CI), producing
a compiled stylesheet that Hugo merely consumes. Hugo and Tailwind builds are
decoupled.

**Rejected**: Two build commands must be kept in sync — a developer or CI
job that runs `hugo` without first running `tailwindcss` ships stale or
missing CSS. It also forgoes Hugo's integrated asset pipeline (fingerprinting,
cache-busting, minification) that the native pipe provides for free. Hugo's
`css.TailwindCSS` function exists specifically to remove this split
(https://gohugo.io/functions/css/tailwindcss/). The only upside — decoupling
from the Hugo version — is marginal for a site with one maintainer.

### Option B: PostCSS pipeline with Tailwind v3

Use Hugo's older `css.PostCSS` route with Tailwind CSS v3, `postcss-cli`,
`autoprefixer`, and a `tailwind.config.js` file.

**Rejected**: Tailwind v3 is the previous major version; v4 is current and is
what Hugo's native pipe targets. The v3 route needs more npm dependencies
(`postcss`, `postcss-cli`, `autoprefixer`) and a JavaScript config file,
versus v4's CSS-only `@theme` configuration. Choosing it would mean adopting
an older stack on a brand-new project — pure technical debt at creation time.

### Option C: Preserve `.html` URLs via `uglyURLs` / aliases

Keep the exact current URLs (`/install.html`, `/how-it-works.html`) by
setting `uglyURLs = true` or generating Hugo `aliases`.

**Rejected**: The user was asked directly and stated the URL extension does
not matter — "just use whatever the site generator creates." Hugo's default
pretty URLs (`/install/`) are the conventional output; adding `uglyURLs` or
alias redirect stubs would be unrequested complexity. The spec's
URL-stability constraint is consciously relaxed on that explicit direction.

### Option D: Shortcode-based content authoring

Express the rich page layouts (pipeline diagrams, grids, cards) as Hugo
shortcodes embedded in Markdown content files, maximising "content in
Markdown".

**Rejected**: The user chose per-page Hugo layouts when asked. The three
existing pages are bespoke landing-page compositions, not prose; building a
shortcode vocabulary expressive enough to reproduce them is more upfront work
than per-page layouts, for a site whose non-goals explicitly exclude adding
new pages.

## Chosen approach — evidence

Hugo + Tailwind v4 via the native `css.TailwindCSS` pipe, per-page layouts,
Hugo default URLs:

- Hugo's `css.TailwindCSS` function is purpose-built for this and documented
  with the exact setup (https://gohugo.io/functions/css/tailwindcss/):
  `npm install -D tailwindcss @tailwindcss/cli @tailwindcss/typography`,
  enable `build.buildStats`, author `assets/css/main.css` with
  `@import "tailwindcss"` + `@source "hugo_stats.json"`, invoke via a
  `templates.Defer` block. Requires Hugo ≥ v0.161.0.
- `assets/css/style.css:14-54` — the existing design system is already a flat
  set of CSS custom properties (colours, spacing scale, radii). These map
  one-to-one onto a Tailwind v4 `@theme` block, so visual parity is a
  mechanical token port, not a redesign.
- `index.html:12-36`, `how-it-works.html:12-36`, `install.html:12-36` — the
  `<nav>` is byte-identical across all three files; the footer likewise.
  This duplication is exactly what Hugo partials + a base layout eliminate.
- `index.html`, `how-it-works.html`, `install.html` are layout-heavy
  (pipeline diagrams, feature grids, roadmap, two-column spec block) — not
  prose. Per-page layouts fit this far better than generic templating or
  shortcodes.
- `.github/workflows/deploy.yml` uploads `path: .`; switching to
  `path: ./public` is a small, well-understood change. GitHub Pages hosting
  and `CNAME` are untouched.

## Files examined

- `index.html:1-233` — Homepage; nav `12-36`, hero+install-block `38-73`,
  demo `75-87`, pipeline diagram `89-153`, features grid `155-201`, CTA
  `203-214`, footer `216-229`.
- `how-it-works.html:1-479` — page-hero `38-47`, steps `49-120`, spec-layout
  `122-206`, pipeline-stages `208-357`, config `359-386`, roadmap `388-440`;
  inline `style=` attrs at `246,247,296,303,382,434,447,454`.
- `install.html:1-146` — page-hero `38-46`, install-methods `49-126`,
  install-platforms grid `92-121`; nav active class at `18`.
- `assets/css/style.css:1-1000` — design tokens `:root` `14-54`; component
  classes BEM-ish; media queries `855-867` (900px), `870-942` + `996-1000`
  (640px); `backdrop-filter` nav `310-318`; roadmap `::before` bullets
  `843-848`.
- `assets/js/main.js:1-66` — copy-to-clipboard `4-34`, smooth-scroll `37-45`,
  dead `#install-tabs` handler `48-66` (no page has that element).
- `.github/workflows/deploy.yml:1-40` — Pages deploy on push to `main`,
  uploads repo root (`path: .`).
- `Makefile:1-4` — `serve` runs `python3 -m http.server 8080`.
- `CNAME` — `spektacular.dev`. `.nojekyll` — present, empty.
- `README.md:1-15` — documents the Python local-dev workflow.
- `.spektacular/config.yaml` — Spektacular config; plan dir
  `.spektacular/plans`, knowledge source `.spektacular/knowledge` (project).
- `.spektacular/knowledge/conventions.md` — stale Python/PEP8 boilerplate,
  not applicable to this repo.

## External references

- https://gohugo.io/functions/css/tailwindcss/ — authoritative setup for the
  native Tailwind pipe: Hugo ≥ v0.161.0, required npm packages, `buildStats`
  config, `assets/css/main.css` structure, and the `templates.Defer`
  invocation pattern. As of v0.161.0 Hugo dropped the standalone Tailwind
  binary — the npm CLI is mandatory.
- Web search (May 2026) on Hugo + Tailwind v4 — confirmed Tailwind v4
  auto-detects classes from `hugo_stats.json` (no `content` array) and that
  configuration moved out of `tailwind.config.js` into the CSS `@theme`
  block.

## Prior plans / specs consulted

- `.spektacular/specs/000002_static-site-generation.md` — source spec.
  Mandates Hugo + Tailwind, Markdown content, GitHub-hosting continuity;
  flags URL preservation as a known risk; states pixel parity is not
  required.
- `.spektacular/plans/1_install_instructions/` — prior plan for the original
  hand-built install page. Unrelated to this migration and not a dependency;
  its tab UI never shipped, which is why `main.js:48-66` is dead code.

## Open assumptions

- **Hugo Extended ≥ v0.161.0 is available** locally and installable in CI.
  If a pinned runner cannot get ≥ 0.161.0, the native `css.TailwindCSS` pipe
  is unavailable and the implement workflow must STOP and ask (fallback would
  be Option A/B from above).
- **The four reusable partials introduced in Phase 1.3** (install-block,
  badge, button, pipeline-node, feature-card) are assumed sufficient for the
  later pages. If Phase 2.1/2.2 reveal a shared structure not covered,
  add a partial rather than duplicating markup.
- **`CNAME` placed in `static/` reaches `public/` unchanged** — assumed from
  Hugo's standard `static/` passthrough; verify in the Phase 1.1 build check.

## Rehydration cues

To rebuild context from cold:
1. Re-read the spec: `spektacular spec file read 000002_static-site-generation.md`
2. Re-read this plan: `spektacular plan file read 000002_static-site-generation/plan.md`
   and `.../context.md`.
3. Re-read the three source pages (`index.html`, `how-it-works.html`,
   `install.html`) and `assets/css/style.css:14-54` for the design tokens.
4. Re-read `assets/js/main.js` — port `4-45`, drop `48-66`.
5. Re-fetch https://gohugo.io/functions/css/tailwindcss/ for the current
   native-pipe setup (Hugo version, npm packages, config block).
6. Confirm `hugo version` shows `+extended` and ≥ v0.161.0 before building.

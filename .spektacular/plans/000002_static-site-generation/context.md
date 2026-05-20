# Context: 000002_static-site-generation

## Current State Analysis

The site is hand-built static HTML served from the repo root via GitHub
Pages. There is no build step — the deployed artifact is the repository
itself.

**Pages (all in repo root):**

- `index.html` (233 lines) — Homepage. Nav (`12-36`), hero with badge +
  install-block + CTAs (`38-73`), demo screenshot (`75-87`), pipeline diagram
  section (`89-153`), features grid (`155-201`), CTA banner (`203-214`),
  footer (`216-229`), script tag (`231`).
- `how-it-works.html` (479 lines) — Nav (`12-36`), `.page-hero` (`38-47`),
  quick-start `.steps` (`49-120`), spec-format two-column `.spec-layout`
  (`122-206`), `.pipeline-stage` x3 (`208-357`), configuration `.code-block`
  (`359-386`), `.roadmap` (`388-440`), CTA banner (`442-459`), footer
  (`461-474`). Note inline `style="..."` attributes at `246`, `247`, `296`,
  `303`, `382`, `434`, `447`, `454` — these must be folded into Tailwind
  utilities, not carried as inline styles.
- `install.html` (146 lines) — Nav (`12-36`, with `class="active"` on the
  Install link `18`), `.page-hero` (`38-46`), `.install-methods` with three
  `.install-method` blocks (`49-126`), `.install-platforms` 2-col grid
  (`92-121`), footer (`128-141`).

**Shared chrome** is copy-pasted: the `<nav>` block is byte-identical across
all three files at lines `12-36` (only the `active` class differs); the
`<footer>` is identical at `index.html:216-229` / `how-it-works.html:461-474`
/ `install.html:128-141`. The GitHub SVG path is inlined in every nav.

**Stylesheet** `assets/css/style.css` (1000 lines) — `:root` design tokens
at `14-54` (backgrounds `--bg-base/surface/elevated/code`, borders, text,
purple accent `--accent-primary #7c3aed` / `--accent-light` / `--accent-subtle`,
`--terminal-green`, `--link-blue`, spacing scale `--space-xs..xl`, radii
`--radius-sm..pill`). Component classes follow BEM-ish naming. Two media
queries: tablet `max-width: 900px` (`855-867`), mobile `max-width: 640px`
(`870-942`, plus `996-1000`). Notable: sticky nav uses `backdrop-filter:
blur(12px)` (`310-318`); roadmap bullets use `::before` content (`843-848`).

**JS** `assets/js/main.js` (66 lines) — copy-to-clipboard with `execCommand`
fallback (`4-34`), smooth-scroll for `#` anchors (`37-45`), and a
tab-switcher for `#install-tabs` (`48-66`) that is **dead code** — no page
contains `#install-tabs` (the install page uses static `.install-method`
blocks, not tabs).

**Deployment** `.github/workflows/deploy.yml` — on push to `main`, uploads
`path: .` (the whole repo) as a Pages artifact via
`actions/upload-pages-artifact@v3` and deploys with `actions/deploy-pages@v4`.
`CNAME` contains `spektacular.dev`; `.nojekyll` is present (empty file).
`Makefile` `serve` target runs `python3 -m http.server 8080`. `README.md`
documents the Python local-dev workflow.

**Knowledge base** `.spektacular/knowledge/conventions.md` references Python
/ PEP 8 / 80% coverage — stale `spektacular init` boilerplate, not applicable
to this HTML/CSS repo. `architecture/`, `learnings/`, `gotchas/` contain only
placeholder READMEs.

## Per-Phase Technical Notes

### Phase 1.1: Hugo project scaffold & Tailwind pipeline

Establish the Hugo project structure at the repo root.

- `hugo.toml` (new) — `baseURL = "https://spektacular.dev/"`,
  `languageCode = "en-us"`, `title = "Spektacular"`. Add `[params]` for
  values reused in chrome: `githubURL =
  "https://github.com/jumppad-labs/spektacular"`, `releasesURL =
  ".../releases"`, `licenseURL = ".../blob/main/LICENSE"`,
  `installCommand = "brew install jumppad-labs/homebrew-repo/spektacular"`.
  Add the `[build]` block required by the Tailwind pipe:
  `[build] writeStats = true` is the legacy form — use the current form:
  `[build.buildStats] enable = true`, plus `[[build.cachebusters]]` entries
  for `hugo_stats\.json` → `css` and `css/.*\.css` → `css`, and
  `[[module.mounts]]` for `assets` with `hugo_stats.json` excluded from
  watch. Define the main menu so the nav partial can iterate it:
  `[[menu.main]]` entries for "How it works" (`/how-it-works/`) and
  "Install" (`/install/`).
- `package.json` (new) — `devDependencies`: `tailwindcss`,
  `@tailwindcss/cli`, `@tailwindcss/typography` (all v4.x). No build scripts
  needed beyond what Hugo invokes; optionally a `"build": "hugo"` convenience
  script.
- `assets/css/main.css` (new) — `@import "tailwindcss";`,
  `@plugin "@tailwindcss/typography";`, `@source "hugo_stats.json";`, then an
  `@theme { ... }` block porting every token from `style.css:14-54`. Map:
  `--bg-base` → `--color-bg-base`, `--accent-primary` →
  `--color-accent-primary`, etc.; spacing → `--spacing-*`; radii →
  `--radius-*`. Tailwind v4 generates utilities (`bg-bg-base`,
  `text-accent-light`, `rounded-md`) from these names.
- `static/` (new dir) — move `assets/images/tui.png` →
  `static/images/tui.png` (or keep under `assets/` and use `resources.Get`;
  prefer `static/` for a simple unprocessed image). Move `CNAME` →
  `static/CNAME` and `.nojekyll` → `static/.nojekyll` so they land in
  `public/` verbatim. (Hugo does not need `.nojekyll`, but keep it for parity
  / safety.)
- `.gitignore` (new) — ignore `/public/`, `/resources/_gen/`,
  `/node_modules/`, `.hugo_build.lock`, `hugo_stats.json`.
- Directory layout to create: `content/`, `layouts/` (with
  `layouts/_default/` or Hugo's newer flat layout convention),
  `assets/css/`, `assets/js/`, `static/`.

Gotcha: Hugo Extended ≥ v0.161 is mandatory — `css.TailwindCSS` and the
npm-CLI integration do not exist earlier. Verify with `hugo version` (look
for `+extended`).

**Complexity**: Medium
**Token estimate**: ~20k
**Agent strategy**: Single agent, sequential — config files are
interdependent (hugo.toml build block ↔ main.css `@source` ↔ pipe options).

### Phase 1.2: Base layout & shared chrome partials

- `layouts/baseof.html` (new) — `<!DOCTYPE html>` shell. `<head>` includes
  the `head` partial; `<body>` is `flex flex-col min-h-screen` (ports
  `style.css:61-72`); `{{ block "main" . }}{{ end }}` for page content;
  footer partial; script tag. CSS is wired via `templates.Defer` +
  `css.TailwindCSS` so `hugo_stats.json` is fully populated before the pipe
  runs — pattern from the Hugo docs (see research.md external references).
- `layouts/_partials/head.html` (new) — `<meta charset>`, viewport,
  `<title>` from `.Title`, `<meta name="description">` from
  `.Params.description` (fall back to `.Site.Params.description`). The CSS
  `<link>` (fingerprinted) is emitted here via the deferred block.
- `layouts/_partials/css.html` (new) — `{{ with resources.Get "css/main.css" }}`
  → `{{ $opts := dict "minify" (not hugo.IsDevelopment) }}` →
  `css.TailwindCSS $opts` → `fingerprint` → `<link>`.
- `layouts/_partials/nav.html` (new) — ports `index.html:13-35`. Sticky nav
  (`sticky top-0 z-50`), `backdrop-blur` for the `backdrop-filter` rule.
  Logo links `/`. Iterate `.Site.Menus.main` for the links; mark the current
  page with the active style via `$.IsMenuCurrent "main" .` (replaces the
  hand-set `class="active"`). Inline the GitHub SVG (from `index.html:22-30`)
  in a final list item.
- `layouts/_partials/footer.html` (new) — ports `index.html:217-229`.

Mobile nav rule from `style.css:881-883` hides the first link on small
screens — reproduce with a `max-sm:hidden` utility on the first menu item.

**Complexity**: Medium
**Token estimate**: ~22k
**Agent strategy**: Single agent, sequential — head/css/baseof are tightly
coupled by the deferred-CSS pattern.

### Phase 1.3: Homepage migration

- `content/_index.md` (new) — front matter: `title`, `description` (from
  `index.html:6-7`), `layout` not needed for the home page (Hugo uses
  `layouts/home.html` or `index.html` automatically); add bespoke keys if
  useful (`heroEyebrow`, `version`). Body left empty — structure is in the
  layout.
- `layouts/home.html` (new) — `{{ define "main" }}` block porting
  `index.html:38-214`: hero (`38-73`), demo (`75-87`), pipeline section
  (`89-153`), features grid (`155-201`), CTA banner (`203-214`). Translate
  each CSS class to Tailwind utilities using the `@theme` tokens.
- Reusable partials (new, in `layouts/_partials/`):
  - `install-block.html` — ports `.install-block` (`style.css:260-305`),
    param `command`; renders prefix `$`, `<code>`, copy button with
    `data-copy`.
  - `badge.html` — ports `.badge` variants (`style.css:153-183`), params
    `text`, `variant` (`green`/`purple`), optional dot.
  - `button.html` — ports `.btn` variants (`style.css:186-228`), params
    `href`, `label`, `variant` (`primary`/`secondary`), `large` bool,
    optional `external` (adds `target="_blank" rel="noopener"`).
  - `pipeline-node.html` + `pipeline-connector` — ports
    `style.css:443-521`, params for `kind` (`file`/`step`/`output`),
    `icon`/`label`/`name`, `sub`, `detail`.
  - `feature-card.html` — ports `.feature-card` (`style.css:564-598`),
    params `icon`, `title`, `body`.
- `assets/js/main.js` (new location) — port copy-to-clipboard (`4-34`) and
  smooth-scroll (`37-45`) verbatim. **Drop** the `#install-tabs` block
  (`48-66`) — dead code. Wired through Hugo's JS pipeline (`js.Build` or
  `resources.Get` + `fingerprint`) from `baseof.html`.

Responsive: features grid is `grid-cols-3` → `max-md:grid-cols-2` →
`max-sm:grid-cols-1` (ports `style.css:856-858`, `900-902`); pipeline
diagram stacks vertically on mobile with the connector rotated 90°
(`style.css:904-912`).

**Complexity**: High
**Token estimate**: ~40k
**Agent strategy**: Parallel analysis (one agent per reusable partial group),
sequential integration of `home.html` once partials exist.

### Phase 2.1: How-it-works page migration

- `content/how-it-works.md` (new) — front matter `title`, `description`
  (`how-it-works.html:6-7`), `layout: how-it-works`.
- `layouts/how-it-works.html` (new) — `{{ define "main" }}` porting
  `how-it-works.html:38-459`: `.page-hero` (`38-47`), quick-start `.steps`
  (`49-120`), `.spec-layout` two-column (`122-206`), three `.pipeline-stage`
  blocks (`208-357`), configuration `.code-block` (`359-386`), `.roadmap`
  (`388-440`), CTA banner (`442-459`).
- `layouts/_partials/code-block.html` (new) — ports `.code-block`
  (`style.css:231-248`), params `code`, optional `lang`. Used for the spec
  example, the config YAML, and the quick-start command blocks.
- New small structures rendered inline in the layout (or as partials if
  reused): `.step` / `.step__number` (`style.css:704-738`),
  `.spec-annotation` (`757-778`), `.pipeline-stage` (`524-559`),
  `.roadmap-item` (`798-848`).
- Eliminate the inline `style="..."` attributes (`how-it-works.html:246`,
  `247`, `296`, `303`, `382`, `434`, `447`, `454`) by expressing them as
  Tailwind utilities (`mt-6`, `max-w-[70ch]`, `text-left`, etc.).
- Reuse `install-block`, `button`, `badge`, `pipeline-node` partials from
  Phase 1.3.

**Complexity**: High
**Token estimate**: ~38k
**Agent strategy**: Parallel analysis per section, sequential integration.

### Phase 2.2: Install page migration

- `content/install.md` (new) — front matter `title`, `description`
  (`install.html:6-7`), `layout: install`.
- `layouts/install.html` (new) — `{{ define "main" }}` porting
  `install.html:38-126`: `.page-hero` (`38-46`), `.section--install`
  header (`49-56`), three `.install-method` blocks (`57-123`) with the
  `.install-platforms` 2-col grid (`92-121`).
- Reuse `install-block` and `code-block` partials. The Homebrew method uses
  `install-block` with `install-block--full` (full-width variant,
  `style.css:975-979`); Debian and the four platform tiles use `code-block`.
- `.install-method` styling (`style.css:959-973`) — top border + padding;
  `.install-platforms` grid `grid-cols-2` → `max-sm:grid-cols-1`
  (`style.css:981-986`, `996-1000`).

**Complexity**: Medium
**Token estimate**: ~24k
**Agent strategy**: Single agent, sequential — reuses partials already built.

### Phase 2.3: Legacy source removal

Delete the superseded hand-built sources:

- `index.html`, `how-it-works.html`, `install.html` (repo root)
- `assets/css/style.css`
- `assets/js/main.js` *only if it still sits at the old path* — Phase 1.3
  relocates/rewrites it; ensure the porting result is the surviving file and
  no stale copy of the original 66-line version remains.
- `assets/images/` is emptied once `tui.png` is moved to `static/` in
  Phase 1.1 — remove the now-empty directory.

Verify `hugo` still builds all three pages after removal. **Sequencing:**
this phase must merge to `main` together with Phase 3.1 — if the old root
HTML is removed while `deploy.yml` still does `upload-pages-artifact` with
`path: .`, the next push publishes raw Hugo sources with no `index.html` and
the live site breaks for a deploy cycle.

**Complexity**: Low
**Token estimate**: ~8k
**Agent strategy**: Single agent, sequential.

### Phase 3.1: Deploy workflow & local tooling cutover

- `.github/workflows/deploy.yml` — replace the single "Upload site" step.
  New steps in the `deploy` job: install Node (`actions/setup-node@v4`),
  install Hugo Extended (`peaceiris/actions-hugo@v3` with
  `extended: true` and a pinned `hugo-version: '0.161.x'` ≥ 0.161.0, or the
  official manual `.deb` install), `npm ci`, `hugo --minify`, then
  `actions/upload-pages-artifact@v3` with `path: ./public`. Keep the
  `concurrency`, `permissions`, and `actions/deploy-pages@v4` blocks
  unchanged.
- `Makefile` — change the `serve` target from `python3 -m http.server 8080`
  to `hugo server` (optionally `hugo server -D`).
- `README.md` — replace the Python local-dev instructions
  (`README.md:1-15`) with: install Hugo Extended + Node, `npm install`,
  `make serve` / `hugo server`, note the dev URL Hugo prints.

Gotcha: `npm ci` requires `package-lock.json` — ensure it is committed
(generated in Phase 1.1 by running `npm install` once).

**Complexity**: Low
**Token estimate**: ~10k
**Agent strategy**: Single agent, sequential.

## Testing Strategy

Verification-based, no automated suite (see plan.md § Testing Approach for
rationale). Per-phase checks the implementer runs:

- **Build** — `hugo` (and `hugo --minify`) exits 0 with no errors/warnings;
  `public/` contains `index.html`, `how-it-works/index.html`,
  `install/index.html`, a fingerprinted CSS file, JS, `tui.png`, and `CNAME`.
- **Visual parity** — run `hugo server`, open each page beside the current
  live `spektacular.dev`; compare layout/colour/type/spacing at desktop,
  `≤900px`, and `≤640px` widths. Bar is "equivalent", not pixel-perfect.
- **Content completeness** — every section listed in § Current State
  Analysis is present on the corresponding migrated page; copy buttons copy;
  `#`-anchor links smooth-scroll.
- **Shared elements** — edit `nav.html` / `footer.html`, rebuild, confirm the
  change shows on all three pages.
- **Deploy** — after Phase 3.1, the Actions run is green and `spektacular.dev`
  serves the Hugo-built site.

## Project References

- Spec: `.spektacular/specs/000002_static-site-generation.md`
- Pages: `index.html`, `how-it-works.html`, `install.html`
- Stylesheet: `assets/css/style.css` (1000 lines, tokens at `:root` `14-54`)
- Script: `assets/js/main.js` (66 lines; `48-66` is dead tab code)
- Deploy: `.github/workflows/deploy.yml`
- Domain / Pages config: `CNAME` (`spektacular.dev`), `.nojekyll`
- Local dev: `Makefile`, `README.md`
- Hugo `css.TailwindCSS` docs: https://gohugo.io/functions/css/tailwindcss/
- Prior plan (unrelated): `.spektacular/plans/1_install_instructions/`

## Token Management Strategy

| Tier   | Token Budget | Agent Strategy                            |
|--------|-------------|-------------------------------------------|
| Low    | ~10k        | Single agent, sequential                  |
| Medium | ~25k        | 2-3 parallel agents                       |
| High   | ~50k+       | Parallel analysis, sequential integration |

Phase tiers: 1.1 Medium (~20k), 1.2 Medium (~22k), 1.3 High (~40k), 2.1 High
(~38k), 2.2 Medium (~24k), 2.3 Low (~8k), 3.1 Low (~10k). The two High phases
(1.3, 2.1) build many independent partials/sections — fan out analysis per
section, then integrate the page layout sequentially.

## Migration Notes

This is a tooling migration, not a data migration — no databases or
persisted state. The migration concern is **build-output continuity**:

- Until Phase 3.1, `deploy.yml` uploads the repo root, so the live site keeps
  serving the legacy HTML throughout Milestones 1–2. The legacy files must
  therefore survive until Phase 2.3.
- Phase 2.3 (delete legacy) and Phase 3.1 (repoint the workflow at `public/`)
  must land in the **same merge to `main`**. Splitting them across merges
  publishes a broken site for one deploy cycle.
- URLs change: `/how-it-works.html` → `/how-it-works/`,
  `/install.html` → `/install/`. The homepage stays at `/`. This is an
  accepted, user-approved break (plan.md § Out of Scope).
- `CNAME` must reach `public/` (placed in `static/`) or the custom domain
  unbinds on the first Hugo-built deploy.

## Performance Considerations

Static site, no runtime. The migration is net-neutral-to-positive: Hugo's
pipeline minifies and fingerprints CSS/JS (the current site ships unminified
`style.css`/`main.js` with no cache-busting). Tailwind v4 emits only the
utilities actually used (scanned from `hugo_stats.json`), so the shipped CSS
should be no larger than today's 1000-line hand-written sheet. No further
performance work is required.

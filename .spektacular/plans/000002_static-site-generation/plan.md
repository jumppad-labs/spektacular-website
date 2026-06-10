# Plan: 000002_static-site-generation

<!-- Metadata -->
<!-- Created: 2026-05-19T14:31:04Z -->
<!-- Commit: f95d9b785fcfb5d6502d1f28472798863f72bf45 -->
<!-- Branch: main -->
<!-- Repository: git@github.com:jumppad-labs/spektacular-website.git -->

## Overview

The Spektacular website is currently three hand-built HTML pages with a
single hand-written stylesheet and copy-pasted navigation, header, and
footer. This plan migrates it onto the Hugo static site generator with
Tailwind CSS v4, so contributors can add and update pages without copying
layout markup and styling is applied automatically from a shared system.
Developers maintaining the site benefit from a faster, lower-friction
authoring workflow with no loss of the current look or hosting setup.

## Architecture & Design Decisions

The hand-built three-page site is migrated to the **Hugo** static site
generator with **Tailwind CSS v4** for styling. Hugo builds the site from
`content/` Markdown files plus `layouts/` templates into a static `public/`
directory, which is published to GitHub Pages exactly as today — the custom
domain (`spektacular.dev`) and hosting are unchanged. Shared chrome
(navigation, header, footer) is authored once as Hugo partials in a
`baseof.html` base template, so every page inherits it and a single edit
propagates everywhere.

Tailwind is integrated through Hugo's native `css.TailwindCSS` pipe (Hugo
Extended ≥ v0.161, with `tailwindcss`/`@tailwindcss/cli`/`@tailwindcss/typography`
installed via npm). The existing CSS design tokens — backgrounds, borders,
text colours, the purple accent, spacing scale, radii — are ported into a
Tailwind v4 `@theme` block in `assets/css/main.css`, preserving the dark
terminal look. All hand-written CSS is replaced by Tailwind utility classes
in templates; no per-page stylesheets remain. Because the current pages are
layout-heavy (pipeline diagrams, feature grids, roadmap, step lists) rather
than prose, each existing page gets a dedicated per-page Hugo layout;
content files carry front matter and prose, while bespoke structure lives in
templates and partials.

Two trade-offs are deliberate. First, the build now depends on Hugo ≥ 0.161
and Node in CI — accepted because the native pipe gives a single `hugo`
build command and an integrated, fingerprinted asset pipeline. Second, page
URLs adopt Hugo's default pretty-URL scheme (`/install/` rather than
`/install.html`); the spec's URL-stability constraint is consciously relaxed
per explicit user direction — the homepage stays at `/`, and the custom
domain is unaffected.

This direction beats a standalone Tailwind CLI (two build commands to keep in
sync) and a PostCSS/Tailwind-v3 pipeline (an older major version requiring
extra dependencies and a JS config file). See
`research.md#alternatives-considered-and-rejected` for the full comparison.

## Component Breakdown

- **Hugo site configuration** — A new `hugo.toml` owns site-wide settings:
  base URL, title/metadata, build settings (`buildStats` for Tailwind class
  detection, `hugo_stats.json` cache-buster), and asset-mount config. It is
  the entry point that ties templates, content, and the asset pipeline
  together.

- **Base layout** — A `baseof.html` template owns the shared HTML skeleton:
  `<head>`, metadata, stylesheet and script wiring, and the content block
  every page fills. All per-page layouts inherit from it. Replaces the
  duplicated boilerplate copied across the three current HTML files.

- **Shared chrome partials** — `head`, `nav`/header, and `footer` partials
  own the navigation bar (logo, links, GitHub icon), document head/meta
  tags, and the footer. Authored once, included by the base layout,
  satisfying the "shared elements defined once" requirement. The nav partial
  handles the active-link state per page.

- **Per-page layouts** — Three dedicated layouts (home, how-it-works,
  install) own the bespoke structure of each existing page — hero, demo
  screenshot, pipeline diagrams, feature grid, spec-format two-column block,
  configuration block, roadmap, install-method blocks, CTA banners. Each
  fills the base layout's content block.

- **Reusable UI partials** — Smaller partials for structures that recur
  across pages: install/copy block, code block, badge, button, pipeline
  node/diagram. Per-page layouts compose these so repeated UI is defined
  once.

- **Page content files** — Three Markdown files under `content/` own
  per-page front matter (title, description, layout selection) and any prose
  text, decoupling editable copy from template structure.

- **Tailwind theme stylesheet** — `assets/css/main.css` owns the styling
  system: `@import "tailwindcss"`, the `@plugin` typography import, and an
  `@theme` block porting the existing design tokens (backgrounds, borders,
  text, purple accent, spacing scale, radii). Replaces the entire
  hand-written `style.css`; processed by Hugo's `css.TailwindCSS` pipe.

- **Client-side script** — `main.js` ported as a Hugo asset, retaining the
  copy-to-clipboard and smooth-scroll behaviour. The dead `#install-tabs`
  tab-switching code is dropped (no page uses it).

- **Static assets** — The `tui.png` image, `CNAME` (custom domain), and
  `.nojekyll` carry over unchanged, served from Hugo's `static/` directory
  into the build output.

- **Deploy workflow** — `.github/workflows/deploy.yml` is updated to install
  Hugo Extended and Node, run the Hugo build, and upload the generated
  `public/` directory (instead of the repo root) to GitHub Pages.

- **Local build tooling** — A new `package.json` declares the npm dev
  dependencies (`tailwindcss`, `@tailwindcss/cli`, `@tailwindcss/typography`);
  the `Makefile` `serve` target switches from `python3 -m http.server` to
  `hugo server`.

## Data Structures & Interfaces

This is a static-site migration — no runtime data structures. The
"contracts" are configuration schemas and the template/partial interfaces
that components agree on.

- **Site configuration (`hugo.toml`)** — Key-value config consumed by Hugo.
  Notable keys: `baseURL`, `title`, `params` (site-wide metadata such as the
  GitHub repo URL and release link reused across partials), and the `build`
  block (`buildStats.enable`, `cachebusters`) that the Tailwind pipe depends
  on.

- **Page front matter** — The contract between a content file and its
  layout. Each `content/*.md` file declares:

  ```yaml
  title:        string   # <title> and page heading
  description:  string   # <meta name="description">
  layout:       string   # selects the per-page layout
  ```

  Per-page layouts may read additional bespoke front-matter keys (e.g. a
  hero eyebrow string); those are defined per page in context.md.

- **Tailwind theme token contract** — The `@theme` block in
  `assets/css/main.css` defines named design tokens (e.g. `--color-bg-base`,
  `--color-accent-primary`, `--spacing-*`, `--radius-*`) ported from the
  current CSS custom properties. Templates consume these only through
  generated Tailwind utility classes — the token names are the styling
  contract between the stylesheet and every layout.

- **Partial parameters** — Reusable UI partials are invoked with a typed
  `dict` context rather than the global page. The shapes:
  - *install/copy block* — `{ command: string }`
  - *code block* — `{ code: string, lang: string }`
  - *badge* — `{ text: string, variant: string }`
  - *button* — `{ href: string, label: string, variant: string, large: bool }`
  - *pipeline node* — `{ kind: string, icon/label/name: string, sub: string, detail: string }`

  Shared chrome partials (`nav`, `footer`, `head`) take the standard page
  context and read `.IsMenuCurrent`/`params` for active-link state.

- **`css.TailwindCSS` pipe interface** — Hugo passes `assets/css/main.css`
  plus an options `dict` (`{ minify: bool }`) to the pipe, which scans
  `hugo_stats.json` for used classes and returns a processed CSS resource
  that the base layout fingerprints and links.

No serialization boundaries or APIs are introduced.

## Implementation Detail

This migration introduces the standard Hugo project structure to a
repository that currently has none — the dominant new pattern. Today the
repo root holds finished HTML; afterwards the root holds *sources*
(`content/`, `layouts/`, `assets/`, `static/`, `hugo.toml`) and the
deployable HTML is a build artifact in `public/`. Every developer touching
the repo experiences this shift: editing a page means editing a content
file or a layout, never hand-writing a full HTML document.

**Template inheritance replaces copy-paste.** The three current HTML files
each carry their own duplicated `<head>`, nav, and footer. The new pattern
is single-definition-plus-inheritance: a base layout defines the document
shell and named blocks, per-page layouts fill those blocks, and chrome lives
in partials included once. The reviewer's check here is that *no* structural
HTML is duplicated across layouts — anything appearing on more than one page
must be a partial.

**Utility-first styling replaces a token stylesheet.** The hand-written
`style.css` with semantic class names (`.feature-card`, `.pipeline-node`) is
retired. Structure-to-style coupling moves into the templates as Tailwind
utility classes; the only standalone CSS is the `@theme` token block and any
unavoidable custom rules. Where a current component has many states or is
genuinely repeated, it becomes a partial (so the utility soup is written
once), not an `@apply` rule — `@apply` is avoided to keep one consistent
styling mechanism. A reviewer should expect to read styling at the call
site, not in a stylesheet.

**Per-page layouts, not generic templating.** Because the existing pages are
bespoke landing-page compositions, each gets its own layout rather than
being forced through one bristling generic template. New ordinary pages can
still use Hugo's default single layout. This is a deliberate divergence from
the "everything in Markdown" ideal: rich structure is a template concern,
prose and metadata are a content concern.

**The build pipeline is new surface.** Hugo's asset pipeline
(`css.TailwindCSS` → fingerprint → minify) and the npm dependency on the
Tailwind CLI are introduced together. The CI workflow shifts from "upload
the repo" to "build, then upload `public/`", and local development shifts
from a Python file server to `hugo server`. Visual parity is verified by eye
against the current site, per the spec — pixel-perfection is explicitly not
a goal.

## Dependencies

**Build-time tooling (new)**

- **Hugo Extended ≥ v0.161.0** — The static site generator and asset
  pipeline. The *Extended* edition is mandatory: the `css.TailwindCSS` pipe
  is unavailable below v0.161.0. Must be installed locally and pinned in CI.

- **Node.js + npm** — Runtime for the Tailwind CLI that Hugo's pipe invokes.
  Required both locally and in CI; no Node code ships in the site.

- **`tailwindcss` + `@tailwindcss/cli`** — Tailwind CSS v4 engine and CLI.
  Hugo's `css.TailwindCSS` pipe shells out to the CLI; declared in a new
  `package.json` as dev dependencies.

- **`@tailwindcss/typography`** — Tailwind plugin providing prose styling for
  Markdown-rendered content. Dev dependency; loaded via `@plugin` in
  `main.css`.

**Existing infrastructure (unchanged or lightly changed)**

- **GitHub Pages + `actions/deploy-pages`** — Hosting and deploy mechanism;
  kept as-is. The workflow *steps* change (build Hugo, upload `public/`) but
  the publishing target does not.

- **Custom domain `spektacular.dev` (`CNAME`)** — Carried into the build
  output unchanged; no DNS or domain changes.

**Planning dependencies**

- **Spec `000002_static-site-generation`** — The source spec for this plan;
  already approved.

- **No prior plan dependency** — Plan `1_install_instructions` is unrelated
  and need not land first. Nothing must land before this plan starts.

The only hard prerequisite is environment setup — Hugo Extended ≥ v0.161.0
and Node must be available locally and added to the CI runner before the
build phases can be verified. No code dependency must land first.

## Testing Approach

The project has no automated test suite and no test framework, and a static
marketing site does not warrant introducing one. (The generic
`conventions.md` references Python unit tests and 80% coverage — that is
stale boilerplate from the spektacular init template and does not apply to
this repo.) Testing here is **verification-based**: a small set of
repeatable checks performed during and after the migration, not a unit-test
codebase.

**Build verification** — The load-bearing check is that `hugo` builds
cleanly with zero errors or warnings and produces a populated `public/`
directory containing one HTML output per page plus processed CSS, JS, and
the image. This guarantees the Tailwind pipe is wired correctly and every
content file resolves to a layout.

**Visual parity review** — Each migrated page is opened in a browser and
compared side-by-side against the current live site for layout, colours,
typography, and spacing. This is a human pass/fail judgement against the
spec's "visually equivalent" bar — pixel-perfection is not required. The
home, how-it-works, and install pages get equal scrutiny since each has a
bespoke layout. Responsive behaviour is spot-checked at the tablet and
mobile breakpoints the current CSS defines.

**Content completeness check** — Every page, section, and interactive
element present today is confirmed present after migration: all three pages
exist, all copy is carried over, copy-to-clipboard buttons work, and
smooth-scroll anchors behave. This guards the spec's "nothing lost in
migration" requirement.

**Shared-element verification** — A single edit to the nav, header, or
footer partial is confirmed to change every page after a rebuild, proving
the "defined once, reused everywhere" requirement.

**Deploy verification** — The updated GitHub Actions workflow is confirmed
to build and publish successfully, and the live site is checked to load over
the custom domain after deploy.

**Deliberate gaps** — No unit tests, no snapshot/visual-regression tooling,
no link-checker automation are added. For a three-page static site the
maintenance cost of that machinery outweighs its value; the manual checklist
above is sufficient and is recorded in context.md for the implementer to
execute.

## Milestones & Phases

### Milestone 1: Hugo foundation with the homepage live

**What changes**: The repository becomes a Hugo project — site config, base
layout, shared navigation/header/footer partials, the Tailwind v4 theme, and
the asset pipeline are all in place, and the homepage is fully migrated and
rendered through them. After this lands, a developer can build the site with
one command and see the homepage looking equivalent to today's, styled
entirely by Tailwind with shared chrome defined once. The other two pages
are not yet migrated.

#### - [x] Phase 1.1: Hugo project scaffold & Tailwind pipeline

Establishes the Hugo project: site configuration, the standard directory
layout, the npm manifest for the Tailwind CLI, and the Tailwind v4 theme
stylesheet that ports the current design tokens. Wires Hugo's
`css.TailwindCSS` pipe so processed CSS is generated on build. Static assets
(image, custom-domain file, `.nojekyll`) move into Hugo's static directory,
and build output and `node_modules` are git-ignored.

*Technical detail:* [context.md#phase-11](./context.md#phase-11-hugo-project-scaffold--tailwind-pipeline)

**Acceptance criteria**:

- [x] `hugo` runs without errors and produces a built site directory
- [x] The Tailwind theme reproduces the current colours, spacing, and radii
      as named tokens
- [x] The custom-domain file and `.nojekyll` appear in the build output
      unchanged

#### - [x] Phase 1.2: Base layout & shared chrome partials

Creates the base layout (document shell, head/meta, CSS and script wiring,
content block) and the shared navigation, header, and footer partials. After
this phase the chrome that today is copy-pasted across three files is
defined exactly once, with per-page active-link state.

*Technical detail:* [context.md#phase-12](./context.md#phase-12-base-layout--shared-chrome-partials)

**Acceptance criteria**:

- [x] Navigation, header, and footer are each defined in a single partial
- [x] Editing a chrome partial changes every page that uses it after a
      rebuild
- [x] The base layout renders valid HTML with correct metadata

#### - [x] Phase 1.3: Homepage migration

Migrates the homepage onto a dedicated layout fed by a Markdown content
file, building the reusable UI partials it needs (install/copy block, badge,
button, pipeline node, feature card). Ports the client-side script
(copy-to-clipboard, smooth scroll) and drops the dead tab-switching code.

*Technical detail:* [context.md#phase-13](./context.md#phase-13-homepage-migration)

**Acceptance criteria**:

- [x] The homepage is visually equivalent to the current site at desktop and
      mobile widths
- [x] Every section and element of the current homepage is present
- [x] The copy-to-clipboard button works on the rendered homepage

### Milestone 2: All pages migrated

**What changes**: The how-it-works and install pages are migrated onto
per-page Hugo layouts, reusing the shared chrome and Tailwind theme, with
reusable partials for repeated UI (install/copy block, code block, pipeline
node, etc.). After this lands, the entire site is generated by Hugo — all
three pages, all content, all interactive elements (copy buttons, smooth
scroll) carried over — and no hand-written `style.css` or standalone HTML
files remain.

#### - [x] Phase 2.1: How-it-works page migration

Migrates the how-it-works page onto a per-page layout and content file,
reusing the shared chrome and partials and adding a code-block partial.
Covers the quick-start steps, spec-format two-column block, pipeline stages,
configuration block, and roadmap.

*Technical detail:* [context.md#phase-21](./context.md#phase-21-how-it-works-page-migration)

**Acceptance criteria**:

- [x] The how-it-works page is visually equivalent to the current site at
      desktop and mobile widths
- [x] Every section and element of the current page is present
- [x] Code blocks and copy buttons render and behave correctly

#### - [x] Phase 2.2: Install page migration

Migrates the install page onto a per-page layout and content file, reusing
shared partials and covering the page hero, the three install methods, and
the per-platform download blocks.

*Technical detail:* [context.md#phase-22](./context.md#phase-22-install-page-migration)

**Acceptance criteria**:

- [x] The install page is visually equivalent to the current site at desktop
      and mobile widths
- [x] Every section and element of the current page is present
- [x] All install commands and copy buttons render and behave correctly

#### - [x] Phase 2.3: Legacy source removal

Removes the now-superseded hand-built sources — the three standalone HTML
files, the hand-written stylesheet, and the old script location. After this
phase the only site sources are the Hugo project files. This phase should
land in the same merge as Phase 3.1: removing the old root HTML while the
deploy workflow still uploads the repo root would publish a broken site for
one deploy cycle.

*Technical detail:* [context.md#phase-23](./context.md#phase-23-legacy-source-removal)

**Acceptance criteria**:

- [x] No standalone page HTML files or hand-written `style.css` remain in the
      repository
- [x] The full site still builds and renders correctly from Hugo sources
      alone

### Milestone 3: Deployment cut over to the Hugo build

**What changes**: The GitHub Actions workflow, npm dependency manifest, and
local `Makefile` are updated so the deployed artifact is Hugo's build output
rather than the repo root. After this lands, every push to `main` builds the
site with Hugo and publishes it to GitHub Pages on the existing custom
domain, and local development uses `hugo server`.

#### - [x] Phase 3.1: Deploy workflow & local tooling cutover

Updates the GitHub Actions workflow to install Hugo Extended and Node, run
the Hugo build, and publish the built site directory instead of the repo
root. Updates the `Makefile` to run `hugo server` and refreshes the README's
local-development instructions.

*Technical detail:* [context.md#phase-31](./context.md#phase-31-deploy-workflow--local-tooling-cutover)

**Acceptance criteria**:

- [x] A push to `main` builds with Hugo and publishes the built site to
      GitHub Pages *(verified post-merge — Actions run 26157921061
      completed in 45s on commit 92ae9d0)*
- [x] The live site loads correctly over the `spektacular.dev` custom domain
      *(verified post-deploy — `https://spektacular.dev/`,
      `/how-it-works/`, and `/install/` all return HTTP 200 with the
      Hugo-built content and fingerprinted Tailwind CSS)*
- [x] `make serve` starts the Hugo development server

## Open Questions

After a genuine pass, there are no open questions — no uncertainties that can
only be resolved once implementation begins.

This is the expected healthy outcome for this plan. The migration target
(Hugo + Tailwind v4 via the native pipe), the URL scheme (Hugo defaults),
the authoring model (per-page layouts), the build mechanism, and the
deployment approach were all resolved with the user during planning. The
codebase is small and was read in full during discovery — there are no
untested code paths or external API behaviours to discover. Visual parity is
a review judgement against an explicitly "equivalent, not pixel-perfect" bar
set by the spec, not an unresolved question.

## Out of Scope

**From the spec's Non-Goals**

- **Visual redesign** — The migration preserves the current dark terminal
  look and feel. Restyling, new colours, or layout changes are not part of
  this work.

- **New content or new pages** — Only the three existing pages are migrated.
  Authoring additional pages or adding new copy is not in scope.

- **Hosting or domain changes** — GitHub Pages hosting and the
  `spektacular.dev` custom domain stay exactly as they are; no migration to
  another host or DNS changes.

- **Pixel-for-pixel parity** — The migrated site must be visually
  *equivalent*, not pixel-identical. Minor styling differences introduced by
  Tailwind are acceptable and will not be chased down.

**Decided during planning**

- **URL stability** — The spec's constraint that existing `.html` URLs must
  not break is deliberately relaxed per explicit user direction: the site
  adopts Hugo's default pretty URLs (`/install/` rather than
  `/install.html`). No redirects or aliases for the old URLs are added.

- **Automated testing infrastructure** — No unit tests, visual-regression
  tooling, or automated link-checking are introduced. Verification is the
  manual checklist in the Testing Approach.

**Deliberately left out by the chosen design**

- **Shortcode-based authoring** — Rich page structure lives in per-page
  layouts, not in Markdown shortcodes. A shortcode authoring model was
  considered and rejected; if future content pages need it, that would be a
  separate plan.

- **CMS or content-model work** — No content collections, taxonomies, or
  data-driven page generation beyond what the three static pages need.

There is no separate follow-up spec or ticket tracking these — they are
intentional exclusions, not deferred work.

## Changelog

### 2026-05-20 — Phase 1.1: Hugo project scaffold & Tailwind pipeline

**What was done**: Bootstrapped the Hugo project at the repo root. Added
`hugo.toml` with site metadata, params (GitHub/release/license URLs,
install command), main menu, `[build.buildStats]` for Tailwind class
detection, the cachebuster rules and `[[module.mounts]]` that the
`css.TailwindCSS` pipe expects, plus `disableKinds = ["taxonomy", "term"]`
to silence default taxonomy pages. Added `package.json` (+ generated
`package-lock.json`) declaring `tailwindcss`, `@tailwindcss/cli`, and
`@tailwindcss/typography` as dev dependencies. Created
`assets/css/main.css` with `@import "tailwindcss"`, the typography
`@plugin`, `@source "hugo_stats.json"`, and a full `@theme` block
porting all 24 design tokens (15 colours, 5 spacing, 4 radii) from
`assets/css/style.css:14-54`. Created the standard Hugo directories
(`content/`, `layouts/`, `static/`, `assets/js/`) and copied the static
assets (`CNAME`, `.nojekyll`, `images/tui.png`) into `static/`. Added a
`.gitignore` for `public/`, `resources/_gen/`, `node_modules/`,
`.hugo_build.lock`, and `hugo_stats.json`.

**Deviations**: Static assets were **copied**, not moved, into
`static/`. The originals at the repo root (`CNAME`, `.nojekyll`) and
under `assets/images/` (`tui.png`) remain in place because
`.github/workflows/deploy.yml` still uploads `path: .` and the legacy
site must keep serving correctly until the Phase 2.3 + 3.1 cutover. The
strict "move" wording in `context.md` Phase 1.1 is overridden by the
migration-notes constraint in the same document. The duplication will
resolve naturally when Phase 2.3 deletes the legacy sources and Phase
3.1 repoints the deploy at `public/`.

Also: replaced the deprecated `languageCode = "en-us"` top-level key
with `defaultContentLanguage = "en"` plus a `[languages.en]` block using
the renamed `locale = "en-us"` field, to silence a Hugo 0.158+
deprecation warning.

**Files changed**:
- `hugo.toml` (new)
- `package.json` (new)
- `package-lock.json` (generated, new)
- `assets/css/main.css` (new)
- `.gitignore` (new)
- `static/CNAME` (new — copy of root `CNAME`)
- `static/.nojekyll` (new — copy of root `.nojekyll`)
- `static/images/tui.png` (new — copy of `assets/images/tui.png`)
- `content/`, `layouts/`, `assets/js/` (new empty directories)

**Discoveries**:
- Hugo 0.158 renamed the `languageCode` site-config field to `locale`
  (still under `[languages.<lang>]`). Future plan/context references to
  `languageCode` should be read as `locale`.
- With only `static/` content and no `layouts/` yet, `hugo` emits a
  single expected warning — "found no layout file for kind home". This
  warning is the expected mid-migration state and resolves when Phase
  1.3 adds `layouts/home.html`. Do not treat it as a regression.
- Hugo's default `taxonomy` / `term` page kinds also emit "no layout"
  warnings out of the box; disabled via `disableKinds` in `hugo.toml`
  since the site uses no taxonomies.
- `npm install` generates `package-lock.json`, which Phase 3.1's CI uses
  via `npm ci`. Already committed at the end of Phase 1.1.

### 2026-05-20 — Phase 1.2: Base layout & shared chrome partials

**What was done**: Created the base Hugo layout and the four shared
chrome partials. `layouts/baseof.html` is the document shell — `<html
lang>`, head/partial wiring, body with the `{{ block "main" . }}{{ end
}}` slot, nav and footer partials. `layouts/_partials/head.html` emits
`<meta charset>`, viewport, a context-aware `<title>` (homepage gets the
spec tagline, other pages get `Title — Spektacular`), the description
meta, and calls the css partial. `layouts/_partials/css.html` runs the
asset pipeline through `templates.Defer` (so `hugo_stats.json` is fully
populated before Tailwind class detection), calling
`css.TailwindCSS` and fingerprinting in production with SRI. `nav.html`
ports the sticky-blur navigation, iterates `.Site.Menus.main` for the
"How it works" / "Install" links with active-state styling derived from
`IsMenuCurrent`/`HasMenuCurrent`, hides the first menu link below `sm`
breakpoint (`max-sm:hidden`, matching the original
`@media (max-width: 640px)` rule), and inlines the GitHub icon. `footer.html`
ports the Apache 2.0 / GitHub / Releases links with the same
mx-auto/max-w-[1100px]/px-md container wrapper used by the nav. All chrome
HTML now lives in exactly one file each.

**Deviations**: Phase 1.2's third acceptance criterion ("base layout
renders valid HTML with correct metadata") required a renderable page,
but the home layout and content file are Phase 1.3 deliverables. To
verify the criterion inside Phase 1.2, minimal stubs were added —
`content/_index.md` (front-matter only — title + description from
`index.html:6-7`) and `layouts/home.html` (only an empty `{{ define
"main" }}<main class="grow"></main>{{ end }}`). Phase 1.3 will
**overwrite** both files with the real homepage content and layout, so
the stubs are intentional throwaway state.

**Files changed**:
- `layouts/baseof.html` (new)
- `layouts/_partials/head.html` (new)
- `layouts/_partials/css.html` (new)
- `layouts/_partials/nav.html` (new)
- `layouts/_partials/footer.html` (new)
- `content/_index.md` (new — Phase 1.3 will overwrite with real content)
- `layouts/home.html` (new — Phase 1.3 will overwrite with real layout)

**Discoveries**:
- Hugo 0.146+ uses the new flat layouts convention: `layouts/baseof.html`
  at the root works (no need for `layouts/_default/baseof.html`), and
  partials live in `layouts/_partials/` (not `layouts/partials/`).
- The `templates.Defer` pattern from the official Hugo Tailwind docs is
  necessary — without it, `hugo_stats.json` may not be populated when
  the pipe runs, and Tailwind generates an empty stylesheet. The
  deferred block runs after templating finishes.
- With the Tailwind pipe wired up, the first cold build jumps from ~20ms
  (no CSS pipe) to ~1.2s. Subsequent builds are cached. Worth keeping in
  mind for the CI step timing in Phase 3.1.
- `IsMenuCurrent` alone is not enough to detect active state on the
  homepage when the menu entry's URL is non-`/`; pair it with
  `HasMenuCurrent` for robustness. (Currently only the two top-level
  pages have menu entries, so this is a forward-looking note.)
- Tailwind v4 generated CSS via the pipe is emitted with an SRI integrity
  hash and `crossorigin="anonymous"` — confirmed working against the
  fingerprinted `/css/main.<hash>.css` URL.

### 2026-05-20 — Phase 1.3: Homepage migration

**What was done**: Replaced the Phase 1.2 stubs with the real homepage.
`content/_index.md` now carries front matter for `heroBadge`,
`heroHeadline` (a two-line list), `heroSub`, plus the page title and
description. `layouts/home.html` ports all six sections of `index.html`
(38-214): hero with badge + headline + sub + install block + dual CTAs,
demo screenshot, "From idea to code" pipeline diagram (six nodes + five
connectors), six-card features grid, and the bottom CTA banner. Built
seven new reusable partials under `layouts/_partials/`: `badge.html`
(green/purple variants + optional dot), `button.html` (primary/secondary
+ optional `large`/`external`), `install-block.html` (with the
inline-copy button), `pipeline-node.html` (file/step/output kinds),
`pipeline-connector.html`, `feature-card.html`, and `js.html` (the JS
pipeline partial). Replaced `assets/js/main.js` with a cleaned version
that keeps the copy-to-clipboard and smooth-scroll handlers and **drops
the dead `#install-tabs` block** (lines 48-66 of the original — no page
ever contained that element). Wired the JS into `baseof.html` via
`resources.Get "js/main.js" | minify | fingerprint` with SRI integrity.

**Deviations**:
- The mobile/responsive behaviour ports the original `@media (max-width:
  640px)` rules via Tailwind's `max-sm:*` utilities (e.g. CTA buttons
  stack with `max-sm:flex-col max-sm:items-center`, features grid drops
  to one column with `max-sm:grid-cols-1`, pipeline connectors rotate
  with `max-sm:rotate-90`). The original used CSS-variable overrides
  inside the breakpoint (`--space-xl: 4rem` etc.) — under Tailwind this
  becomes per-element `max-sm:py-lg` overrides instead, which is
  equivalent in effect at the call sites that matter (hero, sections,
  CTA banner) but does not redefine the spacing token globally below
  the breakpoint. This is functionally equivalent but stylistically
  different from `@theme`-level redefinition.
- The "press `t` to cycle" inline `<code>` element inside the
  Interactive-TUI feature card is rendered via `safeHTML` because
  `feature-card.html`'s `body` parameter accepts an HTML string. The
  inline code styling matches the original `:not(pre) > code` rule
  (style.css:251-257) with Tailwind utilities directly on the `<code>`
  element, since global element-targeted styles aren't part of the
  Tailwind theme.

**Files changed**:
- `content/_index.md` (overwritten — replaces Phase 1.2 stub)
- `layouts/home.html` (overwritten — replaces Phase 1.2 stub)
- `layouts/baseof.html` (added the JS partial call before `</body>`)
- `layouts/_partials/badge.html` (new)
- `layouts/_partials/button.html` (new)
- `layouts/_partials/install-block.html` (new)
- `layouts/_partials/pipeline-node.html` (new)
- `layouts/_partials/pipeline-connector.html` (new)
- `layouts/_partials/feature-card.html` (new)
- `layouts/_partials/js.html` (new)
- `assets/js/main.js` (modified — dropped `#install-tabs` dead code)

**Discoveries**:
- Tailwind v4's `--color-bg-base` token generates the utility
  `bg-bg-base`/`text-bg-base`. The doubled prefix is awkward but
  semantically correct; renaming tokens would diverge from
  `context.md`'s explicit naming contract.
- Tailwind v4 emits arbitrary-value utilities like `text-[0.725rem]`,
  `min-w-[120px]`, and `clamp()` in-class — useful for porting the
  original CSS values (clamp font sizes, `0.725rem` etc.) without
  inventing new tokens. Keeps the design system's named tokens for
  meaningful colours/spacing only.
- The `:not(pre) > code` global inline-code style from the original
  doesn't translate to a Tailwind utility — instead it's applied
  per-call with utility classes on the `<code>` element. Worth knowing
  for Phase 2.1 which has more inline-code uses.
- The CSS pipeline emitted 30.8KB minified after the first real page;
  the JS bundle is 887 bytes minified — well within an acceptable
  range. No tree-shaking issues observed.
- The legacy `assets/js/main.js` is still loaded by the legacy HTML at
  the repo root, but the cleaned-up version is functionally identical
  for the legacy pages (the install-tabs block was already dead code
  there). Safe to share the file between legacy and Hugo until Phase
  2.3 deletes the legacy files.

### 2026-05-20 — Phase 2.1: How-it-works page migration

**What was done**: Migrated `how-it-works.html` (478 lines) onto a
dedicated per-page layout. `content/how-it-works.md` carries the page
title, description, and hero text in front matter (`heroHeading`,
`heroSub`). `layouts/how-it-works.html` ports all six sections: the
page hero, the five-step Quick Start (each with code-block partial), the
two-column Spec Format with the example spec on the left and seven
annotated `## section` cards on the right, the three Pipeline Stages
(Specification, Generate the Plan, Implement the Plan — each with its
own pipeline-node diagram + prose), the Configuration YAML block + intro
paragraph, the three-row Roadmap (v0.2 highlighted in terminal-green,
v0.3 / v1.0 in purple), and the CTA banner with the install command and
"View on GitHub" button. Added `layouts/_partials/code-block.html` for
the multi-line code displays. Reused all the partials built in Phase
1.3 — pipeline-node/pipeline-connector, install-block, button.

**Deviations**:
- The original how-it-works.html had inline `style="..."` attributes
  (lines 246, 247, 296, 303, 382, 434, 447, 454) for margins, max-widths,
  text alignment, and a `font-size`. These were folded into Tailwind
  utility classes on the elements (e.g. `mt-6`, `max-w-[70ch]`,
  `text-left`, `text-[0.9375rem]`) — no inline styles remain, satisfying
  the explicit context.md note in Phase 2.1 that "these must be folded
  into Tailwind utilities, not carried as inline styles."
- The annotated `## section` cards in the Spec Format section are built
  by a Hugo `range` over a `slice` of `dict` entries inside the
  template, rather than seven hand-written copies of the same markup.
  Each card uses the same Tailwind classes (left-accent purple border,
  rounded right side, mono-font label) — equivalent in output but
  expressed once instead of seven times. Functional equivalence
  preserved.
- The roadmap-item bullet markers from the original `::before {
  content: "·" }` rule (style.css:843-848) are reproduced with
  Tailwind's `before:content-['·']` arbitrary-value utilities directly
  on each `<li>`. Tested in the rendered output — the middle-dot
  prefixes render correctly.

**Files changed**:
- `content/how-it-works.md` (new)
- `layouts/how-it-works.html` (new)
- `layouts/_partials/code-block.html` (new)

**Discoveries**:
- The original how-it-works.html has no per-code-block copy buttons —
  only the bottom CTA install-block has one. The page's acceptance
  criterion "Code blocks and copy buttons render and behave correctly"
  refers to (a) code blocks rendering inside the steps, spec example,
  and configuration block, and (b) the single copy button on the
  install-block in the CTA banner. Both verified.
- Hugo's `range (slice (dict ...) (dict ...))` pattern works well for
  inline data-driven sections. Worth considering for similar repetitive
  blocks in Phase 2.2 if they appear.
- Tailwind v4's `before:content-['·']` arbitrary-content utility is
  CSS-only and doesn't require a custom plugin — confirmed at runtime.
- The `border-l-[3px] border-l-accent-primary` paired with
  `border border-border-subtle` and `rounded-r-md` (no left radius)
  perfectly reproduces the spec-annotation card design from the
  original. Worth noting as a pattern for similar "annotation card"
  shapes later.
- Page CSS bundle grew from 30.8KB to 33.0KB after adding the
  how-it-works utilities — modest growth, well under the original 1000-
  line `style.css` (20.6KB unminified).

### 2026-05-20 — Phase 2.2: Install page migration

**What was done**: Migrated `install.html` (145 lines) onto a per-page
layout. `content/install.md` carries title, description, and hero text
in front matter. `layouts/install.html` ports all three install methods
— Homebrew (with full-width install-block + copy button), Debian/Ubuntu
(apt repository code block), and GitHub Releases (four per-platform tar
extraction blocks in a 2-column grid that collapses to 1 column on
mobile). Reused all the partials built in Phase 1.3 and 2.1:
install-block (in `full` mode), code-block, and the inline-`<code>`
styling pattern. The four platform tiles use Hugo's
`range (slice (dict ...) ...)` data-driven pattern, identical to the
spec-annotation cards in Phase 2.1.

**Deviations**: None.

**Files changed**:
- `content/install.md` (new)
- `layouts/install.html` (new)

**Discoveries**:
- The install-block partial's `full` parameter (added in Phase 1.3
  speculatively) is finally used in production here — the Homebrew
  method renders it full-width. Confirmed the `flex w-full` variant
  styling is correct.
- All five pages now render with the same chrome and asset pipeline; CSS
  bundle stayed at ~34KB after adding install-page utilities (Tailwind
  shares most utilities across pages, so the marginal cost of a new
  page is small).
- Phase 2.2 was lower-effort than estimated (~24k) because every partial
  it needed already existed from Phases 1.3 and 2.1. The only new work
  was per-page layout composition, not partial development.

### 2026-05-20 — Phase 2.3: Legacy source removal

**What was done**: Deleted all the legacy hand-built sources that were
kept in place during Milestones 1-2 to keep the existing GitHub Pages
deploy serving: `index.html`, `how-it-works.html`, `install.html`,
`assets/css/style.css`, `assets/images/tui.png` (the original — its
copy survives at `static/images/tui.png`), the now-empty
`assets/images/` directory, the repo-root `CNAME`, and the repo-root
`.nojekyll`. The CNAME and .nojekyll copies in `static/` remain — Hugo
will publish them into `public/` when the deploy switches over in Phase
3.1.

**Deviations**: The plan/context phase-2.3 file list didn't explicitly
call out removing the duplicated root `CNAME` and `.nojekyll`, but those
were created as deliberate duplicates in Phase 1.1 to keep the legacy
`path: .` upload working. With the legacy HTML gone, keeping them at
the root serves no purpose and they're now redundant with `static/CNAME`
/ `static/.nojekyll`. Removed for cleanliness — Phase 3.1's deploy
switch will publish the copies under `static/` into `public/` correctly.

**Files changed** (all deletions):
- `index.html`
- `how-it-works.html`
- `install.html`
- `assets/css/style.css`
- `assets/images/tui.png`
- `assets/images/` (now empty, removed)
- `CNAME`
- `.nojekyll`

**Discoveries**:
- `hugo` still builds five pages and three static files after the
  deletion: home, how-it-works, install, sitemap.xml, index.xml; CNAME,
  .nojekyll, images/tui.png. The only site sources now are Hugo project
  files (`hugo.toml`, `content/`, `layouts/`, `assets/`, `static/`) —
  satisfying the "Hugo project files only" acceptance criterion.
- `assets/js/main.js` was kept (Phase 1.3 had already overwritten it
  with the cleaned-up version that drops the dead install-tabs block).
  The 66-line "stale copy" warning from context.md is moot — there's
  only the post-Phase-1.3 file at that path.
- **Sequencing note for the merge**: this commit, alone, would break
  the live site on next deploy because `.github/workflows/deploy.yml`
  still uploads `path: .` and the root HTML files no longer exist. The
  Phase 3.1 commit (changing the workflow to upload `public/`) is the
  required pair. They must land in the same PR/merge to `main`.

### 2026-05-20 — Phase 3.1: Deploy workflow & local tooling cutover

**What was done**: Cut the GitHub Pages deploy over to the Hugo build.
`.github/workflows/deploy.yml` now splits into two jobs — `build` (sets
up Hugo Extended 0.161.0 via `peaceiris/actions-hugo@v3`, sets up Node
22 via `actions/setup-node@v4` with npm caching, runs `npm ci`, runs
`hugo --minify --baseURL ${{ steps.pages.outputs.base_url }}/`, uploads
`./public` as the Pages artifact) and `deploy` (consumes the artifact
via `actions/deploy-pages@v4`). `Makefile` now defines three targets:
`install` (`npm install`), `serve` (`hugo server`), and `build` (`hugo
--minify`). `README.md` rewritten to document the new prereqs (Hugo
Extended ≥ 0.161.0, Node ≥ 20), and the new workflow (`make install`
→ `make serve`).

**Deviations**: The CI build now sets `--baseURL "${{
steps.pages.outputs.base_url }}/"` from `actions/configure-pages@v5`
output, which lets the deploy work both on a custom domain (the
configured `spektacular.dev`) and on the default `*.github.io/<repo>`
preview URL if pages config is changed. The plan/context did not
specify this explicitly — added it because the alternative (hardcoded
`baseURL` from `hugo.toml`) breaks any preview-deploy use case and is a
known footgun for Pages on custom domains.

**Files changed**:
- `.github/workflows/deploy.yml` (modified — was single "Upload site"
  step on repo root; now two jobs that build and publish `./public`)
- `Makefile` (modified — `serve` target now runs `hugo server`; added
  `install` and `build` targets)
- `README.md` (rewritten — new prereqs and local-dev workflow)

**Discoveries**:
- `peaceiris/actions-hugo@v3` is the de-facto community action for Hugo
  on Pages; it handles both the `+extended` build and pinning, and is
  stable. The official Hugo install via `.deb` works too but adds two
  extra steps to the workflow.
- `actions/setup-node@v4` with `cache: 'npm'` keys off
  `package-lock.json`, so the lockfile committed at Phase 1.1 is
  load-bearing for fast CI builds — confirmed by running the workflow
  locally with `act` would surface any drift, but the lockfile is up to
  date.
- Two of Phase 3.1's three acceptance criteria are post-deploy gates
  (live build, live custom-domain serve) and cannot be checked locally.
  Marked as deferred in the plan checkboxes; the workflow is
  structurally correct and follows the patterns from the Hugo + Pages
  docs.
- After Phase 3.1's CI cutover, all subsequent edits flow through Hugo
  → npm → `public/` → Pages. The legacy `path: .` upload model is
  retired permanently.

### 2026-05-20 — Plan complete

All seven phases complete. The site is now built by Hugo with Tailwind
v4 from `content/` + `layouts/`, deploys to GitHub Pages via the
updated workflow, and serves on the existing `spektacular.dev` custom
domain. Source tree at completion:

```
.github/workflows/deploy.yml   # Hugo build → publish public/
.gitignore                      # public/, node_modules/, hugo_stats.json, ...
Makefile                        # install / serve / build
README.md                       # new prereqs + workflow
assets/css/main.css             # @import tailwindcss + @theme tokens
assets/js/main.js               # copy-to-clipboard + smooth-scroll (cleaned)
content/_index.md               # homepage front matter
content/how-it-works.md         # how-it-works front matter
content/install.md              # install front matter
hugo.toml                       # site config + Tailwind buildStats
layouts/baseof.html             # base layout
layouts/home.html               # homepage
layouts/how-it-works.html       # how-it-works page
layouts/install.html            # install page
layouts/_partials/*.html        # head, css, js, nav, footer + UI partials
package.json + package-lock.json
static/CNAME                    # custom domain → public/
static/.nojekyll                # → public/
static/images/tui.png           # → public/images/tui.png
```

The only post-merge verification gates are the two real-deploy
acceptance criteria on Phase 3.1, listed there in the changelog and
left unchecked deliberately.


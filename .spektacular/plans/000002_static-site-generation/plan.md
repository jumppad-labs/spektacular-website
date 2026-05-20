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

#### - [ ] Phase 1.1: Hugo project scaffold & Tailwind pipeline

Establishes the Hugo project: site configuration, the standard directory
layout, the npm manifest for the Tailwind CLI, and the Tailwind v4 theme
stylesheet that ports the current design tokens. Wires Hugo's
`css.TailwindCSS` pipe so processed CSS is generated on build. Static assets
(image, custom-domain file, `.nojekyll`) move into Hugo's static directory,
and build output and `node_modules` are git-ignored.

*Technical detail:* [context.md#phase-11](./context.md#phase-11-hugo-project-scaffold--tailwind-pipeline)

**Acceptance criteria**:

- [ ] `hugo` runs without errors and produces a built site directory
- [ ] The Tailwind theme reproduces the current colours, spacing, and radii
      as named tokens
- [ ] The custom-domain file and `.nojekyll` appear in the build output
      unchanged

#### - [ ] Phase 1.2: Base layout & shared chrome partials

Creates the base layout (document shell, head/meta, CSS and script wiring,
content block) and the shared navigation, header, and footer partials. After
this phase the chrome that today is copy-pasted across three files is
defined exactly once, with per-page active-link state.

*Technical detail:* [context.md#phase-12](./context.md#phase-12-base-layout--shared-chrome-partials)

**Acceptance criteria**:

- [ ] Navigation, header, and footer are each defined in a single partial
- [ ] Editing a chrome partial changes every page that uses it after a
      rebuild
- [ ] The base layout renders valid HTML with correct metadata

#### - [ ] Phase 1.3: Homepage migration

Migrates the homepage onto a dedicated layout fed by a Markdown content
file, building the reusable UI partials it needs (install/copy block, badge,
button, pipeline node, feature card). Ports the client-side script
(copy-to-clipboard, smooth scroll) and drops the dead tab-switching code.

*Technical detail:* [context.md#phase-13](./context.md#phase-13-homepage-migration)

**Acceptance criteria**:

- [ ] The homepage is visually equivalent to the current site at desktop and
      mobile widths
- [ ] Every section and element of the current homepage is present
- [ ] The copy-to-clipboard button works on the rendered homepage

### Milestone 2: All pages migrated

**What changes**: The how-it-works and install pages are migrated onto
per-page Hugo layouts, reusing the shared chrome and Tailwind theme, with
reusable partials for repeated UI (install/copy block, code block, pipeline
node, etc.). After this lands, the entire site is generated by Hugo — all
three pages, all content, all interactive elements (copy buttons, smooth
scroll) carried over — and no hand-written `style.css` or standalone HTML
files remain.

#### - [ ] Phase 2.1: How-it-works page migration

Migrates the how-it-works page onto a per-page layout and content file,
reusing the shared chrome and partials and adding a code-block partial.
Covers the quick-start steps, spec-format two-column block, pipeline stages,
configuration block, and roadmap.

*Technical detail:* [context.md#phase-21](./context.md#phase-21-how-it-works-page-migration)

**Acceptance criteria**:

- [ ] The how-it-works page is visually equivalent to the current site at
      desktop and mobile widths
- [ ] Every section and element of the current page is present
- [ ] Code blocks and copy buttons render and behave correctly

#### - [ ] Phase 2.2: Install page migration

Migrates the install page onto a per-page layout and content file, reusing
shared partials and covering the page hero, the three install methods, and
the per-platform download blocks.

*Technical detail:* [context.md#phase-22](./context.md#phase-22-install-page-migration)

**Acceptance criteria**:

- [ ] The install page is visually equivalent to the current site at desktop
      and mobile widths
- [ ] Every section and element of the current page is present
- [ ] All install commands and copy buttons render and behave correctly

#### - [ ] Phase 2.3: Legacy source removal

Removes the now-superseded hand-built sources — the three standalone HTML
files, the hand-written stylesheet, and the old script location. After this
phase the only site sources are the Hugo project files. This phase should
land in the same merge as Phase 3.1: removing the old root HTML while the
deploy workflow still uploads the repo root would publish a broken site for
one deploy cycle.

*Technical detail:* [context.md#phase-23](./context.md#phase-23-legacy-source-removal)

**Acceptance criteria**:

- [ ] No standalone page HTML files or hand-written `style.css` remain in the
      repository
- [ ] The full site still builds and renders correctly from Hugo sources
      alone

### Milestone 3: Deployment cut over to the Hugo build

**What changes**: The GitHub Actions workflow, npm dependency manifest, and
local `Makefile` are updated so the deployed artifact is Hugo's build output
rather than the repo root. After this lands, every push to `main` builds the
site with Hugo and publishes it to GitHub Pages on the existing custom
domain, and local development uses `hugo server`.

#### - [ ] Phase 3.1: Deploy workflow & local tooling cutover

Updates the GitHub Actions workflow to install Hugo Extended and Node, run
the Hugo build, and publish the built site directory instead of the repo
root. Updates the `Makefile` to run `hugo server` and refreshes the README's
local-development instructions.

*Technical detail:* [context.md#phase-31](./context.md#phase-31-deploy-workflow--local-tooling-cutover)

**Acceptance criteria**:

- [ ] A push to `main` builds with Hugo and publishes the built site to
      GitHub Pages
- [ ] The live site loads correctly over the `spektacular.dev` custom domain
- [ ] `make serve` starts the Hugo development server

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

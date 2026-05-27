# Research: 000004_astro-migration

## Alternatives considered and rejected

### Option A: Primitives-only port — section-level HTML inline in MDX pages

Port only the seven UI primitives (Button, Badge, CodeBlock,
InstallBlock, FeatureCard, PipelineNode, PipelineConnector) as Astro
components. Each MDX page body contains `<section>` / `<div
class="grid …">` / `<header>` directly, composing primitives inside.

**Rejected** because it fails the spec's acceptance criterion verbatim:
"Scanning any page's source file shows no `<div>`, `<section>`, or
other layout-level HTML in the body — only prose and named references
to structural blocks" (`.spektacular/specs/000004_astro-migration.md:48-50`).
A first-time contributor still wades past layout-level HTML to find
copy. Cheaper to author up-front but voids the migration's load-bearing
promise.

### Option B: Hybrid — extract section components only when "non-trivial"

Extract section components for visually non-trivial / multi-use blocks
(Hero, FeaturesGrid, Pipeline, CtaBanner) but leave the simpler
sections (a heading + a code block + a paragraph) inline as raw HTML
in MDX.

**Rejected** because the rule is inconsistent and judgment-driven —
readers can't predict whether a section is a named block or raw HTML,
and partially violates the acceptance criterion at the same places
Option A does (a "simple" section still has a wrapping `<section>` or
`<div>`). Later additions face the same "is this big enough to
extract?" judgment call, drifting over time.

### Option C: Next.js + MDX (the jumppad reference stack)

Rebuild the site on Next.js with MDX, matching the framework used
elsewhere in the jumppad ecosystem.

**Rejected** by the spec itself
(`.spektacular/specs/000004_astro-migration.md:62-68`): "Astro is
chosen over the jumppad reference (Next.js) because the site is
content-first and stays content-first; Astro ships zero JS by default
and stays close to the existing 'build static HTML, deploy a directory'
model." The spec locks in Astro before planning starts.

### Option D: Astro Content Collections instead of `src/pages/*.mdx`

Define an Astro content collection (`src/content/pages/`) with a Zod
schema for frontmatter and render via a `[...slug].astro` catch-all
route.

**Rejected** because Astro Content Collections pay off when (a) the
schema validation guards a non-trivial frontmatter shape, (b) there
are many entries, or (c) there are multiple content types to keep
type-distinct. This site has six flat pages with near-identical
frontmatter (title/description/layout). The Collection schema +
catch-all route is extra machinery without a payoff. Documented as a
deferred upgrade in plan.md § Out of Scope.

### Option E: `@astrojs/tailwind` integration

Wire Tailwind into Astro via the `@astrojs/tailwind` integration
instead of `@tailwindcss/vite`.

**Rejected** because `@astrojs/tailwind` is a Tailwind v3 wrapper and
is deprecated for Tailwind v4 use; the v4 `@theme` and `@plugin`
syntax the current site uses is not supported (citations in §
External references — Tailwind Astro guide and Astro 5.2 release
notes). Using v3-via-the-integration would require rewriting the
theme tokens to a `tailwind.config.js` and losing the `@theme`
syntax — explicitly opposed to the "tokens carry over verbatim" goal.

### Option F: Astro 6 (beta)

Target Astro 6 instead of 5.x for newest features (rolldown-vite,
others).

**Rejected** because Astro 6 has known compat issues with Tailwind v4
(GitHub issue #16542 — `astro add tailwind` installs incompatible
versions) and reports of MDX HMR regressions (#15223). The migration's
live-reload acceptance criterion is at risk under those conditions.
Pinning to 5.x stable matches the canonical Astro and Tailwind
migration guides. Deferred to a later upgrade once the upstream
issues are resolved.

### Option G: Typed prop arrays for repeating sub-items

Pass repeating items (feature cards, pipeline nodes, plugins) as a
typed prop on the parent section
(`<FeaturesGrid items={[...]} />`) instead of as MDX children.

**Rejected** by user preference confirmed during architecture review:
prop arrays read tighter (one line per section) but the items become
nested data, less visually scannable than MDX children. Authoring
shape — `<FeaturesGrid><FeatureCard ... /></FeaturesGrid>` — reads
as the outline of what appears on screen, in source order. Aligns
with the "first-time contributor finds the file to edit on first try"
success metric.

## Chosen approach — evidence

**Astro 5 + MDX + Tailwind v4 via `@tailwindcss/vite` is the
canonical 2026 stack.** Astro 5 moved JSX/MDX rendering into the
integration; `@astrojs/mdx` v4+ is the path. The Tailwind Astro guide
explicitly recommends `@tailwindcss/vite` over the deprecated
integration. The `@theme { … }` token block and
`@plugin "@tailwindcss/typography";` import are framework-agnostic in
v4, so the existing `assets/css/main.css:1-end` ports unchanged into
`src/styles/global.css`. Citations in § External references.

**`src/pages/*.mdx` direct routing is Astro's idiomatic
file-based-routing pattern.** A `.mdx` file under `src/pages/`
becomes a route. Frontmatter `layout: "../layouts/Shell.astro"`
points the file at the shared shell. JS imports below the
frontmatter import section components; the body composes them as
JSX. This is the shape the Astro Markdown guide documents directly.

**Hugo partials map cleanly to Astro components.** A Hugo partial
takes a dict and returns markup; an `.astro` component takes typed
`Astro.props` and returns markup. Slot-based children replace Hugo's
`partialCached` and `block` patterns for content composition. The
current partial inventory — 7 UI primitives with simple dict shapes
— ports one-to-one without restructuring.

**`safeHTML` semantics carry over via `set:html`.** The current
partials use Hugo's `safeHTML` filter on `body`, `sub`, and `detail`
strings (feature cards have inline `<a>` / `<code>`, pipeline nodes
have inline markup). Astro's `set:html={...}` attribute is the
equivalent escape hatch. Confirmed in Astro's component docs.

**GitHub Pages deploy stays simple.** Move `static/CNAME` and
`static/.nojekyll` to `public/` (everything in `public/` is copied
verbatim to `dist/`). Set `site: "https://spektacular.dev"` in
`astro.config.mjs`. Replace the Hugo workflow steps with Node 22
setup + `npm ci && npm run build`. Use `actions/upload-pages-artifact`
on `./dist`. The deploy guide on docs.astro.build documents this
shape directly.

**Vite HMR handles MDX live-reload.** `astro dev` runs Vite under
the hood; MDX edits trigger a fast Vite page refresh. State-preserving
component swap (React/Preact/Solid-style) doesn't apply to `.astro`
files, but for content-only pages a refresh is indistinguishable
from a swap.

## Files examined

- `hugo.toml:1-50` — Site config; identified the menu entries
  (`[[menu.main]]`), build settings (`[build]` with `buildStats` and
  `cachebusters`), and module mounts that migrate to `astro.config.mjs`
  or are dropped entirely.
- `layouts/baseof.html` — Confirmed the chrome composition shape
  (head/nav/main/footer/js partials) that becomes `Shell.astro`.
- `layouts/home.html` — Confirmed the bespoke structural sections
  driving the page-section component list: hero, install block, CTA
  buttons, single-stage pipeline, features grid, CTA banner.
- `layouts/how-it-works.html` — Identified the three-stage pipeline
  pattern (drives `PipelineStage` helper component) and the
  template-variable class composition (`$stepClasses`, `$stageHeading`)
  that motivates OQ-2.
- `layouts/install.html` — Confirmed three install-method blocks share
  the same heading + prose + InstallBlock/CodeBlock shape — drives
  the `InstallMethods` slot-based section.
- `layouts/configuration.html` — Confirmed the six-key list pattern
  drives `ConfigurationKeys` + `ConfigKey` helper.
- `layouts/plugins.html` — Confirmed the two-grid inventory (shipping
  + planned) drives `PluginInventory` with `<Plugin status="...">`
  children.
- `layouts/extending.html` — Confirmed this is the only layout that
  consumes `{{ .Content }}` from a markdown body, drives the `<Prose>`
  wrapper.
- `layouts/_partials/*.html` (12 files) — Identified the 7 UI
  primitives (button, badge, code-block, install-block, feature-card,
  pipeline-node, pipeline-connector) and 5 chrome partials (head, nav,
  footer, css, js). The 7 primitives port one-to-one with their dict
  shapes becoming Props interfaces.
- `content/*.md` (6 files) — Confirmed 5 of 6 are layout-only
  (frontmatter only) and 1 (`extending.md`) has a markdown body. This
  is the load-bearing observation that motivates the "one file per
  page" goal — the current bifurcation between frontmatter and
  layout HTML disappears under MDX.
- `assets/css/main.css:1-end` — Confirmed the file is one `@import`,
  one `@plugin`, one `@source`, and a single `@theme` block. Ports
  verbatim minus `@source`.
- `assets/js/main.js:1-end` — Confirmed two simple DOM behaviors
  (copy-to-clipboard, smooth scroll). Ports verbatim as inline
  `<script>` in Shell.
- `static/` — Confirmed the three files (CNAME, .nojekyll,
  images/tui.png) that need to move to `public/`.
- `.github/workflows/deploy.yml:1-60` — Confirmed the Hugo-specific
  steps (Setup Hugo, Build with Hugo) that get replaced, and the
  artifact-upload path that changes from `./public` to `./dist`.
- `package.json` — Confirmed current deps (`tailwindcss`,
  `@tailwindcss/cli`, `@tailwindcss/typography`) and the scripts
  that get rewritten.

## External references

- **Upgrade to Astro v5** — `https://docs.astro.build/en/guides/upgrade-to/v5/`
  — confirms Astro 5 requires `@astrojs/mdx` v4+ and the integration
  is the supported MDX path.
- **`@astrojs/mdx` integration** —
  `https://docs.astro.build/en/guides/integrations-guide/mdx/` —
  authoring shape for MDX-as-page.
- **Tailwind Astro install guide** —
  `https://tailwindcss.com/docs/installation/framework-guides/astro`
  — confirms `@tailwindcss/vite` is the supported v4 path; the
  `@astrojs/tailwind` integration is deprecated and is a v3 wrapper.
- **Astro 5.2 release notes** —
  `https://astro.build/blog/astro-520/` — context on the deprecation
  and the `@tailwindcss/vite` recommendation.
- **Tailwind CSS v4 announcement** —
  `https://tailwindcss.com/blog/tailwindcss-v4` — confirms `@theme`
  and `@plugin` are framework-agnostic; same syntax works across
  Hugo's pipe and Astro's Vite path.
- **Markdown in Astro** —
  `https://docs.astro.build/en/guides/markdown-content/` — the
  frontmatter / layout / body shape `.mdx` pages use.
- **Astro Layouts** —
  `https://docs.astro.build/en/basics/layouts/` — how `layout:`
  frontmatter resolves to `Shell.astro`.
- **Astro Components** —
  `https://docs.astro.build/en/basics/astro-components/` — the
  `Astro.props` / `<slot />` / typed `Props` interface pattern that
  primitives and section components follow.
- **Astro TypeScript guide** —
  `https://docs.astro.build/en/guides/typescript/` — confirms
  `Props` interfaces at the top of `.astro` files for type-checked
  props.
- **Deploy Astro to GitHub Pages** —
  `https://docs.astro.build/en/guides/deploy/github/` — the canonical
  workflow shape this migration's `deploy.yml` is rewritten to.
- **Migrating from Hugo (official Astro)** —
  `https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/` —
  high-level: Go templates → JSX-superset shift, shortcodes → MDX
  component imports.
- **Hugo → Astro community migration story (Elio Struyf)** —
  `https://www.eliostruyf.com/migration-story-hugo-astro/` — image
  path handling and asset-pipeline differences.
- **Hugo → Astro migration write-up (Shane Stillwell)** —
  `https://www.shanestillwell.com/migrating-from-hugo-to-astro/` —
  routing and pretty-URL handling under Astro's file-based router.
- **Astro 2.0 HMR notes** —
  `https://astro.build/blog/astro-2/` — the HMR baseline Astro 5
  inherits.
- **Issue #15223 — no hot reload on markdown edits (Astro 6 beta)** —
  `https://github.com/withastro/astro/issues/15223` — motivation for
  pinning to Astro 5 (OQ-3).
- **Issue #6742 — HMR component-swap support** —
  `https://github.com/withastro/astro/issues/6742` — context on what
  HMR does and doesn't do for `.astro` files.
- **Issue #16542 — `astro add tailwind` on Astro 6** —
  `https://github.com/withastro/astro/issues/16542` — Tailwind compat
  issue motivating Astro 5 pin.

## Prior plans / specs consulted

- **`.spektacular/specs/000004_astro-migration.md`** — The spec this
  plan is built against. Locks in Astro + MDX + Tailwind v4 carryover
  before planning starts; defines the "one file per page" goal, the
  visual / URL / hosting parity constraints, the acceptance criterion
  banning `<div>` / `<section>` in page bodies, and the non-goals
  list (no redesign, no content rewrite, no new features, no URL
  changes).
- **`.spektacular/plans/000002_static-site-generation/plan.md`** — The
  Hugo migration plan. Established the Tailwind v4 token palette in
  `assets/css/main.css`, the partial inventory (button, badge,
  code-block, install-block, feature-card, pipeline-node,
  pipeline-connector), the menu-driven nav, and the GitHub Pages
  deploy workflow. This plan ports those inputs forward into Astro
  shape.
- **`.spektacular/plans/000003_update-content/plan.md`** — The
  content-update plan. Added the Configuration, Plugins, and
  Extending pages with their layouts. This plan migrates those three
  pages alongside the original three. The Extending page's
  markdown-body shape (versus the others' layout-only shape) is the
  motivation for the `<Prose>` wrapper component.

## Open assumptions

- **The Tailwind v4 `@theme` token block in `assets/css/main.css`
  is the complete styling contract.** Assumed that no styling
  behaviour escapes the `@theme` block (e.g. computed-style overrides,
  Tailwind defaults the current build silently depends on). If
  rendering reveals a gap, OQ-1 fires: STOP and surface.
- **Tailwind v4 + Vite's class extraction is complete for this
  source tree.** Assumed Vite's content scanner detects every utility
  class used in `.astro` and `.mdx` files. Hugo's
  `layouts/how-it-works.html` composes some classes via template
  variables (`$stepClasses`, `$stageHeading`); those are intentionally
  flattened to literal strings during Phase 2.1 / 2.3 to avoid the
  problem. If a gap appears anyway, OQ-2 fires.
- **MDX HMR in Astro 5 is reliable enough for the live-reload
  acceptance criterion.** Assumed Vite HMR triggers a browser refresh
  on `.mdx` edits within ~1 second. If MDX edits frequently require
  manual reloads, OQ-3 fires.
- **The current GitHub release tag baked into `hugo.toml:params.version`
  is acceptable to hardcode in the home page MDX.** Dynamic
  release-tag fetching is explicitly deferred (plan.md § Out of Scope).
- **The chroma → Shiki syntax-highlighting change on the Extending
  page is visually equivalent or close enough to pass the parity
  check.** If Go code blocks render visibly differently after
  migration, surface as OQ-1 and let the user decide.
- **The repo's `gh-pages` / Pages settings are still set to "GitHub
  Actions"** (not the legacy branch-based publishing). The current
  workflow uses `actions/deploy-pages` which requires this. Assumed
  unchanged.

## Rehydration cues

If context is lost mid-implementation, regenerate it from:

- **Re-read the spec:**
  `spektacular spec file read 000004_astro-migration.md`
- **Re-read the plan and context:**
  `spektacular plan file read 000004_astro-migration/plan.md`
  and `spektacular plan file read 000004_astro-migration/context.md`
- **Re-read the prior Hugo plans:**
  `spektacular plan file read 000002_static-site-generation/plan.md`
  and `spektacular plan file read 000003_update-content/plan.md` to
  recall the partial inventory and the token palette.
- **Re-read the current Hugo source:**
  - `hugo.toml` — site config, menu, params
  - `layouts/baseof.html` and `layouts/_partials/` — chrome and
    primitives
  - `layouts/home.html` / `how-it-works.html` / `install.html` /
    `configuration.html` / `plugins.html` / `extending.html` —
    page structures
  - `content/*.md` — page frontmatter (5 files) and the extending
    markdown body (1 file)
  - `assets/css/main.css` — the `@theme` block and Tailwind imports
  - `assets/js/main.js` — the two DOM handlers
  - `.github/workflows/deploy.yml` — current deploy shape
- **Diff against production:**
  Open `https://spektacular.dev` and compare against the in-progress
  Astro build for any phase.
- **Astro doc rehydration:**
  - Astro Markdown: `https://docs.astro.build/en/guides/markdown-content/`
  - Astro Components: `https://docs.astro.build/en/basics/astro-components/`
  - Astro GitHub Pages deploy: `https://docs.astro.build/en/guides/deploy/github/`
  - Tailwind v4 + Astro: `https://tailwindcss.com/docs/installation/framework-guides/astro`

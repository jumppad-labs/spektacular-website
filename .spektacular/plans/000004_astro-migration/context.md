# Context: 000004_astro-migration

## Current State Analysis

The repository is a Hugo static site published from this commit to
`spektacular.dev` via GitHub Pages. Discovery (see `research.md`)
established the following starting points the migration must port from:

**Layouts (6 top-level + 12 partials):**

- `layouts/baseof.html` — Root wrapper. Composes `head`, `nav`, the
  `{{ block "main" }}` slot, `footer`, and the `js` partials. Will be
  replaced by `src/layouts/Shell.astro`.
- `layouts/home.html` — Reads `Params.version`, `Params.installCommand`,
  `Params.heroHeadline` (array), `Params.heroSub`, `Params.githubURL`.
  Renders hero, install block, CTAs, single-stage pipeline preview
  (3 PipelineNodes + 2 PipelineConnectors), 6-card features grid,
  closing CTA banner.
- `layouts/how-it-works.html` — Reads `Params.heroHeading`,
  `Params.heroSub`. Renders hero, 5-step quick-start (each step has its
  own `<CodeBlock>`), spec-format two-column block, three-stage pipeline
  (`$stepClasses`, `$stepNumClasses`, `$stageHeading`, `$stageNumber`
  template variables), closing CTA. **The template-variable-driven class
  composition here is the most likely source of OQ-2 issues.**
- `layouts/install.html` — Renders hero + three install-method blocks
  (Homebrew, Go install, GitHub Releases) + CTA banner.
- `layouts/configuration.html` — Renders hero + "Where config lives"
  intro + six-key list (using a range over a slice of dicts in the
  template) + worked YAML example + CTA banner.
- `layouts/plugins.html` — Renders hero + "What's pluggable" two-card
  intro + 4-card shipping grid (file, claude, bob, codex) + 3-card
  planned grid (obsidian, notion, jira) + CTA banner.
- `layouts/extending.html` — Renders hero + `{{ .Content }}` (rendered
  markdown from `content/extending.md`) inside a Tailwind Typography
  prose container + CTA banner. **The only current layout that pulls
  from a markdown body.**
- `layouts/_partials/head.html` — Renders meta charset, viewport, title
  (conditional home vs. page), description; includes the `css` partial.
- `layouts/_partials/nav.html` — Sticky navbar; reads
  `Site.Menus.main` (the `[[menu.main]]` entries from `hugo.toml`) and
  `Site.Params.githubURL`; computes active link state per page.
- `layouts/_partials/footer.html` — Footer with license link, GitHub,
  releases (reads `Site.Params.licenseURL`, `githubURL`, `releasesURL`).
- `layouts/_partials/css.html` — Wraps `assets/css/main.css` through
  Hugo's `css.TailwindCSS` pipe with `{ minify: ... }`; fingerprints
  + integrity hashes in production via `templates.Defer`.
- `layouts/_partials/js.html` — Minifies + fingerprints
  `assets/js/main.js` in production; `defer` attribute.
- `layouts/_partials/button.html` — Dict: `href`, `label`, `variant`
  (default `"primary"`), `large` (default `false`), `external` (default
  `false`). Outputs `<a>` with variant + size class composition.
- `layouts/_partials/badge.html` — Dict: `text`, `variant` (default
  `"green"`), `dot` (default `false`).
- `layouts/_partials/code-block.html` — Dict: `code`. Outputs
  `<pre><code>` block + `.copy-btn` button bearing `data-copy={code}`.
- `layouts/_partials/install-block.html` — Dict: `command`, `full`
  (default `false`). Terminal-styled command block with copy button.
- `layouts/_partials/feature-card.html` — Dict: `icon`, `title`, `body`
  (rendered via `safeHTML`, so contains inline `<a>`/`<code>`).
- `layouts/_partials/pipeline-node.html` — Dict: `kind` (`"file"` |
  `"step"` | `"output"`), `icon`, `label`, `name`, `sub` (safeHTML),
  `detail` (safeHTML).
- `layouts/_partials/pipeline-connector.html` — No inputs; renders "→"
  divider that rotates 90° on mobile.

**Content (6 files, 5 layout-only):**

- `content/_index.md:1-15` — Frontmatter: `title`, `description`,
  `heroHeadline` (array of two strings), `heroSub`. Body: empty.
- `content/how-it-works.md` — Frontmatter: `title`, `description`,
  `layout: how-it-works`, `heroHeading`, `heroSub`. Body: empty.
- `content/install.md` — Same shape, `layout: install`. Body: empty.
- `content/configuration.md` — Same shape, `layout: configuration`.
  Body: empty.
- `content/plugins.md` — Same shape, `layout: plugins`. Body: empty.
- `content/extending.md` — Frontmatter: `title`, `description`,
  `layout: extending`, `heroHeading`, `heroSub`. Body: markdown with
  the Go interface listings (Store, DirEntry, Hit, Agent), method
  explanations, and the "how a backend is registered" note.

**Asset pipeline:**

- `assets/css/main.css:1-3` — `@import "tailwindcss";`, `@plugin
  "@tailwindcss/typography";`.
- `assets/css/main.css:4` — `@source "hugo_stats.json";` (DROPPED in
  migration — Tailwind v4 + Vite scans the source tree).
- `assets/css/main.css:6-end` — `@theme` block with colour, spacing,
  and radius tokens. **Ported verbatim** to `src/styles/global.css`.
- `assets/js/main.js:1-end` — Copy-to-clipboard handler targeting
  `.copy-btn[data-copy]` with Clipboard-API + `execCommand` fallback;
  smooth-scroll handler for `a[href^="#"]`. **Ported verbatim** to an
  inline `<script>` in `Shell.astro`.

**Static assets:**

- `static/.nojekyll` — 0-byte file. Moves to `public/.nojekyll`.
- `static/CNAME` — Contains `spektacular.dev`. Moves to `public/CNAME`.
- `static/images/tui.png` — UI screenshot. Moves to
  `public/images/tui.png`.

**Hugo config (`hugo.toml`):**

- `baseURL`, `defaultContentLanguage`, `title` — Astro equivalent:
  `astro.config.mjs:site`, plus Head component title default.
- `disableKinds = ["taxonomy", "term"]` — No Astro equivalent needed;
  Astro doesn't generate taxonomy pages by default.
- `[params]` — Six keys: `description`, `githubURL`, `releasesURL`,
  `licenseURL`, `installCommand`, `version`. Migrated as hardcoded
  values inside the relevant components and MDX pages (see Phase 1.2
  and 2.2 notes).
- `[[menu.main]]` — Five entries (How it works /10, Install /20,
  Configuration /30, Plugins /40, Extending /50). Migrated as a
  hardcoded array inside `Nav.astro`.
- `[build]` — `buildStats.enable`, `cachebusters` for CSS rebuild on
  layout / content / postcss / tailwind changes. **Dropped** — Vite
  + Tailwind v4 handle this transparently.
- `[[module.mounts]]` — `assets/` → `assets/`,
  `hugo_stats.json` → `assets/notwatching/`. **Dropped**.

**Deploy workflow (`.github/workflows/deploy.yml`):**

- Lines 1-30 (build job header, checkout, Setup Hugo via
  `peaceiris/actions-hugo@v3` with `extended: true` and
  `hugo-version: 0.161.0`). **Setup Hugo step removed.**
- Lines 31-40 (Setup Node 22 with `actions/setup-node@v4`, cache npm,
  `npm ci`). **Retained.**
- Lines 41-50 (Setup Pages via `actions/configure-pages@v5`, Build
  with Hugo `hugo --minify --baseURL`). **Replaced with Astro build:
  `npm run build`.**
- Lines 51-60 (`actions/upload-pages-artifact@v3` with `path: ./public`).
  **Path changes to `./dist`.**
- Deploy job (`actions/deploy-pages@v4`) — **unchanged.**

**Build tooling:**

- `package.json` — Current dev deps: `tailwindcss`, `@tailwindcss/cli`,
  `@tailwindcss/typography`. Replaced with: `astro`, `@astrojs/mdx`,
  `@tailwindcss/vite`, `tailwindcss`, `@tailwindcss/typography`.
- `Makefile` — `serve` target invokes `hugo server`. **Deleted** in
  Phase 3.1 (replaced by `npm run dev`).
- `package-lock.json` — Regenerated by Phase 1.1 `npm install`.

**Other repo files:**

- `hugo_0.162.0_linux-amd64.deb` (untracked, listed in git status) —
  Local Hugo install package. Deleted in Phase 3.1 cleanup.
- `node_modules/` — Already gitignored. Regenerated.
- `public/` — Currently the Hugo build output (gitignored). Inverted
  in role during Phase 1.1: becomes the *input* static-asset dir.
- `.gitignore` — Update to add `dist/`, `.astro/`; remove `public/`
  entry (it's now tracked source, not build output).

## Per-Phase Technical Notes

### Phase 1.1: Astro project scaffold + ported global stylesheet

**File changes:**

- Overwrite `package.json`. New shape:
  - Dependencies: `astro` `^5.0`, `@astrojs/mdx` `^4.0`,
    `@tailwindcss/vite` `^4.0`, `tailwindcss` `^4.0`,
    `@tailwindcss/typography` `^0.5`.
  - Scripts: `{ dev: "astro dev", build: "astro build",
    preview: "astro preview", astro: "astro" }`.
  - Remove `@tailwindcss/cli`.
- Create `astro.config.mjs`:
  ```js
  import { defineConfig } from "astro/config";
  import mdx from "@astrojs/mdx";
  import tailwindcss from "@tailwindcss/vite";

  export default defineConfig({
    site: "https://spektacular.dev",
    integrations: [mdx()],
    vite: { plugins: [tailwindcss()] },
  });
  ```
- Create `tsconfig.json`: `{ "extends": "astro/tsconfigs/strict" }`.
- Create `src/styles/global.css`:
  - Line 1: `@import "tailwindcss";` (port from
    `assets/css/main.css:1`).
  - Line 2: `@plugin "@tailwindcss/typography";` (port from
    `assets/css/main.css:2`).
  - **Skip** `assets/css/main.css:4` (`@source "hugo_stats.json";`) —
    not needed under Vite.
  - Lines 4+: Port the entire `@theme` block from
    `assets/css/main.css:6-end` verbatim. Tokens to confirm present:
    `--color-bg-base`, `--color-bg-surface`, `--color-bg-elevated`,
    `--color-bg-code`, `--color-border-subtle`,
    `--color-border-default`, `--color-text-primary`,
    `--color-text-secondary`, `--color-text-muted`,
    `--color-accent-primary`, `--color-accent-light`,
    `--color-accent-subtle`, `--color-terminal-green`,
    `--color-terminal-green-dim`, `--color-link-blue`, spacing scale
    (`--spacing-xs` through `--spacing-xl`), radii (`--radius-sm`,
    `--radius-md`, `--radius-lg`, `--radius-pill`).
- Copy `static/CNAME` → `public/CNAME` (via `cp`, original stays).
- Copy `static/.nojekyll` → `public/.nojekyll`.
- Copy `static/images/tui.png` → `public/images/tui.png`.
- Update `.gitignore`: add `dist/`, `.astro/`.

**Complexity:** Low
**Token estimate:** ~3k
**Agent strategy:** Single agent, sequential execution.

### Phase 1.2: Shell layout + chrome components

**File changes:**

- Create `src/layouts/Shell.astro`:
  - `interface Props { title: string; description?: string }`.
  - Renders `<!doctype html>`, `<html lang="en">`, `<head>` (composes
    `<Head>`), `<body>` (composes `<Nav>`, then `<slot />`, then
    `<Footer>`).
  - Imports `../styles/global.css` once.
  - Includes inline `<script>` block — port of `assets/js/main.js:1-end`
    verbatim (copy-to-clipboard targeting `.copy-btn[data-copy]`,
    smooth-scroll for `a[href^="#"]`).
- Create `src/components/Head.astro`:
  - `interface Props { title: string; description?: string }`.
  - Renders `<meta charset>`, `<meta viewport>`, `<title>` (use page
    title; fall back to `"Spektacular"`), `<meta name="description">`.
  - Port from `layouts/_partials/head.html`.
- Create `src/components/Nav.astro`:
  - No props.
  - Hardcode the menu as a `const items = [...]` array inside the
    component (replacing `hugo.toml [[menu.main]]`):
    ```ts
    const items = [
      { label: "How it works", href: "/how-it-works/" },
      { label: "Install", href: "/install/" },
      { label: "Configuration", href: "/configuration/" },
      { label: "Plugins", href: "/plugins/" },
      { label: "Extending", href: "/extending/" },
    ];
    ```
  - Derive active state with `Astro.url.pathname === item.href`. Port
    visual treatment from `layouts/_partials/nav.html` active-state
    classes.
  - Hardcode GitHub icon link with the current
    `hugo.toml:params.githubURL` value.
- Create `src/components/Footer.astro`:
  - No props.
  - Hardcode license / GitHub / releases URLs from current
    `hugo.toml:params.licenseURL`, `params.githubURL`,
    `params.releasesURL`.
- Create `src/pages/index.astro` (throwaway stub):
  ```astro
  ---
  import Shell from "../layouts/Shell.astro";
  ---
  <Shell title="Astro foundation">
    <main><h1>Astro foundation</h1></main>
  </Shell>
  ```
  Replaced by `index.mdx` in Phase 2.2.

**Complexity:** Low
**Token estimate:** ~4k
**Agent strategy:** Single agent, sequential execution.

### Phase 1.3: UI primitives ported

**File changes:**

- Create `src/components/Button.astro`. Port from
  `layouts/_partials/button.html`. Props:
  `{ href: string; label: string; variant?: "primary" | "secondary"; large?: boolean; external?: boolean }`.
  Defaults: `variant = "primary"`, `large = false`, `external = false`.
  Conditional `target="_blank" rel="noopener noreferrer"` on external.
  Class composition mirrors current partial's logic.
- Create `src/components/Badge.astro`. Port from
  `layouts/_partials/badge.html`. Props:
  `{ text: string; variant?: "green" | "purple"; dot?: boolean }`.
  Defaults: `variant = "green"`, `dot = false`.
- Create `src/components/CodeBlock.astro`. Port from
  `layouts/_partials/code-block.html`. Props:
  `{ code: string; lang?: string }`. Renders `<pre><code
  class="language-${lang}">{code}</code></pre>` plus `.copy-btn` button
  with `data-copy={code}` (handled by Shell's inline script).
- Create `src/components/InstallBlock.astro`. Port from
  `layouts/_partials/install-block.html`. Props:
  `{ command: string; full?: boolean }`. Default `full = false`.
- Create `src/components/FeatureCard.astro`. Port from
  `layouts/_partials/feature-card.html`. Props:
  `{ icon: string; title: string; body: string }`. Render body via
  `<div set:html={body} />` to preserve Hugo's `safeHTML` semantics
  (the body strings contain inline `<a>` and `<code>`).
- Create `src/components/PipelineNode.astro`. Port from
  `layouts/_partials/pipeline-node.html`. Props:
  `{ kind: "file" | "step" | "output"; icon: string; label: string; name: string; sub?: string; detail?: string }`.
  Render `sub` and `detail` via `set:html` to preserve safeHTML
  semantics.
- Create `src/components/PipelineConnector.astro`. Port from
  `layouts/_partials/pipeline-connector.html`. No props.
- Extend `src/pages/index.astro` to render each primitive once with
  representative inputs. Acts as the visual-parity test page through
  Milestone 1; replaced by `index.mdx` in Phase 2.2.

**Complexity:** Medium
**Token estimate:** ~7k
**Agent strategy:** 2-3 parallel agents. Group A: Button, Badge,
CodeBlock, InstallBlock. Group B: FeatureCard, PipelineNode,
PipelineConnector. Sequential integration into the test page.

### Phase 2.1: Page-section components

**File changes:**

- Create `src/components/sections/Hero.astro`. Props:
  `{ heading: string; sub?: string }`. Default `<slot />` for in-hero
  content (Badge, InstallBlock, Button). Port the hero wrapper markup
  shared across `layouts/home.html`, `how-it-works.html`,
  `install.html`, `configuration.html`, `plugins.html`,
  `extending.html`.
- Create `src/components/sections/FeaturesGrid.astro`. No props; pure
  `<slot />`. Port grid container from `layouts/home.html` features
  grid block.
- Create `src/components/sections/Pipeline.astro`. No props; pure
  `<slot />`. Port the pipeline diagram container from
  `layouts/home.html` pipeline preview (single-stage form). The same
  component holds `<PipelineStage>` children on how-it-works
  (multi-stage form).
- Create `src/components/sections/PipelineStage.astro`. Props:
  `{ heading: string; number: string }`. Body is `<slot />` for
  PipelineNode/PipelineConnector children. Port from the per-stage
  layout in `layouts/how-it-works.html`.
- Create `src/components/sections/QuickStart.astro`. No props; pure
  `<slot />`. Port from `layouts/how-it-works.html` quick-start
  section wrapper.
- Create `src/components/sections/Step.astro`. Props:
  `{ number: string; heading: string }`. Body is `<slot />` for prose
  + CodeBlock. Port the per-step layout from
  `layouts/how-it-works.html` (uses the current `$stepClasses`,
  `$stepNumClasses` template-variable styling — **flatten to literal
  utility class strings here** to avoid OQ-2 risk).
- Create `src/components/sections/SpecFormat.astro`. No props; pure
  `<slot />`. Port the two-column spec-format example wrapper from
  `layouts/how-it-works.html`.
- Create `src/components/sections/InstallMethods.astro`. No props;
  pure `<slot />`. Port the install-page grid container from
  `layouts/install.html`.
- Create `src/components/sections/ConfigurationKeys.astro`. No props;
  pure `<slot />`. Port the keys-list container from
  `layouts/configuration.html`.
- Create `src/components/sections/ConfigKey.astro`. Props:
  `{ name: string }`. Body is `<slot />` for description. Port the
  per-key label+body layout from `layouts/configuration.html`.
- Create `src/components/sections/PluginInventory.astro`. No props;
  pure `<slot />`. **Implementation:** receive all `<Plugin>` children
  via the default slot; render two visual grids inside the component
  by reading each child's `status` prop via slot-children inspection.
  Astro slot mechanics support this through the `Astro.slots`
  API — verify pattern works at implementation time; if not, fall
  back to named slots (`<slot name="shipping" />`,
  `<slot name="planned" />`) and switch the MDX authoring to that
  shape.
- Create `src/components/sections/Plugin.astro`. Props:
  `{ name: string; status: "shipping" | "planned" }`. Body is
  `<slot />` for description.
- Create `src/components/sections/CtaBanner.astro`. Props:
  `{ heading: string; body?: string }`. Default `<slot />` for CTA
  buttons. Port from the closing CTA shared across `layouts/*.html`.
- Create `src/components/sections/Prose.astro`. No props. Renders
  `<div class="prose ...">` (Tailwind Typography utilities matching
  the wrapper in `layouts/extending.html`) with `<slot />`. Only used
  on the extending page.
- Extend `src/pages/index.astro` to render each section with one or
  two representative children for visual parity check.

**Complexity:** Medium
**Token estimate:** ~10k
**Agent strategy:** 2-3 parallel agents. Group A: home/how-it-works
sections (Hero, FeaturesGrid, Pipeline, PipelineStage, QuickStart,
Step, SpecFormat). Group B: install/config/plugins sections
(InstallMethods, ConfigurationKeys, ConfigKey, PluginInventory,
Plugin). Group C: shared (CtaBanner, Prose). Sequential integration
into the test page.

### Phase 2.2: Home page

**File changes:**

- Delete the test version of `src/pages/index.astro`.
- Create `src/pages/index.mdx`:
  ```mdx
  ---
  layout: "../layouts/Shell.astro"
  title: "Spektacular"
  description: "Spec-driven AI development. Write the spec. Ship the software."
  ---
  import Hero from "../components/sections/Hero.astro";
  import Badge from "../components/Badge.astro";
  import InstallBlock from "../components/InstallBlock.astro";
  import Button from "../components/Button.astro";
  import Pipeline from "../components/sections/Pipeline.astro";
  import PipelineNode from "../components/PipelineNode.astro";
  import PipelineConnector from "../components/PipelineConnector.astro";
  import FeaturesGrid from "../components/sections/FeaturesGrid.astro";
  import FeatureCard from "../components/FeatureCard.astro";
  import CtaBanner from "../components/sections/CtaBanner.astro";

  <Hero heading="Write the spec. Ship the software." sub="...">
    <Badge text="v0.x.y" variant="green" />
    <InstallBlock command="..." />
    <Button href="/install/" label="Install" variant="primary" large />
    <Button href="/how-it-works/" label="How it works" variant="secondary" large />
  </Hero>

  <Pipeline>
    <PipelineNode kind="file" icon="..." label="..." name="..." />
    <PipelineConnector />
    <PipelineNode kind="step" icon="..." label="..." name="..." />
    <PipelineConnector />
    <PipelineNode kind="output" icon="..." label="..." name="..." />
  </Pipeline>

  <FeaturesGrid>
    <FeatureCard icon="..." title="..." body="..." />
    {/* ... 5 more */}
  </FeaturesGrid>

  <CtaBanner heading="..." body="...">
    <Button href="..." label="..." />
    <Button href="..." label="..." variant="secondary" />
  </CtaBanner>
  ```
- All copy is inlined from `content/_index.md` frontmatter
  (`heroHeadline`, `heroSub`) and `layouts/home.html` (pipeline node
  text, feature card text, CTA text). The Badge `text` value is the
  current hardcoded `hugo.toml:params.version`.
- Verify the file body contains no `<div>`, `<section>`, or `class=`
  occurrences before considering the phase complete.

**Complexity:** Medium
**Token estimate:** ~5k
**Agent strategy:** Single agent, sequential execution.

### Phase 2.3: How-it-works page

**File changes:**

- Create `src/pages/how-it-works.mdx`:
  - Frontmatter: layout = Shell, `title` and `description` from current
    `content/how-it-works.md`.
  - Imports: Hero, QuickStart, Step, CodeBlock, SpecFormat, Pipeline,
    PipelineStage, PipelineNode, PipelineConnector, CtaBanner.
  - Body order:
    1. `<Hero heading="..." sub="..." />` — content from
       `content/how-it-works.md` frontmatter (`heroHeading`, `heroSub`).
    2. `<QuickStart>` with 5 `<Step number="1" heading="...">` children.
       Each Step body: prose paragraph + `<CodeBlock code="spektacular init ..." />`. Commands from
       `layouts/how-it-works.html` (the rewritten commands from spec
       000003).
    3. `<SpecFormat>` with `<CodeBlock code="..." lang="yaml" />`
       inside (the YAML example) and a definition-list of frontmatter
       keys (either inline MDX prose lists or a small DefList component
       — judgment call at implementation).
    4. `<Pipeline>` with 3 `<PipelineStage number="1|2|3" heading="...">`
       children. Each stage holds its own PipelineNode/PipelineConnector
       children. Content from `layouts/how-it-works.html` three-stage
       block.
    5. `<CtaBanner heading="..." body="...">` with Button children.
  - All copy inlined; verify no raw layout HTML.

**Complexity:** Medium
**Token estimate:** ~6k
**Agent strategy:** Single agent, sequential execution. The "step
classes" template-variable styling in the current
`layouts/how-it-works.html` was flattened during Phase 2.1's Step
component creation — confirm the rendered output matches before
committing.

### Phase 2.4: Install page

**File changes:**

- Create `src/pages/install.mdx`:
  - Frontmatter: layout = Shell, `title`, `description` from current
    `content/install.md`.
  - Imports: Hero, InstallMethods, InstallBlock, CodeBlock, CtaBanner.
  - Body:
    1. `<Hero ... />` — content from `content/install.md`.
    2. `<InstallMethods>` with three method-block children. Each
       method block needs its own heading + prose + InstallBlock or
       CodeBlock. Option: the heading + prose pattern is generic
       enough to introduce a small `<Method name="Homebrew">` helper
       (3 uses) — judgment call at implementation; otherwise inline
       as MDX markdown headings inside the slot.
    3. `<CtaBanner ...>` with Button children.
  - Methods: Homebrew (`<InstallBlock command="brew install ..." />`),
    Go install (`<CodeBlock code="go install ..." lang="bash" />`),
    GitHub Releases (link prose + the releases URL Button).

**Complexity:** Low
**Token estimate:** ~4k
**Agent strategy:** Single agent, sequential execution.

### Phase 2.5: Configuration and Plugins pages

**File changes:**

- Create `src/pages/configuration.mdx`:
  - Frontmatter: layout = Shell, `title`, `description` from current
    `content/configuration.md`.
  - Imports: Hero, ConfigurationKeys, ConfigKey, CodeBlock, CtaBanner.
  - Body:
    1. `<Hero ... />`.
    2. "Where config lives" prose intro (MDX markdown paragraph).
    3. `<ConfigurationKeys>` with 6 `<ConfigKey name="command|agent|debug|spec|plan|knowledge">`
       children. Each child body is MDX markdown describing the key.
    4. "Worked example" heading + `<CodeBlock code="..." lang="yaml" />`
       with the example YAML (port verbatim from
       `layouts/configuration.html`).
    5. `<CtaBanner ...>`.
- Create `src/pages/plugins.mdx`:
  - Frontmatter: layout = Shell, `title`, `description` from current
    `content/plugins.md`.
  - Imports: Hero, PluginInventory, Plugin, CtaBanner (and maybe a
    small intro component if the "What's pluggable" two-card grid
    can't be expressed as plain MDX markdown).
  - Body:
    1. `<Hero ... />`.
    2. "What's pluggable" intro: 2-paragraph prose + the two-card grid
       (Store + Agent). If the grid styling requires a wrapper, add a
       `<PluggableIntro>` section component to Phase 2.1's set; if not,
       use plain MDX with primitive cards.
    3. `<PluginInventory>` with 7 `<Plugin>` children:
       ```mdx
       <Plugin name="file" status="shipping">…</Plugin>
       <Plugin name="claude" status="shipping">…</Plugin>
       <Plugin name="bob" status="shipping">…</Plugin>
       <Plugin name="codex" status="shipping">…</Plugin>
       <Plugin name="obsidian" status="planned">…</Plugin>
       <Plugin name="notion" status="planned">…</Plugin>
       <Plugin name="jira" status="planned">…</Plugin>
       ```
    4. `<CtaBanner ...>`.
- All copy inlined from `layouts/configuration.html` and
  `layouts/plugins.html`. No layout HTML in either body.

**Complexity:** Medium
**Token estimate:** ~7k
**Agent strategy:** Two parallel agents, one per page. Sequential
visual parity check.

### Phase 2.6: Extending page

**File changes:**

- Create `src/pages/extending.mdx`:
  - Frontmatter: layout = Shell, `title`, `description` from current
    `content/extending.md`.
  - Imports: Hero, Prose, CtaBanner.
  - Body:
    1. `<Hero ... />` — content from `content/extending.md` frontmatter.
    2. `<Prose>` wrapping the full markdown body from
       `content/extending.md:N-end`:
       - `## Store interface` heading
       - ```go fenced code block with the Store interface
       - ```go fenced code blocks with DirEntry and Hit types
       - Prose paragraphs explaining each method
       - `## Agent interface` heading
       - ```go fenced code block with the Agent interface
       - Prose paragraphs explaining each method
       - `## How a backend is registered` heading + prose.
    3. `<CtaBanner ...>`.
- The MDX engine renders the markdown body directly. The `<Prose>`
  wrapper applies the `prose` Tailwind Typography utilities so that
  the styling matches `layouts/extending.html`'s current wrapper.

**Complexity:** Low
**Token estimate:** ~4k
**Agent strategy:** Single agent, sequential execution. Pay specific
attention to code-block syntax-highlighting parity (the Hugo build
uses Hugo's built-in chroma highlighter by default — Astro defaults to
Shiki. If the rendered Go code differs visually, surface as OQ-1
territory and ask the user before configuring a code highlighter).

### Phase 3.1: Cutover — workflow swap, Hugo removal, production deploy

**File changes:**

- Rewrite `.github/workflows/deploy.yml`:
  - Keep `name`, `on` (push to main), `permissions`, `concurrency`.
  - `build` job steps in order:
    1. `actions/checkout@v4` (drop `fetch-depth: 0` if not needed).
    2. **Remove** `peaceiris/actions-hugo@v3` step.
    3. `actions/setup-node@v4` with `node-version: '22'`, `cache: 'npm'`.
    4. `npm ci`.
    5. `actions/configure-pages@v5`.
    6. `npm run build` (replaces `hugo --minify --baseURL ...`).
    7. `actions/upload-pages-artifact@v3` with `path: ./dist`
       (changed from `./public`).
  - `deploy` job (depends on `build`):
    1. `actions/deploy-pages@v4` — unchanged.
- Delete `hugo.toml`.
- Delete `layouts/` directory recursively.
- Delete `content/` directory recursively.
- Delete `assets/` directory recursively.
- Delete `static/` directory recursively (CNAME, .nojekyll, images
  already in `public/` from Phase 1.1).
- Delete `Makefile`.
- Delete `hugo_0.162.0_linux-amd64.deb` (untracked file).
- Update `package.json` — confirm scripts are
  `{ dev, build, preview, astro }`; remove any leftover Hugo-era
  scripts or unused deps.
- Update `.gitignore`:
  - Add `dist/`, `.astro/` (if not added in 1.1).
  - Remove `public/` if it was ignored (now tracked source).
  - Remove any other Hugo-only entries.
- Update `README.md` if it references `hugo server`, `hugo build`, or
  the Makefile `serve` target — replace with `npm run dev` /
  `npm run build`.
- After all of the above land on a feature branch, open PR, get
  reviewed, merge to main, observe deploy. Post-deploy:
  - Hit each of the six legacy URLs (curl or browser) and confirm
    200 + content matches expectations.
  - Confirm `spektacular.dev` CNAME resolution still works.
  - Confirm GitHub Pages settings show the new deployment.

**Complexity:** Medium
**Token estimate:** ~4k
**Agent strategy:** Single agent, sequential execution. Merge to main
is gated on user approval; deploy verification is observation, not
implementation.

## Testing Strategy

No automated test suite is added. The verification path for each
phase is:

1. **Build green** — `npm run build` and `astro check` both exit with
   no errors. Run after every phase's file changes, before the visual
   parity check.
2. **Dev server runs** — `npm run dev` boots and serves the changed
   surface. Run after every phase from 1.2 onward.
3. **Visual parity check** — open the changed surface in a browser
   next to the equivalent production page (or the Hugo-built version
   on a parallel port) and inspect:
   - Colours match the `@theme` token values.
   - Spacing / typography / radii are equivalent.
   - All copy is identical.
   - Interactive elements (copy buttons, nav active state, smooth
     scroll, hover transitions) behave the same.
4. **No raw layout HTML in page bodies** — `grep -E "<div|<section|class=" src/pages/*.mdx`
   returns nothing.
5. **HMR smoke test** — once per milestone, edit a piece of inlined
   copy and confirm the browser updates without a manual reload.
6. **At cutover** — every legacy URL (`/`, `/how-it-works/`,
   `/install/`, `/configuration/`, `/plugins/`, `/extending/`) returns
   200 and matches the pre-cutover content.

The visual parity check is the load-bearing gate. If a parity gap
appears that requires changes beyond verbatim porting (new tokens,
new CSS, framework config tweaks), STOP and surface as OQ-1 or OQ-2
territory.

## Project References

- **Spec:** `.spektacular/specs/000004_astro-migration.md` — the
  acceptance criteria this plan is built against.
- **Prior plan — Hugo migration:**
  `.spektacular/plans/000002_static-site-generation/plan.md` — the
  current site's architecture and the partial/token inventory this
  plan ports forward.
- **Prior plan — Content update:**
  `.spektacular/plans/000003_update-content/plan.md` — the source of
  the Configuration, Plugins, and Extending page shapes added since
  the Hugo migration.
- **Current site build:** `https://spektacular.dev` — the visual /
  content parity reference.
- **Astro 5 docs:** `https://docs.astro.build/` — for MDX integration,
  Tailwind setup, GitHub Pages deploy.
- **Tailwind v4 docs:** `https://tailwindcss.com/blog/tailwindcss-v4`
  and `https://tailwindcss.com/docs/installation/framework-guides/astro` —
  for the Vite plugin path and the `@theme`/`@plugin` syntax that
  carries over.
- **Astro → GitHub Pages guide:**
  `https://docs.astro.build/en/guides/deploy/github/` — for the
  deploy workflow rewrite.
- **Hugo migration reference (community):**
  `https://www.eliostruyf.com/migration-story-hugo-astro/` and
  `https://www.shanestillwell.com/migrating-from-hugo-to-astro/` —
  known gotchas around routing and asset paths.

## Token Management Strategy

| Tier | Token Budget | Agent Strategy |
|------|-------------|----------------|
| Low | ~10k | Single agent, sequential |
| Medium | ~25k | 2-3 parallel agents |
| High | ~50k+ | Parallel analysis, sequential integration |

This plan's phases all land in the Low or Medium tiers:

- Phases 1.1, 1.2, 2.4, 2.6, 3.1: Low — single agent, sequential.
- Phases 1.3, 2.1, 2.5: Medium — 2-3 parallel agents grouped by
  component family or by page, with sequential integration into the
  test page or visual parity check.
- Phases 2.2, 2.3: Medium (single agent), because each is a single
  cohesive page composition with a parity check at the end.

No phase exceeds the Medium tier; the migration is content-port-heavy
rather than logic-heavy.

## Migration Notes

The migration runs across two parallel directory shapes (Hugo + Astro)
throughout Milestones 1 and 2, then deletes the Hugo half at Phase 3.1.

- During Milestones 1 and 2, `public/` and `static/` both exist:
  `public/` is the Astro static-asset input (created in Phase 1.1);
  `static/` continues to feed the Hugo build until Phase 3.1.
- `package.json` is overwritten in Phase 1.1 (the migration's first
  destructive change). After Phase 1.1, `hugo server` and `hugo build`
  will not work locally without manually re-adding the Hugo dev deps.
  Acceptable because production deploys continue to use the
  CI-installed Hugo binary, which doesn't read `package.json`.
- The branch this plan lands on must merge to `main` only after Phase
  3.1 is complete and reviewed. A partial merge would leave the
  workflow building neither Hugo nor Astro correctly.
- Rollback strategy for Phase 3.1: revert the workflow rewrite commit
  only — the Hugo source-file deletion can be reverted separately or
  together. Until rollback completes, production would temporarily
  serve a 404 (no build artifact uploaded), so coordinate the merge
  with a window when this is acceptable.

## Performance Considerations

The current Hugo site builds in well under a second and ships a single
fingerprinted CSS file plus a single fingerprinted JS file. The Astro
build will produce a similar shape: one CSS bundle (or a small number
under Vite's chunking), the inline `<script>` block in each page's
HTML (no separate JS file unless Astro decides to extract it). Page
weight and load time should be equivalent or marginally better
(Astro 5 ships zero JS by default; the inline script is identical in
content to the current `main.js`).

CI build time will likely increase (Node setup + Astro build is
heavier than Hugo's single binary), but the absolute time stays in
the seconds-to-low-tens-of-seconds range and isn't a constraint.

No runtime performance considerations — the site is static.

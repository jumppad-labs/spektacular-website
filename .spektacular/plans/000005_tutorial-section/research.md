# Research: 000005_tutorial-section

## Alternatives considered and rejected

### Per-agent gating mechanism

- **JS DOM `style.display` swap (rejected).** Server renders all variants
  visible; an inline `<script>` walks `[data-agent-block]` on load and on
  selector change, setting `style.display = 'none'` on non-matching
  blocks. Reads localStorage at the same point. *Why rejected:* the
  script runs after the body parses, so on a first paint where the
  stored agent is not Bob the page flashes Bob's variant then the
  others appear before non-matching blocks vanish — a visible FOUC. The
  CSS-attribute approach (chosen below) sidesteps this by gating
  visibility via a CSS rule keyed on `<html data-agent>`, which is set
  by a head-level script that blocks paint.

- **Astro client islands with React or Svelte (rejected).** Each
  agent-scoped block becomes a `client:load` island; selection state
  lives in a shared store (nanostores, Svelte store, etc.). *Why
  rejected:* the site has no JS framework today
  (`package.json:14-21` — only `astro`, `@astrojs/mdx`,
  `@tailwindcss/vite`, `tailwindcss`, `@tailwindcss/typography`); the
  existing pattern is inline `<script>` (`src/layouts/Shell.astro:31-72`
  for copy-to-clipboard + smooth-scroll). Adding a framework just to
  toggle visibility on a small set of blocks burns the
  "no framework hydration" decision recorded in the Astro migration
  plan (`000004_astro-migration` plan, "Three deliberate trade-offs"
  paragraph — "two small handlers" not "client islands").

- **Per-agent URLs, e.g. `/tutorials/<slug>/<agent>/` (rejected).** Each
  agent variant is its own statically-built page; switching agents
  navigates. *Why rejected:* the spec's acceptance criteria require
  "switching agents updates the visible instructions without a page
  reload" (`.spektacular/specs/000005_tutorial-section.md:85-91`).
  Navigation is by definition a reload. Persistence still requires
  client-side state to redirect on arrival, so the JS budget does not
  shrink either.

### Tutorial page composition

- **One MDX file per tutorial directly under `src/pages/tutorials/`
  (rejected).** Sidesteps content collections by treating tutorials as
  regular MDX pages. *Why rejected:* the spec requires "adding a
  tutorial by creating a single content file ... makes it appear in the
  tutorials index" (acceptance criterion at
  `.spektacular/specs/000005_tutorial-section.md:78-81`). With raw
  `src/pages/` MDX, the index page has no machine-readable list of
  tutorials to iterate — listing files at runtime is not how Astro
  static pages work; the index would need to be hand-edited each time
  a tutorial is added, violating "without code changes elsewhere".
  Astro content collections (`getCollection`) provide exactly the
  list-the-content-files-with-typed-frontmatter shape the index needs.

- **Multi-page chaptered tutorial layout (rejected — already a spec
  Non-Goal).** Each tutorial step becomes its own page with prev/next
  links. Listed only so a future planner can see it was considered.
  *Why rejected:* the spec's Non-Goals section explicitly excludes
  this (`.spektacular/specs/000005_tutorial-section.md:160-166` —
  "Multi-page or chaptered tutorials. Single long-form only for this
  version.").

### Agent identity source

- **Hardcode the agent list inside each new component (rejected).**
  Each of `AgentBlock`, `AgentSelector`, etc. carries its own copy of
  `["bob", "claude", "codex"]`. *Why rejected:* the spec explicitly
  bans this — "Agent identifiers are never hardcoded inside individual
  components or tutorial files"
  (`.spektacular/specs/000005_tutorial-section.md:127-130`) — and
  requires "the set of agents a reader can choose from matches the
  site's declared supported-agents list" (acceptance criterion at
  `.spektacular/specs/000005_tutorial-section.md:105-108`). One
  module (e.g. `src/config/agents.ts`) is the only way to satisfy
  this in a type-checked Astro project.

### Image storage

- **Colocated in content collection at
  `src/content/tutorials/<slug>/<image>.png` (rejected by user).** The
  spec wording "colocated with the tutorial content"
  (`.spektacular/specs/000005_tutorial-section.md:149-152`) initially
  pointed at content-collection colocation with Astro's asset
  pipeline resolving relative `./shot.png` paths. *Why rejected:* the
  user reinterpreted "colocated" as "lives in the project under a
  documented location next to the other site images" — i.e. matching
  the existing `public/images/tui.png` pattern. Picked `public/`
  storage instead; see chosen approach. The trade-off is no
  build-time hash/optimisation on tutorial images, but the site has
  exactly one image today and no optimisation pressure, so this is
  acceptable.

## Chosen approach — evidence

### Per-agent gating: `<html data-agent>` + CSS attribute selector

- The existing Shell layout already runs inline scripts via
  `<script is:inline>` for two DOM behaviours
  (`src/layouts/Shell.astro:31-72`). Pattern: zero hydration, no
  framework, plain DOM. Adding a third inline script for
  `localStorage` → `documentElement.dataset.agent` is the same
  pattern.
- Astro's component emission and slot rendering pass `data-*`
  attributes through to the rendered HTML. The MDX → HTML route is
  expected to behave the same way; surviving that compilation cleanly
  is OQ-2 in plan.md and is verified by a grep over the built HTML in
  Phase 1.2.
- The chosen CSS rule
  `[data-agent="bob"] [data-agent-block]:not([data-agent-block~="bob"]) { display: none }`
  scales linearly with the agent list (one rule per agent) and reads
  cleanly because `~=` is whitespace-delimited word matching.
- Default-render-as-Bob requirement (acceptance criterion at
  `.spektacular/specs/000005_tutorial-section.md:110-112`) is met by
  setting `data-agent="bob"` on the `<html>` tag at SSR time, then
  letting the head-level script overwrite it from localStorage if
  present. With JS disabled, the SSR default holds and only Bob's
  variants render — the acceptance criterion is satisfied without
  client JS.

### Tutorial content shape: Astro 5 content collection + dynamic route

- Astro 5's content layer (`defineCollection` in `src/content.config.ts`,
  glob loader over `src/content/tutorials/*.mdx`) provides typed
  frontmatter (Zod schema), `getCollection()` for the index, and
  `getStaticPaths` for a `[slug].astro` dynamic route. The site has
  no `src/content.config.ts` today (verified by `find` — no
  `content.config.*` exists), so introducing it is greenfield.
- The MDX rendering shape is identical to current pages: import
  section components at the top, set
  `export const components = { pre: CodeBlock }`, compose components
  with slot bodies. Authors carry over no new authoring rules.
- Tutorial images live under `public/images/tutorials/<slug>/`,
  mirroring the existing `public/images/tui.png` pattern. MDX
  references them as absolute paths (`/images/tutorials/<slug>/foo.png`)
  through plain markdown image syntax — Astro's existing `public/`
  passthrough copies them verbatim into `dist/`. No `<Image>` import,
  no asset hashing, no collection-side asset config to wire.

### Single `<AgentBlock>` primitive covers both text and screenshots

- The existing components-per-section pattern in `src/components/sections/`
  treats each block as either a heading/body shell with `<slot />`
  (e.g. `Step.astro:1-17`, `Section.astro:1-32`) or a slotting
  container that buckets children by slot name
  (`PluginInventory.astro:27-30,44-47`). `AgentBlock` follows
  the first pattern: a tiny wrapper that emits a single
  `<div data-agent-block="…">` around its `<slot />`. Inside the
  slot, the author writes anything — paragraphs, lists, fenced code
  blocks (which route through CodeBlock), markdown images
  (`![alt](./shot.png)`), or `<InstallBlock>` invocations. One
  primitive covers both the instructions AC and the screenshots AC
  (`.spektacular/specs/000005_tutorial-section.md:83-91`) without
  adding a screenshots-only helper.

### Agent identity in `src/config/agents.ts`

- A plain TypeScript module exporting `AGENTS: readonly Agent[]` with
  `{ id, label, default }` is the smallest shape that satisfies the
  spec's "single source" requirement. The selector, gating
  components, the CSS rule generator, and the SSR default all import
  from this one file. Type narrows `id` to a union string literal
  via `as const`, giving editor autocomplete on `<AgentBlock for="…">`.

## Files examined

- `src/layouts/Shell.astro:1-74` — single base layout; consumes either
  explicit props or `frontmatter:` from MDX; inline copy-button +
  smooth-scroll `<script is:inline>` at end of `<body>`. Pattern to
  match for the head-level pre-paint agent-init script.
- `src/components/Nav.astro:2-13` — hardcoded items list, active
  state derived from `Astro.url.pathname`. New "Tutorials" entry lands
  here.
- `src/components/Footer.astro:1-34` — passive footer, no change
  needed for tutorials.
- `src/components/sections/Hero.astro:1-59` — two variants (`page`,
  `centered`); the per-tutorial title block reuses `variant="page"`.
- `src/components/sections/Step.astro:1-17` — exact authoring shape
  to model `TutorialStep` on (numbered chip + heading + body slot).
- `src/components/sections/Section.astro:1-32` — generic h2 + sub +
  default slot wrapper; useful pattern for the tutorial body chrome.
- `src/components/sections/Prose.astro:1-9` — Tailwind Typography
  `prose-invert` wrapper used for the Extending page. The tutorial
  body container should mirror this so prose styling is consistent
  with the Extending page.
- `src/components/sections/PluginInventory.astro:14-49` — named-slot
  bucketing pattern (`shipping`, `planned`). The tutorial index list
  follows the simpler default-slot pattern, not this one — listed
  here so a planner can confirm the named-slot pattern is NOT what
  tutorials need.
- `src/components/sections/Plugin.astro:1-25` — current source of
  agent IDs (`name="claude" | "bob" | "codex"`), authored as raw MDX
  on `plugins.mdx`. This is the file that proves agent IDs are
  currently scattered into content, not centralised.
- `src/pages/plugins.mdx:43-79` — current ad-hoc agent list. Spec
  requires extraction into a config module; the Plugins page MAY be
  refactored to read from the same module, but the spec does not
  require it (Non-Goal: no content changes outside the new tutorials
  area).
- `src/pages/how-it-works.mdx:1-271` — canonical MDX authoring
  example; the same shape (frontmatter → imports →
  `export const components = { pre: CodeBlock }` → section
  composition with blank-line-padded slot bodies) is what tutorial
  authors follow.
- `src/styles/global.css:1-92` — `@theme` tokens, `.spek-body` rules,
  `:not(pre) > code` rule. New rule (per-agent visibility) lands
  here alongside `.spek-body`.
- `astro.config.mjs:1-14` — MDX + Tailwind Vite plugin already wired;
  Shiki on with `github-dark` theme; no further config needed for
  content collections (Astro 5 auto-loads `src/content.config.ts`).
- `package.json:14-23` — no React/Svelte/Vue, no client-side state
  library; only Astro + MDX + Tailwind. Reinforces "stay framework-free".
- `tsconfig.json:1-3` — extends `astro/tsconfigs/strict`; Zod-typed
  collection schemas pass through with no extra config.
- `public/images/tui.png` — only existing image; lives in `public/`
  not under `src/content/`. Tutorial images do NOT go here.

## External references

- Astro 5 content collections — `defineCollection`, the glob
  loader over `./src/content/tutorials/**/*.mdx`, and the
  `getCollection` / `entry.render()` shape used by the dynamic
  route. Relevant because the content collection is greenfield in
  this repo. Official docs:
  https://docs.astro.build/en/guides/content-collections/

- Astro pages-routing convention for `_`-prefixed files (Astro
  excludes `src/pages/_*.astro` from the deployed build). Relevant
  because Phase 1.2 uses `src/pages/_scratch.astro` as an
  internal-only validation surface. Note that this exclusion is
  for the pages router only — the content-collection glob loader
  in Phase 2.1 explicitly handles its own filtering.

- CSS attribute selector `~=` (whitespace-token match). Specified by
  CSS Selectors Level 4; supported in all evergreen browsers and
  matches the rest of the site's no-IE-support baseline. Used by
  the chosen gating rule to support multi-agent blocks
  (`data-agent-block="claude codex"`).
  https://www.w3.org/TR/selectors-4/#attribute-representation

## Prior plans / specs consulted

- `000004_astro-migration` (plan, finished) — established the
  Astro 5 + MDX + Tailwind v4 stack, the section-component pattern,
  the `Shell` layout, the inline-script ethos, and the
  no-framework-hydration decision. The tutorial section bolts onto
  these decisions without revisiting any of them.
- `000004_astro-migration` (plan, "Out of Scope" section) — flagged
  "Content Collections" as a defensible upgrade "once a second
  content type is introduced." This spec introduces the second
  content type (tutorials), making collections the right shape now.
- `000003_update-content` (plan, finished) — established the
  agent/plugin inventory (`file`, `claude`, `bob`, `codex` shipping;
  `obsidian`, `notion`, `jira` planned). The agent list in this
  plan stays a subset (`claude`, `bob`, `codex`) — the planner
  should source these IDs from the new `src/config/agents.ts`, not
  from `Plugin` entries in `plugins.mdx`.
- `000002_static-site-generation` (plan, shipped) — historical
  context only; the Hugo pipeline it set up has been replaced.

## Open assumptions

These assumptions are load-bearing for the chosen approach. If any
turns out wrong during implementation, STOP and surface to the user.

- **OA-1: The pre-paint head-level `<script is:inline>` reliably runs
  before first paint in Astro's emitted HTML.** Chosen approach
  depends on `<html data-agent="bob">` being overwritten by JS
  before the browser computes the first style pass, so that a user
  whose stored agent is `claude` never sees Bob's content. Astro's
  default emission places `<script is:inline>` synchronously where
  the source declared it, so a `<script>` in `<head>` before the
  stylesheet `<link>` should be parser-blocking-equivalent for
  paint. Verify by inspecting the built HTML during the
  architecture or first implementation phase.

- **OA-2: Tailwind v4's content scanner detects the per-agent CSS
  utility classes used in the new components.** No utility class is
  generated by string concatenation in this plan (the agent IDs are
  used in `data-*` attributes and as CSS rule keys, not as Tailwind
  class suffixes). If a planner adds e.g. `class={\`agent-${id}\`}`
  during implementation, the scanner may miss the resulting class
  and the OQ-2 issue from `000004_astro-migration` repeats. Plan
  must avoid dynamic class names entirely.

- **OA-3: The Plugins page does not need to be refactored to read from
  the new agent config module.** Spec's constraint section says "No
  existing pages outside the new tutorials area may change URL or
  content" (`.spektacular/specs/000005_tutorial-section.md:64-66`).
  Refactoring `plugins.mdx` to import from `agents.ts` would be a
  content change (the visible agent list might re-order). Plan
  leaves `plugins.mdx` untouched. A future spec can clean this up.

## Rehydration cues

A future agent reading this cold should run:

1. `spektacular knowledge read --data '{"scope":"project","path":"conventions/mdx-authoring.md"}'`
   — the four MDX authoring rules every new component must obey.
2. `spektacular spec file read 000005_tutorial-section.md` — the
   source of truth for what's in scope.
3. `Read src/layouts/Shell.astro`, `src/components/Nav.astro`,
   `src/components/sections/Step.astro`,
   `src/components/sections/Section.astro`,
   `src/components/sections/Prose.astro`,
   `src/pages/how-it-works.mdx`,
   `src/styles/global.css` — the canonical patterns that the
   tutorial section composes from.
4. `cat astro.config.mjs package.json` — confirm Astro 5 + MDX +
   Tailwind v4 stack still holds; no content-collection wiring yet.

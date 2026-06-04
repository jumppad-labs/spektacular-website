# Context: 000005_tutorial-section

## Current State Analysis

The site as of commit `03189e6` is a freshly-migrated Astro 5 + MDX +
Tailwind v4 SSG with six flat marketing pages under `src/pages/` and
no content collections. Key surfaces this plan touches:

- `src/layouts/Shell.astro:1-74` — the only base layout. Owns the
  `<html>` element (line 23: `<html lang="en" class="scroll-smooth">`),
  composes `Head`, `Nav`, default slot, `Footer`, and a tail-of-body
  inline `<script is:inline>` (lines 31-72) carrying copy-to-clipboard
  and smooth-scroll handlers. No head-level inline scripts today; no
  `data-*` attributes on `<html>` today.
- `src/components/Nav.astro:2-13` — items array, five entries today
  (`How it works`, `Install`, `Configuration`, `Plugins`,
  `Extending`). Active state derived from `Astro.url.pathname` via
  `pathname === href || pathname.startsWith(href)`.
- `src/components/sections/Step.astro:1-17` — canonical step shape
  (number chip 2.5rem-wide circle + heading + body slot inside
  `.spek-body`). `TutorialStep` mirrors this shape verbatim with
  tutorial-specific spacing if needed later.
- `src/components/sections/Hero.astro:1-59` — `variant="page"` is
  the left-aligned heading+sub form `TutorialLayout` reuses.
- `src/components/sections/Prose.astro:1-9` — Tailwind Typography
  `prose prose-invert` wrapper applied to a default slot. The
  tutorial body prose container is modelled on this.
- `src/components/sections/Plugin.astro:1-25` and
  `src/pages/plugins.mdx:43-79` — current ad-hoc agent identifiers
  (`name="claude"`, `name="bob"`, `name="codex"`). NOT touched by
  this plan (spec constraint). New `src/config/agents.ts` carries
  the same three IDs.
- `src/styles/global.css:1-92` — `@theme` block (lines 4-44),
  `.spek-body` rules (lines 64-91), and a `:not(pre) > code` rule
  (lines 51-58). New per-agent visibility CSS rules append after
  line 91.
- `astro.config.mjs:1-14` — MDX integration + Tailwind Vite plugin
  + Shiki `github-dark` theme. No content collection wired today;
  Astro 5 auto-loads `src/content.config.ts` once it exists.
- `tsconfig.json:1-3` — extends `astro/tsconfigs/strict`.
- `package.json:14-23` — no React/Svelte/Vue/store library; only
  Astro + MDX + Tailwind + Typography. `zod` arrives transitively
  via Astro 5's content layer.
- `public/images/tui.png` — only existing image. New tutorial
  images land under `public/images/tutorials/<slug>/`.
- No `src/content/` directory exists.
- No file in `src/pages/` is prefixed with `_` today; the convention
  exists but is unused.

## Per-Phase Technical Notes

### Phase 1.1: Always-on agent-gating machinery

**File changes**

- `src/config/agents.ts` (new) — define `Agent` interface,
  `AGENTS` array (`bob` default, `claude`, `codex`), derive
  `AgentId` union via `(typeof AGENTS)[number]["id"]`, export
  `DEFAULT_AGENT_ID` resolved from the record with `default: true`.

- `src/layouts/Shell.astro:23` — change `<html lang="en"
  class="scroll-smooth">` to `<html lang="en" class="scroll-smooth"
  data-agent={DEFAULT_AGENT_ID}>`. Add the corresponding import at
  the top of the frontmatter block (after the existing imports at
  lines 1-5).

- `src/layouts/Shell.astro:24-26` — insert a new
  `<script is:inline>` block immediately after the existing
  `<head>` open tag and BEFORE the `<Head />` component
  invocation. The script: try-reads `localStorage.getItem(
  "spektacular-agent")`, validates membership in a small inline
  agent-ID array (built from `AGENTS` at SSR via `define:vars` or
  by inlining a JSON literal), and assigns the validated value to
  `document.documentElement.dataset.agent`. Falls back to a no-op
  if localStorage is unavailable.

- `src/styles/global.css` — append, after the existing `.spek-body`
  rules (after line 92), one rule per agent of the shape
  `[data-agent="<id>"] [data-agent-block]:not([data-agent-block~="<id>"]) { display: none; }`.
  Three rules total for the initial three agents. Authored
  by hand from the agents config (keeping the file under direct
  human control); the equivalence with `AGENTS` is enforced by
  the type-check on `AgentId` at every consumption site, so a new
  agent without a CSS rule would still display all blocks for it
  (the absence of a hiding rule is visible at first manual check).

**Complexity**: Medium. The SSR/CSS/JS contract crossing makes
this riskier than its line count suggests. The pre-paint script's
placement in `<head>` (before any stylesheet) and the
`define:vars`-vs-inline-JSON choice for surfacing the agent-ID
allowlist to the script are the two non-obvious points.

**Token estimate**: ~6k tokens.

**Agent strategy**: Single agent, sequential execution. The four
changes are tightly coupled (the config module is imported by
Shell, the agent IDs in the CSS rules must agree with the config,
the script must be authored against the same allowlist) so
parallelising them would just create merge friction.

### Phase 1.2: AgentBlock, AgentSelector, scratch validation surface

**File changes**

- `src/components/tutorial/AgentBlock.astro` (new) — typed
  component taking `for: AgentId | readonly AgentId[]`. Normalises
  to an array, joins with a space, emits
  `<div data-agent-block={joined}><slot /></div>`. No styling on the
  wrapper; visibility is governed entirely by the Phase 1.1 CSS
  rules. The directory `src/components/tutorial/` is new, scoping
  tutorial-specific components away from the existing
  marketing-page components in `src/components/sections/`.

- `src/components/tutorial/AgentSelector.astro` (new) — renders a
  labelled `<select>` (or focusable button group; native
  `<select>` is the lower-effort default and a11y-correct out of
  the box) listing every entry from the agents config. Includes
  a small inline `<script is:inline>` that wires the change
  handler: read selected value, validate against the allowlist
  (defensive), set
  `document.documentElement.dataset.agent`, write to
  `localStorage["spektacular-agent"]`. The selector also reads the
  current attribute on mount and sets the control's value so the
  control reflects the active agent after the pre-paint script
  has run.

- `src/pages/scratch.astro` (new, internal-only) — a throwaway
  page composing `Shell`, the `AgentSelector`, and a small
  hand-written set of `AgentBlock` invocations covering single-agent,
  multi-agent, and a default (no-AgentBlock) fall-through case.
  Note: Astro 5 excludes `_`-prefixed pages from BOTH the dev
  server and the build, so an underscore-prefixed name would not
  be browseable for verification. The file is removed entirely in
  Phase 2.2 so it never appears in a production build.

**Complexity**: Low. Both components are slot/prop-driven Astro
components in the same shape as existing section components; the
only novel piece is the localStorage write in the selector's inline
handler.

**Token estimate**: ~4k tokens.

**Agent strategy**: Single agent, sequential. The selector's
behaviour depends on `AgentBlock`'s attribute contract; pair them
in one pass to verify the round trip works on the scratch route
before claiming the phase complete.

### Phase 2.1: Tutorials collection, layout, index, and nav

**File changes**

- `src/content.config.ts` (new) — Astro 5 content-collection
  manifest. Imports `defineCollection`, `z` from `astro:content`
  and `glob` from `astro/loaders`. Defines one collection
  `tutorials` with the glob loader scanning
  `./src/content/tutorials/**/*.mdx` and a Zod schema requiring
  `title: string`, `summary: string`, `order: z.number().int().nonnegative()`.

- `src/content/tutorials/_placeholder.mdx` (new, removed in 2.2) —
  a minimal tutorial MDX file with the required frontmatter and
  two `<TutorialStep>` elements (one containing a single-agent
  `<AgentBlock>`, one containing prose only) — enough to exercise
  the routing and layout without committing real content to the
  repo. The `_` prefix on the file name is reserved by Astro for
  exclusion from page routing but does NOT exclude it from content
  collections; the placeholder appears in the index until Phase
  2.2 deletes it.

- `src/components/tutorial/TutorialStep.astro` (new) — numbered-step
  shell modelled on `src/components/sections/Step.astro:1-17`.
  Props: `number: string`, `heading: string`. Default slot for
  body. Renders inside a `.spek-body` container so prose styling
  matches the rest of the site.

- `src/layouts/TutorialLayout.astro` (new) — composes `Shell`,
  renders the entry's `title` and `summary` via `Hero` with
  `variant="page"`, places `AgentSelector` immediately after the
  hero, and wraps the MDX default slot in a prose container modelled
  on `src/components/sections/Prose.astro:1-9`. The MDX renderer
  is reached via `Astro.props.frontmatter` plus the dynamic-route
  `entry.render()` call.

- `src/pages/tutorials/index.astro` (new) — calls
  `getCollection("tutorials")`, sorts by `order` ascending, renders
  each entry as a card (title + summary linking to the entry's
  slug). Uses `Shell` directly (not `TutorialLayout`) so the index
  does not show the agent selector.

- `src/pages/tutorials/[...slug].astro` (new) — implements
  `getStaticPaths` returning one path per collection entry, and
  in the page body destructures `{ entry }` from props, calls
  `entry.render()`, and passes the rendered Content into
  `TutorialLayout` with the entry's data as props.

- `src/components/Nav.astro:2-8` — extend the `items` array with
  `{ label: "Tutorials", href: "/tutorials/" }` after the
  "How it works" entry to match the topic-flow ordering. The
  existing `pathname.startsWith(href)` active-state derivation
  handles the new entry without further change.

**Complexity**: Medium. Content collections are new to this
codebase; the dynamic-route + `entry.render()` pattern is the
non-obvious piece. The layout composition follows the existing
Shell/Hero/Prose patterns 1:1.

**Token estimate**: ~10k tokens.

**Agent strategy**: Two parallel agents are viable here:

- Agent A: `content.config.ts` + dynamic route + `TutorialLayout` + `TutorialStep`
- Agent B: tutorials index page + Nav entry + placeholder MDX

  Integration is sequential — Agent B's index page depends on
  Agent A's collection schema existing — but the file-level
  separation is clean. Single-agent sequential is also fine if
  parallel coordination cost outweighs the time saved.

### Phase 2.2: "How to use Spektacular" published; scratch and placeholder removed

**File changes**

- `src/content/tutorials/getting-started.mdx` (new) — the real
  first tutorial. Frontmatter: `title: "How to use Spektacular"`,
  `summary` (one-liner), `order: 10` (leaves room for tutorials
  ordered before it later). Body composes `<TutorialStep>`
  children covering the end-to-end Spektacular workflow (install
  → init → spec → plan → implement). At least one step contains
  per-agent instructions via `<AgentBlock for="claude">`,
  `<AgentBlock for="bob">`, `<AgentBlock for="codex">`; at least
  one step contains per-agent screenshots referenced from
  `public/images/tutorials/getting-started/`.

- `public/images/tutorials/getting-started/` (new directory) — the
  agent-specific screenshots for the steps that demonstrate per-
  agent images. Filenames carry the agent ID for clarity (e.g.
  `init-claude.png`, `init-bob.png`, `init-codex.png`); the spec
  does not require any naming convention but consistency aids
  authors.

- `src/content/tutorials/_placeholder.mdx` (delete) — the Phase
  2.1 placeholder.

- `src/pages/scratch.astro` (delete) — the Phase 1.2 validation
  surface.

**Complexity**: Low for the infrastructure side (deletes and one
MDX file); the load-bearing work is content authoring, which is
mechanical given the building blocks are in place.

**Token estimate**: ~8k tokens (most of which is the tutorial
prose itself).

**Agent strategy**: Single agent. The phase is a content
authoring pass over a known shape; parallelism does not help.

## Testing Strategy

No test runner is introduced. Verification per phase relies on
build-time gates and a small set of hand-checked browser
interactions.

**Phase 1.1**: Build the site; inspect any built page's HTML in
`dist/` for `<html ... data-agent="bob">` on first byte and the
new `<script is:inline>` block in `<head>` placed before the
linked stylesheet. Confirm the CSS rules exist in the bundled
stylesheet. `astro check` must report zero errors.

**Phase 1.2**: With the scratch route in place at
`src/pages/scratch.astro`, run `npm run dev` and open
`/scratch/` in a fresh browser profile. Confirm only Bob's
blocks render. Switch the agent via the selector; confirm the
swap is one reflow with no flash. Set a non-Bob localStorage
value manually and reload; confirm the correct variant renders
pre-paint. Disable JS and reload; confirm Bob's variants only.
Grep the dev-server-served scratch HTML for the literal string
`data-agent-block` to verify OQ-2. The scratch file is removed
in Phase 2.2 so the production build never emits the route.

**Phase 2.1**: With the placeholder tutorial in place, build and
confirm `dist/tutorials/index.html` exists and lists the
placeholder; confirm `dist/tutorials/<placeholder-slug>/index.html`
exists. Open both in a browser; confirm the index shows one card
and the tutorial renders with the selector at the top. Add a
second placeholder MDX file; rebuild; confirm a second card
appears with no other code change. Grep
`src/content/tutorials/*.mdx` for `<div`, `<section`, `class=`,
`<CodeBlock`, `code={`, `code="` and confirm zero matches.

**Phase 2.2**: With the real tutorial in place, run all manual
acceptance checks from the spec end-to-end:

- Fresh profile → Bob's content renders
- Switch to Claude → Claude's content renders without reload
- Navigate to the index and back → Claude still selected
- Reload → Claude still selected
- JS off → Bob only
- Add a new image under `public/images/tutorials/getting-started/`
  and reference it → image renders in the next build

`astro check`, `npm run build`, the MDX grep guards, and the
`data-agent-block` grep over `dist/` all pass.

## Project References

- Specification: `.spektacular/specs/000005_tutorial-section.md`
- Project knowledge (MDX authoring rules):
  `spektacular knowledge read --data '{"scope":"project","path":"conventions/mdx-authoring.md"}'`
- Prior shipped plans:
  - `spektacular plan file read 000004_astro-migration/plan.md`
  - `spektacular plan file read 000003_update-content/plan.md`
- Astro 5 content collections — official docs:
  https://docs.astro.build/en/guides/content-collections/
- CSS attribute selector `~=` — Selectors Level 4:
  https://www.w3.org/TR/selectors-4/#attribute-representation

## Token Management Strategy

| Tier | Token Budget | Agent Strategy |
|------|-------------|----------------|
| Low | ~10k | Single agent, sequential |
| Medium | ~25k | 2-3 parallel agents |
| High | ~50k+ | Parallel analysis, sequential integration |

Phase 1.1 (~6k) and Phase 1.2 (~4k) are Low tier — single agent.
Phase 2.1 (~10k) sits at the Low/Medium boundary; either single-
agent sequential or a two-agent split as noted above is fine.
Phase 2.2 (~8k) is Low tier — single agent.

## Migration Notes

No data migrations, schema migrations, or backfills. The Plugins
page (`src/pages/plugins.mdx`) carries the same agent identifiers
as the new `src/config/agents.ts`; the two are intentionally
kept in agreement by hand for this plan and consolidated in a
future plan if needed. No URL or content changes occur on any
existing page.

## Performance Considerations

The agent-gating mechanism adds three things to every page on the
site: the SSR `data-agent="bob"` attribute (a few bytes), the
head-level inline `<script is:inline>` (estimated ~150-250 bytes
including the agent-ID allowlist), and three CSS rules in the
bundled stylesheet (~200 bytes after Tailwind's emit). Tutorial
pages additionally ship every agent variant inline; for a
tutorial with N agent-scoped blocks each containing M characters
of variant content, the page weight is roughly
`N * |agents| * M` bytes for the gated regions — orders of
magnitude smaller than a hydrated framework bundle.

There is no client-side computation per render: the visibility
swap is one attribute change followed by browser-native CSS
recalculation. The pre-paint script runs once on load and is
synchronous; its only I/O is one `localStorage.getItem`. No
network requests, no observers, no timers.

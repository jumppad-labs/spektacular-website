# Context: 000006_document-context

## Current State Analysis

The site is Astro 5 + `@astrojs/mdx` v4 + Tailwind v4. Documentation pages live as flat `.mdx` files in `src/pages/` (`configuration.mdx`, `how-it-works.mdx`, `extending.mdx`, `install.mdx`, `plugins.mdx`, `index.mdx`); each `.mdx` file's name becomes its route (`src/pages/knowledge-base.mdx` → `/knowledge-base/`). There is no Knowledge Base page today.

- `src/pages/extending.mdx:1-30` — the model page for a prose-heavy reference doc. Frontmatter is `layout: ../layouts/Shell.astro` + `title` + `description`; imports `Hero`, `Prose`, `CtaBanner`, `Button`; body is `<Hero>` then `<Prose>` with `##` headings and **plain fenced code blocks** (e.g. ` ```go `), closing with `<CtaBanner>`.
- `src/components/sections/Prose.astro:1-9` — single `<slot/>` inside `<article class="prose prose-invert …">`; fenced + inline code are styled by Tailwind Typography `prose-code:*` classes. This is how code renders on the site today.
- `src/components/sections/Section.astro` — props `heading` (req), `sub?`, `surface?` (adds surface background), `maxWidth?`; exposes a `sub` slot (overrides `sub` prop) + default slot.
- `src/components/sections/Hero.astro` — props `heading` (req), `sub?`, `variant?: "page"|"centered"` (use "page" for docs); slots `badge`, `sub`, `install`, default.
- `src/components/sections/CtaBanner.astro` — props `heading` (req), `body?`; slots `body`, `install`, default. `src/components/Button.astro` — props `href`, `label`, `variant`, `large`.
- `src/layouts/Shell.astro` — wraps `<Nav/>` + `<slot/>` + `<Footer/>`, resolves title `title ?? frontmatter?.title ?? "Spektacular"`, provides copy-to-clipboard + smooth-scroll scripts.
- `src/components/Nav.astro:2-9` — hardcoded `items` array of `{label, href}`. Current order: How it works, Tutorials, Install, Configuration, Plugins, Extending. Active-state is automatic (`Nav.astro:13-14`).
- `src/content/tutorials/getting-started.mdx:545-690` — existing developer-facing KB explanation (category table `:550-576`, two knowledge types `:566-576`, multi-source config YAML `:664-686`); reusable framing source.

**Stale-convention note (load-bearing):** stored `conventions/mdx-authoring.md` Rule 4 says route fenced code through a `<CodeBlock>` component via `export const components = { pre: CodeBlock }`. This does NOT match the repo — verified: no `src/components/CodeBlock.astro`, `grep -nE "export const components|CodeBlock" src/pages/*.mdx` is empty, and `astro.config.mjs` has no `markdown.syntaxHighlight: false`. Follow the live repo (plain fenced code in `<Prose>`); do NOT add CodeBlock. Fixing the convention entry is a separate spek-knowledge follow-up.

**Authoritative subsystem source (`../spektacular`, relative to repo root):**
- Categories + tiers: `internal/knowledge/category.go:47-90` (six categories: Purpose/Boundary/EntryShape), `category.go:7-20` (`TierAlwaysApplied="always-applied"`, `TierLookedUp="looked-up"`), `category.go:92-104` (`AlwaysApplied()`). Always-applied = conventions, glossary; looked-up = architecture, gotchas, learnings, decisions.
- Commands: `cmd/knowledge.go:15-67` — search, read, list, write, sources, categories, always-applied, conventions(legacy); all support `--schema`. Write `:39-43` takes `--data '{"scope","path"}'` + `--file`/stdin; stored at `<scope-location>/<category>/<name>.md`, raw markdown, parent dirs auto-created.
- Search: orchestrated by `internal/knowledge/set.go:102` (`Set.Search`), keyword/scoring/excerpt internals in `internal/store/search.go` (`maxExcerptBytes=256`, `maxExcerptsPerHit=3`) — keyword (whitespace-split, case-insensitive substring, conjunction), score = sum of term occurrences, ≤3 excerpts/hit (256 bytes); always-applied excluded (`internal/knowledge/set.go:134-145`, helper `alwaysAppliedSet()` `:156`). Returns one `store.Hit`/doc (`internal/store/store.go:24`: scope, path, title, score, category, checksum, excerpts).
- Config: `internal/config/config.go:71-133` (struct + defaults), `:223-238` (default project source synth), `:197-217` (validation). `.spektacular/config.yaml` → `knowledge.sources[]` each `{scope, provider: file, config.location}`; default single `project` source at `.spektacular/knowledge`; only `file` provider; relative `location` resolves against project root (`set.go:76-79`).
- Rationale: `docs/knowledge-base.md` — planning-time input (`:1-9`), single registry drives scaffold+tier+routing (`:37-51`), two tiers by retrieval (`:53-76`), re-tiering self-consistent (`:67-71`), exact-byte de-dup vs fuzzy (`:120-141`), layered scope precedence project→team→global (`:143-158`).

## Per-Phase Technical Notes

### Phase 1.1: Page scaffold, navigation, and purpose section

**File changes:**
- `src/pages/knowledge-base.mdx` (new) — create following the `src/pages/extending.mdx:1-30` pattern. Frontmatter: `layout: ../layouts/Shell.astro`, `title: "Knowledge Base — Spektacular"`, `description: "<one sentence>"`. Import block: `Hero`, `Section`, `Prose`, `CtaBanner` from `../components/sections/`, `Button` from `../components/Button.astro`. Do **not** import CodeBlock and do **not** add `export const components` (Rule 4 is stale). Body: `<Hero variant="page" heading=… sub=… />`, then five `<Section>` scaffolds with alternating `surface` (What it is / The six categories / The lifecycle of an entry / Configuration / Why it works this way), then `<CtaBanner>` + `<Button>`. Fill the "What it is" section now (purpose + planning-time-input framing); leave the other four as heading-only stubs. Apply MDX Rules 1-3: no `<div>/<section>/class=`; subtitles via `<Fragment slot="sub">` when they carry inline code/links; blank line after each opening tag and before each closing tag.
- `src/components/Nav.astro:2-9` — insert `{ label: "Knowledge Base", href: "/knowledge-base/" }` into the `items` array immediately after the "How it works" entry (line 3), so order becomes How it works · Knowledge Base · Tutorials · Install · Configuration · Plugins · Extending.

Content sources for purpose: `../spektacular/docs/knowledge-base.md:1-9` (planning-time input framing); tutorial framing `src/content/tutorials/getting-started.mdx:545-576`. Section.astro props: `heading` (req), `sub?`, `surface?`, `maxWidth?` + `sub` slot. Hero.astro: `heading` (req), `sub?`, `variant?` (use "page"). Routing: filename → `/knowledge-base/`.

**Complexity:** Low
**Token estimate:** ~25k
**Agent strategy:** Single agent, sequential — one new file plus one nav line; verify with `npm run build` and `npx astro check`, and the MDX grep guards.

### Phase 2.1: Categories section

**File changes:**
- `src/pages/knowledge-base.mdx` — fill the "The six categories" `<Section>` body (markdown inside `<Prose>` or directly in the section's slot). Explain the two tiers, then describe all six categories. A markdown table (category · tier · what goes in it · what belongs elsewhere) reads well here and is allowed (it is markdown, not layout HTML).

Authoritative content source: `../spektacular/internal/knowledge/category.go:47-90` (six category Purpose/Boundary/EntryShape strings), `category.go:7-20` + `:92-104` (tiers: always-applied = conventions, glossary; looked-up = architecture, gotchas, learnings, decisions). Rationale for tiers (for the lead-in): `../spektacular/docs/knowledge-base.md:53-76`. Tutorial category table to adapt: `src/content/tutorials/getting-started.mdx:550-576`.

**Complexity:** Low
**Token estimate:** ~25k
**Agent strategy:** Single agent, sequential — content authoring against the category registry; verify build + read-through against `category.go`.

### Phase 2.2: Lifecycle and configuration sections

**File changes:**
- `src/pages/knowledge-base.mdx` — fill the "The lifecycle of an entry" and "Configuration" `<Section>` bodies. Lifecycle: create (`knowledge write` — scope/path/category, stored at `<scope-location>/<category>/<name>.md`, raw markdown), search/retrieve (keyword search, scored, excerpts, always-applied excluded; `read`; `always-applied` full load), update (re-write the entry). Configuration: `.spektacular/config.yaml` `knowledge.sources[]` each `{scope, provider: file, config.location}`; default single project source at `.spektacular/knowledge`; multi-source/scope model. Use plain fenced code blocks for the config YAML and any command examples.

Authoritative sources: `../spektacular/cmd/knowledge.go:15-67` (subcommands), create/store at `cmd/knowledge.go:39-43`; search behaviour `internal/store/search.go` orchestrated by `internal/knowledge/set.go:102` (`Set.Search`) + always-applied exclusion `internal/knowledge/set.go:134-145`; config `internal/config/config.go:71-133,223-238`. Reusable config YAML example: `src/content/tutorials/getting-started.mdx:664-686`.

**Complexity:** Low-Medium
**Token estimate:** ~30k
**Agent strategy:** Single agent, sequential — two adjacent sections; verify build + accuracy check against `cmd/knowledge.go` and `config.go`.

### Phase 3.1: Rationale section, CTA, and final review

**File changes:**
- `src/pages/knowledge-base.mdx` — fill the "Why it works this way" `<Section>` body and finalize the closing `<CtaBanner>` + `<Button>` (e.g. link to `/how-it-works/` or `/install/`). Rationale points: two tiers by retrieval, single category registry drives scaffold/tier/routing, re-tiering is self-consistent, exact-byte de-dup vs fuzzy, knowledge as a planning-time input (plan is the contract).
- Final review pass over the whole file: confirm all six spec acceptance criteria are covered, MDX Rules 1-3 hold, no CodeBlock usage, build + `astro check` green.

Authoritative source: `../spektacular/docs/knowledge-base.md:1-9,37-76,120-141,143-158`.

**Complexity:** Low
**Token estimate:** ~25k
**Agent strategy:** Single agent, sequential — author rationale, then whole-page review; verify with `npm run build`, `npx astro check`, and the Rule 1 / CodeBlock grep guards.

## Testing Strategy

No automated tests are added — this is documentation only. Per-phase verification:

- **Every phase:** `npm run build` and `npx astro check` must pass; MDX guards `grep -nE "<div|<section|class=" src/pages/knowledge-base.mdx` and `grep -nE "<CodeBlock|code=\{|code=\"" src/pages/knowledge-base.mdx` must both return zero.
- **Phase 1.1:** confirm the nav entry renders after "How it works" and `/knowledge-base/` resolves; purpose section present, other sections stubbed.
- **Phase 2.1:** read-through against `../spektacular/internal/knowledge/category.go` — all six categories and the tier split correct.
- **Phase 2.2:** read-through against `../spektacular/cmd/knowledge.go` + `internal/config/config.go` — lifecycle (create/search/update) and config/scopes accurate.
- **Phase 3.1:** full-page review against `../spektacular/docs/knowledge-base.md`; confirm all six spec acceptance criteria met and content reflects current behaviour. This is the spec's single manual review (its only "success metric").

## Project References

**This repo (spektacular-website):**
- `src/pages/extending.mdx` — model page to copy (prose-heavy reference doc).
- `src/pages/how-it-works.mdx` — `<Section>` + `<Fragment slot="sub">` usage reference.
- `src/components/sections/Prose.astro`, `Section.astro`, `Hero.astro`, `CtaBanner.astro`; `src/components/Button.astro`; `src/layouts/Shell.astro` — components/layout the page composes.
- `src/components/Nav.astro:2-9` — nav `items` array to edit.
- `src/content/tutorials/getting-started.mdx:545-690` — reusable KB framing + config YAML.
- `.spektacular/specs/000006_document-context.md` — the source spec.
- `astro.config.mjs` — confirms no `syntaxHighlight: false` (Rule 4 not live).

**Spektacular application source (`../spektacular`, authoritative for behaviour):**
- `internal/knowledge/category.go` — six categories + tier definitions.
- `cmd/knowledge.go` — knowledge subcommands, args, I/O schemas.
- `internal/store/search.go` (keyword search/scoring/excerpt internals), `internal/knowledge/set.go` (`Set.Search`, always-applied exclusion), `internal/store/store.go` (`Hit` type).
- `internal/config/config.go` — knowledge config schema, defaults, validation.
- `docs/knowledge-base.md` — authoritative design + rationale doc.

**Rehydration commands:** `ls src/components/CodeBlock.astro` (absent), `grep -nE "export const components|CodeBlock" src/pages/*.mdx` (empty), `spektacular knowledge always-applied` (returns the stale Rule 4 — do not follow).

## Token Management Strategy

| Tier | Token Budget | Agent Strategy |
|------|-------------|----------------|
| Low | ~10k | Single agent, sequential |
| Medium | ~25k | 2-3 parallel agents |
| High | ~50k+ | Parallel analysis, sequential integration |

All four phases are Low / Low-Medium and edit the same single file (`src/pages/knowledge-base.mdx`), so they run as single sequential agents; do not parallelise across phases (write contention on one file).

## Migration Notes

N/A — no migration. New page + one nav line; nothing to migrate or back-fill.

## Performance Considerations

N/A — static content page rendered at build time; no runtime or build-performance implications.

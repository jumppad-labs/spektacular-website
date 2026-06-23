# Research: 000006_document-context

## Alternatives considered and rejected

- **Render code via a `<CodeBlock>` component + `export const components = { pre: CodeBlock }`** (as the stored `conventions/mdx-authoring.md` Rule 4 prescribes). Rejected: this convention does **not** match the live repo. There is no `src/components/CodeBlock.astro` (verified: file absent), no page carries `export const components`, and `astro.config.mjs` has no `markdown.syntaxHighlight: false` (grep returned nothing). Every existing page renders plain fenced markdown code inside `<Prose>`, styled by Tailwind Typography `prose-code:*` classes (`src/components/sections/Prose.astro:4`). The spec's constraint says follow the *existing site's* authoring conventions; the live code is authoritative, so we match it. The stored convention is stale/aspirational — flag for a later knowledge correction.

- **Build bespoke section components for the knowledge page** (e.g. a `KnowledgeCategory` card grid like `how-it-works.mdx` uses `SpecKey`/`PipelineStage`). Rejected: spec Non-Goal forbids IA/navigation rework beyond one page, and a reference/explanatory doc is best served by the existing `<Prose>` + `<Section>` pattern. `extending.mdx` proves a content-dense reference page needs no new components. Adding components is scope creep.

- **Place the page under a new top-level IA group or restructure tutorials.** Rejected by spec Non-Goal ("Reworking the site's navigation or documentation information architecture beyond adding this one page is out of scope"). The page is a single new `.mdx` added to the flat `src/pages/` set and one new entry in the `Nav.astro` items array.

- **Source rationale from memory / assumptions.** Rejected: the spektacular repo ships an authoritative design doc `docs/knowledge-base.md` that states the rationale verbatim (single registry, two tiers, re-tiering self-consistency, exact-byte de-dup, planning-time input). Source the "why" section from there, not invention.

## Chosen approach — evidence

- **Page format / model to copy:** `src/pages/extending.mdx:1-30` — prose-heavy reference doc. Frontmatter `layout: ../layouts/Shell.astro` + `title` + `description`; imports `Hero`, `Prose`, `CtaBanner`, `Button` from `src/components/sections/`; body = `<Hero>` then `<Prose>` with `##` headings and fenced code, ending in `<CtaBanner>`.
- **Prose styling for code/inline-code/links:** `src/components/sections/Prose.astro:1-9` — single `<slot/>` in an `<article class="prose prose-invert …">`; fenced code + inline code render natively, no extra wiring.
- **Section component (for distinct headed sections w/ subtitle):** `src/components/sections/Section.astro` props `heading` (req), `sub?`, `surface?`, `maxWidth?`; exposes a `sub` slot (overrides `sub` prop) + default slot. `how-it-works.mdx` shows `<Fragment slot="sub">` usage.
- **Hero:** `src/components/sections/Hero.astro` props `heading` (req), `sub?`, `variant?: "page"|"centered"` (default "page" = correct for docs); slots `badge`, `sub`, `install`, default.
- **CtaBanner + Button footer:** `src/components/sections/CtaBanner.astro` props `heading` (req), `body?`; slots `body`, `install`, default. `Button` from `src/components/Button.astro` (`href`, `label`, `variant`, `large`).
- **Layout:** `src/layouts/Shell.astro` provides `<Nav/>`, `<slot/>`, `<Footer/>`, title resolution `title ?? frontmatter?.title ?? "Spektacular"`, copy-to-clipboard + smooth-scroll scripts.
- **Navigation (discoverability AC):** `src/components/Nav.astro:2-9` — hardcoded `items` array `{label, href}`. Current order: How it works, Tutorials, Install, Configuration, Plugins, Extending. Add `{ label: "Knowledge Base", href: "/knowledge-base/" }` **after "How it works"** (confirmed by user) → order: How it works · Knowledge Base · Tutorials · Install · Configuration · Plugins · Extending. Active-state is automatic via pathname match (`Nav.astro:13-14`).
- **Routing:** Astro file-based — `src/pages/knowledge-base.mdx` → `/knowledge-base/`. `.mdx` extension required.
- **Reusable source material (tutorial):** `src/content/tutorials/getting-started.mdx:545-690` documents the KB: category table (lines 550-564), two knowledge types / always-loaded vs on-demand (566-576), multi-source config YAML example (664-686). Developer-facing framing to reuse.
- **Authoritative subsystem behaviour (spektacular repo `../spektacular`):**
  - Categories + tiers: `internal/knowledge/category.go:47-90` (six categories), `category.go:7-20` (TierAlwaysApplied="always-applied", TierLookedUp="looked-up"), `category.go:92-104` (`AlwaysApplied()` derivation). Always-applied = conventions + glossary; looked-up = architecture, gotchas, learnings, decisions.
  - Create: `cmd/knowledge.go:39-43` `knowledge write`; `--data '{"scope","path"}'` + `--file`/stdin; stored at `<scope-location>/<category>/<name>.md`; parent dirs auto-created (`store.go` MkdirAll). Raw markdown, no enforced frontmatter; title = first ATX heading or path.
  - Search: `cmd/knowledge.go:20-25`; keyword (whitespace-split, case-insensitive substring, conjunction), score = sum of term occurrences, rank score desc → source order → path asc; ≤3 excerpts/hit (256 bytes each); always-applied categories excluded (`set.go:134-145`). Returns one `store.Hit`/doc (`internal/store/store.go:24`) with scope, path, title, score, category, checksum, excerpts.
  - always-applied: `cmd/knowledge.go:63-67`; loads full content of every conventions+glossary entry, scope order then category order. read: `cmd/knowledge.go:27-31` full body of one entry.
  - Scopes/config: `config/config.go:71-96` + defaults `:99-133`/`:223-238`; `.spektacular/config.yaml` → `knowledge.sources[]` each `{scope, provider:file, config.location}`. Default = single `project` source at `.spektacular/knowledge`. Only `file` provider. Relative `location` resolves against project root (`set.go:76-79`).
  - Commands: `cmd/knowledge.go:15-67` — search, read, list, write, sources, categories, always-applied, conventions(legacy); all support `--schema`.
  - Rationale (quote source): `../spektacular/docs/knowledge-base.md` — planning-time input (`:1-9`), single registry drives scaffold+tier+routing (`:37-51`), two tiers by retrieval (`:53-76`), re-tiering self-consistent (`:67-71`), exact-byte de-dup vs fuzzy (`:120-141`), layered scope precedence project→team→global (`:143-158`).

## Files examined

- `src/pages/extending.mdx:1-30` — canonical prose-heavy reference page; the structural model to copy.
- `src/pages/how-it-works.mdx:1-30` — heavier composition (Section/QuickStart/Step/Pipeline); shows `<Fragment slot="sub">`; more than this page needs.
- `src/components/sections/Prose.astro:1-9` — `<slot/>` in Tailwind `prose prose-invert` article; how fenced/inline code is styled (no CodeBlock).
- `src/components/sections/Section.astro` — heading/sub/surface/maxWidth props + sub slot.
- `src/components/sections/Hero.astro` — page header, variant "page".
- `src/components/sections/CtaBanner.astro` + `src/components/Button.astro` — footer CTA pattern.
- `src/layouts/Shell.astro` — wraps Nav/slot/Footer, title handling, copy + scroll scripts.
- `src/components/Nav.astro:2-9` — nav items array; where to register the new page.
- `astro.config.mjs` — no `syntaxHighlight: false` present (confirms Rule 4 of stored convention is not live).
- `src/content/tutorials/getting-started.mdx:545-690` — reusable KB explanation + config YAML.
- `../spektacular/internal/knowledge/category.go:7-104` — category registry + tiers.
- `../spektacular/cmd/knowledge.go:15-130,340-346` — knowledge subcommands, args, I/O schemas.
- `../spektacular/internal/knowledge/set.go:76-79,134-145` — path resolution, always-applied search exclusion.
- `../spektacular/internal/config/config.go:71-133,197-238` — knowledge config struct, defaults, validation.
- `../spektacular/internal/store/search.go` — keyword search/scoring/excerpt internals (`maxExcerptBytes=256`, `maxExcerptsPerHit=3`); orchestrated by `internal/knowledge/set.go:102` (`Set.Search`).

## External references

- `../spektacular/docs/knowledge-base.md` — the authoritative design+rationale doc for the subsystem; primary source for the page's "what / why" and accurate behaviour. Why it mattered: lets the rationale section quote real design intent rather than infer it.

## Prior plans / specs consulted

- `spec 000005_tutorial-section` (the tutorial that this page draws framing from) — source of the developer-facing KB explanation reused here; tutorial stays separate per Non-Goal.
- No prior plan covers the knowledge-base page. `spektacular plan file list` / `spec file list`: none relevant beyond the above.

## Open assumptions

- **The stored `conventions/mdx-authoring.md` Rule 4 (CodeBlock routing) is stale and must be overridden by the live repo.** Assumed the live repo (plain fenced code in `<Prose>`) is correct. If a CodeBlock component is reintroduced before implementation, revisit. (Verified absent today; high confidence.)
- ~~Nav placement~~ RESOLVED: label "Knowledge Base", after "How it works" (user-confirmed).
- **The `../spektacular` repo is the version the docs must describe.** Assumed it is the current/released behaviour. If the installed CLI differs from `../spektacular` HEAD, the page could drift; the spec names `../spektacular` as authoritative, so we follow it.

## Rehydration cues

- Re-load conventions+glossary: `spektacular knowledge always-applied` (note: returns the stale CodeBlock Rule 4 — do not follow it; trust the repo).
- Re-confirm code-rendering reality: `ls src/components/CodeBlock.astro` (absent), `grep -nE "export const components|CodeBlock" src/pages/*.mdx` (empty), read `src/components/sections/Prose.astro`.
- Re-read the model page: `src/pages/extending.mdx`.
- Re-read nav: `src/components/Nav.astro`.
- Re-source subsystem truth: read `../spektacular/docs/knowledge-base.md`, `../spektacular/internal/knowledge/category.go`, `../spektacular/cmd/knowledge.go`, `../spektacular/internal/config/config.go`.
- Reusable tutorial copy: `src/content/tutorials/getting-started.mdx:545-690`.

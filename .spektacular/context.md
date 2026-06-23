# Working context — 000006_document-context

## Decisions
- Deliverable is a **new documentation page on the Spektacular website** (this repo), not a README or external doc.
- Audience: **developers who use Spektacular** on their own projects (consumers), not contributors to Spektacular itself.
- Scope: the **whole knowledge base subsystem** — categories (architecture, gotchas, learnings, decisions, glossary, conventions), how entries are created/searched/updated, configuration, and the rationale ("why it works this way").
- Source material may be drawn in part from the **existing tutorial**.

## Discovery learnings
- **Model page = `src/pages/extending.mdx`** (prose-heavy reference doc). Skeleton: frontmatter (`layout: ../layouts/Shell.astro`, title, description) → import Hero/Prose/Section/CtaBanner/Button → `<Hero variant="page">` → `<Prose>` with `##` headings + fenced code → `<CtaBanner>` + `<Button>`.
- **STALE CONVENTION FLAG:** stored `conventions/mdx-authoring.md` Rule 4 (CodeBlock + `export const components = { pre: CodeBlock }` + `syntaxHighlight:false`) does NOT match the live repo — no `CodeBlock.astro`, no such export, no astro.config flag. Live pages render plain fenced code inside `<Prose>` (Tailwind Typography `prose-code:*`). Follow the repo, not the convention. (Candidate knowledge correction via spek-knowledge later.)
- **Nav:** add `{ label, href }` to `src/components/Nav.astro` items array (proposed: Knowledge Base after Configuration, before Plugins). Routing: `src/pages/knowledge-base.mdx` → `/knowledge-base/`.
- **Subsystem truth sources (../spektacular):** categories+tiers `internal/knowledge/category.go`; commands+args `cmd/knowledge.go`; config `internal/config/config.go`; rationale `docs/knowledge-base.md`. Tiers: always-applied = conventions+glossary (loaded full, excluded from search); looked-up = architecture/gotchas/learnings/decisions (keyword search). Config = `.spektacular/config.yaml` `knowledge.sources[]` (scope/provider:file/config.location).
- **Reusable tutorial copy:** `src/content/tutorials/getting-started.mdx:545-690`.

## Architecture decisions (confirmed)
- **Page structure: Sectioned** — Hero + one `<Section>` per topic (What it is / The six categories / Lifecycle / Configuration / Why it works this way) + CtaBanner; alternating `surface` backgrounds. One new file `src/pages/knowledge-base.mdx` + one nav entry. No new components.
- **Conventions confirmed:** apply MDX Rules 1-3; deliberately DROP Rule 4 (CodeBlock) as stale — use plain fenced code in `<Prose>`.

## Plan progress
- All sections drafted + user-confirmed (structure sectioned, nav after How-it-works, conventions). 4 phases across 3 milestones, all single-file (`src/pages/knowledge-base.mdx`) + 1 nav line.
- Assemble + verification done. All three docs (plan/context/research) committed to the plan store under `000006_document-context/`. Working dir removed. Plan COMPLETE.
- Metadata: created 2026-06-23T13:00:28Z, commit a728014, branch main.

## Implement run — drift resolution (read_plan gate)
- **Drift fixed (user chose "Fix the plan first"):** the search/scoring/excerpt source moved in `../spektacular`. Old pointer `internal/knowledge/store/search.go` no longer exists. Current reality:
  - Search orchestration: `internal/knowledge/set.go:102` (`func (s *Set) Search`).
  - Keyword/scoring/excerpt internals: `internal/store/search.go` (`maxExcerptBytes=256`, `maxExcerptsPerHit=3`).
  - `Hit` type: `internal/store/store.go:24`.
  - Always-applied exclusion within search: `internal/knowledge/set.go:134-145` (helper `alwaysAppliedSet()` `:156`), was cited as `set.go:127-162`/`127-141`.
  - Path resolution still at `set.go:76-79` (unchanged, verified).
  - context.md + research.md updated in the plan store to these refs; all other plan pointers verified present.
- Changelog mode: **ABSENT** → first-phase invocation; analyze picks up at Phase 1.1.

## Phase 1.1 research (analyze) — confirmed, no mismatches
- Component prop signatures verified: `Hero`(heading req, sub?, variant? default "page", sub slot), `Section`(heading req, sub?, surface?, maxWidth?, sub slot + default slot), `CtaBanner`(heading req, body?, body/install/default slots), `Button`(href, label, variant?, large?, external?).
- Authoring shape to follow: `configuration.mdx` = `<Section heading>` + `<Fragment slot="sub">` (blank lines around slot body, MDX Rule 3); `extending.mdx` = `<Prose>` body + `<CtaBanner>`/`<Button>` footer. Live pages OMIT `variant` on Hero (defaults to "page").
- Nav: insert `{ label: "Knowledge Base", href: "/knowledge-base/" }` after the "How it works" entry (`Nav.astro:3`).
- Phase 1.1 deliverable: new `src/pages/knowledge-base.mdx` — frontmatter (layout/title/description) → import Hero/Section/Prose/CtaBanner/Button → Hero → 5 `<Section>` (What it is filled; six categories / lifecycle / configuration / why-it-works as heading-only stubs; alternating `surface`) → CtaBanner + Button. No CodeBlock, no `export const components`.

## Progress: ALL PHASES COMPLETE (1.1, 2.1, 2.2, 3.1) — verified all-green, checkboxes flipped, per-phase changelog entries added. Repo CHANGELOG.md updated with 000006_document-context section. test-plan.md written to plan store (manual content-accuracy review, 6 items; no quantitative metrics — spec has none). Advancing to finished.

## (earlier) Progress: Phases 1.1 + 2.1 COMPLETE (verified all-green, checkboxes flipped, changelog entries added 2026-06-23). Remaining: 2.2 (lifecycle+config), 3.1 (rationale+CTA+final review). User chose RUN ALL REMAINING PHASES autonomously (2.1, 2.2, 3.1) without pausing between them — loop analyze→...→update_changelog without re-prompting; stop only on a real problem or at the end.

## Phase 2.1 analyze — source confirmed (no mismatch)
- `../spektacular/internal/knowledge/category.go`: registry order = conventions, glossary, architecture, gotchas, learnings, decisions. Each has Purpose/Boundary/Tier/EntryShape. Tiers: always-applied=conventions+glossary (loaded full every task, excluded from search, keep small); looked-up=architecture/gotchas/learnings/decisions (retrieved on query match). Category fixed by first path segment (`gotchas/x.md`→gotchas). Registry is single source of truth (drives init scaffold, tier behaviour, `knowledge categories` JSON).
- Plan suggests a markdown table (category·tier·what goes in·boundary) for this section — allowed (markdown, not layout HTML).

## Phase 2.2 analyze — sources confirmed (no mismatch)
- Create: `knowledge write` (`cmd/knowledge.go:217` runKnowledgeWrite) → `Set.Write` (`set.go:175`) → `store.Write` (parent dirs auto-created). scope+path via `--data {scope,path}`, content via `--file`/stdin. Category = first path segment (`categoryOf` `set.go:147`); stored raw markdown at `<location>/<category>/<name>.md`.
- Search: `knowledge search` → `Set.Search` (`set.go:102`): query every source, merge, rank score desc → source order → path asc, one hit/doc; conventions+glossary excluded (`set.go:134-145`) because loaded full via `always-applied`. Excerpts ≤3 @256B (`internal/store/search.go`). `knowledge read` = one entry full body; `knowledge always-applied` = conventions+glossary full.
- Update: no separate command — re-write same scope/path overwrites.
- Config (`internal/config/config.go:71-133`): `knowledge.sources[]` each `{scope, provider, config.location}`. Constants: ProviderFile="file" (:23), DefaultKnowledgeScope="project" (:33), DefaultKnowledgeLocation=".spektacular/knowledge" (:36). Default = single project source (`WithDefaults` :223). Relative location resolves vs projectRoot (`set.go:76-79`). Searches query each source in configured order + aggregate.
- Reusable multi-source YAML: tutorial `getting-started.mdx:672-686` (project/team/global example).

## Phase 3.1 analyze — rationale source confirmed (docs/knowledge-base.md, no mismatch)
- Planning-time input (:1-9): knowledge read at plan time, relevant parts written INTO the plan; implement consumes only plan docs → plan is the contract.
- Single registry source of truth (:37-51): category model declared once in `category.go`; drives init scaffold+READMEs, tier behaviour, contribution routing (`knowledge categories`). Add/re-tier = one change.
- Two tiers by retrieval (:53-76): always-applied loaded full + excluded from search; looked-up via keyword search. Re-tiering self-consistent — full-load reader + search-exclusion both read the one registry field, can't drift.
- Exact-byte de-dup not fuzzy (:120-141): mechanical step matches exact byte-identity, NOT similarity, because lexical distance ≠ semantic distance ("always retry" vs "never retry" ~95% identical but opposite). Exact-equivalence claims provable zero-difference for free; routes semantic equivalence to LLM judgement layer.
- Layered precedence (:143-158): most-specific scope wins (project→team→global); refinements resolved to most-specific, genuine disagreement surfaced as conflict.
- CTA already present (→ /how-it-works/); just finalize in 3.1. Final review = whole-page read vs all 6 spec ACs + MDX rules + no CodeBlock + build green.

## Phase 1.1 implemented (implement step)
- Created `src/pages/knowledge-base.mdx`: Hero ("The Knowledge Base") + 5 Sections — "What it is" FILLED (purpose + planning-time-input framing + problem-it-solves), four heading-only stubs ("The six categories"[surface] / "The lifecycle of an entry" / "Configuration"[surface] / "Why it works this way"), closing CtaBanner → Button "/how-it-works/". Body prose wrapped in `<Prose>`; Hero `variant` omitted (defaults "page").
- Edited `src/components/Nav.astro:4`: added `{ label: "Knowledge Base", href: "/knowledge-base/" }` after How it works.
- Verified: `astro check` 0 errors/0 warnings (execCommand hints are pre-existing in Shell.astro/main.min.js); `npm run build` OK, `/knowledge-base/index.html` built; nav link renders in correct order; Rule 1 + CodeBlock grep guards both zero.

## Test step — N/A (documentation-only, by plan)
- No `*_test.go` / automated tests written: project is a static Astro/MDX site with no application logic or Go test infra. Plan's `## Testing Approach` explicitly pre-decided this. No convention mismatch (plan and reality agree).
- Phase 1.1 behavioural AC (build/type-check pass, page reachable, guards green) covered by automated gates already run green: `npm run build`, `astro check`, `grep` Rule-1 + CodeBlock guards.
- Content-accuracy criteria are manual → deferred to `test_plan` step. Applies to every phase of this plan.

## User answers
- "new page", audience = developers who use the tool, document the whole subsystem, can pull data from the tutorial.
- Requirements (6 items) approved as proposed without changes.
- Acceptance criteria (6 items) approved as proposed.
- Constraints approved: must fit existing site docs structure/authoring + build; must reflect current behaviour (not aspirational); docs-only (no changes to subsystem).
- Technical Approach: source content from existing tutorial + the main Spektacular application repo at `../spektacular` (authoritative for behaviour/categories/config). Page follows existing docs format; structure left to plan.
- Success metrics: none formal; author will manually test/review.
- Non-goals: other subsystems (spec/plan/implement), hands-on tutorial, nav/IA rework. (Dropped "no subsystem changes" — duplicates docs-only constraint.)
- **Nav placement (confirmed):** label "Knowledge Base", inserted after "How it works" → order: How it works · Knowledge Base · Tutorials · Install · Configuration · Plugins · Extending.

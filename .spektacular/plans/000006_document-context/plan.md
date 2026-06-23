# Plan: 000006_document-context

<!-- Metadata -->
<!-- Created: 2026-06-23T13:00:28Z -->
<!-- Commit: a72801483b31a51ffa53048307301e798ebc53bf -->
<!-- Branch: main -->
<!-- Repository: git@github.com:jumppad-labs/spektacular-website.git -->

## Overview

A new documentation page on the Spektacular website that explains the knowledge
base subsystem to the developers who use Spektacular — what it is, the six
categories of knowledge it holds, how entries are created, searched, and kept up
to date, how it is configured, and why it is designed the way it is. It solves
the problem that developers currently have no single place to understand how
Spektacular captures and reuses project knowledge, which is what lets them trust
the tool and use it effectively. The page is published as a navigable reference
page within the existing site.

## Conventions

- **MDX Rule 1 — no layout HTML in page bodies**
  (`conventions/mdx-authoring.md`) — the new page must contain only frontmatter,
  component invocations, and prose; no `<div>`/`<section>`/`class=`. CI guard
  `grep -nE "<div|<section|class=" src/pages/*.mdx` must stay at zero.
- **MDX Rule 2 — slots/native MDX over `set:html` string props**
  (`conventions/mdx-authoring.md`) — section content (paragraphs, lists, code)
  goes in default/named slots; subtitles use `<Fragment slot="sub">` rather than
  a `sub` string prop when they carry inline code/links.
- **MDX Rule 3 — blank line before and after slot content**
  (`conventions/mdx-authoring.md`) — every `<Section>…</Section>` / `<Fragment
  slot>…</Fragment>` body gets a blank line after the opening tag and before the
  closing tag, matching the existing pages.
- **MDX Rule 4 — CodeBlock routing — DELIBERATELY DROPPED**
  (`conventions/mdx-authoring.md`) — this rule is stale and does not match the
  live repo (no `CodeBlock.astro`, no `export const components`, no
  `syntaxHighlight:false`). Per the spec's "match the existing site" constraint,
  this page renders plain fenced code inside `<Prose>` like every current page.
  The convention entry should be corrected separately via the knowledge
  workflow.

## Architecture & Design Decisions

The deliverable is a single new MDX page, `src/pages/knowledge-base.mdx`, plus
one new entry in the hardcoded nav array in `src/components/Nav.astro`. The page
follows the live site's documentation pattern modelled on
`src/pages/extending.mdx`: frontmatter (`layout: ../layouts/Shell.astro`,
`title`, `description`), an import block pulling only existing components
(`Hero`, `Section`, `Prose`, `CtaBanner`, `Button`), and a body that composes
those components — no new components and no information-architecture changes,
per the spec's non-goals.

The page is **sectioned**: a `<Hero variant="page">` header, then one
`<Section>` per required topic — *What it is* (purpose), *The six categories*
(the two-tier model and a per-category reference), *The lifecycle of an entry*
(create / search / read / always-applied / update), *Configuration*
(`.spektacular/config.yaml` sources, scopes, provider, location), and *Why it
works this way* (rationale) — closing with a `<CtaBanner>` + `<Button>`.
Alternating `surface` backgrounds give visual rhythm as in `how-it-works.mdx`.
Mapping each acceptance criterion to its own visible `<Section>` makes the
spec's "a reader can find, on the page, …" criteria directly checkable. This
beats a single long-form `<Prose>` page (simplest, but the five topics blur
together) and a Prose+table hybrid (better category scannability, more markup);
the sectioned layout keeps each required topic a distinct, navigable unit while
still using `<Prose>`/markdown for the prose inside each section.

The content is sourced two ways, both authoritative per the spec:
developer-facing framing and the config example are adapted from the existing
tutorial (`src/content/tutorials/getting-started.mdx:545-690`), while the
precise behaviour — six categories and their tier split, the
create/search/read/always-applied lifecycle, the config schema, and the design
rationale — is taken from the Spektacular application source
(`../spektacular/internal/knowledge/category.go`, `cmd/knowledge.go`,
`internal/config/config.go`, and the design doc `docs/knowledge-base.md`). This
keeps the documentation grounded in current behaviour rather than aspiration.

The one notable trade-off concerns code rendering. The project's stored
convention `conventions/mdx-authoring.md` Rule 4 prescribes routing every fenced
block through a `<CodeBlock>` component via `export const components = { pre:
CodeBlock }`. That convention is **stale**: the live repo has no
`CodeBlock.astro`, no page declares that export, and `astro.config.mjs` sets no
`syntaxHighlight: false` — every existing page renders plain fenced markdown
inside `<Prose>`, styled by Tailwind Typography
(`src/components/sections/Prose.astro:4`). The spec's constraint is to match the
*existing site's* authoring conventions, so this page follows the live repo
(plain fenced code) and does **not** introduce the CodeBlock wiring. The stale
convention entry should be corrected separately via the knowledge workflow. The
rejected page-structure options and the evidence for this code-rendering
decision are recorded in `research.md#alternatives-considered-and-rejected`.

## Component Breakdown

**Knowledge Base page (new).** A new MDX documentation page that owns all the
prose, code/config examples, and section structure for the knowledge-base
subsystem. It is the only new artifact carrying content. It composes the
existing section components below and declares the page frontmatter (layout,
title, description) that the site shell consumes. Its URL is derived from its
filename by Astro's file-based routing, so no routing code is added.

**Site navigation (changed).** The existing hardcoded navigation list gains one
entry — label "Knowledge Base", linking to the new page's path — inserted
immediately after "How it works". This is the only change to an existing file
and is what satisfies the discoverability requirement; active-link highlighting
is already handled by the nav component and needs no change.

**Hero (reused).** Renders the page header (heading + subtitle) in its "page"
variant, exactly as the other documentation pages use it. No change.

**Section (reused).** One instance per required topic — *What it is*, *The six
categories*, *The lifecycle of an entry*, *Configuration*, *Why it works this
way* — each owning that topic's heading, optional subtitle slot, and slotted
body. Alternating `surface` backgrounds provide visual rhythm. This is the
primary structural component of the page. No change.

**Prose (reused).** Wraps markdown-heavy body content (paragraphs, lists, fenced
code/config blocks, the category reference) inside sections, applying the site's
typography. It is the component that renders the page's fenced code blocks
directly — the page deliberately does not introduce a CodeBlock component. No
change.

**CtaBanner + Button (reused).** Close the page with a call-to-action pointing
readers onward (e.g. to How it works / Install), matching the footer pattern of
the other documentation pages. No change.

**Shell layout (reused, unchanged).** Provides the surrounding chrome — nav,
footer, head/title resolution, copy-to-clipboard and smooth-scroll scripts — for
the new page automatically via the frontmatter `layout`. No change.

## Data Structures & Interfaces

No new data structures, types, or interfaces are introduced. This is a
documentation-only change that adds one MDX page and one navigation entry, both
conforming to existing contracts:

- **Page frontmatter** — the new page supplies the same frontmatter shape every
  documentation page already uses, consumed by the shell layout:

  ```yaml
  layout: ../layouts/Shell.astro
  title: "Knowledge Base — Spektacular"
  description: "<one-sentence meta description>"
  ```

- **Navigation item** — the new nav entry conforms to the existing item shape in
  the navigation list:

  ```ts
  { label: "Knowledge Base", href: "/knowledge-base/" }
  ```

No schema, no serialization boundary, and no component prop signatures change;
the page only invokes existing components through their current prop/slot APIs.

## Implementation Detail

No new code patterns are introduced. The work is authoring one MDX page that
follows the existing documentation-page pattern verbatim — the same
frontmatter/layout binding, import-then-compose body, and section-component
vocabulary the other doc pages already use — plus a one-line addition to the
existing navigation list. A developer reading the change sees a page that is
indistinguishable in shape from the pages around it; there is nothing novel to
learn.

The substance of the work is editorial, not structural: organising accurate
subsystem content into the five required topics and expressing each through
existing components. The content is grounded in two authoritative sources and
must reflect current behaviour, not aspiration — the subsystem's mechanics (the
six categories and their two-tier split into always-applied vs looked-up, the
create/search/read/always-applied lifecycle, the configuration schema, and the
design rationale) come from the Spektacular application source and its design
doc, while developer-facing framing and the configuration example are adapted
from the existing tutorial. Each of the five `<Section>`s corresponds to one
acceptance criterion, so the page's structure is driven by the spec's checklist
rather than by any code concern.

The one deliberate deviation from a documented pattern is code rendering. The
stored MDX authoring convention's CodeBlock rule is stale relative to the live
codebase, so this page follows what every existing page actually does — plain
fenced markdown code/config blocks rendered inside the prose component — and
does not add the CodeBlock component or its `export const components` wiring.
This keeps the new page consistent with the rest of the site and within the
spec's documentation-only, match-the-existing-site constraints. Verification is
the standard site build plus the existing MDX CI guards (no layout HTML, and —
because no CodeBlock is used — the CodeBlock guards trivially stay at zero),
with a manual read-through to confirm the content is accurate and clear.

## Dependencies

- **Existing site components (Hero, Section, Prose, CtaBanner, Button) and the
  Shell layout** — provide the page's structure, typography, and chrome. Reused
  as-is; no changes required.
- **Astro file-based routing + `@astrojs/mdx`** — turn the new `.mdx` file into
  a published route and render its markdown/components. Already configured for
  the site; no changes required.
- **Site navigation component** — the only existing file that must change, to
  add the "Knowledge Base" entry. Trivial, one-line addition.
- **Spektacular application source (`../spektacular`) — content reference, not a
  code dependency** — the knowledge subsystem source (`internal/knowledge`,
  `cmd/knowledge.go`, `internal/config`) and the design doc
  `docs/knowledge-base.md` are the authoritative reference for what the page
  says. It must be readable at authoring time; it is not imported or built
  against. If that source changes before the page lands, the content should be
  re-checked against it.
- **Existing tutorial content** — provides reusable developer-facing framing and
  the configuration example. No changes required; the tutorial stays separate
  (per spec non-goal).
- **No external libraries, services, or prior unlanded plans/specs are
  required.** The spec (000006) is the only upstream input and is already
  approved; nothing must land before this work starts.

## Testing Approach

This is a documentation-only change with no application logic, so there are no
unit, integration, or end-to-end tests to add. Verification rests on the site's
existing build/lint gates plus a manual content review.

**Automated gates (build + lint).** The load-bearing automated guarantee is that
the site builds with the new page included and the page is reachable through
navigation. The Astro production build must succeed and `astro check` must
report zero errors/warnings; a failed build means the page or the nav edit is
broken. The project's existing MDX CI guards also apply and must stay green: no
layout HTML in the page body (no `<div>`/`<section>`/`class=`), and — because
this page deliberately uses plain fenced code rather than a CodeBlock component
— the CodeBlock guards trivially remain at zero. These cover the "page is
reachable / build succeeds" acceptance criterion behaviourally; the others are
content-accuracy criteria that no automated test can assert.

**Manual content review — captured in the implementation test plan.** Every
content-accuracy acceptance criterion (purpose is covered; all six categories
documented with guidance on what goes in each; the create/search/update
lifecycle covered; configuration and where it lives covered; rationale covered)
and the spec's overall accuracy constraint (the page reflects current subsystem
behaviour, not aspiration) can only be confirmed by a human reading the
published page against the authoritative source. These are classified as
**Manual — captured in the implementation test plan**: the implement workflow
produces the concrete checklist once the page exists, cross-checking each
section against the Spektacular application source and design doc.

**Success metrics.** The spec defines no formal success metrics — it states the
author will manually review the published page to confirm it accurately and
clearly explains the subsystem. That single manual review is folded into the
manual content-review check above; there are no quantitative metrics to carry
into a behavioural test.

## Milestones & Phases

### Milestone 1 — A Knowledge Base page exists and is reachable

**What changes:** A new "Knowledge Base" entry appears in the site's top
navigation (after "How it works"), and following it opens a new documentation
page that explains what the knowledge base is and the problem it solves. The
page renders in the existing site shell with its section scaffold in place, and
the site builds with the new page included. After this milestone a visitor can
discover and reach the page and understand the subsystem's purpose, even though
the deeper reference content is still being filled in.

**Validation point:** The production build and `astro check` pass; the
"Knowledge Base" link is present in the nav and resolves to the new page; the
page shows the purpose section and the empty/placeholder section headings for
the remaining topics.

#### - [x] Phase 1.1: Page scaffold, navigation, and purpose section

Create the new Knowledge Base documentation page using the site's existing
documentation-page pattern, register it in the top navigation after "How it
works", and write the opening "What it is" section that states what the
knowledge base is and the problem it solves. The remaining topic sections are
stubbed with their headings so the page structure is visible and the build is
green. After this phase the page is live, reachable from the nav, and explains
the subsystem's purpose.

*Technical detail:*
[context.md#phase-11](./context.md#phase-11-page-scaffold-navigation-and-purpose-section)

**Acceptance criteria**:
- [x] A "Knowledge Base" link appears in the top navigation immediately after
  "How it works" and opens the new page.
- [x] The page renders in the standard site shell with a page hero and a section
  that explains what the knowledge base is and the problem it solves.
- [x] The headings for the remaining topics (categories, lifecycle,
  configuration, rationale) are present as section scaffolding.
- [x] The production build and type check pass with the new page included, and
  no layout HTML or CodeBlock guards are tripped.

### Milestone 2 — The page documents how the knowledge base works

**What changes:** The page gains its reference content — a description of each
of the six categories (architecture, gotchas, learnings, decisions, glossary,
conventions) and the two-tier always-applied/looked-up model, the lifecycle of
an entry (how it is created, searched/retrieved, and updated), and how the
knowledge base is configured and where that configuration lives. After this
milestone a developer can read the page and understand the mechanics of the
subsystem end to end. All content is grounded in the authoritative application
source.

**Validation point:** The build still passes; a read-through confirms each of
the six categories, the create/search/update lifecycle, and the configuration
are present and match current subsystem behaviour (manual content check against
the application source).

#### - [x] Phase 2.1: Categories section

Fill in the "six categories" section: explain the two-tier model (always-applied
conventions and glossary vs looked-up architecture, gotchas, learnings,
decisions) and describe each of the six categories with guidance on what belongs
in it and when to use it. Content is grounded in the application source so it
matches current behaviour.

*Technical detail:*
[context.md#phase-21](./context.md#phase-21-categories-section)

**Acceptance criteria**:
- [x] All six categories — architecture, gotchas, learnings, decisions,
  glossary, conventions — are described, each with guidance on what goes in it.
- [x] The always-applied vs looked-up distinction is explained and maps the six
  categories to their tiers.
- [x] Each category description matches the definitions in the application
  source.

#### - [x] Phase 2.2: Lifecycle and configuration sections

Write the "lifecycle of an entry" section (how an entry is created, how it is
searched/retrieved, and how it is kept up to date) and the "configuration"
section (what can be configured, the config file and its sources/scopes, and
where it lives). Both are grounded in the application source and the existing
tutorial's framing.

*Technical detail:*
[context.md#phase-22](./context.md#phase-22-lifecycle-and-configuration-sections)

**Acceptance criteria**:
- [x] The page describes how an entry is created, how it is searched/retrieved,
  and how it is updated.
- [x] The page describes how the knowledge base is configured and where that
  configuration lives, including the multi-source/scope model.
- [x] The lifecycle and configuration descriptions match current subsystem
  behaviour.

### Milestone 3 — The page explains why the subsystem is designed this way

**What changes:** The page gains its rationale section explaining the reasoning
behind the design (why two tiers, why a single category registry, why exact-byte
de-duplication, why knowledge is a planning-time input) and closes with a
call-to-action pointing readers onward. After this milestone the page is
complete: it conveys not just the mechanics but the intent, and a final accuracy
review confirms it reads clearly and reflects current behaviour.

**Validation point:** The build passes; the rationale section and closing CTA
are present; a full manual review against the application source and design doc
confirms the page is accurate, clear, and complete against every acceptance
criterion.

#### - [x] Phase 3.1: Rationale section, CTA, and final review

Write the "why it works this way" section (the reasoning behind the two-tier
model, the single category registry, exact-byte de-duplication, and knowledge as
a planning-time input), add the closing call-to-action, and perform a full
accuracy and clarity review of the whole page against the authoritative source.
After this phase the page is complete.

*Technical detail:*
[context.md#phase-31](./context.md#phase-31-rationale-section-cta-and-final-review)

**Acceptance criteria**:
- [x] The page includes a section explaining why the subsystem is designed the
  way it is.
- [x] The page closes with a call-to-action pointing the reader onward.
- [x] A full read-through confirms every acceptance criterion in the spec is met
  and the content reflects current behaviour, with the build and guards still
  green.

## Open Questions

None. All design choices for this documentation page are resolved: the page
structure (sectioned), navigation placement (after "How it works"), the
authoring conventions to follow (MDX Rules 1-3; Rule 4 / CodeBlock deliberately
dropped as stale), and the authoritative content sources are all settled. The
content can be authored entirely from sources readable now — the Spektacular
application source, its design doc, and the existing tutorial — so nothing
depends on discoveries that can only be made during implementation.

One standing instruction rather than an open question: the page must reflect the
knowledge subsystem's *current* behaviour. If, while authoring, the implementer
finds the application source (`../spektacular`) contradicts an assumption
recorded in this plan, they should STOP and reconcile against the source before
writing, rather than document aspirational behaviour.

## Out of Scope

- **Documenting other Spektacular subsystems** — the spec, plan, and implement
  workflows are not covered by this page (spec § Non-Goals). They would be
  separate documentation pages / specs if wanted.
- **A hands-on tutorial or step-by-step walkthrough** — this page is reference
  and explanatory documentation only; the existing tutorial stays separate and
  unchanged (spec § Non-Goals).
- **Reworking the site's navigation or information architecture** — beyond
  adding the single "Knowledge Base" entry, no nav restructuring, grouping, or
  IA changes are made (spec § Non-Goals).
- **Modifying the knowledge subsystem itself** — this is a documentation-only
  change; no code, config schema, or behaviour in `../spektacular` is touched
  (spec § Constraints).
- **Correcting the stale `conventions/mdx-authoring.md` Rule 4 (CodeBlock)
  knowledge entry** — this plan only follows the live repo's actual
  code-rendering pattern; fixing the divergent stored convention is a separate
  follow-up to be routed through the knowledge workflow (`spek-knowledge`), not
  part of this page's implementation.
- **Introducing a CodeBlock component or syntax highlighting** — deliberately
  left out to match the existing site; if syntax colour is wanted later it is a
  separate, site-wide change.

## Changelog

### 2026-06-23 — Phase 1.1: Page scaffold, navigation, and purpose section

**What was done**: Created the new Knowledge Base documentation page
(`src/pages/knowledge-base.mdx`) following the live `extending.mdx` reference
pattern — a page Hero, five `<Section>`s (the "What it is" section filled with
the purpose and the problem it solves, framed as a planning-time input; the
other four as heading-only scaffolding with alternating `surface` backgrounds),
and a closing `<CtaBanner>` + `<Button>` linking to How it works. Registered the
page in the top navigation immediately after "How it works".

**Deviations**: None. As planned, the page uses plain fenced code inside
`<Prose>` and does not introduce a CodeBlock component (stored convention Rule 4
is stale relative to the live repo). The Hero `variant` prop was omitted because
it defaults to `"page"` and every live page omits it.

**Files changed**:
- `src/pages/knowledge-base.mdx` (new)
- `src/components/Nav.astro`

**Discoveries**:
- The drift gate found the search subsystem source moved in `../spektacular`:
  `internal/knowledge/store/search.go` no longer exists — search is orchestrated
  by `internal/knowledge/set.go:102` (`Set.Search`), keyword/scoring/excerpt
  internals live in `internal/store/search.go` (`maxExcerptBytes=256`,
  `maxExcerptsPerHit=3`), the `Hit` type is in `internal/store/store.go:24`, and
  the always-applied search exclusion is at `set.go:134-145`. context.md and
  research.md were updated to these refs (relevant to Phase 2.2's lifecycle/
  search content).
- No automated tests apply to this plan: it is a static Astro/MDX site with no
  application logic. Verification is `npm run build` + `npx astro check` + the
  MDX grep guards (no layout HTML, no CodeBlock); content accuracy is manual,
  captured in the test plan.
- Authoring shape for sections with inline-code subtitles is
  `<Section heading=…>` + `<Fragment slot="sub">` with blank lines around slot
  bodies (per `configuration.mdx`); prose bodies wrap in `<Prose>`.

### 2026-06-23 — Phase 2.1: Categories section

**What was done**: Filled the "The six categories" section of
`src/pages/knowledge-base.mdx`. Added a subtitle explaining that an entry's
category is fixed by the first segment of its path, a lead-in describing the two
retrieval tiers (always-applied vs looked-up), and a markdown table covering all
six categories in registry order with their tier, what goes in each, and what
belongs elsewhere (the boundary), plus a closing note on why the boundaries
matter.

**Deviations**: None. Content is grounded in
`../spektacular/internal/knowledge/category.go`; a sub-agent cross-checked every
category's purpose, boundary, and tier against the registry and confirmed an
exact match.

**Files changed**:
- `src/pages/knowledge-base.mdx`

**Discoveries**:
- Registry order in `category.go` is conventions, glossary, architecture,
  gotchas, learnings, decisions — the always-applied pair leads. The table
  follows this order rather than the spec's AC enumeration order.
- A markdown table renders cleanly inside `<Prose>` and trips none of the MDX
  guards (it is markdown, not layout HTML) — useful for the remaining
  reference-dense sections.

### 2026-06-23 — Phase 2.2: Lifecycle and configuration sections

**What was done**: Filled the "The lifecycle of an entry" and "Configuration"
sections of `src/pages/knowledge-base.mdx`. The lifecycle section covers
creating an entry (`knowledge write`, scope + path, raw-markdown storage at
`<location>/<category>/<name>.md`, category from the path's first segment),
searching/retrieving (`knowledge search` keyword ranking and excerpts, the
conventions/glossary search exclusion, `knowledge read`), and updating
(re-writing the same scope/path). The configuration section covers
`.spektacular/config.yaml`'s `knowledge.sources[]`, the default single `project`
source at `.spektacular/knowledge`, and the multi-source/scope model — with two
fenced YAML examples (single-source default and project/team/global).

**Deviations**: None. A sub-agent cross-checked every lifecycle and config claim
against `cmd/knowledge.go`, `internal/knowledge/set.go`, `internal/store/search.go`,
and `internal/config/config.go` — all matched. Used plain fenced code blocks (no
CodeBlock), consistent with the rest of the site.

**Files changed**:
- `src/pages/knowledge-base.mdx`

**Discoveries**:
- The byte-identity de-dup (SHA-256 over an entry's raw bytes) is the mechanism
  behind "rewriting the same text changes nothing." The page introduces it
  lightly here; Phase 3.1's rationale section is where the *why* (exact-byte vs
  fuzzy de-dup) belongs.
- The reusable project/team/global config YAML is in the tutorial at
  `getting-started.mdx:672-686`; relative `location` resolves against the
  project root, absolute and `~` paths are used as-is (`set.go:76-79`).

### 2026-06-23 — Phase 3.1: Rationale section, CTA, and final review

**What was done**: Filled the "Why it works this way" section of
`src/pages/knowledge-base.mdx` with five design rationales — knowledge as a
planning-time input (the plan is the contract), the single category registry as
source of truth, the two retrieval tiers with self-consistent re-tiering,
exact-byte de-duplication (and why lexical similarity is not semantic
similarity), and layered most-specific-wins source precedence. Confirmed the
closing `<CtaBanner>` → `<Button>` points readers to How it works, and performed
a full-page accuracy and clarity review.

**Deviations**: None. A sub-agent ran the final whole-page review: build and
guards green, every one of the spec's six acceptance criteria satisfied by a
visible section, and all five rationale claims verified against
`../spektacular/docs/knowledge-base.md`. The page is complete.

**Files changed**:
- `src/pages/knowledge-base.mdx`

**Discoveries**:
- The page now spans all six required topics across five `<Section>`s plus the
  CTA; total build output ~27 KB. No new components were introduced and no
  information-architecture changes were made, staying within the spec's
  documentation-only, match-the-existing-site constraints.
- Outstanding follow-up (out of scope here, noted in the plan): the stale
  `conventions/mdx-authoring.md` Rule 4 (CodeBlock) knowledge entry should be
  corrected via the `spek-knowledge` workflow — this page deliberately follows
  the live repo (plain fenced code), not that convention.

---
created_date: "2026-07-30"
status: completed
closed_date: "2026-07-30"
---

# Plan: 000009_document-artifact-metadata-and-historical-artifacts

<!-- Metadata -->
<!-- Created: 2026-07-30T08:36:55Z -->
<!-- Commit: 2886c50cb3cc13eb80647f8b34dd2eeb5dc293ed -->
<!-- Branch: main -->
<!-- Repository: git@github.com:jumppad-labs/spektacular-website.git -->

## Overview

The Spektacular docs site is missing coverage of two recent upstream product
changes: coding agents now treat written specs and plans as historical
records rather than descriptions of current behavior, and every spec, plan,
and changelog record now carries lifecycle metadata that can be queried
across the whole project. This plan closes both gaps with two small,
independent content edits to existing docs pages, no new page, so
prospective and existing users can find and understand both features from
the public site.

## Conventions

- **MDX authoring conventions (`conventions/mdx-authoring.md`)** — both
  edits touch `src/pages/*.mdx` directly, so all four rules apply: no layout
  HTML in page bodies, slot content over string props, blank lines
  before/after slot content, and fenced markdown code blocks (not JSX) for
  the new CLI command examples.
- **No em dashes (`conventions/no-em-dashes.md`)** — applies to all new
  prose authored in both edits.
- **Plans must sketch content structure, not just summarize it
  (`conventions/plan-content-pages.md`)** — applies to this plan's own
  Milestones & Phases section: each phase touching content includes a
  `**Content example**` block (smaller copy changes, not new pages) with
  concrete headings/prose shape, not only a summary.

## Architecture & Design Decisions

This plan makes two independent, minimal edits to existing pages rather than
introducing any new page, component, or cross-page linking. Each of the
spec's two feature areas gets exactly one change, placed where the site
already narrates the closest related concept, and each edit is a
self-contained diff that can be reviewed and reverted on its own.

The first edit appends a short prose paragraph to the existing `Fragment
slot="body"` inside `PipelineStage number="3"` ("Implement the Plan") on
`src/pages/how-it-works.mdx`. This covers the historical-treatment behavior
and its "why" exception (spec requirements 1-2). No new `PipelineStage`,
callout, or other component is introduced: the page models the pipeline as
three discrete input/step/output actions, and the historical-treatment
behavior is not a fourth discrete action but ongoing agent behavior once the
pipeline completes, so it belongs as trailing prose in the stage that already
introduces the changelog record, the artifact this new prose ties back to for
"why" answers. The prose reuses the site's own established pattern for this
theme, "the artifact becomes a fixed record and the agent turns to code
instead," already present in `knowledge-base.mdx`'s "Knowledge is a
planning-time input, not a runtime one" passage, and adopts the upstream
project's own terminology ("historical, archaeological record," "process
document, not product document") so the docs describe the feature the way
its own authors do.

The second edit touches `src/pages/configuration.mdx` in two parts: short
trailing sentences inside the existing `spec`, `plan`, and `changelog`
`ConfigKey` blocks noting that each record now carries lifecycle metadata
(spec requirement 3), and one new plain `Section` (not a `ConfigKey`)
inserted between the config-keys list and the page's existing "Example"
section, showing example `spektacular <artifact> file list` and `spektacular
artifacts list` invocations with the verified filter flags (spec requirement
4). `ConfigKey` is deliberately not reused for either addition: its
`name`/`type`/`defaultValue` props describe a YAML config schema key, and
neither the metadata fact nor the query commands are config keys, so forcing
them into that component would be a semantic mismatch. The query examples
stay to one or two commands per artifact type rather than a fuller worked
scenario, directly following the spec's Technical Approach guidance to prefer
short, example-driven prose over an exhaustive reference, and its Non-Goals
exclusion of a full CLI flag-by-flag reference.

Both edits deliberately avoid any new cross-page link between the
historical-treatment prose and the metadata/query prose, even though the two
features are related (metadata is what makes "when did this close" queryable
once an artifact goes historical). The two edits are independently reviewable
and the spec does not ask for that connective tissue; adding it would be
scope the plan chose not to take on. See
`research.md#alternatives-considered-and-rejected` for the rejected
alternatives (a new CLI-reference page, modeling either fact as a `ConfigKey`
variant, a fourth `PipelineStage`, and a new callout component), each with
its rejection rationale and citation.

## Component Breakdown

- **Historical-treatment passage (how-it-works.mdx).** Owns explaining that
  once a spec or plan is written, coding agents treat it as a historical
  record rather than a live description of current behavior, and owns the
  "why" exception where an agent still opens and cites a spec or plan for
  genuine past-intent questions. Appends to the existing "Implement the
  Plan" pipeline stage's prose; it is a pure content addition, no new
  component. Relationship to other pieces: stands alone as a narrative
  passage; it is not cross-linked to the metadata/query content below (per
  the chosen architecture), though it references the changelog record the
  same stage already introduces, since that record is what an agent
  actually cites when answering a "why" question.

- **Lifecycle-metadata notes (configuration.mdx, existing ConfigKey
  blocks).** Owns stating, once per artifact type, that spec/plan/changelog
  records carry a created date, a status, and a closed date. Reuses the
  existing `spec`, `plan`, and `changelog` `ConfigKey` blocks by adding a
  trailing sentence to each; introduces no new component. Relationship to
  other pieces: sits directly above the new query-commands section below,
  since the query flags only make sense once the reader knows the metadata
  exists.

- **Query-commands section (configuration.mdx, new `Section`).** Owns
  showing the reader how to filter/list artifacts by lifecycle metadata,
  covering both a single-artifact-type query and a cross-artifact-type
  query. Reuses the existing `Section` component (already used elsewhere on
  the same page for "Where configuration lives" and "Example") rather than
  introducing a new one; content is plain prose plus fenced `bash` code
  blocks, no new component. Relationship to other pieces: depends on the
  lifecycle-metadata notes above for context, and precedes the page's
  existing "Example" section in reading order.

No new Astro components, no new pages, and no changes to any non-content
code are introduced anywhere in this plan; every piece above is a content
addition to an existing page using existing components.

## Data Structures & Interfaces

No new data structures or interfaces are introduced by this plan. This is a
docs-only content update: it edits existing MDX prose and adds one instance
of an existing Astro component (`Section`) with plain markdown children on
`configuration.mdx`, and appends plain prose inside an existing `Fragment
slot="body"` on `how-it-works.mdx`. No new component props, no new frontmatter
schema, no new CLI surface, and no serialization boundary is introduced or
changed by this plan; the frontmatter schema and CLI flags referenced in the
new prose already exist upstream in the `spektacular` CLI itself (see
`research.md` for the verified field names, enum values, and flag names) and
are being documented, not built, here.

## Implementation Detail

This plan introduces no new code-shape patterns, no new module boundaries,
and no new abstractions. Both edits follow patterns the site already
establishes: content is authored as MDX prose and fenced code blocks inside
existing components' slots, never as new components or raw layout HTML.

The one piece of code-structure UX worth calling out is that the two edits
are governed by different existing conventions for how a fact becomes prose
versus how a fact becomes a labeled block. The historical-treatment content
is pure narrative prose appended inside an already-open slot, following the
pattern the site already uses when it wants to state a behavioral nuance in
plain language (a bolded lead-in sentence followed by explanatory prose,
already used elsewhere on the site for a structurally identical "artifact
becomes fixed, current truth comes from elsewhere" claim). The
lifecycle-metadata and query content, by contrast, is CLI-facing reference
information, so it follows the site's convention for that: a short factual
sentence attached to the specific config key it describes, plus a separate
`Section` for anything that needs a runnable example, with code always
fenced rather than inlined as a component prop. No new pattern is invented
for either; a developer reading the diff will recognize both shapes
immediately from the rest of the page they appear on.

Because neither edit adds a component, a prop, or a build step, there is no
new interface for a future contributor to learn: extending either passage
later (for example, adding a third example command, or a fourth requirement)
is a matter of editing prose and fenced blocks in place, not touching any
component contract.

## Dependencies

- **Upstream `spektacular` CLI (jumppad-labs/spektacular), already shipped.**
  Provides the actual lifecycle-metadata frontmatter schema, the status
  enum, and the `file list` / `artifacts list` filter flags this plan
  documents. Already released and stable as of this research; no change to
  it is required or in scope. This plan only describes behavior that
  already exists.

- **Existing site pages `src/pages/how-it-works.mdx` and
  `src/pages/configuration.mdx`.** Both must remain structurally as
  researched (same `PipelineStage`/`ConfigKey`/`Section` component usage)
  for the planned edits to land where intended. Neither needs to change
  ahead of this plan; the plan's own phases make the only needed changes to
  them.

- **Existing Astro components `PipelineStage`, `ConfigKey`,
  `ConfigurationKeys`, and `Section`.** Provide the slots/props this plan's
  content is written into. No component changes are needed; this plan is a
  pure consumer of their existing contracts.

- **Site build tooling (`astro build`, `astro check`,
  `astro-expressive-code`).** Used to verify the new MDX content compiles
  and renders; already configured project-wide, no setup needed.

- **Prior spec `000009_document-artifact-metadata-and-historical-artifacts`
  (this plan's own spec, already completed/closed).** Defines the scope,
  requirements, and constraints this plan implements. No other prior spec or
  plan in this repo overlaps or blocks this work (confirmed during
  discovery via `spektacular plan file list` / `spektacular spec file
  list`).

No dependency needs to land or change before this plan can start; everything
it depends on already exists in this repo or upstream.

## Testing Approach

This is a docs-only content change with no application logic, so there are
no unit or integration tests in the usual sense. Verification instead means
two things: a build/lint pass proving the MDX is well-formed and conforms to
the site's authoring conventions, and a manual editorial check that the
published prose actually says what the spec requires. Both are
straightforward given the small, self-contained scope of the two edits.

The build/lint pass is the load-bearing automated check: `npm run build`
(or `astro build`) must succeed with the new content in place, and `astro
check` must report zero errors and zero warnings, confirming the new
`Section` block and the appended `ConfigKey`/`PipelineStage` prose are
structurally valid MDX and satisfy Astro's type checking. Additionally, the
mdx-authoring convention's own CI guard (`grep -nE "<div|<section|class="
src/pages/*.mdx`) must continue to return zero matches after the edits,
confirming no layout HTML was introduced into either page body.

The spec's Success Metrics section states there are no metrics beyond its
own Acceptance Criteria, so each Acceptance Criterion is the thing to verify
directly:

- **Historical-treatment explanation is published** — Manual, captured in
  the implementation test plan: a reviewer reads the published
  `how-it-works.mdx` passage and confirms it states in plain prose that
  specs and plans are treated as records of past intent once written, and
  that current-behavior questions are answered from code.
- **"Why" exception is published** — Manual, captured in the implementation
  test plan: the same passage is checked to confirm it states that a coding
  agent still opens and references a spec or plan when asked about the
  reasoning or history behind a past decision.
- **Metadata explanation is published** — Manual, captured in the
  implementation test plan: a reviewer confirms the `configuration.mdx`
  edits state that specs, plans, and changelog records carry a creation
  date, a lifecycle status, and (once closed) a closed date.
- **Query/list instructions are published** — Manual, captured in the
  implementation test plan: a reviewer confirms the new `Section` shows at
  least one example command filtering a single artifact type by metadata,
  and at least one example querying across all artifact types at once
  (`spektacular artifacts list`), and that both commands use flags and
  syntax matching the verified upstream CLI (see `research.md`).

None of the four criteria are mechanically assertable (there is no
automated way to check that prose "states" something in plain language), so
all four are classified as manual checks rather than behavioural tests; the
build/lint pass above is the one fully automatable guarantee this plan
offers, and it is a necessary but not sufficient condition for the four
criteria, which still require an editorial read against the spec's exact
wording. This is a deliberate gap consistent with the nature of a docs
change, not an omission.

## Milestones & Phases

### Milestone 1: Readers learn that specs and plans become historical once written

**What changes**: A reader of the "How Spektacular Works" page now learns
that once a spec or plan has been written, coding agents treat it as a
historical record of past intent rather than a live description of what the
system does today, and that questions about current behavior are answered
by reading code instead. The same passage also tells readers that if they
genuinely want to know why something was built a certain way, the agent will
still open and reference the relevant spec, plan, or changelog entry. This
closes the gap between what the tool actually does today and what the
public docs currently say, for readers evaluating or already using
Spektacular who want to understand how their own specs and plans will be
treated once written.

#### - [x] Phase 1.1: Add historical-treatment prose to the pipeline narrative

Adds a short paragraph to the existing "Implement the Plan" stage on the
"How Spektacular Works" page, explaining that once a spec or plan is
written, coding agents treat it as a historical record of past intent
rather than a live description of current behavior, and that current-state
questions are answered from code instead. The same paragraph explains that
a coding agent still opens and cites a spec, plan, or changelog record when
a reader genuinely asks about the reasoning behind a past decision. No new
component or page is introduced; this is prose appended to an already-open
content slot.

*Technical detail:* [context.md#phase-11](./context.md#phase-11-add-historical-treatment-prose-to-the-pipeline-narrative)

**Content example**

Heading structure touched (existing, unchanged):

```
Pipeline
  Stage 1: Specification
  Stage 2: Generate the Plan
  Stage 3: Implement the Plan   <- new prose appended here
```

Illustrative example of the new paragraph's shape (wording illustrative, not
final copy):

```
**Once written, the spec and plan become a historical record, not a live
description.** Ask an agent how the system behaves today and it reads the
code, not the spec: specs and plans capture the intent and scope at the
time they were written, and the codebase moves on from there. Ask *why*
something was built a particular way, though, and the agent will still open
and cite the relevant spec, plan, or changelog record to explain the
original reasoning.
```

**Acceptance criteria**:

- [x] The "How Spektacular Works" page states, in plain prose, that specs
  and plans are treated as historical records of past intent once written,
  and that current-behavior questions are answered from code.
- [x] The same page states that a coding agent still opens and references a
  spec or plan when asked about the reasoning behind a past decision.
- [x] No new page, component, or layout HTML was introduced; the change is
  contained to prose inside the existing pipeline narrative.
- [x] The site builds and type-checks cleanly with the change in place.

### Milestone 2: Readers learn artifacts carry lifecycle metadata and how to query them

**What changes**: A reader of the "Configuration" page now learns that every
spec, plan, and changelog record automatically tracks when it was created,
its current status, and when it was closed, and sees runnable example
commands for filtering their own project's artifacts by that metadata,
including one command that queries across every artifact type at once. This
gives readers who already have a Spektacular project a concrete way to find
and filter their own project history, closing the second gap between
current tool behavior and current public docs.

#### - [x] Phase 2.1: Document lifecycle metadata and query commands on the Configuration page

Adds a short trailing sentence to each of the existing `spec`, `plan`, and
`changelog` configuration sections on the "Configuration" page, stating that
every record of that type carries a created date, a lifecycle status, and
(once closed) a closed date. Adds one new section, placed after the
existing configuration-keys list and before the page's existing worked
example, showing runnable example commands: filtering a single artifact
type's records by status or date, and querying across every artifact type
at once. No new page is introduced, and the new section reuses the same
component the page already uses for its other prose sections.

*Technical detail:* [context.md#phase-21](./context.md#phase-21-document-lifecycle-metadata-and-query-commands-on-the-configuration-page)

**Content example**

Heading/section structure after this phase (new section in bold):

```
Configuration
  Where configuration lives
  Top-level keys
    command
    agent
    spec_trigger_threshold
    debug
    spec        <- trailing metadata sentence added
    plan        <- trailing metadata sentence added
    changelog   <- trailing metadata sentence added
  **Querying artifacts by lifecycle metadata**   <- new section
  Example
```

Illustrative example of the trailing metadata sentence (added to each of the
`spec`, `plan`, `changelog` sections; wording illustrative):

```
Every spec record also carries lifecycle metadata: a created date, a
status, and, once resolved, a closed date, tracked automatically without
any extra configuration.
```

Illustrative example of the new section's content (command syntax must
match the verified upstream CLI, not be invented at implementation time):

```
## Querying artifacts by lifecycle metadata

Every spec, plan, and changelog record carries a created date, a status,
and (once resolved) a closed date. Filter any `file list` command by them:

'''bash
spektacular spec file list --status completed --created-after 2026-01-01
spektacular changelog file list --closed-after 2026-01-01 --closed-before 2026-06-01
'''

To query across specs, plans, and changelog records at once, use the
top-level `artifacts` command:

'''bash
spektacular artifacts list --kind spec,plan.plan,changelog --status completed
'''
```

(Triple-quote fences shown as `'''` above only to avoid breaking this plan
document's own markdown; the implemented page uses standard triple-backtick
fences per the mdx-authoring convention.)

**Acceptance criteria**:

- [x] The "Configuration" page states, for each of the `spec`, `plan`, and
  `changelog` sections, that records of that type carry a created date, a
  lifecycle status, and a closed date.
- [x] The page shows at least one example command filtering a single
  artifact type's records by created date, status, or closed date.
- [x] The page shows at least one example command querying across all
  artifact types at once.
- [x] Every example command's flag names and syntax match the verified
  upstream CLI (`--status`, `--created-after`, `--created-before`,
  `--closed-after`, `--closed-before`, and the top-level `artifacts list`
  command).
- [x] No new top-level page was introduced; the new section is reached from
  the existing Configuration page.
- [x] The site builds and type-checks cleanly with the change in place.

These two milestones are independently deliverable and do not depend on each
other landing in any particular order; they are presented in spec
Requirements order (1-2, then 3-4) for narrative clarity only.

## Open Questions

None. Every fact this plan depends on was verified directly against source
during discovery: the exact frontmatter field names and status enum, the
exact CLI flag names and command forms, the exact insertion points and
component shapes on both target pages, and the project's own preferred
terminology for the historical-artifacts feature. There is no downstream
system to exercise, no hidden runtime behavior to discover, and no
ambiguity that only surfaces once implementation begins. Both phases are
small, self-contained content edits with everything needed to write final
copy already captured in `research.md` and this plan's phase detail.

## Out of Scope

- **Documenting other changelog entries beyond these two features.** The
  spec's Non-Goals section scopes this plan to only the two most recent
  upstream items (artifact metadata, historical artifacts); no other
  changelog entry is touched. Any future changelog item that needs public
  documentation is a separate spec.
- **A full CLI flag-by-flag reference page for every Spektacular command.**
  The spec's Non-Goals section excludes this; this plan documents only the
  flags introduced by the two features in scope, as short example-driven
  prose, not an exhaustive reference. A comprehensive CLI reference page,
  if ever wanted, would be its own spec and plan (and would itself require
  revisiting the "no new top-level page" constraint from this spec).
- **Changes to this repository's own `AGENTS.md` historical-artifacts
  policy section.** The spec's Non-Goals section explicitly excludes this;
  that section is agent behavior configuration, already in place, and
  unrelated to the public-facing docs this plan changes.
- **Cross-linking the two new docs passages to each other.** Considered and
  rejected during the architecture step (Option B): a reader on
  `how-it-works.mdx` is not pointed to `configuration.mdx`'s metadata/query
  content, or vice versa. The user chose the simpler two-independent-edits
  approach (Option A); adding cross-links later is a small, low-risk
  follow-up if a future editorial pass wants it, but is not part of this
  plan.
- **A richer, tutorial-style worked example for the query commands.**
  Considered and rejected during the architecture step (Option C): the new
  `configuration.mdx` section stays to one or two example commands per
  scenario (single-artifact-type, cross-artifact-type) rather than a
  chained multi-command walkthrough, directly following the spec's
  Technical Approach guidance to prefer short, example-driven prose over an
  exhaustive treatment.

## Changelog

### 2026-07-30 — Phase 1.1: Add historical-treatment prose to the pipeline narrative

**What was done**: Appended a new paragraph to `PipelineStage number="3"`'s
body Fragment on `how-it-works.mdx`, explaining that once a spec or plan is
written, coding agents treat it as a historical, archaeological record
rather than a live description of current behavior, and that a coding agent
still opens and cites a spec, plan, or changelog record when asked about the
reasoning behind a past decision.

**Deviations**: None.

**Files changed**:
- `src/pages/how-it-works.mdx`

**Discoveries**: None; the existing `Fragment slot="body"` insertion point
matched the plan exactly, no drift.

### 2026-07-30 — Phase 2.1: Document lifecycle metadata and query commands on the Configuration page

**What was done**: Added a trailing lifecycle-metadata sentence to each of
the `spec`, `plan`, and `changelog` `ConfigKey` blocks on
`configuration.mdx`, and inserted a new `Section` ("Querying artifacts by
lifecycle metadata") between the `ConfigurationKeys` block and the existing
"Example" section, with two fenced bash examples: a single-artifact-type
query (`spec file list` / `changelog file list` with `--status`,
`--created-after`, `--closed-after`, `--closed-before`) and a
cross-artifact-type query (`artifacts list --kind ... --status`).

**Deviations**: None.

**Files changed**:
- `src/pages/configuration.mdx`

**Discoveries**: None; all CLI flag names and command forms were
re-verified directly against the upstream `spektacular` Go source
(`cmd/artifacts.go`, `cmd/storefile.go`, `internal/metadata/metadata.go`)
and matched the plan/context exactly.

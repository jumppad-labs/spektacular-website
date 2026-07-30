---
created_date: "2026-07-30"
status: completed
closed_date: "2026-07-30"
---

# 000009_document-artifact-metadata-and-historical-artifacts

## What was built

The public Spektacular docs site now documents two upstream product
behaviors that previously weren't reflected anywhere on the site:

- **`src/pages/how-it-works.mdx`** — the "Implement the Plan" pipeline
  stage's body prose gained a new paragraph explaining that once a spec or
  plan is written, coding agents treat it as a historical, archaeological
  record of past intent rather than a live description of current system
  behavior: an agent asked how the system works today reads the code, not
  the spec. The same paragraph states the exception: if a reader genuinely
  asks *why* something was built a particular way, the agent still opens
  and cites the relevant spec, plan, or changelog record to explain the
  original reasoning.

- **`src/pages/configuration.mdx`** — the existing `spec`, `plan`, and
  `changelog` `ConfigKey` blocks each gained a trailing sentence stating
  that records of that type carry lifecycle metadata: a created date, a
  status, and, once resolved, a closed date, tracked automatically with no
  extra configuration. A new `Section`, "Querying artifacts by lifecycle
  metadata," was inserted between the existing configuration-keys list and
  the page's "Example" section, showing a single-artifact-type example
  (`spektacular spec file list` / `spektacular changelog file list` with
  `--status`, `--created-after`, `--created-before`, `--closed-after`,
  `--closed-before`) and a cross-artifact-type example (`spektacular
  artifacts list --kind ... --status ...`).

Both edits are pure content additions to existing pages, reusing existing
Astro components (`PipelineStage`'s existing `Fragment slot="body"`,
`ConfigKey`, and `Section`); no new page, component, or non-content code was
introduced anywhere in this feature.

## Why it matters

Two recent upstream `spektacular` CLI changes had shipped without any
corresponding public documentation: coding agents now treat written specs
and plans as historical records rather than descriptions of current
behavior once implementation lands, and every spec, plan, and changelog
record now carries queryable lifecycle metadata. Prospective and existing
users evaluating or already using Spektacular had no way to learn either
behavior from the public site. This closes both gaps: readers now
understand how their own specs and plans will be treated once written, and
users with an existing Spektacular project have concrete, copy-pasteable
commands for finding and filtering their own project history by creation
date, status, or closed date, across a single artifact type or across
specs, plans, and changelog entries all at once.

## Deviations from the plan

None. Both phases (1.1 and 2.1) implemented exactly as planned:

- The exact insertion points (`how-it-works.mdx`'s `PipelineStage
  number="3"` body Fragment; `configuration.mdx`'s `spec`/`plan`/`changelog`
  `ConfigKey` blocks and the gap before the "Example" section) matched the
  plan's file:line references with no drift.
- All CLI facts (frontmatter keys, status enum values, filter flag names,
  the `artifacts list --kind` command form) were re-verified directly
  against the upstream `spektacular` Go source during implementation and
  matched the plan's research exactly.
- `npm run build` and `npx astro check` both passed cleanly (0 errors, 0
  warnings) on the first attempt for both edited files.

One process note, not a content deviation: this plan's own frontmatter
(and its spec's) carried a stale `status: completed` / `closed_date`
dated today, even though neither edit existed in the working tree at the
start of this implement run. The user confirmed treating this as
incorrect/stale metadata and proceeding with implementation, which is
reflected in this record.

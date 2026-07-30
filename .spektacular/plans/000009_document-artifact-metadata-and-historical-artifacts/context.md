---
created_date: "2026-07-30"
status: completed
closed_date: "2026-07-30"
---

# Context: 000009_document-artifact-metadata-and-historical-artifacts

## Current State Analysis

`src/pages/how-it-works.mdx:1-306` models the Spektacular pipeline as three
`PipelineStage` blocks (Specification, Generate the Plan, Implement the
Plan; lines 216-296) inside a `Pipeline multi` section (lines 210-298). Each
stage renders an input/step/output node diagram plus an optional `Fragment
slot="body"` prose block (only rendered if present,
`PipelineStage.astro:17-23`). Stage 3, "Implement the Plan"
(`how-it-works.mdx:273-296`), already ends its body prose by introducing the
changelog record written at the end of `implement` (lines 291-292) but says
nothing about specs/plans becoming historical once implementation lands.
There is no callout/aside component anywhere on this page; nuanced behavior
is handled as plain prose in the body slot (e.g. the spec-trigger-threshold
note at lines 230-235).

`src/pages/configuration.mdx:1-183` documents `.spektacular/config.yaml`
keys via a `ConfigurationKeys` section (lines 31-129) containing 8 sibling
`ConfigKey` blocks, including `spec` (78-89), `plan` (91-99), and `changelog`
(101-113). `ConfigKey.astro:2-22` takes `name`/`type?`/`defaultValue?` props
(the latter rendered via `set:html`) plus a default slot for body prose.
`changelog`'s block (109-111) already carries a trailing explanatory
paragraph after its bullet list, the only one of the three with this shape,
and the closest existing precedent for adding one. The page has zero
`bash`-fenced code blocks today (only one `yaml` block, lines 140-174,
inside the existing "Example" section, lines 131-176) even though CLI
examples elsewhere on the site (`install.mdx`, `knowledge-base.mdx`,
`how-it-works.mdx`) already use `bash`-fenced blocks as the established
site-wide convention.

The actual lifecycle-metadata and CLI-query features being documented live
entirely upstream, in `/home/nicj/code/github.com/jumppad-labs/spektacular`
(a sibling repo, NOT this one). This repo (`spektacular-website`) only
contains the public marketing/docs site; no code in this repo implements
metadata or historical-artifacts behavior; this plan only adds prose
describing that upstream behavior.

## Project References

- MDX authoring conventions, no-em-dashes, and plan-content-pages
  conventions are always-applied project knowledge, loaded via `spektacular
  knowledge always-applied`; no knowledge-base search hits existed for
  "docs mdx site structure" or "cli commands artifacts metadata" specific
  to this feature, so all CLI facts below were verified directly against
  upstream source rather than an existing knowledge entry.
- Upstream feature source of truth:
  `/home/nicj/code/github.com/jumppad-labs/spektacular` (Go CLI source),
  specifically `internal/metadata/` (frontmatter schema) and `cmd/` (CLI
  flag registration). This is a different repository from the one this plan
  edits; do not confuse its `.spektacular/` directory (that project's own
  specs/plans/changelog) with this repo's `.spektacular/`.
- Upstream `CHANGELOG.md:1-7` and that repo's own
  `.spektacular/changelog/000037_spec_plan_historical_artifacts.md` /
  `000038_artifact_metadata.md` provide prose framing and terminology, but
  per that repo's own historical-artifacts policy, treat them as historical
  artifacts, not live specs; every hard fact used in this plan's phases was
  cross-verified against the actual Go source, not taken from the changelog
  prose alone.

## Per-Phase Technical Notes

### Phase 1.1: Add historical-treatment prose to the pipeline narrative

- `src/pages/how-it-works.mdx:281-294` — inside the existing
  `PipelineStage number="3" heading="Implement the Plan"` block's `Fragment
  slot="body"`, append a new paragraph after the existing paragraph (which
  ends at line 292, "...writes a changelog record of what shipped, why, and
  how it differed from the plan to `.spektacular/changelog/`."), before the
  closing `</Fragment>` at line 294. Insert a blank line between the
  existing paragraph and the new one (markdown paragraph spacing, matches
  mdx-authoring Rule 3's blank-line convention applied to prose).
- No other file requires a change for this phase. `PipelineStage.astro`
  (lines 17-23) already renders `Fragment slot="body"` as arbitrary prose,
  so no component change is needed.
- Wording guidance (final copy, not the plan's illustrative placeholder):
  use the project's own terminology verified during discovery —
  "historical, archaeological record" and, if it fits naturally, "process
  document, not product document" (source:
  `/home/nicj/code/github.com/jumppad-labs/spektacular/templates/agents/historical-artifacts.md:1,7-14`
  and
  `/home/nicj/code/github.com/jumppad-labs/spektacular/.spektacular/changelog/000037_spec_plan_historical_artifacts.md:12`,
  the latter explicitly earmarked upstream for future website docs). Match
  the site's existing rhetorical pattern for this theme at
  `src/pages/knowledge-base.mdx:212-218` (bold lead-in sentence, then
  explanatory prose). No em dashes (`conventions/no-em-dashes.md`).

**Complexity**: Low
**Token estimate**: ~5k
**Agent strategy**: Single agent, sequential execution. Read the target file
section, draft and insert one paragraph, run build/check.

### Phase 2.1: Document lifecycle metadata and query commands on the Configuration page

- `src/pages/configuration.mdx:78-89` (`ConfigKey name="spec"`) — append a
  trailing sentence inside the slot, after the existing bullet list (after
  line 88, before the closing `</ConfigKey>` at line 89), stating specs
  carry lifecycle metadata.
- `src/pages/configuration.mdx:91-99` (`ConfigKey name="plan"`) — same
  treatment, appended after line 98, before the closing `</ConfigKey>` at
  line 99.
- `src/pages/configuration.mdx:101-113` (`ConfigKey name="changelog"`) —
  same fact, but this block already has a trailing paragraph (lines
  109-111) describing the changelog's automatic-write behavior; add the
  metadata sentence as a continuation of that existing paragraph or as an
  immediately following second paragraph (implementer's call, both keep the
  block's existing shape), before the closing `</ConfigKey>` at line 113.
- `src/pages/configuration.mdx:129-131` — insert a new `<Section
  heading="Querying artifacts by lifecycle metadata">...</Section>` block
  between the end of the `ConfigurationKeys` block (closing tag at line
  129) and the start of the existing `<Section heading="Example">` block
  (opening tag at line 131). Follow the `Section` component's existing
  dual `sub` prop-or-slot shape (`src/components/sections/Section.astro`,
  confirmed during discovery) using a `Fragment slot="sub"` for the
  lead-in sentence since it will contain inline code. Body content is two
  fenced ` ```bash ` blocks per mdx-authoring Rule 4, with blank lines
  before/after per Rule 3. Exact commands and flags (verified against
  `/home/nicj/code/github.com/jumppad-labs/spektacular` source during
  discovery, not to be re-derived or guessed at implementation time):
  - Single-artifact-type query, using `--status`, `--created-after`,
    `--created-before`, `--closed-after`, or `--closed-before` on
    `spektacular spec file list`, `spektacular plan file list`, or
    `spektacular changelog file list` (command form is `<artifact> file
    list [path] [flags]`, NOT `<artifact> list`; flags confirmed at
    `cmd/storefile.go:258-262` in the spektacular repo).
  - Cross-artifact-type query using the top-level `spektacular artifacts
    list` command with `--kind` (comma-separated values from: `spec`,
    `plan.plan`, `plan.context`, `plan.research`, `plan.test-plan`,
    `changelog`) plus the same five metadata flags (confirmed at
    `cmd/artifacts.go:20-27,50,64,99-107` in the spektacular repo).
  - Status enum values usable in examples: `in-progress`, `completed`,
    `superseded`, `archived` (confirmed at
    `internal/metadata/metadata.go:19-31` in the spektacular repo). Date
    format is strictly `YYYY-MM-DD`.

**Complexity**: Medium
**Token estimate**: ~12k
**Agent strategy**: The four insertion points are independent (each
`ConfigKey` sentence and the new `Section` do not depend on each other's
exact wording), so 2-3 parallel agents could split "write metadata sentences
for spec/plan/changelog ConfigKeys" from "write the new Querying section,"
then a single sequential pass reconciles them into one diff of the same file
to avoid conflicting edits to `configuration.mdx`. Given the small overall
size (~12k tokens), a single sequential agent is also entirely reasonable;
parallelizing is an optional optimization, not a requirement.

## Testing Strategy

Phase 1.1: no automated assertion possible for prose content; verify via
`npm run build` / `astro check` (zero errors/warnings) plus a manual read
confirming the paragraph states both the historical-treatment fact and the
"why" exception, phrased using the project's preferred terminology, with no
em dashes and no layout HTML introduced (grep guard: `grep -nE "<div|
<section|class=" src/pages/how-it-works.mdx` returns zero matches).

Phase 2.1: same build/check pass, plus a manual read confirming: each of the
three `ConfigKey` blocks states the metadata fact; the new `Section` shows
at least one single-artifact-type example and one cross-artifact-type
example; every flag name and command form in the examples exactly matches
the verified upstream CLI syntax in this document's Per-Phase Technical
Notes above (not re-derived or guessed); no layout HTML was introduced
(same grep guard, run against `src/pages/configuration.mdx`).

Across both phases, the build/lint pass is the only fully automated
guarantee; the four spec Acceptance Criteria are manual checks captured in
the implement workflow's test plan, since there is no mechanical way to
assert that MDX prose "states" a given fact in plain language.

## Token Management Strategy

| Tier | Token Budget | Agent Strategy |
|------|-------------|----------------|
| Low | ~10k | Single agent, sequential |
| Medium | ~25k | 2-3 parallel agents |
| High | ~50k+ | Parallel analysis, sequential integration |

Phase 1.1 (~5k) fits comfortably within the Low tier as a single sequential
agent. Phase 2.1 (~12k) fits within the Medium tier; splitting the three
`ConfigKey` sentences from the new `Section` across 2-3 parallel agents is
optional given the phase's small absolute size, not required to stay within
budget.

## Migration Notes

None. This plan changes only static docs content; there is no data
migration, no schema change, and no existing content is removed or
restructured, only appended to.

## Performance Considerations

None. Static MDX content addition has no runtime performance implication;
page build time impact is negligible (one new `Section` instance, a few
sentences of prose, two fenced code blocks).

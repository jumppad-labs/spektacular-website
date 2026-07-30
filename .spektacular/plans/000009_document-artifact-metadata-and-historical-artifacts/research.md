---
created_date: "2026-07-30"
status: completed
closed_date: "2026-07-30"
---

# Research: 000009_document-artifact-metadata-and-historical-artifacts

## Alternatives considered and rejected

- **New dedicated CLI-reference page for query/list flags.** Rejected: spec's
  Constraints section forbids any new top-level docs page. No further
  consideration needed.
- **Model lifecycle-metadata fact as a new `ConfigKey` block** (e.g.
  `name="metadata"`). Rejected: `ConfigKey`'s `name`/`type`/`defaultValue`
  props map directly to a YAML config schema key (`ConfigKey.astro:2-9`,
  `src/pages/configuration.mdx`); lifecycle metadata isn't a config key at
  all, it's a fact about document frontmatter, and query flags are CLI
  behavior, not config. Reusing `ConfigKey` for either would be a semantic
  mismatch with no existing "non-config-key" variant of the component.
- **Add a 4th `PipelineStage` to `how-it-works.mdx`'s "The pipeline" section**
  for "artifacts become historical." Rejected: the page models exactly three
  discrete pipeline actions (spec, plan, implement), each an
  input/step/output diagram (`PipelineNode`/`PipelineConnector`). The
  historical-treatment behavior is not a discrete action with inputs/outputs,
  it's ongoing agent behavior after the pipeline completes, so forcing it
  into the `PipelineStage` visual model would misrepresent it as a new step.
- **New callout/aside component** for the historical-treatment prose.
  Rejected: no callout/aside component exists anywhere on `how-it-works.mdx`
  today (confirmed by import list, `how-it-works.mdx:6-18`); the page's own
  precedent for nuanced behavioral asides (e.g. the spec-trigger-threshold
  note, lines 230-235) is plain prose inside the existing `Fragment
  slot="body"`, not a new visual container. Introducing one here would be
  inconsistent with the page's established style.
- **Cross-linking the two new docs passages to each other** (Option B during
  the architecture step). Rejected in favor of two fully independent edits
  (Option A, chosen by the user); adding cross-links between
  `how-it-works.mdx` and `configuration.mdx` remains a small, low-risk
  follow-up if wanted later, but is out of scope for this plan.
- **A richer, tutorial-style worked example for the query commands**
  (Option C during the architecture step). Rejected in favor of one or two
  example commands per scenario, directly following the spec's Technical
  Approach guidance to prefer short, example-driven prose over an exhaustive
  reference.

## Chosen approach — evidence

**Requirements 1-2 (historical-treatment + "why" exception) → `src/pages/how-it-works.mdx`, inside `PipelineStage number="3"`'s existing `Fragment slot="body"` (lines 281-294), appended after the existing paragraph (after line 292, before the closing `</Fragment>` at 294).**

- `how-it-works.mdx:273-296` is "Implement the Plan," the last of the three
  `PipelineStage` blocks, and its body prose already ends by introducing the
  changelog artifact ("writes a changelog record of what shipped, why, and
  how it differed from the plan," lines 291-292), the same artifact that
  answers "why" questions once specs/plans go historical. Appending here
  reads naturally as "what happens once implementation is done."
- `PipelineStage.astro:17-23` renders `Fragment slot="body"` only if
  `Astro.slots.has("body")`, styled `max-w-[70ch] text-left
  text-[0.9375rem] text-text-secondary`, plain markdown prose fits this
  directly, no new component needed.
- Established rhetorical precedent for "artifact X is a fixed record now,
  not a live source; current truth comes from Y instead" already exists at
  `src/pages/knowledge-base.mdx:212-218` (bold lead-in + explanatory
  paragraph pattern): *"**Knowledge is a planning-time input, not a runtime
  one.** ... the plan, not a live lookup, is the contract the implementation
  is held to."* Reusing this pattern keeps site-wide tone consistent.
- Project's own preferred terminology for this exact feature (per
  `/home/nicj/code/github.com/jumppad-labs/spektacular/templates/agents/historical-artifacts.md:1,7-14`
  and echoed in that repo's `.spektacular/changelog/000037_spec_plan_historical_artifacts.md:12`):
  "historical, archaeological record" and "process document, not product
  document", the changelog entry explicitly flags the latter phrase as
  intended for future website documentation, so both should appear in the
  new prose.
- Constraint check: no new top-level page, appends to an existing page only.
  Satisfies spec Constraints section.

**Requirements 3-4 (lifecycle metadata + query/list commands) → `src/pages/configuration.mdx`, two-part change:**

1. **Metadata fact**: trailing prose paragraph inside each of the existing
   `spec`, `plan`, `changelog` `ConfigKey` blocks (`configuration.mdx:78-89`,
   `91-99`, `101-113`), following the exact precedent already set inside the
   `changelog` block itself (lines 109-111, an explanatory paragraph after
   the bullet list). This keeps the fact attached to the specific artifact
   type it describes and matches Rule 2 (native MDX prose in the default
   slot).
2. **Query/list commands**: new plain `Section` component (not
   `ConfigurationKeys`/`ConfigKey`, since this is CLI usage, not a config
   key) inserted between the end of the `ConfigurationKeys` block (line 129)
   and the start of the "Example" `Section` (line 131). Uses fenced
   ` ```bash ` blocks per mdx-authoring Rule 4, matching the site-wide CLI
   example convention already used at `install.mdx:35,45,66,75,84,93`,
   `knowledge-base.mdx:103,122`, `how-it-works.mdx:36,52,68,88,100`.
   `configuration.mdx` itself currently has zero `bash` fenced blocks
   (confirmed via grep, only one `yaml` block at lines 140-174), so this
   introduces the pattern to this page for the first time but not to the
   site.

Verified exact CLI facts (source: `/home/nicj/code/github.com/jumppad-labs/spektacular`, NOT this repo):

- Frontmatter YAML keys: `created_date`, `status`, `closed_date`
  (`internal/metadata/metadata.go:39-52`). `closed_date` is `omitempty`,
  only present once a document leaves `in-progress`
  (`internal/metadata/merge.go:16-82`). Date format is strictly `YYYY-MM-DD`
  (Go layout `2006-01-02`, `internal/metadata/metadata.go:33`).
- Status enum, exactly 4 values: `in-progress`, `completed`, `superseded`,
  `archived` (`internal/metadata/metadata.go:19-31`). Only `in-progress` is
  "open"; the other three are "closed" (`isClosed`,
  `internal/metadata/metadata.go:103-105`).
- Filter flags on `spec file list` / `plan file list` / `changelog file
  list` (all three are the same generic command builder,
  `cmd/storefile.go:100`, wired at `cmd/spec.go:72`, `cmd/plan.go:39`,
  `cmd/changelog.go:6`): exactly `--status`, `--created-after`,
  `--created-before`, `--closed-after`, `--closed-before`
  (`cmd/storefile.go:258-262`). **Command form is `spektacular <artifact>
  file list [path] [flags]`**, confirmed via `Use: "file"`
  (`cmd/storefile.go:111`) nesting `Use: "list [path]"`
  (`cmd/storefile.go:203`). Not `spektacular <artifact> list` (no such
  shorthand exists).
- Cross-artifact query command: `spektacular artifacts list`
  (`cmd/artifacts.go:50,64`, registered top-level at `cmd/root.go:243`).
  Flags: `--kind` (comma-separated: `spec`, `plan.plan`, `plan.context`,
  `plan.research`, `plan.test-plan`, `changelog`, `cmd/artifacts.go:20-27`)
  plus the same five metadata filters. Output envelope: `{"artifacts":
  [...]}`, each entry carrying a `kind` discriminant plus `name`, `path`,
  `created_date`, `status`, `closed_date` (`cmd/artifacts.go:99,151-181`).
- Both changes are documented upstream in
  `/home/nicj/code/github.com/jumppad-labs/spektacular/CHANGELOG.md:1-7`
  (000038_artifact_metadata, 000037_spec_plan_historical_artifacts) and in
  full per-feature changelog artifacts under that repo's own
  `.spektacular/changelog/`, useful for prose phrasing, but those files are
  that repo's historical artifacts, cross-verify any quoted claim against
  the source citations above rather than trusting the changelog prose
  alone.

## Files examined

- `src/pages/how-it-works.mdx:1-306` — full page; pipeline stage structure,
  `PipelineStage number="3"` body fragment (lines 273-296) is the insertion
  point.
- `src/components/sections/PipelineStage.astro:1-23` — confirms `Fragment
  slot="body"` is plain prose, optional, styled independently of node
  diagram.
- `src/pages/knowledge-base.mdx:212-218,27-31` — precedent phrasing pattern
  for "artifact is a fixed record, not live" theme.
- `src/pages/configuration.mdx:1-183` — full page; `ConfigurationKeys`
  section (31-129) containing `spec` (78-89), `plan` (91-99), `changelog`
  (101-113) `ConfigKey` blocks; "Example" `Section` (131-176) with the
  page's only existing fenced block (yaml, 140-174).
- `src/components/sections/ConfigKey.astro:2-22` — prop shape (`name`,
  `type?`, `defaultValue?`), default slot for body prose, `defaultValue`
  rendered via `set:html` per mdx-authoring Rule 2 exception for short
  single-`<code>` strings.
- `src/components/sections/ConfigurationKeys.astro:1-28` and
  `src/components/sections/Section.astro:1-32` — wrapping section
  components; `Section` is the generic one to reuse for the new query/list
  content (heading + sub slot/prop + default slot), matching how "Where
  configuration lives" and "Example" are built on the same page.
- `.claude/knowledge/conventions/mdx-authoring.md` (via `spektacular
  knowledge always-applied`) — the four MDX authoring rules (no layout
  HTML, slot-over-string-prop, blank lines around slots, fenced code via
  astro-expressive-code) that every edit here must follow.
- `.claude/knowledge/conventions/plan-content-pages.md` (via `spektacular
  knowledge always-applied`) — binding on this plan's own Phases section:
  any phase touching a content page must include a `**Content outline**` or
  `**Content example**` block with concrete headings and illustrative
  examples, not just a prose summary.
- `.claude/knowledge/conventions/no-em-dashes.md` — no em dashes in any
  authored prose, including the new docs copy.
- `/home/nicj/code/github.com/jumppad-labs/spektacular/internal/metadata/metadata.go:19-52,93-105`
  — frontmatter struct, status enum, date format, validation.
- `/home/nicj/code/github.com/jumppad-labs/spektacular/internal/metadata/merge.go:16-82`
  — created/closed date stamping semantics (used only for background
  understanding, not directly quoted in docs).
- `/home/nicj/code/github.com/jumppad-labs/spektacular/cmd/artifactfilter.go:16-105`
  — shared filter struct/matching/parsing logic behind the five flags.
- `/home/nicj/code/github.com/jumppad-labs/spektacular/cmd/storefile.go:100-262`
  — generic `file list` command builder and exact flag registration; command
  path confirmed as `<artifact> file list`, not `<artifact> list`.
- `/home/nicj/code/github.com/jumppad-labs/spektacular/cmd/artifacts.go:20-27,50,64,99-107,151-181`
  — top-level `artifacts list` command, `--kind` values, output shape.
- `/home/nicj/code/github.com/jumppad-labs/spektacular/cmd/root.go:243` —
  confirms `artifacts` is registered as a top-level command.
- `/home/nicj/code/github.com/jumppad-labs/spektacular/templates/agents/historical-artifacts.md:1,7-14,25-40`
  — canonical policy language/terminology to echo in public docs
  ("historical, archaeological record", the archaeology-question exception,
  the owning-workflow exception). This is the same template this repo's own
  `AGENTS.md` was generated from.
- `/home/nicj/code/github.com/jumppad-labs/spektacular/.spektacular/changelog/000037_spec_plan_historical_artifacts.md:12`
  — source of the "process document, not product document" phrase,
  explicitly flagged there as intended for future website documentation.
- `/home/nicj/code/github.com/jumppad-labs/spektacular/.spektacular/changelog/000038_artifact_metadata.md:11-20,37-46`
  — confirms pre-existing artifacts are not backfilled with metadata (byte-
  identical, no migration), a nuance worth a short caveat in docs prose if
  space allows, though not a spec requirement.

## External references

None. This is a self-contained internal docs task; no external library or
API documentation was consulted.

## Prior plans / specs consulted

- Spec `000009_document-artifact-metadata-and-historical-artifacts.md`
  (this plan's own spec) — source of truth for scope; already summarized in
  `.spektacular/context.md`. Not re-summarized here to avoid duplication.
- `spektacular plan file list` and `spektacular spec file list` were run to
  confirm no other in-progress or completed spec/plan overlaps this one's
  scope, none found; this is a standalone docs update with no dependency on
  other in-flight work in this repo.

## Open assumptions

- **Assumed**: the `spektacular` binary/CLI name shown in doc examples
  should be `spektacular` (matching every existing CLI example already on
  this site, e.g. `install.mdx`), not `go run .` or another dev-invocation
  form. Low risk, high confidence, consistent with every existing example on
  the site.
- **Assumed**: exact example values in fenced code blocks (dates, status
  strings) are illustrative and do not need to reference any real date from
  this session. If wrong, the implement workflow should flag it, but this is
  standard practice for docs examples elsewhere on the site (e.g.
  `configuration.mdx`'s existing yaml example uses placeholder-style values).
- **Not yet verified, should be checked during implement**: whether
  `astro check` or the site's build step enforces any MDX linting that would
  reject a `Fragment slot="sub"` combined with a `Section` default slot in
  the exact structure proposed for the new configuration.mdx block, the
  pattern is modeled directly on existing usage elsewhere on the page
  (`ConfigurationKeys`/`Section` dual `sub` prop-or-slot shape,
  `mdx-authoring.md` Rule 2), so this is expected to work, but was not
  build-tested during research. If the build fails, this is a fixable
  authoring detail, not a scope question, do not stop and ask the user,
  just fix and rebuild.

## Rehydration cues

- Re-read `.claude/knowledge/conventions/mdx-authoring.md` and
  `.claude/knowledge/conventions/plan-content-pages.md` before writing the
  Phases section of `plan.md`, both are binding on how phases in this plan
  must be written (content skeletons with concrete headings + illustrative
  examples, not summaries; MDX rules for the actual edits).
- Re-read `src/pages/how-it-works.mdx:273-296` and
  `src/pages/configuration.mdx:78-129` directly before drafting phase
  content skeletons, line numbers above are current as of this research
  session but may drift if the pages change before implementation.
- If resuming cold, `spektacular knowledge always-applied` re-loads the four
  MDX rules, the no-em-dashes rule, and the plan-content-pages rule in one
  call; no further knowledge search is needed for this plan; the CLI facts
  above are the full set required and do not need re-verification unless
  the upstream `spektacular` source has changed since this research.

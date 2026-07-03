# Context: 000008_debugging-docs

## Current State Analysis

- `src/components/Nav.astro:1-52` — flat nav array, active-link logic,
  no submenu/dropdown concept exists anywhere in the component tree.
  `items` is built at `Nav.astro:2-10` as `{label, href}[]`; `isActive`
  at `Nav.astro:14-15` does `pathname === href || (href !== "/" &&
  pathname.startsWith(href))`; render block at `Nav.astro:21-35` maps
  `items` to flat `<li><a>` entries.
- `src/pages/plugins.mdx:1-88` — current Plugins page; card/grid-style
  (`FeaturesGrid`, `PluginInventory`, `Plugin`), links to Extending via
  `CtaBanner`. Route (`/plugins/`) and content unchanged by this plan.
- `src/pages/extending.mdx:1-157` — current Extending page; prose-style
  via `Prose`, the direct structural model for the new Debugging page.
  Route (`/extending/`) and content unchanged by this plan.
- `src/pages/configuration.mdx:1-149` — documents `debug.enabled` today
  in one terse, **inaccurate** `ConfigKey` entry at lines 56-61: current
  text is `"Debug logging. Set `debug.enabled: true` to surface verbose
  internal logs to the console — useful when reporting issues or
  developing a new plugin."` The claim that logs go to "the console" is
  false; see verified behavior below. This entry gets rewritten (Phase
  1.1) and cross-linked (Phase 2.1).
- `/usr/local/bin/spektacular` (binary, v0.7.0) — ground truth for
  Spektacular's debugging capabilities. No source checkout of
  `github.com/jumppad-labs/spektacular` exists on this machine; all
  findings below are from black-box testing of the installed binary
  plus its embedded debug-symbol strings (file paths, type names, yaml
  tags), reproducible via `strings /usr/local/bin/spektacular | grep
  -iE "<pattern>"`.

**Verified debugging capability (the only one that exists):**

- No CLI flag (`--verbose`/`--debug`/`--log-level`) exists on
  `spektacular` or any of its subcommands (`implement`, `init`,
  `knowledge`, `plan`, `skill`, `spec`, `completion`) — confirmed via
  `--help` on each.
- No `SPEKTACULAR_*`/`SPEK_*` environment variable exists — confirmed via
  binary string search for `Getenv`/`LookupEnv` call sites and env-var-
  shaped string literals.
- Debug control is a config-file key: the binary contains
  `*config.DebugConfig`, a `yaml:"debug"` tag, and a `yaml:"enabled"`
  tag. Source path per debug symbols:
  `github.com/jumppad-labs/spektacular/internal/config/config.go`.
- Every project's `.spektacular/config.yaml` (this repo's, and a fresh
  `spektacular init claude` scratch project) scaffolds:

  ```yaml
  debug:
      enabled: false
  ```

  Enabling debugging is exactly: edit that file, set `enabled: true`.
- **Verified with `debug.enabled: true` in a scratch project**
  (`spektacular init claude`, flip the flag, run any command, capture
  stdout+stderr separately): **no console/stderr output is produced at
  all.** Instead, one JSON line is appended to
  `.spektacular/debug/session-log.jsonl` per command (file created on
  first run after enabling). Confirmed schema and a real sample line:

  ```json
  {
    "seq": 0,
    "timestamp": "2026-07-03T11:31:53.075772108+01:00",
    "session_id": "no-active-workflow",
    "command": ["knowledge", "sources"],
    "duration_ms": 0,
    "exit_code": 0,
    "response": "{...full JSON stdout response as a string...}",
    "state_before": null,
    "state_after": null,
    "advanced": false
  }
  ```

  When a spec/plan/implement workflow is in progress, `session_id`
  becomes `"<kind>:<name>"` (observed `"plan:000008_debugging-docs"`)
  and `state_before`/`state_after` populate with `{kind, name,
  current_step, completed_steps}` reflecting the workflow state machine
  transition (or lack thereof, `advanced: false`) caused by that
  command. `seq` increments per line within the file (append-only, never
  rotated/truncated).
- Unknown/extra keys under `debug:` in `config.yaml` (tested `verbose:
  true`, `level: trace`) are silently ignored, no validation error, no
  effect. `enabled` is the only field the schema reads under `debug:`.
- `.spektacular/.gitignore`'s `*.log` pattern (present in both this
  repo's and a fresh scaffold's gitignore) does **not** match
  `session-log.jsonl` — enabling debug mode leaves an ever-growing,
  un-ignored file. Out of scope to fix here (lives in the CLI's scaffold
  template); the new page calls it out as a reader tip only.

**Conclusion:** exactly one debugging capability ships today — the
config-gated JSONL audit log described above. No second capability
exists to document.

## Project References

- `spektacular plan file read 000007_video-element/plan.md` — read in
  full as a structural example of this project's plan-document
  conventions (Overview / Conventions / Architecture & Design Decisions
  shape, how it cites `research.md` sections, how it justifies rejecting
  alternatives). No content overlap with this feature; consulted for
  plan-document style only.
- `spektacular knowledge always-applied` — loaded the project's
  always-applied conventions and glossary in full during discovery; the
  four MDX authoring rules and no-em-dashes convention both come from
  here (`conventions/mdx-authoring.md`, `conventions/no-em-dashes.md`).
- `spektacular knowledge search` for "navigation", "debugging", "plugins
  extending" — zero hits across all three; no prior knowledge-base entry
  exists on any of these topics.
- Project memory `project_site_architecture.md` (this machine's
  per-user memory store, outside the knowledge base) — confirms MDX
  authoring rules and section-component inventory, but is **stale** on
  code-block authoring: it describes a `CodeBlock` Astro component with
  a per-page `pre:` override that no longer exists. The project's own
  `spektacular knowledge always-applied` output supersedes it: code
  chrome now comes from `astro-expressive-code`, registered once in
  `astro.config.mjs`, with no per-page wiring. This plan follows the
  knowledge-base version. The stale memory entry has been flagged for a
  `spek-knowledge`-mediated correction, not yet made (requires user
  confirmation per project convention, not done unprompted).

## Per-Phase Technical Notes

### Phase 1.1: Correct the Configuration page's debug description

- `src/pages/configuration.mdx:56-61` — rewrite the `debug` `ConfigKey`
  entry's body. Current text: "Debug logging. Set `debug.enabled: true`
  to surface verbose internal logs to the console — useful when
  reporting issues or developing a new plugin." Replace with copy
  stating: enabling `debug.enabled: true` in `.spektacular/config.yaml`
  makes Spektacular write a JSONL log file (not console output) at
  `.spektacular/debug/session-log.jsonl`, one line per CLI invocation.
  Keep it to 1-2 sentences here; full detail belongs on the new page
  from Phase 2.1 (this phase should NOT yet add the cross-link, that
  edit happens in Phase 2.1 once the target page exists, to avoid a
  dangling link if phases are applied out of order).
- Ground truth for the rewritten copy: verified above against a scratch
  `spektacular init claude` project with `debug.enabled: true`, no
  console/stderr output under any tested command; only
  `.spektacular/debug/session-log.jsonl` is written.

**Complexity**: Low
**Token estimate**: ~3k
**Agent strategy**: Single agent, sequential execution. This is a
six-line prose edit to one existing file.

### Phase 2.1: Add a dedicated Debugging page

- New file `src/pages/debugging.mdx` — model directly on the structure
  of `src/pages/extending.mdx:1-157` (frontmatter with `layout:
  ../layouts/Shell.astro`, `title`, `description`; `Hero` import and
  invocation; `Prose`-wrapped body; closing `CtaBanner`). Content to
  include, in order:
  1. `Hero` heading/sub introducing debug logging.
  2. Enablement: the exact `.spektacular/config.yaml` change (`debug:`
     / `  enabled: true`), authored as a fenced `yaml` code block per
     MDX Rule 4, referencing that this key is scaffolded (as `false`)
     into every project by `spektacular init` already.
  3. Expected output: state the log file path
     (`.spektacular/debug/session-log.jsonl`), that it's created on the
     first command run after enabling, that one JSON line is appended
     per CLI invocation (append-only, `seq` increments, never
     truncated), and a sample line as a fenced `json` code block. Use
     the verified sample and field list above (`seq`, `timestamp`,
     `session_id`, `command`, `duration_ms`, `exit_code`, `response`,
     `state_before`, `state_after`, `advanced`), including the
     `session_id` value's two forms (`"no-active-workflow"` vs.
     `"<kind>:<name>"` when a workflow is active).
  4. A brief heads-up that the default `.spektacular/.gitignore`'s
     `*.log` pattern does not match `.jsonl`, so readers who enable this
     may want to add `.spektacular/debug/` to their own `.gitignore`,
     framed as a reader tip, not a claim that Spektacular handles it.
  5. Closing `CtaBanner` linking back to Configuration or Plugins,
     consistent with how `extending.mdx:144-156` and `plugins.mdx:81-87`
     each end with a banner pointing at a related page.
- `src/pages/configuration.mdx:56-61` (same entry touched in Phase
  1.1) — add the cross-link to `/debugging/` now that the target page
  exists, e.g. "See the Debugging page for the full walkthrough." Keep
  the entry itself short; do not duplicate the field-by-field schema
  here.

**Complexity**: Medium
**Token estimate**: ~10k
**Agent strategy**: Single agent, sequential execution. Although this
phase touches two files, the second (`configuration.mdx`) is a one-line
cross-link addition that depends on the first file's route existing, so
there's no independent work to parallelize.

### Phase 3.1: Make the Debugging page discoverable from the nav

- `src/components/Nav.astro:2-10` — change the `items` array. Remove
  the standalone `{ label: "Plugins", href: "/plugins/" }` and `{
  label: "Extending", href: "/extending/" }` entries. Add one grouping
  entry in their place, e.g. `{ label: "Resources", children: [{ label:
  "Plugins", href: "/plugins/" }, { label: "Extending", href:
  "/extending/" }, { label: "Debugging", href: "/debugging/" }] }`
  (exact label text is a copy decision for the implementer; "Resources"
  is a placeholder, not a requirement). `NavItem` becomes a union of the
  existing plain shape and this new `{ label, children }` shape (see
  plan.md § Data Structures & Interfaces).
- `src/components/Nav.astro:14-15` (`isActive`) — extend so a grouping
  entry is considered active when `pathname` matches any child's
  `href`, using the same `startsWith`-based matching already used for
  plain entries.
- `src/components/Nav.astro:21-35` (render block) — branch per entry:
  keep the existing `<li><a>...</a></li>` rendering for plain entries;
  for a grouping entry, render a `<li class="group relative">` containing
  the group's label (as a non-navigating span or a link to the first
  child, implementer's choice, consistent with the "no new top-level
  nav entry" constraint either way) plus a nested `<ul>` of the
  children's links, shown via Tailwind's `group-hover:block
  group-focus-within:block` on an otherwise `hidden` nested `<ul>`, per
  the confirmed CSS-only approach. No `<script>` is added anywhere in
  this file.
- Mobile behavior: the existing `max-sm:hidden` treatment on the first
  item (`Nav.astro:23`, currently applied by index to "How it works")
  is unrelated to this change and stays as-is; verify during manual
  testing that the new grouping entry's dropdown remains usable at the
  `sm` breakpoint where `:hover` is less meaningful, `:focus-within`
  (reachable via tap-to-focus on the trigger) is the fallback for touch,
  already covered by the chosen CSS approach without extra code.

**Complexity**: Medium
**Token estimate**: ~8k
**Agent strategy**: Single agent, sequential execution. All three edits
are inside one file (`Nav.astro`) and are interdependent (data shape,
active-state logic, and render all change together), so splitting across
agents would just add coordination overhead for no parallelism benefit.

## Testing Strategy

- **Phase 1.1**: `npm run build` and `npx astro check` pass; manual read
  confirming the `debug` entry no longer says "console" and states the
  log-file mechanism instead.
- **Phase 2.1**: `npm run build`, `npx astro check`, and both MDX CI
  guards (Rule 1 no-layout-HTML grep, Rule 4 no-CodeBlock-JSX grep) pass
  against `src/pages/*.mdx`; manual read of the new page confirming the
  exact config change and exact expected output are both stated, plus a
  proofread against this context.md's verified schema/sample to catch
  authoring drift.
- **Phase 3.1**: `npm run build` and `npx astro check` pass; manual
  browser check confirming no new top-level nav item, dropdown opens on
  hover and on keyboard focus, all three child links resolve correctly,
  and the parent entry shows active state on `/plugins/`, `/extending/`,
  and `/debugging/`. Also manually check touch/mobile behavior of the
  dropdown since no automated equivalent exists for `:focus-within`
  reachability on a touch device.
- **Deliberate gap** (applies across all phases): no automated test
  asserts the *content* of the Debugging page stays accurate if a future
  Spektacular release changes its debugging behavior. This is a manual
  maintenance concern, not covered by this plan's test surface.

## Token Management Strategy

| Tier | Token Budget | Agent Strategy |
|------|-------------|----------------|
| Low | ~10k | Single agent, sequential |
| Medium | ~25k | 2-3 parallel agents |
| High | ~50k+ | Parallel analysis, sequential integration |

All three phases in this plan are Low/Medium and use a single sequential
agent; no phase needs parallel sub-agents given the small, interdependent
nature of each phase's edits (see each phase's Agent strategy above).

## Migration Notes

N/A. No data migration, no breaking change to any existing route, prop,
or interface. `Plugins` and `Extending` keep their existing URLs
unchanged throughout.

## Performance Considerations

N/A. This plan adds one new static MDX page and a CSS-only nav change;
no client-side script, no additional network request, no runtime
performance implication beyond the negligible HTML/CSS weight of one
more page and a few more `<li>`/`<ul>` elements in the nav.

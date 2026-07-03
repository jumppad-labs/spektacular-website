# Research: 000008_debugging-docs

## Alternatives considered and rejected

- **New top-level nav item for "Debugging"** — rejected by spec constraint
  (no new top-level nav entry). Would also crowd an already-full nav bar
  (`src/components/Nav.astro:2-10` currently lists 7 items before GitHub).
- **Fold debugging content into the existing Configuration page** instead of
  a new page — rejected: `configuration.mdx` already documents `debug:
  enabled` tersely as one `ConfigKey` among many
  (`src/pages/configuration.mdx:56-61`); the spec's acceptance criteria need
  a dedicated page that walks through enablement + expected output per
  capability, which doesn't fit the terse config-reference format the rest
  of that page uses. Configuration page instead cross-links to the new
  Debugging page rather than duplicating content.
- **A click-toggle dropdown implementation with a small inline script** —
  presented to the user during the architecture step as an alternative to
  a CSS-only dropdown; rejected in favor of CSS-only `:hover`/
  `:focus-within`, since the site ships zero JS by default and a static
  3-item menu doesn't need dynamic behavior to justify introducing the
  first dropdown-toggle script in the nav.
- **A `ConfigurationKeys`/`ConfigKey`-style structured layout for the new
  Debugging page** — presented to the user during the architecture step
  as an alternative to a `Prose` walkthrough; rejected for now because
  only one debugging capability exists to document today, so a
  comparison-oriented component would either sit mostly empty or force
  the one capability to masquerade as a list.

## Chosen approach — evidence

**Nav restructure.** `src/components/Nav.astro:1-10` builds `items` as a
flat `{label, href}[]` rendered as flat `<li>`s (`Nav.astro:21-35`). Adding
a submenu means changing the data shape for at least the Plugins/Extending/
Debugging entries to support a nested children list, and adding a dropdown
render path alongside the existing flat one. Active-state logic
(`Nav.astro:14-15`, `isActive`) needs to also mark the parent item active
when any child route is active. User confirmed during architecture: build
the dropdown as CSS-only `:hover`/`:focus-within`, no client script.

**New page.** Model directly on `src/pages/extending.mdx` (`layout:
../layouts/Shell.astro` frontmatter, `Hero` + `Prose` composition,
`CtaBanner` at the end). `Prose` is the right wrapper per
`project_site_architecture` conventions: this content is prose-heavy
(one walkthrough for the one capability) rather than a grid of cards,
matching how `extending.mdx` uses `Prose` for its Go-interface walkthrough
(`extending.mdx:16-142`) versus how `plugins.mdx` uses `FeaturesGrid` +
`PluginInventory` for its card-based inventory. User confirmed during
architecture: use the `Prose` walkthrough, not `ConfigurationKeys`/
`ConfigKey`.

**Ground truth for "every debugging capability Spektacular exposes"**
(verified directly against the installed `spektacular` v0.7.0 binary and a
scratch project, not against assumption):

- `spektacular --help` and every subcommand's `--help` (`implement`,
  `init`, `knowledge`, `plan`, `skill`, `spec`, `completion`) expose **no**
  `--verbose`/`--debug`/`--log-level` flag. There is no CLI-flag-based
  debugging capability.
- `strings /usr/local/bin/spektacular` surfaces `*config.DebugConfig`, a
  `yaml:"debug"` tag, and a `yaml:"enabled"` tag — confirming debug control
  is a config-file key, not an env var or flag. No `SPEKTACULAR_*` /
  `SPEK_*` env vars exist in the binary at all.
  `internal/config/config.go` is the source file (per binary debug
  symbols); not present on this machine as source, only as the compiled
  binary + its embedded paths.
- Every project's `.spektacular/config.yaml` (both this repo's and a fresh
  `spektacular init claude` scratch project) scaffolds:

  ```yaml
  debug:
      enabled: false
  ```

  by default. Enabling debugging is exactly: edit that file, set
  `enabled: true`.
- **Verified behavior with `debug.enabled: true`** in a scratch project
  (`spektacular init claude` then flipped the flag, ran `spektacular
  knowledge sources` with stdout+stderr both captured):
  - **No console/stderr output is produced at all.** This contradicts the
    existing copy in `src/pages/configuration.mdx:58` ("surface verbose
    internal logs to the **console**") — that line is factually wrong
    about the delivery mechanism and is corrected as part of this
    feature (requirement: "Documentation accurately reflects real
    capabilities").
  - Instead, every command run appends one JSON line to
    `.spektacular/debug/session-log.jsonl` (created on first command after
    enabling). Confirmed schema, one line per invocation:

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
    becomes `"<kind>:<name>"` (observed `"plan:000008_debugging-docs"`) and
    `state_before`/`state_after` are populated with `{kind, name,
    current_step, completed_steps}` objects reflecting the workflow state
    machine transition (or lack thereof) caused by that command.
  - `seq` increments per line within the log file (0, 1, 2, ... across
    the session's commands) — an append-only audit trail, not a
    rotating/truncating log.
  - Unknown/extra keys under `debug:` in `config.yaml` (tested `verbose:
    true`, `level: trace`) are silently ignored — no validation error, and
    no effect. `enabled` is the only field the schema reads under `debug:`.
  - This matches "session_id", "state_before", "state_after", "advanced"
    naming already visible in the binary's string table
    (`session-log.jsonl` literal, `no-active-workflow` literal, both
    grepped directly from `/usr/local/bin/spektacular`).

**Conclusion: Spektacular exposes exactly one debugging capability today** —
a config-gated, per-command JSONL audit log at
`.spektacular/debug/session-log.jsonl`, enabled via
`.spektacular/config.yaml`'s `debug.enabled: true`. There is no
second capability (no separate verbose-console mode, no log-level
tiers, no env var toggle). The plan documents this one capability
thoroughly (what enables it, exact log location, full field schema,
one line per command, append-only/growing-forever behavior worth
flagging to the user re: `.gitignore`), and separately fixes the
existing inaccurate "console" claim in `configuration.mdx`.

`.spektacular/.gitignore` already contains `*.log` (both in this repo and a
fresh `init` scaffold) but the debug log's actual filename is
`session-log.jsonl` — the `*.log` glob does **not** match `.jsonl`, so
the debug log directory is currently **not** gitignored by default. This
is a real gap but fixing the `.gitignore` template lives in the
Spektacular CLI project, not this website repo — out of scope for this
plan; the docs page calls it out to the reader instead, suggesting they
add `.spektacular/debug/` to their own `.gitignore`.

## Files examined

- `src/components/Nav.astro:1-52` — flat nav array, active-link logic, no
  submenu/dropdown concept exists anywhere in the component tree.
- `src/pages/plugins.mdx:1-88` — current Plugins page; card/grid-style
  (`FeaturesGrid`, `PluginInventory`, `Plugin`), links to Extending via
  `CtaBanner`.
- `src/pages/extending.mdx:1-157` — current Extending page; prose-style via
  `Prose`, the direct structural model for the new Debugging page.
- `src/pages/configuration.mdx:1-149` — documents `debug.enabled` today in
  one terse, **inaccurate** `ConfigKey` entry (line 56-61: says logs go to
  "the console"); corrected/cross-linked once the Debugging page exists.
- `/usr/local/bin/spektacular` (binary, v0.7.0) — grepped for env vars,
  flags, and config struct field/YAML tags; ground truth for "every
  debugging capability Spektacular exposes" (spec requirement 2 and
  acceptance criterion 4). No source checkout of
  `github.com/jumppad-labs/spektacular` exists on this machine — all
  findings are from black-box testing of the installed binary plus its
  embedded debug-symbol strings (file paths, type names, yaml tags).
- Project memory `project_site_architecture.md` — confirms MDX authoring
  rules and section-component inventory; one entry is **stale**: it
  describes code blocks routed through a `CodeBlock` Astro component with
  `export const components = { pre: CodeBlock }` in each page. The
  project's own always-applied knowledge
  (`spektacular knowledge always-applied`, `conventions/mdx-authoring.md`)
  supersedes this: code chrome now comes from the `astro-expressive-code`
  integration registered once in `astro.config.mjs`, and no
  per-page `pre: CodeBlock` override exists or is needed. Follow the
  knowledge-base version (fenced code, no per-page wiring), not the stale
  memory. Flagged for a memory update after user confirmation
  (`spek-knowledge`), not done unprompted per project convention.

## External references

None used — no external library or RFC is involved; this is pure
documentation content plus a nav/IA change using only in-repo primitives.

## Prior plans / specs consulted

- `spektacular plan file list` / `spec file list` — seven prior plans
  (000001-000007), none touch navigation structure or debugging/config
  docs. `000007_video-element` plan was read in full as a structural
  example of this project's plan-document conventions (Overview /
  Conventions / Architecture & Design Decisions shape, how it cites
  `research.md` sections, how it justifies rejecting alternatives) — no
  content overlap with this feature, used only for plan-document style.
- `spektacular knowledge search` for "navigation", "debugging", "plugins
  extending" — zero hits in all three; no prior knowledge-base entries on
  any of these topics. This is genuinely new ground for the knowledge
  base.

## Open assumptions

- **Resolved during architecture:** a nested/dropdown submenu is the
  chosen IA solution (user confirmed), implemented as CSS-only
  `:hover`/`:focus-within` rather than a scripted toggle (user
  confirmed). Mobile/touch behavior still needs a manual check during
  implementation testing (`:focus-within` via tap-to-focus is the
  intended touch fallback, not yet visually verified in a real browser).
- **Assumed, not yet re-confirmed with the user directly, but consistent
  with every existing top-level page:** the new page's URL is
  `/debugging/`, matching the `/plugins/` and `/extending/` sibling
  convention (lowercase, single word, trailing slash implied by Astro's
  routing).
- **Resolved during architecture:** "reorganized into the new submenu"
  means Plugins and Extending keep their existing URLs (`/plugins/`,
  `/extending/`) and only their nav *entry point* changes from top-level
  links to a submenu's child links. Confirmed via the component
  breakdown and data-structures steps, both approved by the user.
- **If the URL assumption above turns out wrong, the implement workflow
  must STOP and ask** rather than silently proceeding on a guess.

## Rehydration cues

- Re-run `spektacular knowledge always-applied` to reload conventions +
  glossary (cheap, idempotent, was not persisted verbatim above beyond the
  mdx-authoring rules already summarized).
- Re-read `src/components/Nav.astro`, `src/pages/extending.mdx`,
  `src/pages/plugins.mdx`, `src/pages/configuration.mdx` in full — all
  quoted above by line range but under 160 lines each, cheap to re-read
  cold.
- To re-verify the debug-log behavior from scratch: `spektacular init
  claude` in a scratch dir, flip `debug.enabled` to `true` in the
  generated `.spektacular/config.yaml`, run any `spektacular <cmd>`, then
  read `.spektacular/debug/session-log.jsonl`. Takes under a minute, no
  network access needed, fully reproducible.
- `strings /usr/local/bin/spektacular | grep -iE "<pattern>"` was the
  technique used to ground-truth CLI behavior with no source checkout
  available; reuse it if new questions about undocumented behavior come up
  during architecture/implementation.

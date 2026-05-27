# Context: 000003_update-content

## Current State Analysis

The site is a Hugo + Tailwind v4 project established by
`000002_static-site-generation` (commit `c9cbcb4`). Three content
pages exist; almost all visible content lives in per-page HTML
layouts, not in markdown.

**Hugo site layout (this repo):**

- `hugo.toml` — `baseURL = "https://spektacular.dev/"`, `title =
  "Spektacular"`, two `[[menu.main]]` entries (How it works wt 10,
  Install wt 20), `params.{description, githubURL, releasesURL,
  licenseURL, installCommand}`, `build.buildStats.enable = true` and
  `hugo_stats.json` cachebusters.
- `content/_index.md` — front matter only: `heroBadge: "v0.0.1 — early
  development"`, `heroHeadline: ["Write the spec.", "Ship the
  software."]`, `heroSub: "...Agent-agnostic. Complexity-aware.
  Interactive TUI."`. No body.
- `content/how-it-works.md` — front matter only: `layout:
  "how-it-works"`, hero heading/sub. No body.
- `content/install.md` — front matter only: `layout: "install"`, hero
  heading/sub. No body.
- `layouts/baseof.html:1-15` — base shell; head/nav/main/footer/js
  partials, defines `main` block. Body uses Tailwind flex column
  with min-height screen.
- `layouts/home.html` (107 lines) — hero, install command, CTA
  buttons, TUI screenshot section (`<img src="/images/tui.png">`,
  removed in Phase 1.1), pipeline preview (6 nodes), features grid
  (6 cards), CTA banner.
- `layouts/how-it-works.html:1-262` — quick-start (5 numbered steps
  starting at line 23), spec-format two-column (line 73), pipeline
  3 stages (line 104), configuration with fake YAML (line 178),
  roadmap (line 194), CTA (line 248).
- `layouts/install.html` (62 lines) — install methods: Homebrew,
  Debian apt, GitHub Releases.
- `layouts/_partials/*` — `nav.html`, `footer.html`, `head.html`,
  `css.html`, `js.html`, `button.html`, `badge.html`,
  `code-block.html`, `feature-card.html`, `install-block.html`,
  `pipeline-connector.html`, `pipeline-node.html`. Total 11
  partials; all reused as-is.
- `assets/css/main.css` — Tailwind v4 `@theme` block with `bg-*`,
  `border-*`, `text-*`, `accent-*`, `terminal-*`, `link-blue`
  tokens, spacing scale `xs/sm/md/lg/xl`, radius `sm/md/lg/pill`.
  No changes.
- `assets/js/main.js` — copy-to-clipboard + smooth-scroll only. No
  changes.
- `static/CNAME`, `static/.nojekyll`, `static/images/tui.png` —
  `tui.png` becomes unused after Phase 1.1.

**Spektacular tool (`../spektacular`):**

- `README.md:1-230` — canonical current behaviour. Lines 9–10:
  status "v0.1.0 — early development". Lines 16–18 still mention
  complexity-based routing (stale in the README itself; out of
  scope to fix from this repo). Lines 49–60: `go install` and
  binary-download install methods. Lines 137–179: `Store`
  interface and `FileStore` walkthrough. Lines 181–230:
  `.spektacular/config.yaml` shape.
- `cmd/root.go:76-81` — command group mounting. Subcommands at
  `cmd/spec.go`, `cmd/plan.go`, `cmd/implement.go`,
  `cmd/knowledge.go`, `cmd/init.go`, `cmd/skill.go`.
- `internal/store/store.go:30-50` — `Store` interface (7 methods).
  `internal/store/store.go:52-151` — `FileStore` impl.
  `internal/store/search.go:31-40` — `Search` impl.
- `internal/agent/agent.go:20-23` — `Agent` interface
  (`Name`, `Install`). `internal/agent/agent.go:29-55` — registry
  + `register(a)`. Concrete agents at
  `internal/agent/claude.go`, `internal/agent/bob.go`,
  `internal/agent/codex.go`, each calling `register()` from
  `init()`.
- `internal/knowledge/set.go:47-71` — provider→Store resolution.
  Line 51-69: switch with single `case "file"` today.
- `internal/config/config.go:99-133` — config defaults: `command:
  spektacular`, `agent: claude`, `debug.enabled: false`,
  `spec.provider: file`, `spec.id_method: timestamp`,
  `spec.config.directory: .spektacular/specs`, `plan.provider:
  file`, `plan.config.directory: .spektacular/plans`,
  `knowledge.sources[].scope: project`,
  `knowledge.sources[].provider: file`,
  `knowledge.sources[].config.location: .spektacular/knowledge`.
- `internal/steps/spec/steps.go:21-34`,
  `internal/steps/plan/steps.go:28-49`,
  `internal/steps/implement/steps.go:10-29` — workflow step lists.
- **Grep for "complexity" in `internal/` and `cmd/`: zero hits.**
  Confirms model-routing feature absent from current Go code.

## Per-Phase Technical Notes

### Phase 1.1: Make the home page truthful

**File changes:**

- `layouts/home.html` — wholesale edit. Specific sub-changes:
  - Hero subtitle (around line 21–28): drop "Complexity-aware.
    Interactive TUI" from `{{ .Params.heroSub }}` source in
    `content/_index.md`. Update `content/_index.md` `heroSub` to
    new copy (e.g. "Spektacular takes a markdown specification and
    uses AI coding agents to plan and implement your features.
    Agent-agnostic. Pluggable.").
  - Hero badge: change `content/_index.md` `heroBadge:` to read
    `{{ .Site.Params.version }}` dynamically, or set it to literal
    "v0.1.0 — early development" if dynamic lookup is awkward in
    the existing badge partial. Add `version = "v0.1.0"` (or
    current release tag) under `[params]` in `hugo.toml`.
  - TUI screenshot section (full `<section>` block — currently
    rendering `static/images/tui.png` between hero and pipeline
    preview): delete the entire section block.
  - Pipeline preview (6-node `pipeline-node.html` calls in
    `layouts/home.html`): drop the "Analyse · complexity score"
    node and any model-tier `detail:` text. Final pipeline shape:
    `spec.md → Plan → plan.md/research.md/context.md → Implement
    → code`. Five nodes total.
  - Features grid (6 `feature-card.html` partial calls): rewrite
    each card's title and body. New set (final cut decided
    inline, see Open Questions): spec-driven workflow, pluggable
    architecture, multi-source knowledge, multi-agent (claude /
    bob / codex), resumable workflows, open source. Drop the
    "Complexity-aware" card and the "works with Aider/Cursor"
    claims.
  - CTA banner (around lines 95–107): retain; verify link targets.
- `content/_index.md` — update `heroSub`, `heroBadge` value (or
  switch badge to read `Site.Params.version`).
- `hugo.toml` — add `version` under `[params]`.
- `static/images/tui.png` — flagged for cleanup but no requirement
  to delete; leaving in place is fine.

**Complexity**: Medium
**Token estimate**: ~4k
**Agent strategy**: Single agent, sequential — the sections of
home.html are interrelated (hero ↔ features ↔ pipeline), so a
single pass keeps the narrative coherent.

### Phase 1.2: Make the how-it-works page truthful

**File changes:**

- `layouts/how-it-works.html:23-70` — quick-start steps (5
  `{{ partial "code-block.html" (dict "code" "...") }}` calls):
  rewrite every command. New shape per step:
  - Step 1 (line 24-32): `go install
    github.com/jumppad-labs/spektacular@latest` (or current
    install path from README:49-60).
  - Step 2 (line 33-41): `cd my-project; spektacular init claude`
    — note the agent arg.
  - Step 3 (line 42-50): `spektacular spec new --data
    '{"name":"auth-feature"}'`. Prose explains spec_name is
    returned by the command and used in the next step.
  - Step 4 (line 51-59): `spektacular plan new --data
    '{"name":"<returned-spec-name>"}'`. Prose explains the JSON
    `--data` shape and the returned plan_name.
  - Step 5 (line 60-68): `spektacular implement new --data
    '{"name":"<plan-name>"}'`.
- `layouts/how-it-works.html:131-153` — pipeline Stage 2 (currently
  two `pipeline-node.html` blocks: Analyse + Plan): collapse to a
  single Plan node. Drop the "complexity score 0.0–1.0" sub label
  and the "Haiku · Sonnet · Opus · scaled by score" detail label.
  Stage 1 (spec) and Stage 3 (implement) unchanged.
- `layouts/how-it-works.html:178-192` — configuration section:
  remove the fake YAML block (lines 186 with `models:` /
  `complexity:`); replace with a short paragraph that points to
  `/configuration/` for the full schema.
- `layouts/how-it-works.html:194-246` — roadmap: trim to actual
  planned work or remove entirely (impl-time decision per Open
  Questions). Current v0.2 "automated execution" is already
  shipped; v0.3 "Aider/Cursor" is no longer the direction; v1.0
  "plugin system" is partly present.
- `layouts/how-it-works.html:104-176` — pipeline section prose
  (paragraphs at 124-127, 146-152, 169-173): rewrite to remove
  references to complexity scoring and model routing. Stage 2
  prose now describes the Plan step on its own.
- Spec format two-column section (lines 72-102) unchanged.

**Complexity**: Medium-High (interrelated edits across one large
file; ~30% line reduction expected)
**Token estimate**: ~6k
**Agent strategy**: Single agent, sequential — section reflows
depend on neighbouring sections, parallel agents would race.

### Phase 1.3: Verify and adjust the install page

**File changes:**

- `layouts/install.html` — likely unchanged. Verification steps the
  implementer must run:
  - `brew tap jumppad-labs/spektacular && brew info spektacular`
    (or whichever tap is shown on the page) returns a current
    formula.
  - `curl -fsSL https://apt.fury.io/jumppad-labs/...` (or the apt
    URL on the page) responds 200 for the current architecture
    debs.
  - Every URL referenced in the page's GitHub Releases section
    (macOS Intel, macOS Apple Silicon, Linux x86_64, Linux ARM64)
    resolves to a v0.1.x artifact.
- If a channel is broken, that channel's `code-block.html` block
  is replaced with the README:49-60 install commands.
- `content/install.md` — unchanged.

**Complexity**: Low
**Token estimate**: ~2k (verification reads, not large edits)
**Agent strategy**: Single agent. The verification work is
sequential (check each URL, then decide).

### Phase 2.1: Add the Configuration page

**File changes:**

- `content/configuration.md` (new) — front matter only:
  - `title: "Configuration"`
  - `description: "Configure Spektacular via .spektacular/config.yaml: command, agent, debug, spec, plan, and pluggable knowledge sources."`
  - `layout: "configuration"`
  - `heroHeading: "Configuration"`
  - `heroSub: "Spektacular reads everything it needs from .spektacular/config.yaml. Here's what each key does."`
- `layouts/configuration.html` (new) — extends `baseof.html`;
  defines `main`. Sections:
  - Hero (mirrors `how-it-works.html:7-13` shape).
  - Intro paragraph: where config lives, env-var expansion.
  - "Top-level keys" section: one entry per key. Each entry shows
    the key name, the type, and a one-paragraph description.
    Inline markup OR a new partial `_partials/config-option.html`
    (decided inline) with `dict "key" "..." "type" "..."
    "description" "..."`. Keys to document (from
    `../spektacular/internal/config/config.go:99-133`):
    1. `command` — CLI command name (default `spektacular`).
    2. `agent` — installed agent: `claude | bob | codex`.
    3. `debug.enabled` — enable verbose logging.
    4. `spec.provider` — only `file` ships today.
    5. `spec.id_method` — `timestamp | counter | external`.
    6. `spec.config.directory` — relative path; default
       `.spektacular/specs`.
    7. `plan.provider`, `plan.config.directory` — symmetric to
       spec; default `.spektacular/plans`.
    8. `knowledge.sources[].scope` — `project | team | global |
       <custom>`; sources at distinct scopes can coexist.
    9. `knowledge.sources[].provider` — only `file` ships today.
    10. `knowledge.sources[].config.location` — default
        `.spektacular/knowledge`.
  - "Worked example" section: full YAML block via
    `code-block.html` showing all keys with a `project` and a
    `team` knowledge source.
  - CTA banner — link to Plugins page.
- `hugo.toml` — add `[[menu.main]]` entry: `name = "Configuration",
  url = "/configuration/", weight = 30`.
- `layouts/how-it-works.html` — configuration teaser (added in
  Phase 1.2) links to `/configuration/`.
- `_partials/config-option.html` (new, conditional) — if
  promoted, takes `dict "key" string "type" string "description"
  string`; outputs a styled label/body pair using existing
  `bg-bg-surface`, `border-l-accent-primary`,
  `text-accent-light` token classes (mirroring the spec-format
  card pattern at `layouts/how-it-works.html:93-97`).

**Complexity**: Medium
**Token estimate**: ~5k
**Agent strategy**: Single agent. The page is structured but
mostly mechanical.

### Phase 3.1: Add the Plugins page

**File changes:**

- `content/plugins.md` (new) — front matter only:
  - `title: "Plugins"`
  - `description: "Spektacular is built around a pluggable architecture: Store backends for specs, plans, and knowledge, and Agent backends for coding agents."`
  - `layout: "plugins"`
  - `heroHeading: "Plugins"`
  - `heroSub: "Spektacular's pluggable architecture lets specs, plans, knowledge, and agents come from wherever your team already keeps them."`
- `layouts/plugins.html` (new) — extends `baseof.html`. Sections:
  - Hero.
  - "What's pluggable" — short concept section. Two plugin
    points: `Store` (specs, plans, knowledge — three use-cases of
    one interface) and `Agent` (coding agent). One sentence each.
  - "What ships today" — grid of cards. Cards: `file` Store
    provider (one card, with sub-labels for specs / plans /
    knowledge), `claude` agent, `bob` agent, `codex` agent. Card
    markup either inline or via a new partial (decided inline).
  - "Planned" — separate grid of cards labelled "planned":
    Obsidian (knowledge), Notion (knowledge), Jira (specs). Each
    card carries an explicit "planned" badge using the existing
    `badge.html` partial with `variant: "purple"`.
  - CTA — links to `/extending/`.
- `hugo.toml` — add `[[menu.main]]` entry: `name = "Plugins", url =
  "/plugins/", weight = 40`.
- `layouts/home.html` — pluggable-architecture feature card
  landed in Phase 1.1 should link to `/plugins/` (verify during
  this phase).

**Complexity**: Medium
**Token estimate**: ~5k
**Agent strategy**: Single agent. Two card grids are mechanical
once the card markup is chosen.

### Phase 4.1: Add the Extending page

**File changes:**

- `content/extending.md` (new) — front matter PLUS markdown body:
  - Front matter: `title: "Extending"`, `description`, `layout:
    "extending"`, `heroHeading: "Extending Spektacular"`,
    `heroSub: "Implement the Store or Agent interface and
    register it. Here's what each one expects."`
  - Markdown body:
    1. Short paragraph introducing the two interfaces.
    2. `## The Store interface` — prose + Go code block taken
       verbatim from `../spektacular/internal/store/store.go:30-50`
       (the 7-method interface), plus the `DirEntry` and `Hit`
       types from lines 18-28 (or wherever they live). One-line
       contract notes per method.
    3. `## The Agent interface` — prose + Go code block taken
       from `../spektacular/internal/agent/agent.go:20-23` (the
       2-method interface). One-line contract notes per method.
    4. `## Registering a backend` — prose pointing at
       `../spektacular/internal/knowledge/set.go:51-69` (the
       provider switch) for `Store` providers, and at the
       `init()` + `register()` pattern in
       `../spektacular/internal/agent/claude.go` for agents. The
       `file` provider's registration is named as the worked
       example.
    5. `## Next steps` — short note that a full plugin-building
       tutorial is out of scope here; link to the upstream repo's
       README "Extending Storage" section.
- `layouts/extending.html` (new) — extends `baseof.html`. Renders
  hero from front matter (mirrors `how-it-works.html:8-13`), then
  renders `{{ .Content }}` inside a `prose` (Tailwind Typography)
  container. Brief HTML comment in the layout notes that this is
  the only page where body comes from `.Content`.
- `hugo.toml` — add `[[menu.main]]` entry: `name = "Extending",
  url = "/extending/", weight = 50`.

**Complexity**: Medium
**Token estimate**: ~4k
**Agent strategy**: Single agent. Markdown body is mostly
copy-from-source plus prose.

## Testing Strategy

The repository has no unit, integration, or end-to-end test suite —
neither today nor as part of this plan. Verification is build-pass
plus manual review.

**Per-phase verification commands (build-pass):**

```
hugo --minify
```

Run after every phase. Catches template typos, missing partials,
front-matter errors, broken Hugo template syntax, and Tailwind
class problems (via `hugo_stats.json`).

**Per-phase verification (content correctness):**

Each page is reviewed against the `../spektacular` source:

- README at `../spektacular/README.md`.
- Command tree at `../spektacular/cmd/root.go`.
- Interface definitions at
  `../spektacular/internal/store/store.go:30-50` and
  `../spektacular/internal/agent/agent.go:20-23`.
- Config defaults at
  `../spektacular/internal/config/config.go:99-133`.

Reviewer checklist per page: every command runs as written; every
config key exists; every named feature is implemented; every named
plugin is correctly labelled "shipping today" or "planned".

**Per-phase verification (visual):**

`hugo server` running locally; each page is opened in a browser.
Check that new pages match how-it-works/install in theme tokens,
section rhythm, and typography. Check that unchanged pages show no
visual regressions after partial/layout edits.

**Deliberate gaps:** no automated link-checking, no screenshot
regression tests, no accessibility audit.

## Project References

**Site repo:**

- `hugo.toml` — site config.
- `content/_index.md`, `content/how-it-works.md`,
  `content/install.md` — existing content files.
- `layouts/baseof.html`, `layouts/home.html`,
  `layouts/how-it-works.html`, `layouts/install.html` — existing
  layouts.
- `layouts/_partials/*` — 11 existing partials, all reused
  as-is.
- `assets/css/main.css` — Tailwind v4 theme tokens.
- `assets/js/main.js` — copy + smooth-scroll.
- `Makefile`, `package.json` — local build entry points.
- `.github/workflows/deploy.yml` — CI deploy via GitHub Pages.

**Spektacular tool (source of truth):**

- `../spektacular/README.md` — canonical current behaviour.
- `../spektacular/cmd/root.go` — CLI command tree.
- `../spektacular/internal/store/store.go` — `Store` interface,
  `FileStore`, `DirEntry`, `Hit`.
- `../spektacular/internal/store/search.go` — `Search`
  implementation.
- `../spektacular/internal/agent/agent.go` — `Agent` interface,
  registry.
- `../spektacular/internal/agent/claude.go`,
  `../spektacular/internal/agent/bob.go`,
  `../spektacular/internal/agent/codex.go` — concrete agents.
- `../spektacular/internal/knowledge/set.go` — provider→Store
  resolution; registration point for a new Store backend.
- `../spektacular/internal/config/config.go` — config struct and
  defaults.
- `../spektacular/internal/steps/spec/steps.go`,
  `../spektacular/internal/steps/plan/steps.go`,
  `../spektacular/internal/steps/implement/steps.go` — workflow
  step lists.

**Prior plans/specs:**

- `.spektacular/plans/000002_static-site-generation/` — Hugo
  migration plan (architecture baseline).
- `.spektacular/specs/000002_static-site-generation.md` — Hugo
  migration spec.
- `.spektacular/specs/000003_update-content.md` — this plan's
  spec.

## Token Management Strategy

| Tier | Token Budget | Agent Strategy |
|------|-------------|----------------|
| Low | ~10k | Single agent, sequential |
| Medium | ~25k | 2-3 parallel agents |
| High | ~50k+ | Parallel analysis, sequential integration |

**Per-phase placement:**

- Phase 1.1: Low (~4k). Single agent.
- Phase 1.2: Medium (~6k). Single agent, sequential — section
  reflows are interdependent.
- Phase 1.3: Low (~2k). Single agent; mostly verification reads.
- Phase 2.1: Medium (~5k). Single agent.
- Phase 3.1: Medium (~5k). Single agent.
- Phase 4.1: Medium (~4k). Single agent.

**Parallelisation opportunity:** Phases 2.1, 3.1, and 4.1 touch
independent files and can be run in parallel by three agents once
Phase 1.1's home-page feature-card link target is decided and
Phase 1.2's configuration teaser link is in place. The implementer
may choose to fan out at that boundary.

## Migration Notes

No data migration. No URL migration (per spec non-goal —
backwards-compatible URLs are not required). The `tui.png` static
asset becomes orphaned after Phase 1.1; leaving it in place is
acceptable.

## Performance Considerations

No runtime performance implications — this is a static site. Build
time grows modestly because three new pages are added, but Hugo's
build is sub-second on this site today and the new pages are
small.

The Tailwind v4 `hugo_stats.json` mechanism means the CSS bundle
only includes classes actually used in templates. New classes
introduced by the new pages (if any) are picked up automatically;
no manual config-purge step needed.

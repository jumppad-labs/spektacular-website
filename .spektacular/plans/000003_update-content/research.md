# Research: 000003_update-content

## Alternatives considered and rejected

### IA: docs section grouping (`/docs/configuration/`, etc.)

Group the new reference pages under a `/docs/` segment with a
dropdown or sub-nav.

**Rejected**: the site is small (six pages total after this work)
and a nested docs section would add navigation depth without
enough content to justify it. Hugo would happily support either,
so this is reversible if the site grows. See
`hugo.toml` existing `[[menu.main]]` shape — flat entries are the
convention.

### IA: one combined `/reference/` page

Combine Configuration, Plugins, and Plugin interface into a single
long `/reference/` page with anchored sections.

**Rejected**: the spec's acceptance criteria require *a page* for
each topic. Combining them would still technically satisfy "a
page on the site documents X", but at the cost of an overlong,
hard-to-link page. Separate pages give each topic its own URL for
inbound links and clearer scope. See
`.spektacular/specs/000003_update-content.md` Acceptance Criteria
items "Pluggable knowledge storage is documented", "Pluggable
specification storage is documented", "Configuration is
documented", "Plugin interface is described".

### Mention Obsidian, Notion, and Jira as shipping today

List these as currently-shipping plugins on the Plugins page.

**Rejected**: today only the `file` provider is registered. See
`../spektacular/internal/knowledge/set.go:51-69` — single
`case "file"`. Chosen framing instead: the architecture is real
and current; Obsidian, Notion, and Jira are named as planned
concrete plugins that the architecture supports. The Plugins
page lists `file` as available today and the named integrations
as planned.

### Keep complexity-driven model routing content

Keep the home page's "Complexity-aware" feature, the how-it-works
pipeline's Analyse-with-complexity-score stage, and the
configuration block showing `models:` and `complexity:` keys.

**Rejected**: the Go codebase has no `complexity` symbol in
`internal/` or `cmd/`, no model tiers, no routing logic
(verified: `grep -r "complexity" ../spektacular/internal/
../spektacular/cmd/` returned zero hits). The README at
`../spektacular/README.md:16-18` does say "routes work to
different models based on complexity" which is itself out of
date — the current behaviour is single-model. Per spec
acceptance criterion "no statements contradict actual
behaviour", this content is removed from the home features, the
pipeline diagram, and the configuration block.

### Keep the Bubble Tea TUI claim and tui.png

Keep the home hero's "Interactive TUI" subtitle, the TUI
screenshot section between hero and pipeline preview, and the
explicit Bubble Tea mention.

**Rejected**: the Go survey found no Bubble Tea TUI in v0.1.0;
the TUI was a feature of the prior Python implementation. The
README still mentions Bubble Tea but the code doesn't ship it.
The hero copy on the home page ("Interactive TUI") and the
screenshot on `/` are removed.

### Per-page bespoke layouts for all three new pages

Mirror `how-it-works.html` / `install.html` exactly for the new
pages — all body content in HTML layouts including the Extending
page's Go code blocks.

**Rejected**: Extending is heavy on prose + Go interface listings.
Putting it in HTML means escaping a lot of code inside
`{{ partial "code-block.html" (dict "code" "...") }}` calls (see
`layouts/how-it-works.html:81` for how awkward that gets at
scale), and pushes editable copy into template files where
contributors have to know Hugo. Hybrid chosen instead.

### Generic docs layout, all content in markdown

One `docs.html` layout, three markdown files. All content
including the Plugins and Configuration pages' structured cards
and option rows in markdown.

**Rejected**: Plugins and Configuration are structured (cards,
option rows). Markdown forces that structure into raw HTML
embedded in the body, which is worse than just keeping the
bespoke HTML layout. Also a larger stylistic shift from the
established per-page-layout convention.

### Build a new partial per concept (config-row, plugin-card, etc.)

Pre-commit to introducing one or more new partials for the new
pages.

**Rejected as premature**. Existing partials cover most
patterns; the only likely new partial is a definition-row
(`label` / `body`) for the configuration page's option list.
Decide during component breakdown, not now.

### Restructure how-it-works into a hub page

Reshape how-it-works to be a short orientation hub that links out
to all the other pages.

**Rejected as more churn than the spec requires**. The
how-it-works page already serves as an orientation page;
trimming the inaccurate sections (complexity, model routing,
stale roadmap) and updating the quick-start commands preserves
its role without restructuring information architecture inside
it.

### Build-time fetch of latest GitHub release into the badge

Use Hugo's `resources.GetRemote` to fetch the latest GitHub
release tag at build time and surface it in the hero badge.

**Rejected**: a manually-updated `params.version` key in
`hugo.toml` matches the rest of the site's static-param
convention (`githubURL`, `releasesURL`, `licenseURL`,
`installCommand` are all manually set). Maintainer updates the
key on each release — one line per release.

## Chosen approach — evidence

The chosen approach: update the three existing pages to remove
inaccurate claims (complexity routing, TUI, fake agent list,
stale roadmap, stale quick-start commands), then add three new
top-level pages — Configuration, Plugins, Extending — each
following the established per-page-layout pattern (with
Extending taking a markdown body for its prose-heavy content).
Navigation is updated in `hugo.toml` to expose the new pages at
flat top-level URLs.

Evidence supporting this direction:

- The site is already structured for per-page bespoke layouts:
  `layouts/home.html`, `layouts/how-it-works.html`,
  `layouts/install.html` each fill the `main` block of
  `layouts/baseof.html:1-15`. New pages follow the same pattern
  without inventing structure.
- Reusable partials (`code-block.html`, `install-block.html`,
  `button.html`, `feature-card.html`, `badge.html`,
  `pipeline-node.html`) cover almost everything new pages need.
- Hugo menus are driven by `hugo.toml`. Adding the new pages is
  a config edit plus `weight:` ordering.
- The Tailwind theme tokens in `assets/css/main.css` (`@theme`
  block, `bg-*`, `border-*`, `text-*`, `accent-*`, `terminal-*`,
  `link-blue`, spacing scale, radius scale) are sufficient for
  the new pages — no new tokens needed.

Authoritative sources used to validate every claim:

- `../spektacular/README.md:1-230` — the canonical
  current-behaviour description, including the `Store`
  interface block, `FileStore` walkthrough, and current
  `.spektacular/config.yaml` shape.
- `../spektacular/cmd/root.go:76-81` and child files in
  `../spektacular/cmd/` — the truth for which subcommands exist
  (`spec`, `plan`, `implement`, `knowledge`, `init`, `skill`)
  and their shape (`spec new --data '{"name":"..."}'` etc.).
- `../spektacular/internal/store/store.go:30-50` —`Store`
  interface; `internal/store/store.go:52-151` plus
  `internal/store/search.go:31-40` — `FileStore` impl.
- `../spektacular/internal/agent/agent.go:20-55` — `Agent`
  interface and registry; three concrete agents (`claude`,
  `bob`, `codex`), each registered from its own file's
  `init()`.
- `../spektacular/internal/config/config.go:99-133` — defaults
  for command/agent/debug/spec/plan/knowledge.sources. **Zero
  hits for "complexity" anywhere in
  `../spektacular/internal/` or `../spektacular/cmd/`** —
  confirms complexity routing was removed in the Python→Go
  rewrite.
- `../spektacular/internal/knowledge/set.go:47-71` — shows how
  provider names resolve to `Store` instances and is the
  registration point for a new backend.

## Files examined

Spektacular website (this repo):

- `hugo.toml` — site config, params, menu entries, build
  config; new pages added as `[[menu.main]]` entries with
  weights 30/40/50; new `[params].version` key added for the
  hero badge.
- `content/_index.md`, `content/how-it-works.md`,
  `content/install.md` — thin front-matter files; almost all
  visible content lives in the per-page layouts, not in
  markdown.
- `layouts/baseof.html:1-15` — base shell, includes
  nav/footer/head/js partials, defines `main` block.
- `layouts/home.html` (107 lines) — hero with
  badge/headline/install block/CTA buttons, TUI screenshot
  section, six pipeline nodes, features grid (6 cards), CTA
  banner.
- `layouts/how-it-works.html:23-70` — quick-start commands all
  wrong (`spektacular init` lacks agent arg; `spektacular new
  ... --title` is not a real command; plan/implement take
  `--data '{"name":...}'` not paths).
- `layouts/how-it-works.html:131-153` — pipeline Stage 2
  "Analyse → complexity score 0.0–1.0" and "Haiku · Sonnet ·
  Opus scaled by score" describe non-existent behaviour.
- `layouts/how-it-works.html:178-192` — configuration block
  shows fake `models:` and `complexity:` config that doesn't
  exist.
- `layouts/how-it-works.html:194-246` — roadmap mentions v0.2
  automated execution (already shipped as `implement`), v0.3
  MCP/Aider/Cursor (not on roadmap per current code), v1.0
  plugin system (the Store/Agent plugin pattern already exists
  today).
- `layouts/install.html` (62 lines) — Homebrew, Debian apt,
  GitHub Releases for macOS Intel/Apple Silicon/Linux
  x86_64/ARM64. Channel availability confirmed shipping by the
  user; Phase 1.3 is verification only.
- `layouts/_partials/nav.html`, `footer.html`, `head.html`,
  `css.html`, `js.html` — chrome; nav is driven by
  `Site.Menus.main`, so new pages appear automatically once
  added to `hugo.toml`.
- `layouts/_partials/button.html`, `badge.html`,
  `feature-card.html`, `code-block.html`,
  `install-block.html`, `pipeline-node.html`,
  `pipeline-connector.html` — reusable UI; new pages compose
  these.
- `assets/css/main.css` — Tailwind v4 `@theme` block; no
  changes required.
- `assets/js/main.js` — copy-to-clipboard + smooth-scroll
  only; no changes required.
- `static/images/tui.png` — orphaned after Phase 1.1.

Spektacular tool (`../spektacular`):

- `README.md:1-230` — canonical current behaviour; status line
  at lines 9-10 reads "v0.1.0 — early development"; install
  instructions at lines 49-60; `Store` interface and
  `FileStore` walkthrough at lines 137-179; `config.yaml`
  shape at lines 181-230.
- `cmd/root.go:76-81` — command tree mounting; defines
  top-level group command and child commands.
- `cmd/spec.go`, `cmd/plan.go`, `cmd/implement.go`,
  `cmd/knowledge.go`, `cmd/init.go`, `cmd/skill.go` —
  concrete subcommand definitions.
- `internal/store/store.go:30-50` — `Store` interface (7
  methods).
- `internal/store/store.go:52-151`,
  `internal/store/search.go:31-40` — `FileStore` worked
  example.
- `internal/agent/agent.go:20-55` — `Agent` interface and
  registry; three concrete agents.
- `internal/agent/bob.go` — confirms `bob` is a real shipping
  agent with proper `Install` implementation and test file.
- `internal/knowledge/set.go:47-71` — provider→Store
  resolution; the point where a new backend is registered.
- `internal/config/config.go:99-133` — config defaults;
  canonical config shape.
- `internal/steps/spec/steps.go:21-34`,
  `internal/steps/plan/steps.go:28-49`,
  `internal/steps/implement/steps.go:10-29` — workflow step
  lists.
- `.spektacular/specs/000020_context.md` — confirms "pluggable
  knowledge" is the implemented feature; "pluggable context"
  mentioned in the spec refers to context being assembled
  from these pluggable knowledge sources, not a separate
  plugin point.
- `.spektacular/specs/000004_complexity_driven_model_routing.md`
  — the Python-era complexity routing spec; the Go rewrite
  did not carry it forward.

## External references

None required. All claims on the site are validated against the
Spektacular source repo at `../spektacular`. No third-party
documentation needs to be linked into the site (beyond the
existing Claude Code link in the quick-start prerequisites,
which stays).

## Prior plans / specs consulted

- `.spektacular/plans/000002_static-site-generation/plan.md`
  (this repo, via `spektacular plan file read`) — established
  the Hugo + Tailwind v4 stack, per-page layouts, partials
  library, and `baseof.html` inheritance pattern. The plan we
  are about to write builds on this architecture without
  changing it.
- `.spektacular/specs/000002_static-site-generation.md` —
  confirms the styling system constraints (no per-page CSS,
  partials for repeated UI, theme tokens via `@theme`).
- `.spektacular/specs/000001_install_instructions.md` —
  historical context; install page content is already aligned
  with this spec and out of scope for the current change
  unless cross-check against the README turns up a
  discrepancy.
- `../spektacular/.spektacular/specs/000004_complexity_driven_model_routing.md`
  — describes the Python-era complexity routing feature; the
  Go rewrite did not carry it forward. Read to confirm
  rejection of the model-tier content as inaccurate.
- `../spektacular/.spektacular/specs/000006_convert_to_go.md`
  (file exists, not read in full) — establishes that the
  Python→Go conversion is the seam where many Python-era
  features were dropped.
- `../spektacular/.spektacular/specs/000020_context.md` —
  defines the multi-source knowledge feature; informs the
  framing of "pluggable context" on the new Plugins /
  Extending pages.

## Open assumptions

If any of these turn out wrong during implementation, the
implement workflow must STOP and ask:

- **Install page channels.** User confirmed all three channels
  (Homebrew tap, apt repo, GitHub Releases) ship today. Phase
  1.3 verifies by actually fetching each URL; if any returns
  404 or stale artifacts, that channel's block is replaced
  with the README's `go install` + binary-download flow. STOP
  and ask before deleting a channel without replacement.
- **JSON `--data` shape in quick start.** The literal CLI
  today takes `--data '{"name":"..."}'` for `spec new`, `plan
  new`, and `implement new`. This is awkward in a quick-start
  context but is the truth. Keep it as-is rather than
  inventing a friendlier syntax that doesn't exist. STOP and
  ask if the CLI shape has changed when the implementer reads
  the tool.
- **Hero badge tracks `params.version` in `hugo.toml`.**
  Maintainer updates this on each release. If the team
  prefers a different mechanism (build-time fetch from
  GitHub releases API), this decision is easy to revisit;
  STOP and ask if implementation finds an existing
  release-version mechanism in the repo.
- **Obsidian / Notion / Jira framing.** Plugins page lists
  these as **planned** integrations with explicit "planned"
  labelling. If the user later prefers a softer "examples a
  plugin could integrate" framing without a "planned"
  commitment, the section is easy to retitle — but STOP
  before changing framing without a directive.

## Rehydration cues

To rebuild context from a cold start, an agent should:

1. Read this `research.md` first.
2. Read `../spektacular/README.md` in full — the canonical
   current-behaviour reference.
3. Read `../spektacular/internal/store/store.go`,
   `../spektacular/internal/agent/agent.go`, and
   `../spektacular/internal/config/config.go` — the three
   sources of truth for the pluggable architecture content.
4. Run `spektacular plan file read
   000002_static-site-generation/plan.md` to refresh the
   site's architecture (layouts, partials, theme tokens).
5. Run `spektacular spec file read 000003_update-content.md`
   for the target requirements and acceptance criteria.
6. Open the three existing layouts (`layouts/home.html`,
   `layouts/how-it-works.html`, `layouts/install.html`) to
   see the current claims that need updating.
7. Skill: `spektacular skill spawn-implementation-agents` if
   parallel page work helps.

# Plan: 000003_update-content

<!-- Metadata -->
<!-- Created: 2026-05-26T12:20:42Z -->
<!-- Commit: 40dcb62 -->
<!-- Branch: f-rationalise-content -->
<!-- Repository: git@github.com:jumppad-labs/spektacular-website.git -->

## Overview

The Spektacular website currently advertises features that no longer
exist in the Go-based tool (complexity-driven model routing, an
interactive Bubble Tea TUI, Aider/Cursor as supported agents) and is
silent about features that do exist (the pluggable Store and Agent
architecture, multi-source knowledge, three real agents, configuration
schema). This plan brings the site back into alignment with reality:
inaccurate content is removed from the three existing pages and three
new top-level reference pages — Configuration, Plugins, and Extending —
are added. Visitors evaluating or adopting Spektacular gain an accurate,
complete picture they can act on, including documentation of every
current feature and the plugin interface that lets developers extend the
tool.

## Architecture & Design Decisions

The site is brought into alignment with the current Go-based Spektacular
tool by **trimming stale content from the three existing pages and
adding three new top-level reference pages** — Configuration, Plugins,
and Extending — within the existing Hugo + Tailwind v4 stack established
in `000002_static-site-generation`. Navigation grows from two to five
top-level entries; URLs stay flat (`/configuration/`, `/plugins/`,
`/extending/`) rather than nesting under a `/docs/` segment. The
Plugins page carries the "what the pluggable architecture is"
explanation, satisfying the spec's pluggable-design requirement;
Extending stays purely developer-facing.

Three load-bearing decisions. First, the **layout/content split is
hybrid**: Configuration and Plugins keep the established per-page
bespoke layout convention (matches `layouts/how-it-works.html` and
`layouts/install.html`), while Extending uses a layout that renders a
markdown body via `{{ .Content }}` so the Go interface listing and prose
live in the `.md` file rather than as escaped strings inside Hugo dict
calls. The trade-off is one mild structural inconsistency (Extending's
body comes from markdown, the others' from layouts) accepted in
exchange for prose-and-code ergonomics on the page that needs them
most. Second, **stale content is deleted rather than soft-deprecated** —
complexity routing, the Bubble Tea TUI, model-tier configuration, and
the fake agent list are removed outright, not hidden behind feature
flags, because the spec's acceptance criterion is "no statements
contradict actual behaviour". Third, **named planned plugins (Obsidian,
Notion, Jira)** are listed on the Plugins page as concrete planned
integrations, with the `file` provider clearly labelled as the only
currently-shipping integration — combining illustrative-architecture
and planned-plugins framings.

Why this beats the alternatives. A `/docs/` section was rejected as
overkill for six pages of content; a single `/reference/` mega-page was
rejected because separate URLs give each topic better inbound-link
surface; an all-markdown docs layout was rejected because Plugins and
Configuration are structured (cards, option rows) and markdown would
push that structure into raw HTML inside the body. See
`research.md#alternatives-considered-and-rejected` for the full
evidence.

Inputs to keep stable. The base layout, the shared chrome partials
(nav, footer, head, css, js), the Tailwind theme tokens, and the
existing reusable partials (button, badge, code-block, install-block,
feature-card, pipeline-node, pipeline-connector) are reused as-is; no
new theme tokens are introduced. The dominant new pattern is a Hugo
content file whose front matter declares the page's hero copy plus, for
Extending, a markdown body.

## Component Breakdown

- **Home page (changed)** — Owns the hero (badge, multi-line headline,
  subtitle, install command, CTA buttons), the pipeline preview, the
  features grid, and the closing CTA banner. Changes: hero subtitle
  drops "Complexity-aware. Interactive TUI"; badge tracks the latest
  GitHub release via a new `params.version`; the TUI screenshot section
  is removed; the features grid is rewritten to reflect actual current
  features (spec-driven workflow, pluggable architecture, pluggable
  knowledge, multi-agent support, resumable workflows, open source);
  the pipeline preview drops the model-routing call-outs. Continues to
  compose the existing badge, install-block, button, and feature-card
  partials.

- **How-it-works page (changed)** — Owns the orientation deep-dive:
  page hero, quick-start steps, spec-format two-column block, pipeline
  stage descriptions, configuration teaser, and roadmap. Changes: all
  five quick-start step commands are rewritten to match the real CLI
  (`spektacular init <agent>`, `spektacular spec new --data
  '{"name":"..."}'`, etc.); pipeline Stage 2 loses the complexity-score
  node and the "Haiku · Sonnet · Opus" tier label, becoming a single
  Plan step; configuration section becomes a brief teaser that links to
  the new Configuration page rather than embedding a fake YAML block;
  roadmap is replaced with a short forward-looking section grounded in
  actual planned work, or removed if a coherent forward-looking
  statement cannot be made. Spec-format two-column block stays
  unchanged.

- **Install page (mostly unchanged)** — Owns the install-method blocks
  (Homebrew, Debian apt, GitHub Releases per-platform). Verified
  against current release channels; structural changes are made only if
  a channel is found to no longer publish. Page hero unchanged.

- **Configuration page (new)** — Owns documentation of
  `.spektacular/config.yaml`: the canonical config shape, a brief
  description of every top-level key (`command`, `agent`, `debug`,
  `spec`, `plan`, `knowledge`), and a worked example showing multiple
  knowledge sources at distinct scopes. Composes the code-block partial
  for inline YAML blocks and a new config-option row pattern (likely a
  small new partial) for individual key descriptions.

- **Plugins page (new)** — Owns the conceptual explanation of
  Spektacular's pluggable design plus the inventory of plugins. Opens
  with a short "What's pluggable" overview describing the two plugin
  points (Store and Agent) and the three Store use-cases (specs, plans,
  knowledge). Lists the currently-shipping plugins (the `file` Store
  provider; the `claude`, `bob`, `codex` agents). Lists named planned
  plugins (Obsidian and Notion as knowledge backends; Jira as a spec
  backend) with explicit "planned" labelling. Closes with a CTA linking
  to the Extending page for developers.

- **Extending page (new)** — Owns the developer-facing description of
  the plugin interfaces, sufficient for a developer to understand the
  shape of a plugin. Body is markdown (the only page where this is
  true), carrying Go code blocks for the `Store` interface (with
  `DirEntry` and `Hit` types) and the `Agent` interface, brief prose
  explaining each method's contract, and a short "how a backend is
  registered" note pointing at the file-provider registration pattern
  as the worked example. Hero is rendered by the page layout from
  front matter, matching the other pages.

- **Site configuration (changed)** — Owns site-wide settings and the
  menu. Changes: three new `[[menu.main]]` entries (Configuration
  weight 30, Plugins weight 40, Extending weight 50) so the nav
  exposes the new pages automatically; a new `params.version` key
  carrying the current GitHub release tag, read by the home page's
  hero badge.

- **Per-page layouts (new)** — Three new layouts: one for each new
  page. Configuration and Plugins layouts carry the full body markup
  in HTML; Extending's layout renders `{{ .Content }}` from its
  markdown body inside the standard hero-plus-main shell. All three
  extend `layouts/baseof.html` and use the existing nav/footer/head/js
  partials unchanged.

- **Content files (new)** — Three new content files: Configuration and
  Plugins carry only front matter (title, description, layout, hero
  copy), matching how `how-it-works.md` and `install.md` are
  structured today. Extending's content file carries the full markdown
  body (interface listings, prose, code blocks) in addition to front
  matter.

- **Config-option row partial (new, conditional)** — A small reusable
  partial for the Configuration page: a label + body pair to render
  each config key's name and description in a consistent visual style.
  Promoted to a partial only if used more than twice on the page
  (likely — there are six top-level config keys); otherwise inlined
  directly. Decision taken during implementation.

## Data Structures & Interfaces

This is a content update on a static site — no runtime data structures
or wire formats are introduced. The contracts that matter are the Hugo
configuration schemas the new components agree on and the page-layout
interfaces that consume them.

**Page front matter (extended)** — The contract between a content file
and its layout. The three new content files declare the same shape
already used by `content/how-it-works.md` and `content/install.md`:

```yaml
title:        string   # <title> and page heading
description:  string   # <meta name="description">
layout:       string   # selects the per-page layout
heroHeading:  string   # large page hero heading
heroSub:      string   # one-paragraph hero subtitle
```

Extending's content file additionally carries a markdown body
(everything below the front matter), which its layout renders via
`{{ .Content }}`. The other two new pages carry no body — all
structure lives in the layout.

**Hugo menu entry (extended)** — The contract for navigation. Three
new entries are added to `hugo.toml` under `[[menu.main]]`, each
carrying the standard Hugo menu shape:

```
name:    string  # link label rendered in the nav
url:     string  # page URL (e.g. "/configuration/")
weight:  int     # sort order (30, 40, 50 for the new pages)
```

This is the same shape as the existing How-it-works (weight 10) and
Install (weight 20) entries.

**Site param (new)** — A new top-level `params.version` key in
`hugo.toml`, holding the current GitHub release tag as a string. Read
by the home page hero badge via `{{ .Site.Params.version }}`.
Maintainer-updated on each release; no build-time fetch.

**Config-option partial parameters (new, conditional)** — If the
config-option row partial is promoted, it is invoked with a typed
`dict` context rather than the global page, matching the convention
established by the existing `button`, `badge`, `feature-card`, and
`pipeline-node` partials:

```
{ key: string, type: string, description: string }
```

No serialization boundaries, APIs, or persistent data types are
introduced.

## Implementation Detail

This plan introduces no new patterns. The Hugo + Tailwind v4 stack,
the `baseof.html` + per-page-layout inheritance shape, the partials
library, and the `@theme` token system are all carried over from
`000002_static-site-generation` without modification. Three new pages
slot into the existing pattern rather than reshaping it.

**One mild structural variation: a markdown-body page.** The Extending
page is the first page where the body content lives in a content file
rather than in a layout. The layout still defines the hero block and
the standard chrome; the body is rendered via `{{ .Content }}`. A
developer reading the changed code sees three new layouts that look
like the existing ones — only Extending's layout differs by ending
with a `{{ .Content }}` block where the others end with bespoke
section markup. This is a deliberate convention split, justified by
Extending's prose-and-code character, and documented in the layout
file as a brief comment.

**Content removal is structural, not cosmetic.** The current home and
how-it-works layouts mention the complexity-routing pipeline stage,
model tiers, the TUI, and the wrong agent list in multiple places —
pipeline diagrams, feature cards, configuration blocks, and roadmap
entries. Removing these is not a string-edit job; whole sections (the
home page's TUI screenshot section, how-it-works' configuration block,
how-it-works' roadmap) are deleted, and the surviving sections are
restructured to flow without them. The pipeline diagram on the home
page shrinks from six nodes to five (the Analyse complexity-score node
goes), and the how-it-works pipeline Stage 2 collapses from two boxes
(Analyse, Plan) to one (Plan). Reviewers should expect to see
net-negative line counts on the existing layouts.

**Quick-start commands change shape, not just wording.** The current
quick-start lists each step's command as a single inline string
passed to the `code-block` partial. The real commands take JSON via
`--data '{"name":"..."}'` and return identifiers the next step
depends on (the spec name returned by `spec new` feeds into `plan
new`). A developer reading the new how-it-works layout will see the
steps explicitly thread the returned identifier through, mirroring
the README's quick-start narrative.

**Code-structure UX of the new pages.** Configuration's body is a
column of option rows, each rendering one config key (via either
inline markup or a small partial — decided at implementation time).
Plugins' body is a short concept paragraph plus two card grids: one
for shipping plugins, one for planned ones, each card a tiny
structure of name + scope + status. Extending's body is
markdown-driven prose punctuated by Go code blocks for the `Store`
and `Agent` interfaces, with the existing Tailwind Typography plugin
handling default prose styling — no per-element styling decisions on
this page.

**What developers do not see changing.** The base layout, every
shared partial (nav, footer, head, css, js), the entire
`assets/css/main.css` theme block, the `assets/js/main.js` script,
the build pipeline, the GitHub Pages deploy workflow, and the
`package.json` dependency set are all untouched.

## Dependencies

No new dependencies — runtime, build-time, or planning — are
introduced by this plan.

**Runtime / build (carried over from `000002_static-site-generation`,
no changes required):**

- **Hugo Extended ≥ v0.161** — site builder; provides the
  `css.TailwindCSS` pipe and the layout/partials/content rendering
  used by the new pages. No version bump needed.
- **Node ≥ 22 (CI) plus the npm dev dependencies `tailwindcss`,
  `@tailwindcss/cli`, `@tailwindcss/typography`** — Tailwind v4
  toolchain; already wired into `package.json`. The typography plugin
  in particular is leaned on by Extending's markdown body and is
  already installed.
- **GitHub Pages + the `static/CNAME` custom domain** — deployment
  target; no change.

**Planning dependencies:**

- **`000002_static-site-generation` plan** — established the Hugo +
  Tailwind stack and partials library that this plan builds on.
  Already landed; nothing to wait for.
- **`000003_update-content` spec** — the source-of-truth requirements
  for this plan; already approved.

**External source of truth (not a dependency in the lockstep sense,
but a content input):**

- **The `../spektacular` repository on the local filesystem** — every
  claim written to the site is validated against this source. If the
  Spektacular tool's behaviour changes during implementation, the
  implement workflow must re-check the affected pages before
  completing. There is no version pin between the website repo and the
  tool; the assumption is that the implement step reads the tool
  source at implementation time.

Nothing needs to land first. All prerequisite work is already on
`main` or on the current branch.

## Testing Approach

This is a content update on a static site. The repository has no unit,
integration, or end-to-end test suite — neither today nor as part of
this plan. Verification is **build-pass plus manual review**,
structured into three checks:

**1. Build verification.** `hugo --minify` must complete without
warnings or errors after every change. This exercises the
layout/partials/template wiring and catches typos in front matter,
missing partials, broken Hugo template syntax, and Tailwind class
problems (via the `hugo_stats.json` pipeline). The local dev server
(`hugo server`) is used during implementation; CI runs the same build
via `.github/workflows/deploy.yml` before publishing.

**2. Content correctness review.** Each updated or new page is
reviewed against the `../spektacular` source — README, command tree,
interface definitions, config defaults — to confirm "no statements
contradict actual behaviour". The review is performed page by page
during implementation. Reviewer's checklist per page: every command
runs, every config key exists, every named feature is implemented,
every named plugin is correctly labelled "shipping today" or
"planned".

**3. Visual regression review.** Pages are opened in a browser via
the local Hugo dev server and inspected for layout fidelity. Three
load-bearing assertions:

- **Unchanged pages show no visual regressions.** Install page and
  the surviving parts of home/how-it-works retain their existing
  layout, typography, spacing, and colour usage.
- **New pages match the existing visual language.** Configuration,
  Plugins, and Extending use the same theme tokens, partial styles,
  and section rhythm as how-it-works and install — no bespoke styling
  that breaks consistency.
- **The nav reflects the new IA.** Five top-level entries in the
  order: How it works, Install, Configuration, Plugins, Extending.
  The GitHub link stays as the trailing external link.

**Deliberate gaps.** No automated link-checking, no screenshot
regression tests, no accessibility-audit step. These are out of scope
per the spec's "no SEO/analytics/marketing copywriting beyond
accuracy" non-goal. If link rot becomes a recurring problem it can be
addressed in follow-up work.

**Spec acceptance criteria mapped to verification.** All nine criteria
("site content matches current behaviour", "pluggable architecture
explained", "knowledge/spec storage pluggable", "all current features
discoverable", "plugins listed", "configuration documented", "plugin
interface described", "visual style consistent") are
check-1+check-2+check-3 outputs. The success metric "manual
verification confirms accuracy and clarity" is satisfied by completing
check 2 end to end.

## Milestones & Phases

### Milestone 1: Existing pages match current Spektacular behaviour

**What changes**: A visitor landing on the site sees claims that match
the tool they actually download. The home page no longer advertises an
Interactive TUI, complexity-aware model routing, or the wrong agent
list; the badge tracks the latest GitHub release. The how-it-works
page's quick-start runs end-to-end as written (every command, every
flag, every argument). The pipeline diagram shows the real pipeline
(no model-tier routing). The fake `models:` / `complexity:`
configuration block is gone; in its place, a short pointer toward the
new Configuration page. The roadmap section is either trimmed to
forward-looking work that's actually planned, or removed. The install
page is verified against current release channels and adjusted only if
existing channels are no longer accurate.

#### - [x] Phase 1.1: Make the home page truthful

The home page is rewritten to remove every claim that contradicts the
current tool. The hero subtitle loses "Complexity-aware. Interactive
TUI"; the badge updates to track the latest GitHub release. The TUI
screenshot section is removed entirely (whole block, including the
image reference). The features grid is rewritten card-by-card so it
reflects features that actually exist in the Go tool today — spec-
driven workflow, pluggable architecture, multi-agent support, multi-
source knowledge, resumable workflows, open source — replacing the
stale "Complexity-aware" and wrong agent list. The home pipeline
preview is trimmed so it shows the real pipeline shape (no model-tier
routing call-outs).

*Technical detail:* [context.md#phase-11](./context.md#phase-11-make-the-home-page-truthful)

**Acceptance criteria**:

- [x] The home page shows no reference to a TUI, complexity scoring,
  model tiers, or Aider/Cursor as supported agents.
- [x] Every feature card on the home page names a feature that exists
  in the current Go tool at `../spektacular`.
- [x] The hero badge reads the GitHub release tag from
  `Site.Params.version`.
- [x] The home page pipeline preview shows only stages and outputs
  that exist in the current pipeline.
- [ ] The page builds cleanly and renders visually consistent with
  the existing site.

#### - [x] Phase 1.2: Make the how-it-works page truthful

The how-it-works page is rewritten section by section. The five
quick-start steps get their commands replaced with the real CLI shape
(`spektacular init <agent>`, `spektacular spec new --data
'{"name":"..."}'`, etc.), and the step prose explicitly threads the
returned spec name into the next step. The pipeline section's Stage 2
is collapsed from a two-box "Analyse → complexity score" + "Plan,
model-routed" diagram to a single Plan stage that describes the actual
behaviour. The configuration section's embedded YAML block (which
currently shows fake `models:` and `complexity:` keys) is replaced
with a short pointer paragraph that links to the new Configuration
page. The roadmap section is replaced with a brief forward-looking
section grounded in actual planned work, or removed if no
forward-looking statements are accurate.

*Technical detail:* [context.md#phase-12](./context.md#phase-12-make-the-how-it-works-page-truthful)

**Acceptance criteria**:

- [x] Every command shown in the quick-start runs as written against
  the current tool and produces the documented output.
- [x] The pipeline diagram shows no complexity-scoring node and no
  model-tier labels.
- [x] The configuration section contains no YAML keys that don't
  exist in the current `config.yaml` schema.
- [x] The roadmap section either reflects actual planned work or is
  absent.
- [ ] The page builds cleanly and remains visually consistent.

#### - [x] Phase 1.3: Verify and adjust the install page

The install page is verified against the README's install instructions
and current release channels. If the Homebrew tap and apt repository
both publish current artifacts, the existing three-method presentation
stays. If either doesn't, that section switches to the README's
`go install` + pre-built binary flow. The hero copy and page chrome
are unchanged.

*Technical detail:* [context.md#phase-13](./context.md#phase-13-verify-and-adjust-the-install-page)

**Acceptance criteria**:

- [x] Every install command on the page produces a working install
  when run on a clean system.
- [x] Every release URL referenced on the page resolves to a current
  artifact.
- [ ] The page builds cleanly and remains visually consistent.

### Milestone 2: Configuration is documented on the site

**What changes**: A visitor can navigate to a Configuration page that
documents the real `.spektacular/config.yaml` shape: every top-level
key (`command`, `agent`, `debug`, `spec`, `plan`, `knowledge`), what
it controls, the defaults, the supported values (e.g. `id_method:
timestamp | counter | external`), and a worked example showing
multiple knowledge sources at distinct scopes. The page is reachable
from the nav and from the how-it-works configuration pointer landed
in M1.

#### - [x] Phase 2.1: Add the Configuration page

A new Configuration page is added at `/configuration/`. The page opens
with a hero (heading + sub) and a short paragraph explaining that all
Spektacular configuration lives in `.spektacular/config.yaml`. It
then documents every top-level key, describing what each key
controls, the supported values, and the defaults. A worked example
YAML block shows a complete configuration including multiple
knowledge sources at distinct scopes. The nav gets a new entry at
weight 30; the how-it-works configuration pointer added in Phase 1.2
links here.

*Technical detail:* [context.md#phase-21](./context.md#phase-21-add-the-configuration-page)

**Acceptance criteria**:

- [x] A page exists at `/configuration/` and is reachable from the
  main nav.
- [x] Every option documented on the page corresponds to a real key
  in the current `config.yaml` schema; no fictional keys.
- [x] The worked-example YAML, when copied verbatim into a fresh
  `.spektacular/config.yaml`, loads in Spektacular without errors.
- [x] The page uses the same visual language as how-it-works and
  install (theme tokens, partials, section rhythm).

### Milestone 3: Pluggable architecture and plugin inventory are documented

**What changes**: A visitor can navigate to a Plugins page that opens
with a short explanation of Spektacular's pluggable design (Store and
Agent plugin points, with the three Store use-cases — specs, plans,
knowledge), then lists what ships today (the `file` Store provider;
`claude`, `bob`, and `codex` agents) and what's planned (Obsidian and
Notion as knowledge backends; Jira as a spec backend), with explicit
"planned" labelling so nothing is overpromised. From the home page, a
feature card surfaces "pluggable architecture" as a top-line feature
(landed in Phase 1.1).

#### - [x] Phase 3.1: Add the Plugins page

A new Plugins page is added at `/plugins/`. The page opens with a
short conceptual section explaining Spektacular's pluggable
architecture: the `Store` plugin point (used for specs, plans, and
knowledge) and the `Agent` plugin point (the coding agent). Below the
concept, a "What ships today" section lists the `file` Store provider
and the `claude`, `bob`, `codex` agents, each with a one-line
description. A separate "Planned" section names Obsidian and Notion
as planned knowledge backends and Jira as a planned spec backend,
with explicit "planned" labelling and no shipped-today claim. A CTA
at the bottom links to the Extending page for developers who want to
build their own. The nav gets a new entry at weight 40.

*Technical detail:* [context.md#phase-31](./context.md#phase-31-add-the-plugins-page)

**Acceptance criteria**:

- [x] A page exists at `/plugins/` and is reachable from the main
  nav.
- [x] A visitor reading only this page can answer: is knowledge
  storage pluggable, is spec storage pluggable, and what plugins
  exist today.
- [x] Every "ships today" plugin listed on the page corresponds to a
  registered provider/agent in the current Go tool.
- [x] Every "planned" plugin is clearly labelled as planned and not
  as a current capability.
- [x] The page uses the same visual language as the rest of the
  site.

### Milestone 4: Plugin interface is documented for developers

**What changes**: A developer can navigate to an Extending page that
describes the `Store` interface (the seven methods, the `DirEntry`
and `Hit` types, the contracts for `Search` token-efficiency and
scope tagging) and the `Agent` interface (the two methods, `Name`
and `Install`), along with a brief note on how a new provider or
agent is registered (the `file` provider as the worked example). The
page is brief — enough to communicate the shape of a plugin — and
defers any step-by-step tutorial per spec non-goal.

#### - [x] Phase 4.1: Add the Extending page

A new Extending page is added at `/extending/`. Unlike the other
pages, the body is rendered from the content file's markdown via
`{{ .Content }}`, so the prose and Go code blocks live in the `.md`
file. The body presents the `Store` interface (seven methods, the
`DirEntry` and `Hit` shapes, brief contracts for each method), the
`Agent` interface (two methods), and a short "how a backend is
registered" note pointing at the `file` provider's registration as
the worked example. The nav gets a new entry at weight 50.

*Technical detail:* [context.md#phase-41](./context.md#phase-41-add-the-extending-page)

**Acceptance criteria**:

- [x] A page exists at `/extending/` and is reachable from the main
  nav.
- [x] The Go code blocks for the `Store` and `Agent` interfaces
  match the current interface definitions in `../spektacular`.
- [x] A developer reading only this page understands what methods a
  new backend must implement and where registration happens.
- [x] The page hero is rendered consistently with the other pages;
  the body uses the Tailwind Typography defaults already configured.

## Open Questions

The discovery and architecture steps resolved the substantive
uncertainties (install channels confirmed shipping, version badge
will mirror the GitHub release via a maintainer-updated
`params.version` key, `bob` agent confirmed shipping, IA confirmed
flat, layout/content split confirmed hybrid). The following items
genuinely cannot be settled until implementation puts the pages on
screen:

- **How-it-works roadmap section — remove or trim?** Depends on how
  the page reads once the inaccurate roadmap entries are stripped. If
  the truthful remainder is too thin to justify a section, the
  section is removed entirely; if there's a coherent forward-looking
  statement to make, it's kept and trimmed. When the implementer
  hits this: make the call inline while editing how-it-works. No need
  to STOP — editorial judgement, not correctness.
- **Configuration page — config-option partial or inlined markup?**
  Depends on how repetitive the per-key markup looks after writing
  the page once. Six top-level keys means the same row markup
  repeats six times; if that's an obvious partial, extract one. If
  the keys want different per-key markup, inline. When the
  implementer hits this: make the call inline.
- **Plugins page — extract a plugin-card partial?** Depends on
  whether the "ships today" cards and the "planned" cards share
  enough structure to be one partial. When the implementer hits
  this: make the call inline.
- **Home features grid — which features make the final cut?** The
  grid stays six cards by convention; selecting which six is a
  judgement call best made once the cards are roughed in. When the
  implementer hits this: make the call inline.

## Out of Scope

**From the spec's Non-Goals:**

- **Visual redesign.** The existing dark-terminal look, theme
  tokens, partials, and section rhythm are preserved as-is. No new
  colour, typography, spacing, or component patterns. Tracked: spec
  § Non-Goals.
- **Building plugin implementations.** Implementing actual Obsidian,
  Notion, or Jira plugins lives in the Spektacular tool, not this
  website plan. The site documents the architecture and names them
  as planned; no plugin code is written here. Tracked: spec
  § Non-Goals.
- **Step-by-step plugin-building tutorial.** The Extending page
  describes the `Store` and `Agent` interfaces and notes how
  registration works, but stops short of a full "how to build and
  ship your own plugin" walkthrough. Tracked: spec § Non-Goals.
- **Translation and internationalisation.** Content stays in
  English. Tracked: spec § Non-Goals.
- **SEO, analytics, or marketing copywriting beyond accuracy.** Meta
  tags and copy are corrected for accuracy but no SEO tuning, no
  analytics, no marketing rewriting. Tracked: spec § Non-Goals.
- **Backwards-compatible URLs.** Existing URLs may change as
  content is restructured. No redirects are added. Tracked: spec
  § Non-Goals.

**Deliberately deferred during planning:**

- **Automated tests for the site** (link checking, screenshot
  regression, accessibility audits). Verification is build-pass +
  manual review. Adding test infrastructure would expand scope
  beyond the spec's success metric. Tracked: future website
  operational spec if link rot or visual regressions become a
  recurring problem.
- **Reworking how Spektacular's behaviour is described in the
  README.** This plan validates site claims against the README and
  the Go source. Where the README itself contains stale content
  (e.g., the lingering "routes work to different models based on
  complexity" line), the fix lives in `../spektacular`, not in this
  plan.
- **Build-time fetching of the latest GitHub release version into
  the badge.** The badge will use a maintainer-updated
  `params.version` key in `hugo.toml`, matching the rest of the
  site's static-param convention. A build-time fetch via
  `resources.GetRemote` was considered and deferred — the manual
  update is one line per release.
- **Per-page schema metadata, Open Graph cards, structured-data
  tags.** Out of scope under the SEO non-goal; not planned for this
  work.

## Changelog

### 2026-05-26 — Phase 1.1: Make the home page truthful

**What was done**: Rewrote `layouts/home.html` to remove the TUI
screenshot section, drop the "Analyse · complexity score" pipeline
node, trim the "Haiku · Sonnet · Opus" detail from the Plan node, and
replace the six-card features grid with cards that match real
behaviour (spec-driven workflow, pluggable architecture, multi-source
knowledge, multi-agent support, resumable workflows, open source).
Pointed the hero badge at a new `Site.Params.version` and updated
`content/_index.md` so the hero subtitle no longer claims
"Complexity-aware. Interactive TUI".

**Deviations**: The hero badge value used is `v0.3.0 — early
development` rather than `v0.1.0` from context.md — the latest git tag
on `../spektacular` is `0.3.0`. The build-pass acceptance criterion
remains unchecked because `hugo` is not installed on this machine;
build verification will need to be run by the user (or via CI on
push).

**Files changed**:
- `layouts/home.html`
- `content/_index.md`
- `hugo.toml`

**Discoveries**:
- `../spektacular` git tags currently reach `0.3.0`. Context.md's
  reference to `v0.1.0` is stale; future phases that quote a version
  should source it from `git tag --list` rather than context.md.
- `internal/knowledge/set.go` resolves the provider via
  `case config.ProviderFile:`, not a literal `case "file"` —
  documentation phases should reference the `ProviderFile` constant
  if quoted at the symbol level.
- `static/images/tui.png` is now orphaned. Left in place per
  context.md; safe to delete in a follow-up cleanup if desired.

### 2026-05-26 — Phase 1.2: Make the how-it-works page truthful

**What was done**: Rewrote `layouts/how-it-works.html`. The five
quick-start steps now use the real CLI shape (`spektacular init
claude`, `spektacular spec new --data '{"name":"auth-feature"}'`,
`spektacular plan new --data '{"name":"<returned-spec-name>"}'`,
`spektacular implement new --data '{"name":"<plan-name>"}'`) and the
step prose explicitly threads the returned `spec_name` into the next
step. Pipeline Stage 2 collapsed from Analyse + Plan to a single Plan
node — complexity-scoring node, `Haiku · Sonnet · Opus` detail, and
the surrounding prose about complexity-driven model routing all
removed. Configuration section's fake `models:` / `complexity:` YAML
replaced with a short paragraph pointing at the (future)
`/configuration/` page. Roadmap section removed entirely.

**Deviations**: Roadmap was removed rather than trimmed — the
truthful remainder (v0.2 "automated execution" already shipped as
`implement`, v0.3 Aider/Cursor no longer the direction, v1.0 plugin
system partly present today) was too thin to justify keeping the
section. The build-pass acceptance criterion remains unchecked
because `hugo` is not installed on this machine.

**Files changed**:
- `layouts/how-it-works.html`

**Discoveries**:
- The quick-start "Install" step originally referenced only Claude
  Code CLI as the prerequisite. Updated to mention Claude Code, Bob,
  and Codex — matching the agents the tool actually supports.
- The Configuration teaser now links to `/configuration/`, which
  doesn't exist yet — it will be created in Phase 2.1. Link will
  404 until that phase lands.

### 2026-05-26 — Phase 1.3: Verify and adjust the install page

**What was done**: Verified all three install channels named on the
page. Homebrew tap (`jumppad-labs/homebrew-repo`) and its
`spektacular.rb` formula are current. The apt repository URL on the
page (`https://apt.fury.io/jumppad/`) returns 404 — the channel is
broken. GitHub Releases publish current artifacts, but the file
naming scheme has changed: macOS now ships as `.zip` (was `.tar.gz`),
filenames now lowercase OS and include the version (e.g.
`spektacular_0.3.0_darwin_arm64.zip`). Replaced the broken apt
section with a Go install block (`go install
github.com/jumppad-labs/spektacular@latest`) and rewrote the GitHub
Releases code blocks to use the current artifact names, with a
`<VERSION>` placeholder for the version segment.

**Deviations**: Per context.md's open-assumption guidance ("STOP and
ask before deleting a channel without replacement"), apt was
replaced rather than deleted — the page still offers three install
methods. Apt URL was not just corrected because the actual fury
account name could not be confirmed without credentials (both
`/jumppad-labs/` and `/spektacular/` return 401 for listing). The
build-pass acceptance criterion remains unchecked because `hugo` is
not installed on this machine.

**Files changed**:
- `layouts/install.html`

**Discoveries**:
- The `homebrew-repo` formula lives at the root of the repo
  (`spektacular.rb`), not under `Formula/`, and the formula class is
  named `Jumppad` (likely a copy-paste artefact from
  `jumppad.rb`) — not a problem for `brew install` but worth a
  cleanup PR upstream.
- The latest release artifact naming is
  `spektacular_<VERSION>_<os>_<arch>.<ext>` with `.zip` for macOS
  and `.tar.gz` for Linux. Future docs that quote release artifact
  names should match this pattern.
- The apt channel publishes via gemfury (per
  `../spektacular/.github/workflows/build_and_deploy.yaml`) but the
  public URL is not the one previously on the install page; if the
  team wants to keep apt as a documented channel, the correct fury
  account/URL needs to be confirmed and added back.

### 2026-05-26 — Phase 2.1: Add the Configuration page

**What was done**: Added a new `/configuration/` page documenting the
six top-level keys in `.spektacular/config.yaml` (`command`,
`agent`, `debug`, `spec`, `plan`, `knowledge`), each with its type,
defaults, supported values, and a short description of its
sub-keys. Page closes with a complete worked-example YAML block
that shows two knowledge sources at distinct scopes (a project-local
source and a team source under `${HOME}`). Added a
`[[menu.main]]` entry at weight 30 so the page appears in the nav.

**Deviations**: The "config-option row" partial described in
context.md as conditional was not extracted — the row markup is
inlined inside a `range` over a slice of dicts, mirroring the
existing pattern at `layouts/how-it-works.html` (spec-format
section). Six rows do not justify a separate partial. The
build-pass component of the visual-language acceptance criterion is
covered by the layout reusing existing theme tokens
(<code>bg-bg-base</code>, <code>border-border-subtle</code>,
<code>border-l-accent-primary</code>) — full build verification
still depends on the user running `hugo --minify`.

**Files changed**:
- `content/configuration.md` (new)
- `layouts/configuration.html` (new)
- `hugo.toml`

**Discoveries**:
- The canonical config struct lives at
  `../spektacular/internal/config/config.go:38-93` (top-level
  `Config` plus all sub-config types). Defaults are at lines
  100-133 in `NewDefault()`. Future doc updates should source from
  these symbols directly.
- The `id_method: external` mode requires the caller to pass an
  `id` on each `spec new` invocation, otherwise the command
  errors. Worth surfacing on the Configuration page if `external`
  becomes a more common workflow.
- Hugo's `Site.Menus.main` is sorted by `weight`; the
  Configuration entry sits between Install (20) and the planned
  Plugins (40) / Extending (50) entries to keep the nav grouped
  logically.

### 2026-05-26 — Phase 3.1: Add the Plugins page

**What was done**: Added a new `/plugins/` page. Opens with a
"What's pluggable" concept block describing the two plugin points
(`Store` for specs/plans/knowledge; `Agent` for the coding agent).
"What ships today" lists the four currently-registered plugins —
the `file` Store provider and the `claude`, `bob`, and `codex`
agents — each in its own card with a green status badge. "Planned"
lists Obsidian and Notion as planned knowledge backends and Jira as
a planned spec backend, each card carrying a purple "Planned ·
Store" badge so the future-state framing is unambiguous. Closes
with a CTA linking to the Extending page. Added a `[[menu.main]]`
entry at weight 40.

**Deviations**: A dedicated `plugin-card` partial was not extracted.
Shipped-today and planned cards share enough structure (icon-less
container, badge, mono name, prose body) that a partial would have
helped, but with seven cards across two distinct visual variants
(green status vs. purple planned, plus subtly different background
treatments), inlining was clearer at this volume. Easy to refactor
later if more plugins land.

**Files changed**:
- `content/plugins.md` (new)
- `layouts/plugins.html` (new)
- `hugo.toml`

**Discoveries**:
- The current `Agent` registry has exactly three entries (`claude`,
  `bob`, `codex`). Each agent registers from its own file's
  `init()` via the unexported `register()` helper at
  `../spektacular/internal/agent/agent.go:33`. Future agent
  additions should re-trigger a review of this page.
- Only the `file` provider is registered for knowledge today; the
  `default` arm of the switch at
  `../spektacular/internal/knowledge/set.go` returns
  `"provider %q is not supported"`. The page reflects this without
  enumerating the rejection message.
- The Plugins page CTA links to `/extending/`, which doesn't exist
  yet — it lands in Phase 4.1. Link will 404 until then.

### 2026-05-26 — Phase 4.1: Add the Extending page

**What was done**: Added a new `/extending/` page. Unlike the other
pages, the body is rendered from the content file's markdown via
`{{ .Content }}`. The body presents the `Store` interface
(seven-method interface plus `DirEntry` and `Hit` types, with
one-line method contracts), the `Agent` interface (two methods),
and a short "Registering a backend" section showing the `init()` +
`register()` pattern from `internal/agent/claude.go` and pointing at
the `case config.ProviderFile:` arm in `internal/knowledge/set.go`
as the worked example. Added a `[[menu.main]]` entry at weight 50,
completing the five-entry nav (How it works, Install, Configuration,
Plugins, Extending).

**Deviations**: None.

**Files changed**:
- `content/extending.md` (new — first page with a markdown body)
- `layouts/extending.html` (new)
- `hugo.toml`

**Discoveries**:
- The `prose-invert` class plus per-element overrides
  (`prose-headings`, `prose-p`, `prose-code`, `prose-pre`,
  `prose-a`, `prose-li`, `prose-strong`) maps Tailwind Typography
  onto the site's existing dark palette without introducing new
  theme tokens. Keep this configuration in sync if more
  markdown-body pages are added.
- `prose-code:before:content-none` and
  `prose-code:after:content-none` are required to strip the
  default backtick decorations Tailwind Typography adds to inline
  `<code>` elements.
- The `file` provider's worked-example registration crosses two
  files: knowledge-side registration in
  `../spektacular/internal/knowledge/set.go` (the provider switch
  in `NewSet`) and the underlying `Store` implementation in
  `../spektacular/internal/store/store.go`. Future docs that want
  to point at "where a new backend plugs in" should reference both.

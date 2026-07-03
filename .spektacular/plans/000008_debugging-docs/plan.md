# Plan: 000008_debugging-docs

<!-- Metadata -->
<!-- Created: 2026-07-03T10:45:54Z -->
<!-- Commit: e844ae0 -->
<!-- Branch: main -->
<!-- Repository: git@github.com:jumppad-labs/spektacular-website.git -->

## Overview

This plan documents Spektacular's one debugging capability, a
config-gated JSONL audit log, and makes it discoverable. Today the
capability exists but is undiscoverable and the site's one mention of it
is factually wrong (it claims debug mode logs to the console, when it
actually writes a log file). This plan corrects that inaccuracy, adds a
dedicated Debugging page that walks through enabling the capability and
what to expect, and folds Plugins, Extending, and Debugging into a new
navigation submenu so a user can find the page without already knowing
its URL.

## Conventions

- **MDX authoring Rule 1 (no layout HTML in page bodies)** — the new
  `debugging.mdx` page and the edits to `configuration.mdx` contain only
  frontmatter, component invocations, and prose; no raw `<div>`,
  `<section>`, or `class="…"` lands in either MDX body, keeping the nav
  submenu's dropdown styling entirely inside `Nav.astro` rather than
  leaking layout markup into a page.
- **MDX authoring Rule 2 (native MDX content over string-prop HTML)** —
  applies to `Hero`'s `sub` and any `Prose` body content on the new page:
  the walkthrough prose, code samples, and links are authored as native
  MDX (backticks, fenced blocks, `[text](url)`), never encoded into a
  string prop rendered via `set:html`.
- **MDX authoring Rule 3 (blank line before/after slot content)** — every
  component invocation with slot children on the new page and in the
  `configuration.mdx` edit gets a blank line after the opening tag and
  before the closing tag, matching the rest of the site's MDX.
- **MDX authoring Rule 4 (fenced code blocks via astro-expressive-code)**
  — the sample `config.yaml` snippet (`debug: enabled: true`) and the
  sample `session-log.jsonl` line are authored as triple-backtick fenced
  blocks, not `<CodeBlock code={…}>` JSX, so they render through the same
  `astro-expressive-code` chrome as every other code sample on the site.
- **No em dashes** — applies to all prose authored for this feature: the
  new page's copy, the corrected `configuration.mdx` line, and this plan
  document itself.

No other project convention applies: nothing in the knowledge base
addresses nav components, page layout choices, or documentation content
beyond these five.

## Architecture & Design Decisions

The nav gains a single new grouping item, "Resources" (label TBD at copy
time), replacing the current standalone "Plugins" and "Extending" entries
in `Nav.astro`'s `items` array. It renders as a nested `<ul>` inside the
parent `<li>`, shown via `:hover` and `:focus-within` on that `<li>` —
CSS only, no client script. This keeps the change consistent with the
site's zero-JS-by-default architecture rather than introducing the first
dropdown-toggle script anywhere in the nav. `:focus-within` also gets
keyboard-tab users a working open state for free, which a pure `:hover`
rule would not. The top-level nav item count is unchanged (still 5
entries plus GitHub): the constraint "must not add a new top-level
navigation entry" is satisfied by *replacing* two flat entries with one
grouping entry that expands to three children, not by adding alongside
them (`research.md#chosen-approach--evidence`). `Plugins` and `Extending`
keep their existing routes (`/plugins/`, `/extending/`) unchanged — only
their nav entry point moves from top-level link to submenu child link —
so existing links and bookmarks into those pages keep working, satisfying
the "must not break existing Plugins and Extending page URLs" constraint.
`isActive` is extended so the parent "Resources" item also renders in
its active state when the current path matches any child route,
otherwise a reader on `/debugging/` would see no nav item highlighted at
all.

The new page lives at `src/pages/debugging.mdx`, structurally modeled on
`src/pages/extending.mdx` rather than `plugins.mdx`: `Hero` + a single
`<Prose>`-wrapped narrative walkthrough, not a card grid or a
`ConfigurationKeys`/`ConfigKey` scannable-reference block. Discovery
found exactly one debugging capability ships today — a config-gated
JSONL audit log, detailed below — so a reference-style component built
for comparing several parallel items would either sit mostly empty or
force one capability to masquerade as a list
(`research.md#chosen-approach--evidence`). Prose reads naturally as a
single walkthrough: what the capability is, the exact steps to enable it,
and what to expect once enabled, which maps directly onto the spec's
"enablement" and "expected behavior" requirements without inventing
structure the content doesn't have yet. If Spektacular grows a second
debugging capability later, revisiting the layout choice is a future
concern, not a reason to over-build now.

Content accuracy is anchored entirely to black-box verification against
the installed `spektacular` v0.7.0 binary, since no source checkout of
`github.com/jumppad-labs/spektacular` exists on this machine
(`research.md#chosen-approach--evidence`). The page documents: the config
key (`debug.enabled: true` in `.spektacular/config.yaml`, defaulting to
`false`), the resulting artifact (`.spektacular/debug/session-log.jsonl`,
created on first command after enabling, one JSON line appended per CLI
invocation), and the verified field schema (`seq`, `timestamp`,
`session_id`, `command`, `duration_ms`, `exit_code`, `response`,
`state_before`, `state_after`, `advanced`) with a real sample line. It
also flags, as a reader heads-up rather than a fix attempted in this
repo, that the default `.spektacular/.gitignore`'s `*.log` glob does not
match `session-log.jsonl`, so enabling debug mode leaves an
ever-growing, un-ignored file — fixing the CLI's scaffolded gitignore is
out of scope for this website-only plan.

As part of this work, `src/pages/configuration.mdx`'s existing `debug`
`ConfigKey` entry is corrected: it currently claims debug mode
"surface[s] verbose internal logs to the console," which discovery
verified is false (no console or stderr output is produced under any
tested condition — `research.md#chosen-approach--evidence`). The
corrected copy states the log-file mechanism in one line and links to
the new `/debugging/` page for the full walkthrough, rather than
duplicating the field-by-field detail on both pages. This directly
satisfies the spec's "documentation accurately reflects real
capabilities" requirement, which the existing copy currently violates.

This beats the two alternatives considered during this step
(`research.md#alternatives-considered-and-rejected`): a click-toggle
dropdown with an inline script (rejected — CSS-only fully covers the
3-item static-menu use case without introducing new JS surface where
none exists), and a `ConfigurationKeys`/`ConfigKey` structured layout for
the new page (rejected for now — right shape for N parallel capabilities,
premature for the single capability that exists today).

## Component Breakdown

- **Nav (changed)** — owns the site's top-level navigation. Its item
  data model changes from a flat list of `{label, href}` entries to a
  list where one entry can additionally carry a set of child links; that
  entry renders as a grouping label with a nested menu instead of a
  plain link. Owns the CSS-only open/close behavior (`:hover` /
  `:focus-within`) and the active-state logic, now extended to treat a
  grouping entry as active whenever any of its children match the
  current route. No other component depends on Nav's internal item
  shape; pages that link to `/plugins/`, `/extending/`, or `/debugging/`
  do so independently of how the nav renders those links.

- **Debugging page (new)** — a new top-level page, reachable only
  through the nav's new grouping entry (per the "no new top-level nav
  entry" constraint, it has no direct top-level nav link of its own,
  same as how Plugins and Extending will now work). Owns the full
  walkthrough of Spektacular's one verified debugging capability:
  what it is, the exact config change that enables it, and what output
  to expect. Composes the same `Hero` + `Prose` section components the
  Extending page already uses; introduces no new section or UI
  component.

- **Configuration page (changed)** — owns the project-wide config
  reference. Its existing `debug` entry is corrected to state the actual
  delivery mechanism (a log file, not console output) and now points
  readers to the Debugging page for the full walkthrough instead of
  carrying that detail itself. No structural change to the page; the
  `ConfigurationKeys`/`ConfigKey` components it already uses are reused
  as-is.

- **Plugins page / Extending page (unchanged)** — both keep their
  existing routes, content, and structure. They participate in this
  feature only as nav children now reached through the new grouping
  entry instead of a top-level link; neither page's own content changes.

## Data Structures & Interfaces

One data shape changes: the nav's item list. Today every entry is a
plain link:

```
NavItem = { label: string, href: string }
```

This becomes a union: most entries stay plain links, but one entry is a
group with children:

```
NavItem =
  | { label: string, href: string }
  | { label: string, children: { label: string, href: string }[] }
```

Nav's render and `isActive` logic branch on whether an entry has
`children`: a plain entry renders as today; a group entry renders as a
label plus a nested menu of its children's links, and is considered
active when the current route matches any child's `href`. This is the
only contract change in the plan — there is no new page-level prop,
component API, or serialization format. The Debugging and Configuration
page changes are prose/content edits to existing MDX pages using
existing section components (`Hero`, `Prose`, `ConfigurationKeys`,
`ConfigKey`); none of them introduce a new component prop or interface.

## Implementation Detail

The nav introduces one new pattern: a two-level menu, where the site has
only ever had a flat one. The render logic gains a branch — render a
plain link, or render a label plus a nested menu — rather than a second
component or a parallel nav implementation. A developer reading `Nav`
afterward sees one list, one map, one conditional inside it; the mental
model "the nav is a list of links" extends to "the nav is a list of
links, some of which are themselves a list of links" rather than being
replaced by something structurally different. The dropdown's open/close
behavior is expressed entirely as CSS state selectors on the existing
markup (`:hover`, `:focus-within`) — no state variable, no event
listener, no script tag is introduced anywhere in the nav. This follows
the pattern already established by `Lightbox`/`AgentSelector`
(interactivity via scoped inline scripts only where genuinely needed)
by choosing not to reach for that pattern here at all, since CSS alone
fully covers a static, always-the-same-three-items menu.

The Debugging page and the Configuration page edit introduce no new
authoring pattern. Both follow the same MDX composition style already
used throughout `src/pages/*.mdx`: frontmatter, imported section
components, prose and fenced code in between. A developer authoring
either page experiences it exactly like editing `extending.mdx` or
`configuration.mdx` today — there is no new build step, no new
component API to learn, and no new content-authoring convention beyond
the four MDX rules and no-em-dashes already in force project-wide.

No existing pattern is being replaced or restructured. This plan adds
one conditional branch to one existing component's render path, and
edits/adds MDX content using components and conventions that already
exist.

## Dependencies

- **`astro-expressive-code`** — already registered in `astro.config.mjs`;
  provides the fenced-code-block chrome for the `config.yaml` and
  `session-log.jsonl` samples on the new Debugging page. No version
  change or new configuration needed.

- **Existing section components** (`Hero`, `Prose`, `ConfigurationKeys`,
  `ConfigKey`) — all already ship in `src/components/sections/`. No
  changes needed to any of them; this plan only changes which pages
  invoke them and with what content.

- **The installed `spektacular` binary (v0.7.0)** — the source of truth
  this plan's content is verified against (config schema, log file
  schema and location, absence of any other debugging capability). Not a
  build or runtime dependency of the website itself; a documentation
  accuracy dependency. If a future Spektacular release changes or adds
  to the debug-logging behavior, this page's content will drift and need
  a follow-up update — no mechanism in this plan keeps it in sync
  automatically.

- **No prior plan or spec must land first.** This is the only plan
  touching `Nav.astro`, `debugging.mdx` (new), `configuration.mdx`, and
  no prior plan (000001-000007) modified any of these files or the
  nav's data shape.

## Testing Approach

This is a content and static-markup feature; there is no application
logic to unit-test. Verification leans on the site's existing build-time
guards plus manual checks against the acceptance criteria, since the
spec defines no quantitative success metrics ("No quantitative success
metrics have been defined. The user will manually test the documentation
directly against the acceptance criteria").

**Behavioural / automated checks:**

- `npm run build` succeeding is the load-bearing automated assertion: it
  guarantees the new `debugging.mdx` page, the `Nav.astro` change, and
  the `configuration.mdx` edit all compile, every internal link
  resolves, and no MDX syntax error was introduced.
- `npx astro check` guarantees no type errors are introduced in
  `Nav.astro`'s changed item-rendering logic.
- The project's Rule 1 CI guard (`grep -nE "<div|<section|class=" src/pages/*.mdx`)
  returning zero matches guarantees the new page and the edited
  Configuration page stay pure MDX with no leaked layout markup, per
  convention.
- The project's Rule 4 CI guard (`grep -nE "<CodeBlock|code=\{|code=\""
  src/pages/*.mdx`) returning zero matches guarantees the `config.yaml`
  and `session-log.jsonl` samples are authored as fenced markdown, not
  JSX-with-a-string-prop.

**Manual — captured in the implementation test plan:**

- Acceptance criterion "Debugging docs page is reachable from a
  submenu" — visually confirming the nav's grouping entry opens on
  hover/focus and its three links (Plugins, Extending, Debugging) go to
  the right pages, and that no new top-level nav item appears, requires
  looking at the rendered site.
- Acceptance criterion "Every documented capability has an enablement
  step" and "Every documented capability describes expected output" —
  a human read-through of the rendered Debugging page confirming the
  prose actually states the exact config change and the exact expected
  log output, since "reads clearly and completely" isn't a build-time
  assertion.
- Acceptance criterion "Documented capabilities match what Spektacular
  exposes" — this plan's content was already ground-truthed against the
  installed v0.7.0 binary during discovery
  (`research.md#chosen-approach--evidence`), but confirming the shipped
  page's final wording didn't drift from that verified truth during
  authoring is a manual proofread, not an automated check.
- Visual/UX check of the dropdown's mobile behavior — the nav already
  hides one item at small breakpoints (`research.md`'s open assumption
  on responsive behavior); confirming the new submenu is usable on a
  touch device has no automated equivalent.

**Deliberate gap:** no automated test asserts the *content* of the
Debugging page is accurate over time — if a future Spektacular release
changes its debugging behavior, nothing in this plan's test surface
would catch the resulting drift (also noted under Dependencies). Keeping
the page accurate long-term is a manual maintenance concern outside this
plan's scope.

## Milestones & Phases

### Milestone 1: Configuration page stops overstating debug logging

**What changes**: The Configuration page's description of debug mode no
longer claims logs appear "on the console." Anyone reading that page
today gets a wrong mental model of how to see debug output; after this
milestone the copy says what actually happens (a log file is written)
without yet walking through the full picture. This is the smallest
correct fix and is independently valuable even before the dedicated
Debugging page exists.

#### - [x] Phase 1.1: Correct the Configuration page's debug description

The Configuration page currently tells readers that enabling debug mode
makes Spektacular "surface verbose internal logs to the console." That's
not what happens: nothing is printed to the console or terminal at all.
This phase rewrites that one description so it says what actually
happens, a log file is written, without yet going into full detail (that
arrives in Phase 2.1's dedicated page).

*Technical detail:* [context.md#phase-11](./context.md#phase-11-correct-the-configuration-pages-debug-description)

**Content example** (illustrative wording, not final copy — the
implementer may phrase it differently as long as it states the same
facts):

> Debug logging. Set `debug.enabled: true` to write a JSONL log of every
> command to `.spektacular/debug/session-log.jsonl`, useful when
> reporting issues or developing a new plugin. See the
> [Debugging](/debugging/) page for the full walkthrough.

(The `/debugging/` link is added in Phase 2.1 once that page exists —
this phase's version of the sentence omits the link, per the phase
ordering note above.)

**Acceptance criteria**:

- [x] The Configuration page's `debug` entry no longer mentions
  "console" or implies terminal output.
- [x] The Configuration page's `debug` entry states that a log file is
  written when debug mode is enabled.
- [x] The site still builds and type-checks cleanly.

### Milestone 2: A dedicated Debugging page documents the capability end-to-end

**What changes**: A new page exists (at `/debugging/`) that walks a
reader through Spektacular's one debugging capability: what it is, the
exact config change that turns it on, and exactly what to expect once
it's on (the log file's location and a sample line). The Configuration
page's `debug` entry now links to it instead of standing alone. At this
point the page is live and linkable, but not yet reachable through the
site's navigation, that's the next milestone.

#### - [x] Phase 2.1: Add a dedicated Debugging page

A new page walks a reader through Spektacular's one debugging capability
end-to-end: what it is, the exact `config.yaml` change that turns it on,
and exactly what to expect afterward (the log file's location and a
sample line showing its shape). The Configuration page's `debug` entry
is updated to link to this new page instead of standing alone, so the
two pages don't duplicate the same detail. The page exists and is
reachable by direct link at the end of this phase, but is not yet
reachable from the site's navigation.

*Technical detail:* [context.md#phase-21](./context.md#phase-21-add-a-dedicated-debugging-page)

**Content outline** (headings and shape the page follows; exact wording
is the implementer's to write, but the structure and the technical facts
below are fixed by discovery, not open for reinterpretation):

```
# Debugging (Hero heading)
Sub: one sentence framing this as "how to see what Spektacular is doing
     under the hood."

## Enabling debug logging
- States: this is off by default; every project scaffolded by
  `spektacular init` already has the key, just set to `false`.
- Shows the exact edit to `.spektacular/config.yaml`:

  ```yaml
  debug:
    enabled: true
  ```

## What gets logged
- States: once enabled, every `spektacular` command appends one line to
  `.spektacular/debug/session-log.jsonl` (created on first run after
  enabling; never truncated or rotated).
- Shows one real sample line as a fenced `json` block (the verified
  sample from context.md § Current State Analysis), and briefly glosses
  each field: `seq` (position in file), `timestamp`, `session_id`
  (`"no-active-workflow"` or `"<kind>:<name>"` when a spec/plan/implement
  workflow is active), `command`, `duration_ms`, `exit_code`, `response`
  (the command's full JSON output), `state_before`/`state_after`
  (workflow state transition, or `null` outside a workflow), `advanced`.

## Before you enable it
- One short paragraph: the default `.gitignore`'s `*.log` pattern does
  not match `session-log.jsonl`, so the log file itself is not ignored
  by git today. Suggests adding `.spektacular/debug/` to the project's
  own `.gitignore` if that matters to the reader.

(closing CtaBanner, linking back to Configuration or Plugins)
```

This is the only debugging capability the page documents — do not add
placeholder sections for a "log level" or "verbose mode" that doesn't
exist; see `research.md § Chosen approach — evidence` for the
verification that ruled those out.

**Acceptance criteria**:

- [x] A page at `/debugging/` exists and states the exact config change
  needed to enable debug logging.
- [x] The same page states exactly what output to expect once enabled,
  including where the log file lives and what one logged line looks
  like.
- [x] The Configuration page's `debug` entry links to the new page
  instead of repeating its detail.
- [x] The site still builds, type-checks cleanly, and passes the
  project's existing MDX authoring guards.

### Milestone 3: The Debugging page is discoverable from the nav

**What changes**: A visitor browsing the site can now find the Debugging
page without already knowing its URL. Plugins and Extending move out of
the top-level nav into a new grouping entry alongside Debugging; no new
top-level nav item appears, and the existing `/plugins/` and
`/extending/` links keep working exactly as before. This milestone is
what makes the capability actually discoverable, closing the loop the
spec exists to close.

#### - [x] Phase 3.1: Make the Debugging page discoverable from the nav

A visitor browsing the site can now find the Debugging page without
already knowing its URL. The "Plugins" and "Extending" links move out of
the top-level navigation into a new grouping entry that expands, on
hover or keyboard focus, to reveal Plugins, Extending, and Debugging
together. No new top-level navigation item is added, and the existing
Plugins and Extending pages keep working at their current addresses
exactly as before.

*Technical detail:* [context.md#phase-31](./context.md#phase-31-make-the-debugging-page-discoverable-from-the-nav)

**Acceptance criteria**:

- [x] The main navigation shows no new top-level item.
- [ ] Hovering or keyboard-focusing the grouping entry reveals links to
  Plugins, Extending, and Debugging. (Verified statically via rendered
  HTML/CSS logic — a real-browser hover/focus check could not be run in
  this sandbox, no chromium available. User to confirm manually via
  `npm run dev`.)
- [x] All three links navigate to the correct existing/new pages.
- [x] The grouping entry visually indicates it's active when the
  current page is Plugins, Extending, or Debugging.
- [x] The site still builds and type-checks cleanly.

## Open Questions

None. Every uncertainty identified during discovery and architecture was
resolved before this plan was finalized: the exact debugging capability
and its full schema were ground-truthed against the installed
`spektacular` v0.7.0 binary (`research.md#chosen-approach--evidence`),
the nav dropdown mechanism and the new page's layout were both decided
with the user during the architecture step, and copy details (label
text, exact wording) are ordinary implementation choices already
delegated to the implementer in context.md, not open questions. There is
no downstream system, hidden code path, or environment-dependent
behavior in this feature that could only be discovered once
implementation starts.

## Out of Scope

- **Building or modifying any actual debugging capability in
  Spektacular itself.** This plan only documents the one capability that
  already exists (`debug.enabled` → `session-log.jsonl`); it does not
  add a second capability, a log-level system, or a console-output mode
  anywhere in the `spektacular` CLI. (Spec Non-Goal.)

- **Redesigning the site's navigation or information architecture
  beyond folding Plugins, Extending, and Debugging together.** The other
  four top-level nav items (How it works, Knowledge Base, Tutorials,
  Install, Configuration) are untouched. (Spec Non-Goal.)

- **Translating or localizing the new or edited documentation.** All
  content ships in English only, consistent with the rest of the site.
  (Spec Non-Goal.)

- **Fixing `.spektacular`'s default `.gitignore` template** so its
  `*.log` pattern also matches `session-log.jsonl`. That template lives
  in the `github.com/jumppad-labs/spektacular` CLI project, not this
  website repo. The new Debugging page calls this out to readers as a
  heads-up instead (Phase 2.1), but does not fix the underlying gap.

- **Keeping the Debugging page in sync with future Spektacular
  releases.** This plan's content is accurate as of the installed
  v0.7.0 binary at time of writing. If a later release changes or adds
  debugging capabilities, updating this page is a future documentation
  task, not something this plan establishes an automated or recurring
  process for.

- **A click-toggle dropdown implementation (with a small inline
  script).** Considered during the architecture step and rejected in
  favor of the CSS-only `:hover`/`:focus-within` approach; not being
  built as a fallback or alternative. (See
  `research.md#alternatives-considered-and-rejected`.)

- **A `ConfigurationKeys`/`ConfigKey`-style structured layout for the
  Debugging page.** Considered and rejected in favor of a `Prose`
  walkthrough, since only one capability exists to document today; not
  being built alongside the chosen layout. (See
  `research.md#alternatives-considered-and-rejected`.)

## Changelog

### 2026-07-03 — Phase 1.1: Correct the Configuration page's debug description

**What was done**: Rewrote the `debug` `ConfigKey` entry on the
Configuration page. It no longer claims debug mode "surface[s] verbose
internal logs to the console" (false — no console/stderr output is ever
produced); it now states the real mechanism, a JSONL log file written to
`.spektacular/debug/session-log.jsonl`.

**Deviations**: None. The `/debugging/` cross-link is intentionally
deferred to Phase 2.1, per the plan's phase-ordering note (the target
page doesn't exist yet).

**Files changed**:
- `src/pages/configuration.mdx`

**Discoveries**: None beyond what context.md's Current State Analysis
already captured. `npm run build` and `npx astro check` both pass clean
(0 errors); the 3 pre-existing `execCommand` deprecation warnings in
`public/js/main.js` / `Shell.astro` are unrelated to this change.

### 2026-07-03 — Phase 2.1: Add a dedicated Debugging page

**What was done**: Added a new page at `src/pages/debugging.mdx`,
modeled on `extending.mdx` (Hero + Prose + CtaBanner). It walks through
enabling debug logging (the exact `config.yaml` edit), what gets logged
(log file location, append-only behavior, a full field-by-field gloss
of a real sample line), and a heads-up that the default `.gitignore`
doesn't cover the log file. Updated `configuration.mdx`'s `debug` entry
to link to the new page instead of standing alone.

**Deviations**: None. Content matches the plan's outline and the
verified schema/sample from context.md exactly.

**Files changed**:
- `src/pages/debugging.mdx` (new)
- `src/pages/configuration.mdx`

**Discoveries**: None. `CtaBanner`'s `body` slot and default slot
worked exactly as used in `extending.mdx`; no new component API
needed. Rule 1 and Rule 4 MDX guards both pass with 0 matches; `npm run
build` and `npx astro check` both pass clean.

### 2026-07-03 — Phase 3.1: Make the Debugging page discoverable from the nav

**What was done**: Changed `Nav.astro`'s `items` data model from a flat
`{label, href}[]` to a `NavItem` union type where one entry can carry
`children` instead of an `href`. Replaced the standalone Plugins and
Extending nav entries with a single "Resources" grouping entry whose
children are Plugins, Extending, and Debugging. The dropdown opens via
CSS only (`group-hover:block group-focus-within:block` on a `<ul>`
inside a `<li class="group relative">`), no script added. `isActive`
was extended so the grouping entry shows active state when any child's
route matches the current page.

**Deviations**: None from the plan's design. One implementation
correction: the first `astro check` pass failed with a type error
because TypeScript couldn't narrow `"href" in item` against the
array's inferred type; fixed by declaring the `NavItem` union type
explicitly (`items: NavItem[]`) rather than relying on inference — this
is the exact union already specified in plan.md's Data Structures
section.

**Files changed**:
- `src/components/Nav.astro`

**Discoveries**: This sandboxed environment has no working headless
browser (no `chromium-cli`; `playwright install --with-deps` needs
sudo, which isn't available; the downloaded Chromium binary is missing
`libnspr4.so` with no way to install it). The plan's one manual
acceptance criterion for this phase, actually hovering/keyboard-focusing
the dropdown in a rendered browser, could not be performed here. Verified
instead via the built HTML/CSS output: single "Resources" top-level
entry, all three children present, active-state classes apply correctly
to both the parent trigger and the matching child on `/plugins/`,
`/extending/`, and `/debugging/`. User was informed of the gap and chose
to proceed, planning to confirm hover/keyboard/mobile behavior themselves
via `npm run dev` in a real browser. The corresponding acceptance
criterion is left unchecked in plan.md pending that confirmation.

### 2026-07-03 — Post-implementation follow-up: revise nav grouping

**What was done**: After this plan shipped, the user asked to move
Plugins back to a top-level nav item (it's a conceptual page, not a
how-to) and regroup "Resources" around reference/how-to content
instead: Configuration, Extending, and Debugging. Nav is now: How it
works, Knowledge Base, Tutorials, Install, Plugins (all top-level, 5
items) plus Resources (dropdown: Configuration, Extending, Debugging).
Net top-level count grew from 6 to 7 (plus GitHub), a deliberate,
explicit user decision that supersedes this plan's original "no new
top-level nav item" constraint for the Debugging-launch scope — that
constraint applied to the initial ship, not to future iteration on the
grouping.

**Deviations**: This changes the Milestone 3 / Phase 3.1 grouping
decision recorded above (Plugins was originally kept out of top-level).
The change was made directly in `Nav.astro`, not via a new plan — it's
a small, low-risk follow-up to already-shipped work, not a new feature
requiring its own spec/plan cycle.

**Files changed**:
- `src/components/Nav.astro`

**Discoveries**: None. Same CSS-only dropdown mechanism, same
`isActive`/`matches` logic, unchanged — only the `items` array's content
moved. `npm run build` and `npx astro check` both pass clean (0
errors); active-state verified via rendered HTML on `/plugins/` (plain
top-level active) and `/configuration/` (both Resources trigger and
Configuration child show active).

# Plan: 1_install_instructions

<!-- Metadata -->
<!-- Created: 2026-04-16T14:13:20Z -->
<!-- Commit: 22eed493a49fc9d7aec36dac83d53737a1c2ebc4 -->
<!-- Branch: main -->
<!-- Repository: github.com/jumppad-labs/spektacular-website -->

<!--
  OVERVIEW
-->
## Overview

A new Install page is being added to the Spektacular website to show visitors
how to get Spektacular onto their machine. It provides tabbed install
instructions for Homebrew, Debian, and GitHub Releases, removing friction for
new users trying to get started. The page will be accessible from the top
navigation on every page of the site.

<!--
  ARCHITECTURE & DESIGN DECISIONS
-->
## Architecture & Design Decisions

A single `install.html` page will be created in the project root, consistent
with the existing page-per-file convention (`index.html`, `how-it-works.html`).
The page uses a tabbed interface to present install methods — Homebrew, Debian,
and GitHub Releases — showing only the selected tab's content at a time.

Tab switching will be implemented in vanilla JS, extending `assets/js/main.js`
to stay consistent with the site's minimal-dependency approach. The active tab
highlights using the existing purple accent from the design system. Command
blocks reuse the `.install-block` and `.code-block` CSS classes already present
in the stylesheet, keeping visual consistency with the homepage hero.

Navigation links to `install.html` will be added to the nav in both
`index.html` and `how-it-works.html`, following the existing `<li><a href="...">`
pattern.

Options 1 and 3 were rejected: Option 1 (all sections visible) is adequate but
less focused for users who know their platform; Option 3 (multiple pages)
introduces heavy nav/footer duplication for trivial content. Fedora/dnf was
dropped because the release pipeline builds only `.deb` packages — no RPM
support exists. See `research.md § Alternatives considered and rejected` for
full evidence.

<!--
  COMPONENT BREAKDOWN
-->
## Component Breakdown

- **Install page** — New standalone page presenting Spektacular install
  instructions. Owns the tab UI shell, page hero, and overall layout. Delegates
  command display to install blocks and tab content panels.

- **Tab component** — New UI pattern (tabs + panels) added to the install page.
  Owns the tab switching behaviour — activating the selected panel and
  deactivating others. Implemented in vanilla JS extending the existing script
  file; styled with a new small CSS block following the existing design tokens.

- **Install command blocks** — Reused existing `.install-block` and
  `.code-block` patterns. Each tab panel contains one or more command blocks for
  its platform. No changes to the existing CSS classes required.

- **Top navigation** — Existing component, updated on every page. Gains a new
  "Install" link pointing to the install page, inserted alongside the existing
  "How it works" link.

<!--
  DATA STRUCTURES & INTERFACES
-->
## Data Structures & Interfaces

This feature introduces no new backend types, APIs, or serialization
boundaries — it is purely a static HTML/CSS/JS addition.

The one implicit contract is the tab component's DOM interface:

```
Tab trigger:  <button class="tab-btn" data-tab="<id>">
Tab panel:    <div class="tab-panel" id="<id>">
Active state: .tab-btn--active / .tab-panel--active (toggled by JS)
```

`data-tab` on a trigger must match the `id` of its corresponding panel — this
is the only coupling between the tab buttons and content. The JS reads this
attribute to resolve which panel to activate; no other state is shared between
components.

<!--
  IMPLEMENTATION DETAIL
-->
## Implementation Detail

The install page follows the same structural template as existing pages —
identical nav, page-hero section, and footer — so a developer reading it will
immediately recognise the shape. The only new pattern introduced is the tab
component.

Tabs are implemented with a lightweight data-attribute convention: trigger
buttons carry a `data-tab` attribute that maps to a panel `id`. The JS event
handler (added to the existing script file) attaches a single delegated click
listener to the tab container, reads `data-tab` from the clicked button, removes
the active class from all triggers and panels, then sets it on the matched pair.
This keeps the logic self-contained with no global state.

CSS for the tabs follows the existing design-token approach — colours come from
CSS custom properties already defined in the stylesheet, no new variables are
needed. A small new block of rules handles the tab strip layout and the
active/inactive visual states.

The nav update is a pure copy-edit: the same `<li><a>` pattern used for the
existing "How it works" link is duplicated for "Install" on every page that
carries the nav.

<!--
  DEPENDENCIES
-->
## Dependencies

- **`assets/css/style.css`** — Provides all design tokens and existing component
  classes (`.install-block`, `.code-block`, `.nav`, etc.). No changes required;
  new tab CSS rules will be appended.
- **`assets/js/main.js`** — Provides the existing copy-to-clipboard and
  smooth-scroll utilities. Tab switching logic will be added here; no existing
  behaviour changes.
- **`index.html` / `how-it-works.html`** — Nav must be updated on both pages to
  add the Install link. No other changes to these files.

No external libraries, upstream specs, or prior plans are required. No new
packages are introduced.

<!--
  TESTING APPROACH
-->
## Testing Approach

This is a static HTML site with no build pipeline, automated test suite, or CI
test step — there are no existing test conventions to slot into. Testing is
manual and browser-based.

The load-bearing checks are:

- **Nav link present on all pages** — visit `index.html` and
  `how-it-works.html`, confirm the Install link appears in the top nav and
  navigates to the install page.
- **Tab switching works** — click each tab (Homebrew, Debian, GitHub Releases),
  confirm only the selected panel is visible and the active tab is highlighted.
- **All command blocks are present** — each tab panel displays the correct
  install commands for its platform.
- **Copy buttons function** — clicking a copy button on any command block copies
  the command to the clipboard.
- **Visual consistency** — the install page matches the look and feel of the
  existing pages (dark theme, typography, spacing).

No automated tests will be added, as the project has none and this is a simple
content page. The acceptance criteria in the spec serve as the test checklist.

<!--
  MILESTONES & PHASES
-->
## Milestones & Phases

### Milestone 1: Install page with all install methods

**What changes**: A new Install page is live, containing tabbed instructions for
Homebrew, Debian, and GitHub Releases. Each tab shows the relevant commands in
styled command blocks with copy buttons. The page matches the visual style of
the existing site.

#### - [ ] Phase 1.1: Create the install page

The install page is built as a new HTML file containing a tab strip and three
content panels — one each for Homebrew, Debian, and GitHub Releases. Each panel
holds the relevant commands in styled blocks with copy buttons. Tab switching
behaviour is added to the existing JS file, and a small block of tab CSS rules
is appended to the existing stylesheet. The page includes the standard nav and
footer so it looks and feels like the rest of the site.

*Technical detail:* [context.md#phase-11](./context.md#phase-11-create-the-install-page)

**Acceptance criteria**:

- [ ] The install page opens in a browser without errors
- [ ] Three tabs are visible: Homebrew, Debian, GitHub Releases
- [ ] Clicking each tab shows only that tab's content
- [ ] The active tab is visually distinct from the inactive tabs
- [ ] Each tab panel displays the correct install commands
- [ ] Copy buttons on each command block copy the command to the clipboard
- [ ] The page visually matches the style of the existing site

### Milestone 2: Install page linked from top navigation

**What changes**: The Install page is reachable from the top navigation on every
page of the site. Visitors no longer need to know the URL directly — the link is
visible alongside "How it works" on every page.

#### - [ ] Phase 2.1: Add Install link to top navigation

The nav on both existing pages gains a new "Install" link pointing to the
install page. No other changes are made to those files.

*Technical detail:* [context.md#phase-21](./context.md#phase-21-add-install-link-to-top-navigation)

**Acceptance criteria**:

- [ ] The Install link appears in the top nav on the homepage
- [ ] The Install link appears in the top nav on the How it works page
- [ ] Clicking the link navigates to the install page

<!--
  OPEN QUESTIONS
-->
## Open Questions

None. All design decisions have been resolved, the codebase patterns are clear,
and the spec is fully scoped.

<!--
  OUT OF SCOPE
-->
## Out of Scope

- **All-methods-visible layout (Option 1)** — Decided against during
  architecture; tabs were chosen instead. No follow-up planned.
- **Multiple pages per install method (Option 3)** — Rejected as over-engineered
  for this content volume. No follow-up planned.
- **Fedora/dnf install method** — The release pipeline builds only `.deb`
  packages; no RPM support exists. Linux users on non-Debian distros are
  directed to GitHub Releases.
- **Automated tests** — The project has no test suite. Adding one is out of
  scope for this plan.
- **Additional install methods** — Windows instructions or other platforms are
  not covered. Any additions would be a follow-up update to the install page.

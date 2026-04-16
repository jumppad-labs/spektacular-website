# Research: 1_install_instructions

## Alternatives considered and rejected

### Option 1: Single page, all methods visible

All install methods displayed as sequential sections on one scrollable page,
using existing `.install-block` and `.code-block` classes. No new JS required.

**Rejected**: Adequate but less focused — users who know their platform must
scroll past irrelevant content. The `how-it-works.html` all-sections pattern
works for a guide with a logical reading order; install instructions do not
have that property. Tabbed approach (Option 2) is cleaner UX for a focused
"pick your platform" task.

### Option 3: Multiple pages per install method

Separate HTML files for each method (`install-homebrew.html`,
`install-debian.html`, etc.) linked from a landing `install.html`.

**Rejected**: Heavy nav/footer duplication across 4+ files for trivial content
volume. `index.html` and `how-it-works.html` already copy-paste the nav
identically — adding more files makes future nav changes a multi-file edit
with no structural benefit. (`index.html:12-35`, `how-it-works.html:12-35`)

### Fedora/dnf tab

A Fedora tab showing dnf install commands, as originally in the spec.

**Rejected**: The release pipeline (`../spektacular/dagger/main.go:200-228`)
builds only `.deb` packages for Linux — no RPM packaging exists. There is no
dnf repository to point users to. Linux users on non-Debian distros are
directed to GitHub Releases instead.

## Chosen approach — evidence

Option 2 (tabbed single page) is supported by:

- `assets/js/main.js` — ~40 lines of vanilla JS with no framework. A
  delegated click listener for tabs fits this pattern cleanly with minimal
  additions.
- `assets/css/style.css:13-54` — CSS custom properties (`--color-primary`,
  `--text-secondary`, `--border-subtle`) already defined; no new design tokens
  needed for tab active/inactive states.
- `assets/css/style.css:256-302` — `.install-block` and `.copy-btn` ready to
  reuse inside each tab panel without modification.
- `how-it-works.html:12-35` — Nav pattern confirmed: `<ul class="nav__links">`
  with `<li><a>` children. Adding an Install link is a one-line insertion per
  file.
- `../spektacular/dagger/main.go:439-454` — Homebrew tap confirmed as
  `jumppad-labs/homebrew-repo`, formula `spektacular`.
- `../spektacular/dagger/main.go:468-495` — Debian packages pushed to GemFury
  at `apt.fury.io/jumppad`, confirming the apt repo URL and install commands.

## Files examined

- `index.html:1-232` — Homepage; confirmed nav structure (12-35),
  `.install-block` usage (58-64), design token application throughout.
- `how-it-works.html:1-478` — Guide page; confirmed `.page-hero` pattern
  (37-46), `.steps`/`.code-block` usage (48-119), footer (460-473). Used as
  page scaffold template.
- `assets/css/style.css:1-938` — Full design system; confirmed design tokens
  (13-54), code block styles (227-254), install block styles (256-302), nav
  styles (304-365).
- `assets/js/main.js:1-~40` — Confirmed vanilla JS only; copy-to-clipboard and
  smooth-scroll. No existing tab logic.
- `.github/workflows/deploy.yml` — GitHub Pages deployment on push to main.
  No build step; files served as-is from repo root.
- `../spektacular/.github/workflows/build_and_deploy.yaml` — Dagger-based
  release pipeline; confirmed Homebrew, GemFury, and GitHub Releases publishing.
- `../spektacular/dagger/main.go` — Release pipeline source; confirmed package
  types built (deb only for Linux), Homebrew tap name, GemFury org slug, and
  GitHub Releases URL pattern.

## External references

- GemFury apt repo format: `https://apt.fury.io/<org>/` — confirmed from
  `main.go:477`. Install docs pattern: add apt source, `apt update`,
  `apt install`.

## Prior plans / specs consulted

- `.spektacular/specs/1_install_instructions.md` — Source of truth for
  requirements and acceptance criteria. Fedora requirement dropped after
  pipeline investigation confirmed no RPM build exists.

## Open assumptions

None. All install commands and package registry URLs were verified directly
from the release pipeline source (`../spektacular/dagger/main.go`).

## Rehydration cues

To rebuild context from cold:
1. Read `index.html:12-35` for nav pattern
2. Read `how-it-works.html:37-50` for `.page-hero` scaffold
3. Read `assets/css/style.css:256-302` for `.install-block` / `.copy-btn`
4. Read `assets/js/main.js` for JS conventions
5. Read `../spektacular/dagger/main.go:428-495` for Homebrew tap name and
   GemFury apt URL
6. Read `context.md#phase-11` for exact HTML/CSS/JS to write

# Context: 1_install_instructions

## Current State Analysis

The site is plain static HTML served via GitHub Pages. Two pages exist:

- `index.html` (232 lines) — Homepage with hero, feature grid, and a single
  `.install-block` showing the `go install` command (`index.html:58-64`).
- `how-it-works.html` (478 lines) — Guide page with `.page-hero`, `.steps`,
  and `.code-block` usage (`how-it-works.html:37-119`).

Navigation is copy-pasted identically into each page at lines 12-35. The nav
currently has one link ("How it works") plus a GitHub icon link.

Key CSS classes already available (no changes needed):
- `.install-block` / `.install-block__prefix` / `.install-block__cmd` /
  `.copy-btn` — styled command blocks with copy buttons
  (`assets/css/style.css:256-302`)
- `.code-block` — dark background pre/code block (`assets/css/style.css:227-254`)
- `.page-hero` — full-width hero section used at top of inner pages
  (`how-it-works.html:37-46`)
- Design tokens: `--color-primary: #7c3aed`, `--terminal-green: #3fb950`,
  `--bg-code: #1c2128`, `--border-subtle` (defined in `style.css:13-54`)

JS in `assets/js/main.js` (~40 lines): copy-to-clipboard handler and
smooth-scroll. No tab logic exists yet.

Release pipeline (`spektacular/dagger/main.go`) confirms:
- Homebrew tap: `jumppad-labs/homebrew-repo`, formula: `spektacular`
  (`main.go:439-454`)
- Debian `.deb` packages pushed to GemFury at `apt.fury.io/jumppad`
  (`main.go:468-495`)
- No RPM/dnf packages built — Linux non-Debian users directed to GitHub Releases
- GitHub Releases URL: `https://github.com/jumppad-labs/spektacular/releases`

## Per-Phase Technical Notes

### Phase 1.1: Create the install page

New file `install.html` in the project root. Scaffold from
`how-it-works.html` — copy the `<head>`, nav (`lines 12-35`), `.page-hero`
section (`lines 37-46`), and footer (`lines 460-473`). Update `<title>` and
hero heading to "Install Spektacular".

**Tab structure** — inside the main content section, add:

```html
<div class="tabs" id="install-tabs">
  <button class="tab-btn tab-btn--active" data-tab="homebrew">Homebrew</button>
  <button class="tab-btn" data-tab="debian">Debian / Ubuntu</button>
  <button class="tab-btn" data-tab="github-releases">GitHub Releases</button>
</div>
```

**Tab panels:**

- `id="homebrew"` (active by default):
  ```html
  <div class="install-block">
    <span class="install-block__prefix">$</span>
    <code class="install-block__cmd">brew install jumppad-labs/homebrew-repo/spektacular</code>
    <button class="copy-btn" data-copy="brew install jumppad-labs/homebrew-repo/spektacular">Copy</button>
  </div>
  ```

- `id="debian"`:
  ```html
  <div class="code-block">
    <pre><code>echo "deb [trusted=yes] https://apt.fury.io/jumppad/ /" \
  | sudo tee /etc/apt/sources.list.d/spektacular.list
  sudo apt update
  sudo apt install spektacular</code></pre>
  </div>
  ```

- `id="github-releases"`:
  A `.code-block` with prose and a link to
  `https://github.com/jumppad-labs/spektacular/releases` — download the
  appropriate archive, extract, and move the binary to `$PATH`. Include
  copy-able `tar` / `unzip` commands for linux and darwin archives matching
  the naming convention from `main.go:237-245`.

**CSS additions** — append to end of `assets/css/style.css`:

```css
/* ── Tabs ───────────────────────────────────────────────── */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 1.5rem;
}
.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.6rem 1.25rem;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn--active {
  border-bottom-color: var(--color-primary);
  color: var(--text-primary);
}
.tab-panel { display: none; }
.tab-panel--active { display: block; }
```

**JS additions** — append to end of `assets/js/main.js`:

```js
// Tab switching
const tabsEl = document.getElementById('install-tabs');
if (tabsEl) {
  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
    btn.classList.add('tab-btn--active');
    document.getElementById(target).classList.add('tab-panel--active');
  });
  // activate first tab on load
  const firstBtn = tabsEl.querySelector('.tab-btn');
  if (firstBtn) firstBtn.click();
}
```

**Complexity**: Low
**Token estimate**: ~10k
**Agent strategy**: Single agent, sequential execution

### Phase 2.1: Add Install link to top navigation and update homepage hero

- `index.html` — insert before the GitHub icon `<li>` (around line 28):
  ```html
  <li><a href="install.html">Install</a></li>
  ```
- `how-it-works.html` — same insertion at the same nav position (around
  line 28).
- `index.html:61-62` — update the hero install block from `go install` to
  the Homebrew command:
  ```html
  <code class="install-block__cmd">brew install jumppad-labs/homebrew-repo/spektacular</code>
  <button class="copy-btn" data-copy="brew install jumppad-labs/homebrew-repo/spektacular">Copy</button>
  ```

**Complexity**: Low
**Token estimate**: ~5k
**Agent strategy**: Single agent, sequential execution

## Testing Strategy

Manual browser testing only. No automated test suite exists in this project.
Acceptance criteria in the spec and plan serve as the test checklist. Open the
HTML files directly in a browser (no server needed for static assets).

## Project References

- Spec: `.spektacular/specs/1_install_instructions.md`
- Homepage: `index.html`
- Guide page: `how-it-works.html`
- Stylesheet: `assets/css/style.css`
- JS: `assets/js/main.js`
- Release pipeline: `../spektacular/dagger/main.go`
- Deployment: `.github/workflows/deploy.yml` (GitHub Pages, deploys on push
  to main)

## Token Management Strategy

| Tier   | Token Budget | Agent Strategy                            |
|--------|-------------|-------------------------------------------|
| Low    | ~10k        | Single agent, sequential                  |
| Medium | ~25k        | 2-3 parallel agents                       |
| High   | ~50k+       | Parallel analysis, sequential integration |

Both phases in this plan are Low tier.

## Migration Notes

N/A — static HTML addition, no data migration required.

## Performance Considerations

N/A — static HTML page with minimal JS. No performance implications.

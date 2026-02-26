# Spektacular Website - Implementation Plan

**Created:** 2026-02-26
**Type:** Ad-hoc
**Plan:** `.docs/adhoc/spektacular-website/`

---

## Overview

Build a two-page static website to showcase the Spektacular project. The site will explain what Spektacular is, how it works, and how to get started. It must be hostable on GitHub Pages with no build step required.

**Why:** Spektacular currently has no web presence beyond the GitHub repository README. A polished landing page will make the project more approachable and discoverable.

**Expected Outcome:** A live GitHub Pages site at `https://nicholasjackson.github.io/spektacular-website/` (or custom domain later) with two clean, dark-themed pages targeting developers.

---

## Current State Analysis

- Empty repository with only a `README.md`
- No build tooling, no framework installed
- TUI screenshot available at `../spektacular/images/tui.png`
- Full project source available at `../spektacular/` for reference copy

**Key constraint:** GitHub Pages serves static files — no server-side rendering, no Node.js at runtime. Options are:
1. Pure HTML/CSS/JS (zero build, zero dependencies) — **recommended**
2. Jekyll (GitHub Pages native, requires `_config.yml`)
3. Astro/Next.js deployed via GitHub Actions

**Decision:** Pure HTML/CSS/JS. Two pages, no framework. Keeps the repo focused on the website content, not tooling.

---

## Desired End State

```
spektacular-website/
├── index.html          # Landing page
├── how-it-works.html   # Deep dive / docs page
├── assets/
│   ├── css/
│   │   └── style.css   # All styles
│   ├── js/
│   │   └── main.js     # Minimal JS (copy button, scroll)
│   └── images/
│       └── tui.png     # TUI screenshot (copied from spektacular)
└── .nojekyll           # Prevents Jekyll processing
```

**Verification:** `open index.html` in a browser shows the landing page correctly. `gh-pages` branch (or main branch root) serves the site.

---

## What We Are NOT Doing

- No CMS, no SSG framework (Hugo, Astro, Jekyll)
- No dark/light toggle (dark only — developer audience)
- No animations or JavaScript-heavy interactions
- No blog or changelog
- No backend or API calls
- No custom domain configuration (out of scope for now)
- No SEO metadata beyond basics
- No tracking / analytics scripts

---

## Implementation Approach

Build page-by-page, starting with the design system (CSS variables + base styles), then index.html, then how-it-works.html. Use semantic HTML5 throughout. All styles in a single `style.css` to keep it simple and maintainable.

---

## Phase 1: Project Setup & Design System

### Overview

Create the file structure and define the full design system in CSS. Everything that follows will reference these variables.

### Changes Required

#### 1. Create `.nojekyll`

**File:** `.nojekyll`
Empty file that tells GitHub Pages not to process this with Jekyll (important for files/folders starting with `_`).

```bash
touch .nojekyll
```

#### 2. Create `assets/css/style.css` — Design System

The complete CSS design system. Core variables and resets defined first.

**Color Palette (GitHub Dark + Purple AI accent):**

```css
:root {
  /* Backgrounds */
  --bg-base:     #0d1117;   /* Page background — GitHub dark */
  --bg-surface:  #161b22;   /* Cards, nav, sections */
  --bg-elevated: #21262d;   /* Hover states, code blocks */
  --bg-code:     #1c2128;   /* Inline code, terminal blocks */

  /* Borders */
  --border-subtle:  #30363d;
  --border-default: #3d444d;

  /* Text */
  --text-primary:   #e6edf3;
  --text-secondary: #8b949e;
  --text-muted:     #656d76;

  /* Accent — Purple (AI / intelligence) */
  --accent-primary: #7c3aed;
  --accent-light:   #a78bfa;
  --accent-subtle:  #1a1033;  /* Background tint for accent areas */

  /* Terminal green (CLI output, success) */
  --terminal-green: #3fb950;
  --terminal-green-dim: #238636;

  /* Link blue */
  --link-blue: #58a6ff;

  /* CTA */
  --cta-bg:   #7c3aed;
  --cta-text: #ffffff;
  --cta-hover-bg: #6d28d9;
}
```

**Typography:**

```css
/* System font stack — no web font requests, loads instantly */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
    sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-base);
  margin: 0;
  padding: 0;
}

code, kbd, pre, .terminal {
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace,
    "SFMono-Regular", Consolas, monospace;
}

h1 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; line-height: 1.1; }
h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 700; }
h3 { font-size: 1.25rem; font-weight: 600; }
```

**Utility classes:**

```css
.container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }
.section    { padding: 6rem 0; }
.section--alt { background: var(--bg-surface); }

/* Pill / badge */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.badge--purple { background: var(--accent-subtle); color: var(--accent-light); border: 1px solid var(--accent-primary); }
.badge--green  { background: #0d2010; color: var(--terminal-green); border: 1px solid var(--terminal-green-dim); }
```

---

## Phase 2: Landing Page (`index.html`)

### Overview

The main showcase page. Visitors land here from GitHub, search, or links. Must immediately communicate what Spektacular is and invite them to learn more.

### Page Structure

```
[NAV]
[HERO]          — Tagline + install command + CTA buttons
[DEMO]          — Full-width TUI screenshot
[HOW IT WORKS]  — 3-step visual pipeline
[FEATURES]      — 6-card feature grid
[CTA BANNER]    — Final call to action
[FOOTER]
```

### Detailed Section Specs

#### NAV

```html
<nav class="nav">
  <div class="container nav__inner">
    <a href="index.html" class="nav__logo">
      <span class="nav__logo-text">spektacular</span>
    </a>
    <ul class="nav__links">
      <li><a href="how-it-works.html">How it works</a></li>
      <li>
        <a href="https://github.com/nicholasjackson/spektacular"
           class="nav__github" target="_blank" rel="noopener">
          <!-- GitHub SVG icon -->
          GitHub
        </a>
      </li>
    </ul>
  </div>
</nav>
```

**Styles:** Sticky top, `background: var(--bg-surface)`, `border-bottom: 1px solid var(--border-subtle)`. Logo in bold white with purple hover.

#### HERO SECTION

**Eyebrow:** Badge pill — `"v0.1.0 — early development"` in green

**Headline (H1):**
> Write the spec.
> Ship the software.

**Subheadline:**
> Spektacular takes a markdown specification and uses AI coding agents to produce a detailed, actionable implementation plan. Agent-agnostic. Complexity-aware. Interactive TUI.

**Install command block:**
```html
<div class="install-block">
  <span class="install-prefix">$</span>
  <code class="install-cmd">pip install spektacular</code>
  <button class="copy-btn" data-copy="pip install spektacular">Copy</button>
</div>
```
Dark pill, monospace, green `$` prefix, copy-to-clipboard button.

**CTA buttons:**
```html
<a href="how-it-works.html" class="btn btn--primary">Get Started →</a>
<a href="https://github.com/nicholasjackson/spektacular"
   class="btn btn--secondary" target="_blank">View on GitHub</a>
```
Primary: purple fill. Secondary: outlined border with `var(--border-default)`.

#### DEMO (TUI Screenshot)

Full-width dark panel below the hero, centered:

```html
<section class="section section--demo">
  <div class="container">
    <p class="demo-caption">The Spektacular TUI — real-time agent output, interactive questions, 5 color themes</p>
    <div class="demo-frame">
      <img src="assets/images/tui.png" alt="Spektacular TUI showing markdown output and interactive question panel"
           loading="lazy" />
    </div>
  </div>
</section>
```

**Styles:** Demo frame has a subtle border `var(--border-default)`, `border-radius: 12px`, drop shadow. Image fills 100% width.

#### HOW IT WORKS — Horizontal Flow Diagram

**Design choice (confirmed):** Horizontal flow diagram showing the pipeline as connected boxes — `spec.md → [Analyse] → [Plan]` — with annotation labels below each node, and output files listed at the end.

```html
<section class="section section--alt" id="how-it-works">
  <div class="container">
    <h2>From idea to plan</h2>
    <p class="section-sub">Write a spec. Spektacular scores complexity, routes to the right model, and runs an interactive planning agent.</p>

    <!-- Flow diagram -->
    <div class="pipeline-diagram">
      <div class="pipeline-node pipeline-node--file">
        <div class="pipeline-node__icon">📄</div>
        <div class="pipeline-node__label">spec.md</div>
        <div class="pipeline-node__sub">your requirements</div>
      </div>

      <div class="pipeline-connector">
        <span class="pipeline-connector__line"></span>
        <span class="pipeline-connector__arrow">→</span>
      </div>

      <div class="pipeline-node pipeline-node--step">
        <div class="pipeline-node__name">Analyse</div>
        <div class="pipeline-node__sub">complexity score<br>0.0 – 1.0</div>
        <div class="pipeline-node__detail">cheap model<br>(fast &amp; free)</div>
      </div>

      <div class="pipeline-connector">
        <span class="pipeline-connector__line"></span>
        <span class="pipeline-connector__arrow">→</span>
      </div>

      <div class="pipeline-node pipeline-node--step">
        <div class="pipeline-node__name">Plan</div>
        <div class="pipeline-node__sub">explores codebase<br>asks questions</div>
        <div class="pipeline-node__detail">Haiku · Sonnet · Opus<br>scaled by score</div>
      </div>

      <div class="pipeline-connector">
        <span class="pipeline-connector__line"></span>
        <span class="pipeline-connector__arrow">→</span>
      </div>

      <div class="pipeline-node pipeline-node--output">
        <div class="pipeline-node__icon">📋</div>
        <div class="pipeline-node__label">plan.md</div>
        <div class="pipeline-node__sub">+ research.md<br>+ context.md</div>
      </div>
    </div>

    <!-- Annotation row below the diagram -->
    <div class="pipeline-annotations">
      <p>The analyse phase uses a cheap model to score complexity. The planning agent then uses the score to select a model tier — so simple tasks stay cheap and complex ones get the power they need.</p>
    </div>
  </div>
</section>
```

**Styles for pipeline diagram:**
```css
.pipeline-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin: 3rem 0 2rem;
  flex-wrap: wrap;
}

.pipeline-node {
  text-align: center;
  padding: 1.5rem 1.25rem;
  border-radius: 8px;
  min-width: 130px;
}
.pipeline-node--file,
.pipeline-node--output {
  background: var(--bg-code);
  border: 1px dashed var(--border-default);
}
.pipeline-node--step {
  background: var(--accent-subtle);
  border: 1px solid var(--accent-primary);
}
.pipeline-node__name {
  font-weight: 700;
  color: var(--accent-light);
  font-size: 1.1rem;
}
.pipeline-node__label {
  font-family: monospace;
  color: var(--text-primary);
  font-size: 0.95rem;
}
.pipeline-node__sub  { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.4rem; }
.pipeline-node__detail { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem; }

.pipeline-connector {
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  color: var(--text-muted);
  font-size: 1.5rem;
}

/* On mobile, stack vertically */
@media (max-width: 768px) {
  .pipeline-diagram { flex-direction: column; }
  .pipeline-connector { transform: rotate(90deg); }
}
```

#### FEATURES GRID

Six feature cards in a 3×2 grid (2×3 on mobile):

| # | Icon | Title | Description |
|---|------|-------|-------------|
| 1 | 📄 | Spec-first | Write requirements before code. Structured markdown specs drive all AI workflows. |
| 2 | 🤖 | Agent-agnostic | Works with Claude Code, Aider, Cursor — bring your own agent. |
| 3 | 🎨 | Interactive TUI | Beautiful terminal UI with real-time streaming, 5 color themes, keyboard control. |
| 4 | ⚡ | Complexity-aware | Routes tasks to the right model tier. Pay for what you need. |
| 5 | 🧠 | Knowledge-driven | Project knowledge base feeds context to every plan. Gets smarter over time. |
| 6 | 🔓 | Open source | Apache 2.0. Build on it, extend it, run it anywhere. |

```html
<section class="section" id="features">
  <div class="container">
    <h2>Built for how developers actually work</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">📄</div>
        <h3>Spec-first</h3>
        <p>Write requirements before code. Structured markdown specs drive all AI workflows and keep intent clear.</p>
      </div>
      <!-- ... repeat for all 6 -->
    </div>
  </div>
</section>
```

**Card styles:** `background: var(--bg-surface)`, `border: 1px solid var(--border-subtle)`, `border-radius: 8px`, `padding: 1.5rem`, hover lifts with `border-color: var(--accent-primary)` transition.

#### CTA BANNER

```html
<section class="section section--cta">
  <div class="container container--narrow">
    <h2>Ready to build smarter?</h2>
    <p>Spektacular is free and open source. Start with a spec, ship with confidence.</p>
    <div class="cta-buttons">
      <a href="how-it-works.html" class="btn btn--primary btn--lg">Get Started →</a>
      <a href="https://github.com/nicholasjackson/spektacular"
         class="btn btn--secondary btn--lg" target="_blank">Star on GitHub ⭐</a>
    </div>
  </div>
</section>
```

**Style:** Centered, `background: var(--accent-subtle)`, `border-top: 1px solid var(--accent-primary)`.

#### FOOTER

```html
<footer class="footer">
  <div class="container footer__inner">
    <span class="footer__copy">
      Spektacular —
      <a href="https://github.com/nicholasjackson/spektacular/blob/main/LICENSE">Apache 2.0</a>
    </span>
    <div class="footer__links">
      <a href="https://github.com/nicholasjackson/spektacular" target="_blank">GitHub</a>
      <a href="https://pypi.org/project/spektacular/" target="_blank">PyPI</a>
    </div>
  </div>
</footer>
```

---

## Phase 3: How It Works Page (`how-it-works.html`)

### Overview

The deep-dive page for developers who want to understand the system before installing. Covers the full pipeline, spec format, CLI commands, and configuration.

### Page Structure

```
[NAV — same as index.html]
[PAGE HERO]         — Simple heading, no full viewport height
[QUICK START]       — Install + 4-step quick start
[SPEC FORMAT]       — Markdown spec anatomy with annotated example
[THE PIPELINE]      — Detailed explanation of analyse → plan
[CONFIGURATION]     — config.yaml model routing reference
[ROADMAP]           — v0.2, v0.3, v1.0 milestones (timeline style)
[FOOTER — same]
```

### Detailed Section Specs

#### PAGE HERO (simple)

```html
<section class="page-hero">
  <div class="container">
    <h1>How Spektacular Works</h1>
    <p class="page-hero__sub">A deep dive into spec-driven development — from writing your first spec to reviewing a complete implementation plan.</p>
  </div>
</section>
```

#### QUICK START

4-step numbered sequence with code blocks:

```
Step 1: Install
  pip install spektacular

Step 2: Initialize your project
  cd my-project
  spektacular init

Step 3: Create a spec
  spektacular new auth-feature --title "User Authentication"
  $EDITOR .spektacular/specs/auth-feature.md

Step 4: Generate a plan
  spektacular plan .spektacular/specs/auth-feature.md
```

Each step rendered as a card with a large step number, explanation text, and styled code block.

#### SPEC FORMAT

Annotated example of a complete spec with callouts explaining each section:

```markdown
# Feature: User Authentication

## Overview
Add OAuth2 login with Google and GitHub providers.

## Requirements          ← What must be true when done
- [ ] Users can sign in with Google OAuth2
- [ ] Session persists across browser refreshes

## Constraints          ← Boundaries the agent must respect
- Must use existing Express backend
- No new dependencies over 50KB gzipped

## Acceptance Criteria  ← How to verify it works
- [ ] Login completes in under 3 seconds

## Technical Approach   ← Optional hints for the agent
Use passport.js for OAuth2 strategy management.

## Non-Goals           ← Explicitly out of scope
Social login with Apple or Microsoft.
```

Display as a split panel: spec on the left (styled code block), section annotations on the right.

#### THE PIPELINE

Detailed explanation of the `spec → analyse → plan → execute → validate` pipeline with a diagram:

```
┌──────────┐   complexity   ┌──────────┐   structured   ┌──────────┐
│  spec.md  │ ─────────────▶│ Analyse  │ ──────────────▶│   Plan   │
└──────────┘    scoring     └──────────┘     output     └──────────┘
                                │                            │
                          cheap model                 scaled by score
                          (Haiku)                    (Haiku/Sonnet/Opus)
```

Text explanation below:
- **Analyse phase:** Scores spec complexity on 0.0–1.0 scale using a cheap model. Checks lines, requirements count, constraint density, and keywords.
- **Plan phase:** Uses the scored complexity to select a model tier. The planning agent loads your knowledge base, explores the codebase, asks clarifying questions via TUI, and outputs `plan.md`, `research.md`, and `context.md`.

#### CONFIGURATION REFERENCE

Show the `config.yaml` with inline comments explaining each field:

```yaml
models:
  default: anthropic/claude-3-5-sonnet-20241022
  tiers:
    simple:  anthropic/claude-3-5-haiku-20241022    # score 0.0–0.3
    medium:  anthropic/claude-3-5-sonnet-20241022   # score 0.3–0.6
    complex: anthropic/claude-3-opus-20240229       # score 0.6+

complexity:
  thresholds:
    simple:  0.3
    medium:  0.6
    complex: 0.8
```

Short explanation: "Model selection happens automatically. Override thresholds to tune how aggressively Spektacular routes to complex models."

#### ROADMAP

Timeline-style list showing the three milestone releases:

```
v0.2 (next)
  • Automated execution via coding agent subprocess
  • Validation agent
  • GitHub Issues integration

v0.3
  • MCP server integration
  • Multiple agent backends (Aider, Cursor)
  • Cost tracking per plan

v1.0
  • Parallel task execution
  • Plugin system
  • CI integration
```

Note: "Spektacular is v0.1.0 — early development. Contributions welcome."

---

## Phase 4: JavaScript & Final Assets

### `assets/js/main.js` — Minimal JS

Only two behaviours:

**1. Copy-to-clipboard for install command and code blocks:**
```javascript
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = original, 2000);
    });
  });
});
```

**2. Smooth scroll for anchor links (progressive enhancement):**
```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
```

### TUI Screenshot

Copy `../spektacular/images/tui.png` to `assets/images/tui.png`. This is the main visual proof that Spektacular produces a beautiful output.

---

## Phase 5: GitHub Pages Configuration

### Enable GitHub Pages

1. Commit all files to `main` branch
2. Go to repo Settings → Pages
3. Source: "Deploy from a branch" → `main` branch → `/ (root)`
4. Site publishes at `https://nicholasjackson.github.io/spektacular-website/`

### `.nojekyll` file

Required. Without it, GitHub Pages runs Jekyll which may process/ignore files starting with `_`. The `.nojekyll` file disables this behaviour.

### `index.html` at root

GitHub Pages automatically serves `index.html` from the root when Pages is configured for root `/`. No `404.html` needed for a two-page site with direct links.

---

## Testing Strategy

### Visual Testing (Manual)

Open both pages in a browser and verify:
- [ ] Dark background renders correctly — no white flash
- [ ] Hero headline renders large and bold
- [ ] Install block has copy button and green `$` prefix
- [ ] TUI screenshot loads and is not blurry
- [ ] Pipeline steps are horizontal on desktop, vertical on mobile
- [ ] Feature cards lift on hover (border changes to purple)
- [ ] Both CTAs link to correct destinations
- [ ] Navigation links between pages work
- [ ] `how-it-works.html` code blocks are readable

### Responsive Testing (Manual)

Test at three breakpoints:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad portrait)
- Desktop: 1280px (standard)

Verify:
- [ ] Navigation collapses gracefully on mobile
- [ ] Pipeline steps stack vertically on mobile
- [ ] Features grid is 1 column on mobile, 2 on tablet, 3 on desktop
- [ ] No horizontal scroll at any breakpoint
- [ ] Hero text is readable and not overflowing

### GitHub Pages Smoke Test

After deploying:
- [ ] Site loads at the Pages URL
- [ ] Both pages accessible via navigation
- [ ] Images load (no CORS or path issues)
- [ ] No console errors

---

## Success Criteria

### Automated Verification

```bash
# Validate HTML structure (if html-validator available)
npx html-validate index.html how-it-works.html

# Check all internal links work
npx broken-link-checker http://localhost:8080 --recursive

# Serve locally for testing
python3 -m http.server 8080
```

### Manual Verification

- [ ] Landing page communicates what Spektacular is within 5 seconds of reading
- [ ] Install command is prominent and copyable
- [ ] TUI screenshot is visible and compelling
- [ ] "How it works" page fully explains the spec → plan pipeline
- [ ] Site looks polished on mobile and desktop
- [ ] All GitHub links point to correct repo
- [ ] GitHub Pages URL is live and accessible

---

## References

- [Spektacular README](../spektacular/README.md)
- [TUI Screenshot](../spektacular/images/tui.png)
- [Architecture doc](../spektacular/.spektacular/knowledge/architecture/initial-idea.md)
- [jumppad.dev](https://jumppad.dev) — design inspiration
- [textual.textualize.io](https://textual.textualize.io) — dark terminal design
- [charm.sh](https://charm.sh) — CLI tool personality

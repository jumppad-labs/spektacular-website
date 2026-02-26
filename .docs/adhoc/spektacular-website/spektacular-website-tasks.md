# Spektacular Website — Task Checklist

**Created:** 2026-02-26
**Plan:** [spektacular-website-plan.md](./spektacular-website-plan.md)

---

## Phase 1: Project Setup & Design System

- [x] **Create `.nojekyll`** — empty file at repo root
  - File: `.nojekyll`
  - Effort: XS
  - Purpose: Prevents GitHub Pages from running Jekyll

- [x] **Create directory structure**
  - `assets/css/`, `assets/js/`, `assets/images/`
  - Effort: XS

- [x] **Copy TUI screenshot**
  - From: `../spektacular/images/tui.png`
  - To: `assets/images/tui.png`
  - Effort: XS

- [x] **Create `assets/css/style.css` — Phase 1: Design system**
  - CSS variables (all color tokens)
  - CSS reset and base styles
  - Typography scale
  - Utility classes (container, section, badge, btn)
  - Effort: M
  - Acceptance: Variables accessible, body renders with dark background

---

## Phase 2: Landing Page (`index.html`)

- [x] **HTML structure — `index.html`**
  - `<!DOCTYPE html>`, head with meta charset/viewport/title/description
  - Link CSS and JS
  - Effort: S

- [x] **Navigation component**
  - Logo wordmark, "How it works" link, GitHub link
  - Sticky positioning, border-bottom
  - Effort: S

- [x] **Hero section**
  - v0.1.0 badge, H1 headline, subheadline
  - Install command block with copy button
  - Two CTA buttons (primary + secondary)
  - Effort: M

- [x] **Demo / TUI screenshot section**
  - Centered image with frame styling
  - Caption below image
  - Effort: S

- [x] **How it works — pipeline flow diagram**
  - Horizontal flow: spec.md → Analyse → Plan → plan.md
  - Arrow connectors, node labels
  - Effort: M

- [x] **Features grid — 6 cards**
  - 3×2 grid, icon + title + description
  - Hover effect (border changes to purple)
  - Effort: M

- [x] **CTA banner**
  - Centered, purple-tinted background
  - H2 + body text + two buttons
  - Effort: S

- [x] **Footer**
  - License link, GitHub link, PyPI link
  - Effort: S

---

## Phase 3: How It Works Page (`how-it-works.html`)

- [x] **HTML structure — `how-it-works.html`**
  - Same head/meta as index.html
  - Active state on nav for current page
  - Effort: S

- [x] **Page hero (simple)**
  - H1 + subtitle paragraph
  - No full-viewport height (compact)
  - Effort: XS

- [x] **Quick start section**
  - 4 numbered steps
  - Code block for each step command
  - Effort: M

- [x] **Spec format section**
  - Full spec example in styled code block
  - Side annotations explaining each section
  - Effort: M

- [x] **The pipeline section**
  - Flow diagram (same as landing page)
  - Prose explanation of analyse + plan phases
  - Effort: M

- [x] **Configuration reference**
  - `config.yaml` code block with inline comments
  - Brief explanation of model tiers
  - Effort: S

- [x] **Roadmap section**
  - Timeline-style list: v0.2, v0.3, v1.0
  - "Early development" note with contribution invite
  - Effort: S

---

## Phase 4: JavaScript & Responsive Polish

- [x] **Create `assets/js/main.js`**
  - Copy-to-clipboard for all `.copy-btn` elements
  - Smooth scroll for anchor links
  - Effort: S

- [x] **CSS: Responsive breakpoints**
  - Mobile (375px): stack pipeline, 1-col features, hide arrows
  - Tablet (768px): 2-col features, horizontal nav
  - Desktop (1280px): 3-col features, horizontal pipeline
  - Effort: M (included in style.css)

- [x] **CSS: Navigation mobile**
  - Simplified horizontal links on mobile
  - Effort: S (included in style.css)

---

## Phase 5: GitHub Pages Configuration

- [ ] **Verify `.nojekyll` is committed**
  - Effort: XS

- [ ] **Push to `main` branch**
  - Effort: XS

- [ ] **Enable GitHub Pages in repo settings**
  - Source: main branch, / (root)
  - Effort: XS
  - Acceptance: Pages URL active and site loads

- [ ] **Smoke test GitHub Pages URL**
  - Both pages accessible
  - Images load
  - Navigation between pages works
  - No console errors
  - Effort: S

---

## Phase 6: Final Verification

### Manual Checks

- [ ] Landing page communicates what Spektacular is within 5 seconds
- [ ] Install command is prominent and the copy button works
- [ ] TUI screenshot is visible and sharp (not blurry/pixelated)
- [ ] "How it works" page explains the full spec → plan pipeline
- [ ] All external links open in new tab with `target="_blank" rel="noopener"`
- [ ] No broken internal links between pages
- [ ] Site is visually polished on mobile (375px) and desktop (1280px)
- [ ] No white flash on page load (dark background applied immediately)

### Content Accuracy Checks

- [ ] Verify `pip install spektacular` works (or update install copy)
- [ ] Confirm GitHub repo URL is correct: `https://github.com/nicholasjackson/spektacular`
- [ ] Confirm version badge matches actual release (v0.1.0)
- [ ] CLI commands match actual implementation (`init`, `new`, `plan`)

---

## Implementation Notes

- Share the nav and footer HTML between both pages (manual duplication is acceptable for 2 pages; if site grows, consider Jekyll includes)
- Use `loading="lazy"` on the TUI screenshot image
- Include `<meta name="description">` on both pages for basic SEO
- The `.nojekyll` file must be at the repo root, not inside a subdirectory

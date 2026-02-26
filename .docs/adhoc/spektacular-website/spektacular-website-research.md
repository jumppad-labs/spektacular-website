# Spektacular Website — Research Notes

**Created:** 2026-02-26

---

## Initial Understanding

Task: Build a two-page showcase website for the Spektacular CLI tool. Hostable on GitHub Pages. No framework preference specified. Goal is to explain what the project does and how it works to a developer audience.

---

## Research Process

### 1. Spektacular Codebase Analysis

Read `../spektacular/README.md` and explored `../spektacular/src/spektacular/`.

**What Spektacular is:**
- Agent-agnostic CLI for spec-driven development
- Pipeline: `spec → analyse → plan → (execute → validate in roadmap)`
- Write a markdown spec, get a structured implementation plan
- Uses Claude Code (or other CLI agents) as the planning engine
- Routes tasks to model tiers by complexity score (0–1.0 scale)
- Has a beautiful Textual TUI with 5 color themes
- Early development: v0.1.0

**Key technical facts for copy:**
- Python 3.12+, pip installable
- Depends on Claude Code CLI being installed and configured
- TUI built with Textual library
- Config via `.spektacular/config.yaml`
- Outputs: `plan.md`, `research.md`, `context.md` in `.spektacular/plans/`
- Knowledge base at `.spektacular/knowledge/` feeds context to agents
- 4 CLI commands: `init`, `new`, `plan`, `run` (run not yet implemented)

**Visual asset:** `../spektacular/images/tui.png` — TUI screenshot available

### 2. Design Research

**Jumppad.dev (visited):**
- Minimal landing page — single tagline, one product screenshot, two CTAs
- Light/dark toggle, neutral color palette
- Very sparse nav: just logo + "Docs" link
- "Your development environments simplified." — the simplicity of the tagline is the design
- Core lesson: Less is more. One screenshot > a hundred words.

**Textual.textualize.io:**
- Dark-first (appropriate for a TUI library)
- Uses SVG/PNG terminal captures as primary visual proof
- Feature cards with real app examples
- Code tabs showing syntax-highlighted examples
- Monospace font everywhere code appears

**Charm.sh (charm.land):**
- Playful brand personality — memorable
- Dark terminal aesthetic
- Mascot characters create brand identity
- Shows: personality is compatible with being a serious tool

**Evil Martians analysis of 100 devtool landing pages (2025):**
- Install command prominent and copy-pasteable
- Two-CTA hero pattern is universal: "Get Started" + "GitHub"
- Screenshot or demo above the fold
- Three-panel workflow visualization for pipeline tools
- GitHub star count as trust signal
- Dark mode as default for developer-targeted tools

**Pattern consensus:**
- Dark terminal aesthetic = correct for CLI/TUI tool
- Purple accent = strong AI/intelligence connotation
- Copy-pasteable install command = table stakes
- TUI screenshot = highest-impact visual element

### 3. Technology Decision

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| Pure HTML/CSS | Zero deps, zero build, instant GitHub Pages | More verbose to write |
| Jekyll | GitHub Pages native, includes blog | Ruby dependency, templating complexity |
| Hugo | Very fast, good themes | Go binary required, overkill for 2 pages |
| Astro | Modern, component-based | Node.js build required, CI setup needed |
| 11ty | Lightweight JS SSG | Still needs npm, build step |

**Decision: Pure HTML/CSS/JS**

Rationale:
- 2-page site doesn't benefit from templating
- Shared nav/footer can be duplicated across 2 files (acceptable)
- No build step = one less thing to maintain
- GitHub Pages serves HTML directly from `main` branch
- Easier for any contributor to understand and modify

**Trade-off acknowledged:** If the site grows beyond 3-4 pages, consider migrating to Jekyll or 11ty to avoid duplication. Document this in gotchas.

### 4. Past Learnings

No existing learnings directory for this project (fresh repo). No institutional knowledge to surface.

---

## Design Decisions Made

### Decision 1: Dark mode only (no toggle)

- **Options:** Dark only, Light only, Dark default with toggle
- **Chosen:** Dark only
- **Rationale:** Audience lives in terminals. Dark is expected. Toggle adds JS complexity and a second set of styles. Jumppad has a toggle but that's appropriate for their infrastructure audience (mixed devops/dev). Spektacular is pure developer CLI tooling.

### Decision 2: Purple as primary accent

- **Options:** Blue (#58a6ff), Purple (#7c3aed), Amber (#f59e0b), Emerald (#10b981)
- **Chosen:** Purple
- **Rationale:** Purple has become the dominant AI/intelligence visual shorthand (Anthropic, OpenAI, GitHub Copilot all use purple). Spektacular is an AI-powered tool — the color association is meaningful. Green is reserved for terminal/success states.

### Decision 3: System font stack (no Google Fonts)

- **Options:** Google Fonts (Inter/Geist), system fonts, self-hosted fonts
- **Chosen:** System fonts
- **Rationale:** No network request for fonts = faster load, no privacy concern, no CORS on GitHub Pages. The system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", ...`) looks excellent at modern sizes. JetBrains Mono loaded from CSS `@font-face` or left as `ui-monospace` fallback.

### Decision 4: No JavaScript framework

- **Options:** Vanilla JS, Alpine.js, htmx
- **Chosen:** Vanilla JS (minimal)
- **Rationale:** We need exactly two JS behaviours: copy-to-clipboard and smooth scroll. Both are one-function implementations. A framework would be pure overhead.

### Decision 5: Two pages, not a single long scroll

- **Options:** Single page (SPA-style), two pages
- **Chosen:** Two pages
- **Rationale:** User explicitly requested two pages. This also allows the landing page to be high-impact/marketing-focused while the second page can be documentation-depth without polluting the landing experience.

---

## Open Questions (All Resolved)

1. **GitHub Pages branch config?** → Deploy from `main` root. Add `.nojekyll`.
2. **Where is the TUI screenshot?** → `../spektacular/images/tui.png` — copy to `assets/images/`.
3. **Is there a logo/icon for spektacular?** → No. Use wordmark (styled text) for now.
4. **Should we use GitHub star count badge?** → Yes, `shields.io` badge in SVG format is fine. Add to nav or hero.
5. **v0.1.0 — does the install actually work?** → Not confirmed. Site should note "early development" clearly (already in badge).

---

## Notes on Content Accuracy

- Install command `pip install spektacular` — the `pyproject.toml` defines the package name as "spektacular", so this is correct assuming it's published to PyPI. **Add a note in the plan** to verify PyPI publication before going live, or change the copy to "install from source" for now.
- The `run` command is listed as "not yet implemented" in the CLI code. The website does not mention `spektacular run` — only `init`, `new`, and `plan`.

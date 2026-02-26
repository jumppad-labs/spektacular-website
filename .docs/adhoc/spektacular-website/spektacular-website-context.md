# Spektacular Website — Quick Reference Context

**Created:** 2026-02-26

---

## Quick Summary

Two-page static website showcasing Spektacular (an AI spec-driven development CLI tool). Pure HTML/CSS/JS, zero build step, GitHub Pages compatible. Dark terminal aesthetic with purple AI accent.

---

## Key Files & Locations

### Files to Create

| File | Purpose |
|------|---------|
| `index.html` | Landing page — hero, demo, pipeline, features, CTA |
| `how-it-works.html` | Deep dive — quick start, spec format, pipeline, config, roadmap |
| `assets/css/style.css` | All styles — CSS variables, layout, components |
| `assets/js/main.js` | Copy-to-clipboard + smooth scroll |
| `assets/images/tui.png` | TUI screenshot (copy from `../spektacular/images/`) |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages |

### Reference Files

| File | What to Use From It |
|------|---------------------|
| `../spektacular/README.md` | All project copy — tagline, commands, spec format, roadmap |
| `../spektacular/images/tui.png` | Main visual asset |
| `../spektacular/pyproject.toml` | Dependencies, Python version requirement |
| `../spektacular/src/spektacular/cli.py` | Exact command names/flags |
| `../spektacular/.spektacular/knowledge/architecture/initial-idea.md` | Enterprise vision for roadmap section |

---

## Design Tokens (CSS Variables)

```
--bg-base:          #0d1117   Page background
--bg-surface:       #161b22   Cards, nav
--bg-elevated:      #21262d   Hover states
--bg-code:          #1c2128   Code blocks
--border-subtle:    #30363d
--border-default:   #3d444d
--text-primary:     #e6edf3
--text-secondary:   #8b949e
--accent-primary:   #7c3aed   Purple — main CTA, badges, hover
--accent-light:     #a78bfa   Light purple for text on dark
--terminal-green:   #3fb950   CLI prompts, success states
--link-blue:        #58a6ff   Links
```

---

## Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | None (pure HTML/CSS) | 2 pages, zero build, simplest GitHub Pages setup |
| Theme | Dark only | Developer CLI audience — dark is expected |
| Accent color | Purple (`#7c3aed`) | AI/intelligence connotation (Anthropic, Copilot) |
| Fonts | System font stack | No network request, privacy-safe, looks great |
| JS | Vanilla, minimal | Only need clipboard + scroll, no framework justified |

---

## Content Summary

### Page 1: index.html

1. **Nav** — Logo, "How it works" link, GitHub link
2. **Hero** — Badge `v0.1.0`, H1 "Write the spec. Ship the software.", install command, two CTAs
3. **Demo** — TUI screenshot full-width
4. **Pipeline** — 3 steps: Write spec → Score & route → Review plan
5. **Features** — 6 cards: Spec-first, Agent-agnostic, Interactive TUI, Complexity-aware, Knowledge-driven, Open source
6. **CTA Banner** — "Ready to build smarter?" with buttons
7. **Footer** — License link, GitHub, PyPI

### Page 2: how-it-works.html

1. **Page Hero** — H1 + subtitle
2. **Quick Start** — 4-step install + init + new + plan
3. **Spec Format** — Annotated example spec file
4. **The Pipeline** — Detailed spec → analyse → plan explanation with ASCII diagram
5. **Config Reference** — `config.yaml` with inline comments
6. **Roadmap** — v0.2, v0.3, v1.0 milestones

---

## GitHub Pages Setup

- Source: `main` branch, `/ (root)` directory
- URL: `https://nicholasjackson.github.io/spektacular-website/`
- Requirement: `.nojekyll` file in root
- No `_config.yml` needed (not using Jekyll)
- No custom domain configured (out of scope)

---

## Important Note: PyPI Publication

Verify that `pip install spektacular` works before using it as the primary install CTA. If not yet published to PyPI, change the install block to:

```bash
git clone https://github.com/nicholasjackson/spektacular.git
cd spektacular
uv pip install -e ".[dev]"
```

Or use `uv pip install spektacular` if published to PyPI.

---

## Related Documentation

- [Plan](./spektacular-website-plan.md) — Full implementation guide
- [Research](./spektacular-website-research.md) — Research notes and design decisions
- [Tasks](./spektacular-website-tasks.md) — Actionable checklist

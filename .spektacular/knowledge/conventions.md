# Conventions

## CSS Naming

BEM-ish: `.block`, `.block__element`, `.block--modifier`. Modifier classes are
additive — always applied alongside the base class.

## Design Tokens

All colours, spacing, and radii are CSS custom properties defined in `:root` at
the top of `style.css`. Never hardcode values that have a token equivalent.

Key tokens:
- `--accent-primary: #7c3aed` — purple, used for interactive/active states
- `--bg-base / --bg-surface / --bg-elevated / --bg-code` — background layers
- `--space-xs` through `--space-xl` — spacing scale (0.5rem → 6rem)

## Typography

- Code and terminal content: `"JetBrains Mono", "Fira Code", ui-monospace, monospace`
- `.install-block` and `.code-block pre` must both use `font-size: 0.875rem` —
  keep these in sync or they look mismatched on the same page

## Components

**Install block** — inline terminal command with copy button. Use
`.install-block--full` (adds `display: flex; width: 100%`) when the block
should span the container width rather than sit inline.

**Code block** — multi-line code display. Always wrap in `.code-block > pre > code`.

**No tabs** — the site does not use tab components. Show multiple options as
labeled sections separated by `border-top`, not as a tabbed widget.

## Layout Patterns

- Stacked labeled sections: `border-top: 1px solid var(--border-subtle)` with
  asymmetric padding (`3.5rem 0 1.5rem`) so there is clear space above each
  heading and tighter space below before the next separator.
- Two-column grids (e.g. platform download options): use CSS grid with
  `repeat(2, 1fr)`, collapsing to 1 column at ≤640px.

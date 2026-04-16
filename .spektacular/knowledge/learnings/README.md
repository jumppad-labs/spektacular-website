# Learnings

## Footer needs explicit pinning

Short pages (like the install page) leave the footer floating mid-screen unless
`body` is a flex column with `min-height: 100vh` and `.footer` has
`margin-top: auto`. This is already in `style.css` — don't remove it.

## section--install pattern

When a page already has a `.page-hero` that introduces the content, the first
`section` has too much top whitespace at the default 6rem. Use a page-specific
modifier (e.g. `section--install`) to reduce `padding-top` and
`.section__header` `margin-bottom` so the section content sits closer to the
hero.

## Symmetric padding changes cancel out

When adjusting spacing between stacked items, changing `padding-top` and
`padding-bottom` by equal-but-opposite amounts leaves the total gap identical.
To actually increase separation, increase the total of both values, not just
redistribute them.

## install-block and code-block font sizes must match

`.install-block` uses a monospace font independently of `.code-block`. If their
`font-size` values diverge, Homebrew (install-block) will look larger than
Debian/GitHub (code-block) on the same page. Both should be `0.875rem`.

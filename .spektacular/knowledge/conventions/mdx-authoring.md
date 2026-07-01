# MDX authoring conventions

Four rules govern how content is authored on the Spektacular marketing
site (Astro 5 + `@astrojs/mdx` v4 + Tailwind v4). They evolved during
the Hugo → Astro migration and the subsequent slot refactor. They are
the **first choice always** — relaxing any of them reintroduces the
readability problems the refactor was meant to fix.

## Rule 1 — No layout HTML in MDX page bodies

A page MDX body contains only frontmatter, named-block component
invocations, and prose. There is no `<div>`, `<section>`, or `class="…"`
in any `src/pages/*.mdx` file.

CI guard:

```bash
grep -nE "<div|<section|class=" src/pages/*.mdx
```

…must return zero matches. Any layout markup that is tempted to land in
a page body must instead become one of:

- A new section or helper component under `src/components/sections/`.
- A named slot on an existing section/helper component.
- A CSS rule scoped to `.spek-body` in `src/styles/global.css`.

## Rule 2 — Default slot with native MDX content over string-prop HTML

When a component takes content (paragraphs, lists, code, links), the
content goes in a default `<slot />` or a named slot — never in a
`body: string` prop rendered via `set:html`. Backticks become `<code>`,
dashes become `<ul>`, `[text](url)` becomes a styled link — all parsed
natively by MDX, no template literal noise.

This is "the ConfigKey pattern". Its canonical form:

```mdx
<ConfigKey name="spec" type="section" defaultValue="file provider, timestamp IDs, <code>.spektacular/specs</code>">

  How specs are stored and identified.

  - `spec.provider`: storage backend; only `file` ships today.
  - `spec.id_method`: spec naming scheme. One of `timestamp` (default),
    `counter` (sequential numbers), or `external` (the caller supplies
    an `id` with each spec).
  - `spec.config.directory`: where the file provider writes specs.
    Defaults to `.spektacular/specs`.

</ConfigKey>
```

For section components that historically took a `sub` subtitle prop,
accept **both** a `sub: string` prop AND a named `sub` slot — the slot
takes precedence when present. Plain single-line subtitles stay as a
prop; subtitles with inline code or links use the slot. The same dual
shape applies to any `body` prop that may carry markdown content
(`CtaBanner.body`, `Pipeline.body`, etc.).

Short metadata props that are at most one inline `<code>` (e.g.
`ConfigKey.defaultValue`) may remain as HTML string props rendered via
`set:html` — the slot/Fragment wrapper cost would exceed the saved
readability.

## Rule 3 — Blank line before and after slot content

Any `<Component>…</Component>` invocation in MDX with a slot body gets
a blank line between the opening tag and the content, and a blank line
before the closing tag:

```mdx
<Component>

  actual content here

</Component>
```

Applies to every component used with children in MDX — section
components, item helpers, and every `<Fragment slot="…">…</Fragment>`.
The pattern matches markdown paragraph spacing and keeps diffs
scannable.

## Rule 4 — Code blocks are fenced markdown, chrome comes from astro-expressive-code

Code is authored as markdown fenced blocks (triple-backtick) — never as
JSX with a string code prop. There is no per-page wiring step: the
`astro-expressive-code` integration is registered once in
`astro.config.mjs`, ahead of `mdx()`:

```js
integrations: [astroExpressiveCode(), mdx()],
```

…and it processes every fenced block on every page automatically at
build time. No page needs `export const components = { pre: … }` — the
integration hooks into the markdown pipeline directly, not through an
MDX component override.

```mdx
```bash
go install github.com/jumppad-labs/spektacular@latest
```
```

Why this matters:

- **`<placeholders>` are safe.** MDX escapes them to literal text
  (`&lt;` `&gt;`) instead of parsing them as JSX tags. `<VERSION>`,
  `<plan-name>`, `<returned-spec-name>` render verbatim.
- **Blank lines inside the block are preserved.** The
  blank-line-breaks-JSX problem that affects raw JSX slot children
  does not apply inside fenced code blocks.
- **No `\n` escape soup.** Multi-line code is just multi-line markdown.
- **One source of truth for chrome.** Every code block on every page
  shares the same border, padding, syntax highlighting theme, and line
  wrapping, configured once in `ec.config.mjs` (theme `github-dark`,
  `wrap: true`, palette overrides matching the site's dark colours)
  rather than per-component classes.

`ec.config.mjs` is the single place to change code-block appearance
(theme, line numbers, per-language overrides, colours) — never
component-level classes or props, since there is no code-block
component to put them on.

## Where the conventions are enforced

- `src/styles/global.css` carries the `.spek-body` rules (inline
  `<code>` styling, link styling, list spacing, paragraph spacing)
  that make Rule 2's markdown bodies look right.
- Every section component with a body or sub container wraps its slot
  rendering in an element with the `.spek-body` class.
- `astro.config.mjs` registers `astroExpressiveCode()` before `mdx()`
  so fenced blocks are processed before MDX handles the rest of the
  page; `ec.config.mjs` holds all of Rule 4's chrome configuration.

## Verification before merge

Run these against `src/pages/*.mdx`:

| Guard | Pattern | Expected |
|-------|---------|----------|
| Rule 1 | `<div\|<section\|class=` | 0 matches |
| Build  | `npm run build` | succeeds |
| Types  | `npx astro check` | 0 errors, 0 warnings |

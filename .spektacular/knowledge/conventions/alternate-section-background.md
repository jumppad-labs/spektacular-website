# Alternate section background shading

Top-level page sections built from `Section`-style components (`Section.astro`,
`SpecFormat.astro`, `Pipeline.astro`, and similar) accept a `surface` boolean
prop: `surface` (true) renders a shaded background (`bg-bg-surface`), and
`surface={false}` (the default on most of these components) renders a plain
background.

When adding a new section to a page, alternate `surface` against the value of
the section immediately before it, so the page reads as alternating
plain/shaded bands top to bottom. Do not default to leaving `surface` unset —
check what the preceding section resolved to and set the opposite explicitly.

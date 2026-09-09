# Site layout conventions

Five rules hold the documentation site's layout together. Follow them and a new
page looks like the rest of the site without any per-page tuning.

**One frame.** Every band is `mx-auto max-w-[1100px] px-md`, set once as the
default `maxWidth` on `Section.astro`. Do not introduce a second frame width or
override it per page.

**One flow width.** Everything that flows down a page runs the full frame:
paragraphs, lists, headings, code blocks, tables, card grids. There is
deliberately no narrower reading measure for body text. The single exception is
text that is *centred* rather than flowed, a centred hero sub, a call-to-action
body, a diagram caption, which needs a cap or it runs the full frame with ragged
edges on both sides. `.spek-centered` (`--spek-centered-measure: 52ch`) is that
cap and is the only place a measure is applied. See
`decisions/frame-width-flow.md` for why.

**One heading scale.** Section headings are `clamp(1.625rem, 3vw, 2.25rem)`,
bold, `tracking-[-0.01em]`. That exact value appears in `.spek-prose h2`,
`SectionHeader.astro`, and `CtaBanner.astro`, so a heading is the same size
whether a page is built from `Section` blocks or from markdown. Hero headings are
the deliberate step up (`clamp(2.25rem, 5vw, 3.75rem)`). Sub-headings are
`1.25rem` bold. Do not add a new size; reuse one of these.

**One body rhythm.** Spacing comes from the `--spacing-*` tokens (`xs` 0.5rem
through `xl` 6rem), never ad-hoc margins. `.spek-prose` pulls markdown onto the
same scale the band components use, so the two never drift. Wide children (code
blocks, tables, images) are left uncapped on purpose so they span the frame.

**One component per job.** `src/components/sections/` holds a component per band
type: `Hero`, `Section`, `SectionHeader`, `Prose`, `FeaturesGrid`, `Pipeline`,
`QuickStart`, `SpecFormat`, `ConfigurationKeys`, `CtaBanner` and the rest.
Compose a page from these. If a page needs a shape none of them provides, add a
component rather than inlining markup, and keep page bodies free of `<div>`,
`<section>` and `class=`.

# Context: 000007_video-element

## Current State Analysis

The site is a static Astro 5 + `@astrojs/mdx` v4 + Tailwind v4 marketing
site with no server logic, no data layer, and no automated test runner
(`package.json` has no test script, no vitest/jest anywhere in the
repo). Tutorials are the only content collection that embeds media
today, via a small family of hand-written MDX-facing components in
`src/components/tutorial/`:

- `ZoomImage.astro:1-14` — props-only leaf component (`src`, `alt`),
  wired as the `img` override (`export const components = { img:
  ZoomImage }`, `src/content/tutorials/getting-started.mdx:10`). Adds
  `rounded-md border border-border-subtle`, `loading="lazy"`, and a
  zoom-on-click affordance (`cursor-zoom-in`, `hover:opacity-90`,
  `spek-zoomable` class).
- `Lightbox.astro:1-52` — a single shared overlay, rendered once by
  `TutorialLayout.astro:5,24`. A `document`-level delegated click
  listener (lines 40-45) opens the overlay for any element carrying the
  `.spek-zoomable` class. A new component MUST NOT carry that class
  unless it is meant to be zoomable.
- `AgentBlock.astro` — a simple wrapper: a `for` prop (one or more
  agent IDs) rendered as a single `<div data-agent-block="…">` around
  its slot. Precedent for a small prop-driven wrapper invoked directly
  in MDX.
- `TutorialStep.astro:1-17` — the numbered-step shell; its slot
  container recently had a `max-w-[65ch]` constraint removed (per the
  working tree diff at the start of this plan), so full-width embeds
  (wide images, and by extension video) are expected to fit inside a
  step's body without a narrower text-measure constraint.
- `TutorialLayout.astro:1-25` — the article container:
  `.spek-body prose prose-invert max-w-none …` inside a
  `max-w-[820px]` section. This is the width budget any embed,
  including video, renders within.

`src/styles/global.css` carries no image-specific sizing rule (only
inline-code/link/list rules scoped to `.spek-body`); image sizing today
comes entirely from `@tailwindcss/typography`'s `prose` defaults plus
`ZoomImage`'s own classes. `astro.config.mjs` registers
`astroExpressiveCode()` then `mdx()` with no image-optimization
integration (`astro:assets`/`@astrojs/image` is not configured), and
`package.json` carries zero video/embed dependencies as of this plan.
A repo-wide search for "youtube", "iframe", "video", or "embed" found
no prior implementation work, only the new spec file itself.

No prior plan or spec touches images, video, or embeds except
`000005_tutorial-section`, which established the
`src/components/tutorial/` location, the props-only-leaf-component
pattern (`ZoomImage`), the slot-wrapper-component pattern (`AgentBlock`,
`TutorialStep`), and the project's deliberate avoidance of added
JS-framework/dependency weight (it rejected React/Svelte islands for a
comparably-sized gating problem).

During planning, `@astro-community/astro-embed-youtube` was found via
web search (not in the codebase) — an actively maintained package
(~5.4k weekly npm downloads, last published ~4 months before this
research, part of the `astro-embed` project by an Astro core
contributor) whose `<YouTube>` component accepts a raw YouTube URL
directly as its `id` prop and a `params` prop for YouTube player query
parameters, removing the need to hand-roll URL parsing or query-string
composition. See `research.md` for the full alternatives analysis.

## Per-Phase Technical Notes

### Phase 1.1: Add the YouTubeVideo component with basic embed and image-parity styling

- `package.json:12-21` — add `@astro-community/astro-embed-youtube` to
  `dependencies` (run the package manager's install command, don't
  hand-edit the lockfile).
- New file `src/components/tutorial/YouTubeVideo.astro` — Astro
  component, frontmatter `interface Props { url: string }` for this
  phase (widened in Phase 2.1), imports `YouTube` from
  `@astro-community/astro-embed-youtube`, renders `<YouTube id={url}
  />` wrapped in a container `div` carrying `rounded-md border
  border-border-subtle` (mirroring
  `src/components/tutorial/ZoomImage.astro:13`, but WITHOUT
  `spek-zoomable`/`cursor-zoom-in`/`hover:opacity-90`, which are
  zoom-specific and documented in
  `src/components/tutorial/Lightbox.astro:40-45` as the class the
  global lightbox click handler keys off).
- Before finalizing the wrapper markup, read the installed package's
  own `.d.ts`/source (`node_modules/@astro-community/astro-embed-youtube/`)
  to confirm whether `<YouTube>` accepts a `class`/`style` prop
  directly; if not, the border/rounding wrapper `div` around it is
  sufficient and no fallback is needed (research.md open assumption,
  low risk either way).
- `src/content/tutorials/getting-started.mdx` — add one
  `<YouTubeVideo url="…" />` usage (with an import line alongside the
  existing `TutorialStep`/`AgentBlock`/`ZoomImage` imports at the top
  of the file) so there is a real, buildable usage to validate against;
  pick any real public YouTube URL appropriate as a placeholder,
  following the same "placeholder, swap real X screenshot here"
  alt-text convention already used for image placeholders in this file
  (e.g. lines 175, 197) for parity, adapted to a one-line note rather
  than alt text since a video has no alt prop.

**Complexity**: Low
**Token estimate**: ~15k
**Agent strategy**: Single agent, sequential execution (install
dependency → write component → add example usage → run `astro
check`/`build`).

### Phase 2.1: Add start, end, and fullscreen controls

- `src/components/tutorial/YouTubeVideo.astro` — widen `Props` to
  `{ url: string; start?: number; end?: number; fullscreen?: boolean }`
  (matching this plan's Data Structures & Interfaces contract; default
  `fullscreen` to `true`). Build a `params` query string from
  `start`/`end` (e.g. `start=<n>&end=<n>`, omitting each when unset)
  and pass it to `<YouTube id={url} params={params} />`. For
  fullscreen, append `fs=0` to the same `params` string when
  `fullscreen` is `false`, omitting it (or explicitly `fs=1`) when
  `true`/unset.
- Confirm empirically (the plan's flagged Open Question) that `fs=0`
  passed through `params` actually suppresses the fullscreen control
  once `lite-youtube-embed` swaps in the real YouTube iframe on click,
  by loading the page and clicking through to the real player with
  `fullscreen={false}` set. If it does not suppress it, this phase must
  fall back to whatever mechanism the installed package's source
  actually exposes for this (an `allow`/`allowfullscreen`-style prop,
  if one exists) rather than silently shipping a `fullscreen` prop that
  has no effect.
- `src/content/tutorials/getting-started.mdx` — extend the Phase 1.1
  example usage (or add a second one) with `start`, `end`, and
  `fullscreen={false}` set, so both the enabled and disabled fullscreen
  states have a real, buildable, manually-checkable usage in the
  codebase.

**Complexity**: Low
**Token estimate**: ~10k
**Agent strategy**: Single agent, sequential execution (widen props →
build params string → manual verification pass → adjust if the
fullscreen assumption is wrong).

## Testing Strategy

No automated test runner exists in this repo; per-phase verification is
static-check plus manual browser confirmation:

- **Phase 1.1**: `npx astro check` and `npm run build` succeed with the
  new component and its example usage in place. Manually confirm in a
  browser: the video renders and plays from a plain URL, YouTube's
  default controls appear with no custom overlay, and the container's
  border/rounding/width/spacing matches an image in the same location.
- **Phase 2.1**: `npx astro check` and `npm run build` continue to
  succeed. Manually confirm in a browser: a set `start` time begins
  playback there rather than at 0:00, a set `end` time stops playback
  there, `fullscreen={false}` removes/disables the fullscreen control
  (the one behaviour flagged as genuinely unverified until this phase
  is implemented), and the default/`fullscreen={true}` case still shows
  a working fullscreen control.

## Project References

- `.spektacular/specs/000007_video-element.md` — the spec this plan implements; source of truth for requirements, acceptance criteria, and non-goals.
- `spektacular plan file read 000005_tutorial-section/plan.md` and its `research.md` — prior plan that established `src/components/tutorial/`, the props-only-leaf-component pattern (`ZoomImage`), the slot-wrapper pattern (`AgentBlock`, `TutorialStep`), and the project's stance against added framework/dependency weight, all directly reused in this plan's architecture.
- `conventions/mdx-authoring.md` (project knowledge base) — Rules 1 and 2 cited in this plan's Conventions and Architecture sections. Rule 4 of this document was found stale during this plan's discovery step (referenced a nonexistent `CodeBlock.astro`/disabled-Shiki setup) and was corrected in place via `spektacular knowledge write` before this plan's architecture step, unrelated to this feature's own scope but discovered along the way.
- [Astro Embed — YouTube component docs](https://astro-embed.netlify.app/components/youtube/) and [`@astro-community/astro-embed-youtube` on npm](https://www.npmjs.com/package/@astro-community/astro-embed-youtube) — the third-party package this plan depends on; re-read before implementation to confirm its exact prop surface.

## Token Management Strategy

| Tier | Token Budget | Agent Strategy |
|------|-------------|----------------|
| Low | ~10k | Single agent, sequential |
| Medium | ~25k | 2-3 parallel agents |
| High | ~50k+ | Parallel analysis, sequential integration |

## Migration Notes

None. This feature adds a new component and a new dependency; it
changes no existing data, schema, or content.

## Performance Considerations

`@astro-community/astro-embed-youtube` renders via `lite-youtube-embed`,
which shows a static poster image and play button and only loads
YouTube's actual iframe (and the JavaScript YouTube's player requires)
once a reader clicks play. Tutorial pages that embed a video therefore
do not pay YouTube's iframe/script weight on initial page load, only
readers who actually choose to play the video do. No other performance
considerations apply: the component introduces no server-side work, no
data fetching, and no build-time cost beyond the one new dependency.

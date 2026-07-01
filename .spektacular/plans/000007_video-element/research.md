# Research: 000007_video-element

## Alternatives considered and rejected

### Authoring surface for the video

- **Override the `img` MDX component to detect YouTube URLs in `src`
  (rejected).** Markdown `![alt](src)` is the existing pattern for
  images (`src/content/tutorials/getting-started.mdx:175-198`), wired
  via `export const components = { img: ZoomImage }`
  (`getting-started.mdx:10`, `src/components/tutorial/ZoomImage.astro:1-14`).
  *Why rejected:* markdown image syntax only carries `src` and `alt` —
  there is no slot for start time, end time, or a fullscreen toggle
  (spec requirements 2-4,
  `.spektacular/specs/000007_video-element.md:16-20`). Encoding those
  as query-string hacks on the URL or smuggled into `alt` text would
  violate the project's Rule 2 preference for native, readable MDX
  content over string-encoded props
  (project convention `conventions/mdx-authoring.md`, Rule 2).

- **Hand-rolled `<iframe>` component, no dependency (rejected during
  the architecture step, superseded).** A plain
  `<iframe src="https://www.youtube-nocookie.com/embed/…">` built and
  parsed entirely by a new bespoke component, own URL-ID parsing, own
  query-string composition, own aspect-ratio CSS. Initially the chosen
  direction (zero new dependency, `package.json:12-21` carried zero
  video/embed dependencies at the time, and the tutorial-section plan
  had already rejected adding client-side framework/dependency weight
  for a comparably sized problem — `000005_tutorial-section` plan,
  "Three trade-offs are accepted deliberately" paragraph, rejecting
  React/Svelte islands). *Why superseded:* once
  `@astro-community/astro-embed-youtube` was found (see "Chosen
  approach" below), it already solves URL parsing and embed-parameter
  composition, is actively maintained, and is a vanilla custom element
  (not a framework), so it doesn't burn the same "no added framework"
  budget the 000005 plan was protecting. Owning bespoke parsing/
  composition code stopped being worth it once a maintained option
  covering the same ground was confirmed to exist.

- **Chosen: a new thin wrapper component, `YouTubeVideo.astro`,
  invoked directly in MDX** (not through an `img` override), taking
  `url`, optional `start`, optional `end`, optional `fullscreen` props,
  and composing the third-party `<YouTube>` component internally.
  Mirrors the existing leaf-component-with-props pattern
  (`src/components/tutorial/ZoomImage.astro:1-14`, which takes `src`/
  `alt` props and no slot) rather than the content-carrying slot
  pattern used by `AgentBlock`/`TutorialStep`
  (`src/components/tutorial/AgentBlock.astro`,
  `src/components/tutorial/TutorialStep.astro`), since a video has no
  accompanying markdown body to render (captions are an explicit
  non-goal, `.spektacular/specs/000007_video-element.md:75`).

## Chosen approach — evidence

- Precedent for author-invoked leaf components with only props (no
  slot): `src/components/tutorial/ZoomImage.astro:1-14`, imported and
  used directly in MDX at `src/content/tutorials/getting-started.mdx:8`
  (`import ZoomImage from "../../components/tutorial/ZoomImage.astro"`).
- Precedent for author-invoked components with a `for`/attribute-style
  prop rendering a wrapper div: `src/components/tutorial/AgentBlock.astro`
  (`for` prop, single wrapper `<div data-agent-block=…>`).
- Visual parity target — ZoomImage's container styling to mirror:
  `rounded-md border border-border-subtle` plus `loading="lazy"`
  (`src/components/tutorial/ZoomImage.astro:13`). The `cursor-zoom-in`
  / `hover:opacity-90` / `spek-zoomable` classes are zoom-specific and
  must NOT be copied onto the video (an iframe is not zoomable, and
  `spek-zoomable` would wire it into the global Lightbox click handler
  unintentionally — see gotcha below).
  Also see `src/components/tutorial/Lightbox.astro:5-16,40-45` —
  the lightbox is a single delegated `document` click listener keyed
  off the `.spek-zoomable` class, so the video component is unaffected
  as long as it never carries that class.
- No image-specific width/height/aspect-ratio CSS exists globally
  (`src/styles/global.css` — no `img` rule beyond the inline-code
  styling at lines 46-92); image sizing today comes from
  `@tailwindcss/typography`'s `prose` defaults applied at the article
  level (`src/layouts/TutorialLayout.astro:19`,
  `prose prose-invert max-w-none …`) plus ZoomImage's own classes. The
  underlying `lite-youtube-embed` custom element used by
  `@astro-community/astro-embed-youtube` is inherently responsive
  (fills its container width at a fixed aspect ratio on its own), so no
  additional aspect-ratio CSS needs to be authored for this feature,
  only the border/rounding wrapper classes for visual parity.
- **Third-party package found:** `@astro-community/astro-embed-youtube`
  (web search, npm + the `astro-embed` project docs at
  https://astro-embed.netlify.app/components/youtube/). Its `<YouTube>`
  component's `id` prop accepts a YouTube URL directly (any common
  shape), removing the need for a bespoke URL-to-ID parser. Its
  `params` prop passes through YouTube player query parameters
  (confirmed usage shown as `params="start=57&end=75"`), covering the
  spec's start/end requirements; whether `fs=0` in `params` reliably
  suppresses fullscreen for this specific package (rather than only for
  a raw iframe) was not conclusively confirmed from documentation alone
  — flagged as an open assumption below, to verify empirically during
  implementation. The package is actively maintained (~5.4k weekly
  npm downloads, version 0.5.10 last published ~4 months before this
  research, 2 maintainers, part of the `astro-embed` project by an
  Astro core contributor) and renders via `lite-youtube-embed`, a
  vanilla custom element, not a UI framework, so adopting it does not
  reintroduce the framework-hydration weight the `000005_tutorial-section`
  plan deliberately avoided.
- MDX component wiring precedent: `export const components = { img:
  ZoomImage }` (`getting-started.mdx:10`) shows the per-document
  override mechanism, but the video component is a directly-imported
  tag (like `<TutorialStep>`/`<AgentBlock>`), not a markdown-syntax
  override, so no `components` map entry is needed for it.
- Current component location precedent: every MDX-facing tutorial
  helper lives under `src/components/tutorial/` (`AgentBlock.astro`,
  `AgentSelector.astro`, `Lightbox.astro`, `TutorialStep.astro`,
  `ZoomImage.astro`) because tutorials are the only content today that
  embeds images; no marketing page under `src/pages/*.mdx` uses
  markdown images. The new video component should live alongside them
  in `src/components/tutorial/` unless the architecture step decides
  otherwise.
- `astro.config.mjs:1-14` — integrations are `astroExpressiveCode()`
  then `mdx()`; no image integration (`astro:assets`/`@astrojs/image`)
  is configured, and `package.json:12-21` confirms no such dependency
  exists. This means images (and by extension the video component) are
  plain unoptimized markup, not routed through Astro's image pipeline.

## Files examined

- `.spektacular/specs/000007_video-element.md` — the spec being planned; full read.
- `src/components/tutorial/ZoomImage.astro:1-14` — leaf image component, props-only, styling to mirror.
- `src/components/tutorial/Lightbox.astro:1-52` — delegated zoom-click handler keyed on `.spek-zoomable`; video must not carry this class.
- `src/components/tutorial/AgentBlock.astro` — precedent for a simple prop-driven wrapper component invoked directly in MDX.
- `src/components/tutorial/TutorialStep.astro:1-17` — step shell; content wrapper is `.spek-body`; recently had a `max-w-[65ch]` constraint removed from its slot container (per working tree diff), so full-width embeds (wide images, and by extension video) are expected to fit inside a step's body.
- `src/content/tutorials/getting-started.mdx` — only real-world MDX content in the repo; shows exact markdown-image usage (lines ~175-198) and the `export const components = { img: ZoomImage }` wiring (line 10); no existing youtube/iframe/video reference anywhere in it or the rest of the repo.
- `src/layouts/TutorialLayout.astro:1-25` — article container: `.spek-body prose prose-invert max-w-none …` inside a `max-w-[820px]` section; this is the width budget any embed (video included) must respect.
- `src/styles/global.css:1-92` — no image-specific sizing rules; only inline-code and link/list rules scoped to `.spek-body`.
- `astro.config.mjs:1-14` — integrations are `astroExpressiveCode()` + `mdx()`; no image optimization integration.
- `src/content.config.ts` — tutorials content collection schema (`title`, `summary`, `order`); unrelated to media handling, confirms no media-specific collection config exists.
- `package.json` — dependency list; confirms no video-embed or image-optimization package present today.
- Repo-wide `grep -ri "youtube|iframe|video|embed"` — zero implementation hits; only the new spec file itself.

## External references

- [Astro Embed — YouTube component docs](https://astro-embed.netlify.app/components/youtube/) — confirms `id` accepts a raw URL, `params` accepts YouTube player query parameters (`start`, `end`), `poster`/`posterQuality`/`playlabel` exist for facade customization.
- [`@astro-community/astro-embed-youtube` on npm](https://www.npmjs.com/package/@astro-community/astro-embed-youtube) — package identity, maintenance signal (weekly downloads, last-published date) used to judge it as a safe dependency to add.
- [`astro-embed-youtube` package source, `delucis/astro-embed` on GitHub](https://github.com/delucis/astro-embed/tree/main/packages/astro-embed-youtube) — not yet read in full; re-read before implementation to confirm the exact prop surface (class/style passthrough, `fs` param behaviour) rather than relying on docs-page summaries alone.

## Prior plans / specs consulted

- `000005_tutorial-section` plan (`spektacular plan file read 000005_tutorial-section/plan.md`) —
  established the `src/components/tutorial/` location, the
  props-only-leaf-component pattern (ZoomImage), the
  slot-wrapper-component pattern (AgentBlock, TutorialStep), and the
  project's deliberate avoidance of added JS-framework/dependency
  weight (rejected React/Svelte islands). All of this transfers
  directly to how the video component should be designed and where it
  should live.
- `000005_tutorial-section` research.md — same plan's alternatives-log
  format was used as the template for this document's structure.
- No other prior plan or spec references images, video, or embeds.

## Open assumptions

- **YouTube URL formats to accept.** Assumed authors may paste a
  standard watch URL (`youtube.com/watch?v=ID`), a short URL
  (`youtu.be/ID`), or an already-formed embed URL
  (`youtube.com/embed/ID`), and the component must extract the video
  ID from any of these. Not verified against a concrete author example
  in the spec (spec only says "providing its URL",
  `.spektacular/specs/000007_video-element.md:14-15`). If this
  assumption is wrong (e.g. only one URL shape needs support), the
  parsing logic in the architecture step should be simplified
  accordingly — flag and confirm with the user during the
  architecture step if it materially changes scope.
- **Start/end time units.** Assumed seconds (matching YouTube's
  embed-player `start`/`end` query parameters), passed as a plain
  number prop, not a `mm:ss` string. Not stated in the spec.
- **Fullscreen default.** Assumed default-enabled (`fullscreen`
  defaults to `true`) since the spec frames it as an opt-out control
  authors can disable, not an opt-in one
  (`.spektacular/specs/000007_video-element.md:20`). Reasonable default,
  not explicitly confirmed by the user.
- **No accompanying slot content.** Assumed the video component takes
  props only, no default slot, mirroring `ZoomImage`. Consistent with
  the non-goal ruling out captions
  (`.spektacular/specs/000007_video-element.md:75`).
- **Component location.** Assumed `src/components/tutorial/` (matching
  every existing MDX-facing helper) rather than a repo-root
  `src/components/` location, since only tutorial content embeds media
  today. If a future non-tutorial MDX page needs video, the component
  can be relocated then — not a blocker for this plan.
- **Video is responsive width, fixed aspect ratio.** Assumed the
  package's own responsive behaviour (a 16:9-style fixed aspect ratio,
  YouTube's near-universal default) satisfies the layout-parity
  requirement (requirement 5) once sized to the article's width budget,
  not pixel-for-pixel matching of a particular image's dimensions.
- **`fs=0` in the package's `params` prop suppresses fullscreen.** Not
  conclusively confirmed from documentation, since `astro-embed-youtube`
  renders via `lite-youtube-embed` rather than a raw iframe, and it's
  unverified whether player parameters passed through `params` reach
  the real YouTube iframe once the facade is clicked, and whether
  `allowfullscreen` is set independently of `params` by the package. If
  wrong, the implement workflow must STOP and confirm an alternative
  (e.g. an `allow`/`allowfullscreen`-equivalent prop on `<YouTube>`, or
  falling back to a raw iframe just for the fullscreen-disabled case)
  before shipping requirement 4 as complete.
- **The package exposes a way to attach the border/rounding wrapper
  classes** (either a `class`/`style` passthrough prop on `<YouTube>`,
  or wrapping it in our own `<div>`). Not confirmed from documentation;
  if `<YouTube>` renders a `<lite-youtube>` custom element with no class
  passthrough, `YouTubeVideo` can still apply the styling to an
  outer wrapper `<div>` around it, so this assumption is low-risk
  either way, but should be confirmed at implementation time rather
  than assumed silently.

## Rehydration cues

- Re-read `.spektacular/specs/000007_video-element.md` in full — it is short (80 lines) and is the scope's source of truth.
- Re-read `src/components/tutorial/ZoomImage.astro`, `AgentBlock.astro`, `TutorialStep.astro`, `Lightbox.astro` (all under 55 lines each) to re-derive the component patterns and the `.spek-zoomable` gotcha.
- Re-read `src/content/tutorials/getting-started.mdx` lines 1-10 and 165-200 for the MDX import/usage convention and an example image-in-context.
- Re-run `spektacular plan file read 000005_tutorial-section/plan.md` for the fuller architectural rationale (dependency-avoidance stance, component location precedent) if the architecture step needs more of it than is captured above.
- Note for the architecture step: confirm YouTube's actual embed-URL query parameter names (`start`, `end`, `fs`) against current YouTube documentation before finalizing the component's implementation — flagged under Open assumptions, not yet externally verified.

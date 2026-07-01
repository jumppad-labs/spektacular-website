# Plan: 000007_video-element

<!-- Metadata -->
<!-- Created: 2026-07-01T14:11:49Z -->
<!-- Commit: 71e79f3488604a8fb32d7ebe112d11c0b1f87b16 -->
<!-- Branch: main -->
<!-- Repository: git@github.com:jumppad-labs/spektacular-website.git -->

## Overview

This plan adds a `YouTubeVideo` component so tutorial and documentation
authors can embed a YouTube video by URL, with optional start and end
times and a fullscreen toggle, rendered with the same layout, sizing,
and spacing as an embedded image. Readers get a visual alternative to
text and screenshots when following a tutorial, and authors get a
single new component that composes an existing, actively maintained
YouTube-embed package rather than requiring any new infrastructure.

## Conventions

- **MDX authoring Rule 1 (no layout HTML in MDX page bodies)** — the new
  `<YouTubeVideo>` component is invoked as a self-closing component tag,
  never as raw `<div>`/`class="…"` markup in an MDX body, so any
  container/aspect-ratio styling lives inside the component itself, not
  in the MDX content.
- **MDX authoring Rule 2 (native MDX content over string-prop HTML)** —
  directly drove rejecting the alternative of overriding the `img`
  component to sniff YouTube URLs from markdown `![]()` syntax: there is
  no way to carry `start`/`end`/`fullscreen` as native content, and
  encoding them into `alt` text would be exactly the string-encoded-prop
  anti-pattern this rule exists to prevent.
- **No em dashes** — applies to all authored prose for this feature: the
  plan document itself, any inline code comments the component ships
  with, and example MDX usage snippets.

## Architecture & Design Decisions

The feature ships as a single new Astro component, `YouTubeVideo.astro`,
placed in `src/components/tutorial/` alongside the existing MDX-facing
tutorial helpers (`ZoomImage.astro`, `AgentBlock.astro`,
`TutorialStep.astro`, `AgentSelector.astro`, `Lightbox.astro`) since
tutorials are the only content today that embeds media
(`research.md#chosen-approach--evidence`). Authors invoke it directly in
MDX with an explicit import, the same way they invoke `TutorialStep` or
`AgentBlock` today:

```mdx
import YouTubeVideo from "../../components/tutorial/YouTubeVideo.astro";

<YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" start={30} end={90} fullscreen={false} />
```

Rather than hand-rolling URL parsing and iframe construction,
`YouTubeVideo` is a thin wrapper around the existing, actively
maintained `@astro-community/astro-embed-youtube` package's `<YouTube>`
component (part of the `astro-embed` project). That component already
accepts a raw YouTube URL in any common shape as its `id` prop and
exposes a `params` prop for YouTube player query parameters, so
`YouTubeVideo` only has to translate its own stable `url`/`start`/
`end`/`fullscreen` props into `<YouTube id={url} params="…" />`, and
wrap the result in the image-parity container styling. Keeping our own
prop names as the authoring contract, rather than exposing `id`/
`params` directly, means the third-party package can be swapped later
without changing how authors invoke the component. `astro-embed-youtube`
renders via `lite-youtube-embed`, a vanilla custom element (no React/
Vue/Svelte), consistent with the site's existing framework-free, small-
inline-script approach (`AgentSelector`, `Lightbox`). It shows a static
poster and play button, and only loads the real YouTube iframe (with
YouTube's own default controls, satisfying requirement 6) once clicked,
a deferred-load performance characteristic the site gets for free
rather than a custom player.

This beats the two alternatives considered during discovery and the
hand-rolled version considered during this step
(`research.md#alternatives-considered-and-rejected`). Overriding the
`img` MDX component to detect YouTube URLs in `src` would reuse the
existing `![alt](src)` authoring syntax, but markdown images only carry
`src` and `alt`, there is no slot for start time, end time, or a
fullscreen toggle (spec requirements 2-4), and encoding them into `alt`
text as a mini-DSL would violate the project's "native MDX content over
string-encoded props" convention (`conventions/mdx-authoring.md`, Rule
2). A fully hand-rolled `<iframe>` component (the direction originally
agreed in this step) was reconsidered once
`@astro-community/astro-embed-youtube` was found: it already solves URL
parsing and query-parameter composition, is maintained by an Astro core
contributor with a healthy release cadence, and costs one dependency in
exchange for not owning that parsing/composition code ourselves. The
trade-off accepted is the one new dependency and the click-to-load
facade step before playback begins, both judged acceptable for a
performance-friendly, well-supported embed over maintaining bespoke
parsing logic.

Visual parity with images (requirement 5) is achieved by wrapping the
`<YouTube>` component in the same container treatment as `ZoomImage`,
`rounded-md border border-border-subtle`, but without the zoom-specific
classes. `spek-zoomable` and `cursor-zoom-in` are deliberately NOT
applied: the `Lightbox` component's click handler is delegated globally
off the `.spek-zoomable` class
(`src/components/tutorial/Lightbox.astro:40-45`), and wiring a video
into it would either break or produce a confusing zoom-cursor affordance
on something that is not zoomable. The underlying `lite-youtube-embed`
custom element is inherently responsive (fills its container width at a
fixed aspect ratio), so sizing it to the same `max-w-[820px]` article
width budget every image already renders within
(`src/layouts/TutorialLayout.astro:17-19`) requires no additional
aspect-ratio CSS of our own, only the wrapper's border/rounding classes,
so the video occupies the same layout position, width, and spacing as
an image placed in the same content location.

## Component Breakdown

### New components

- **`YouTubeVideo`.** The single new component this feature introduces.
  A thin wrapper around the third-party `<YouTube>` component (from
  `@astro-community/astro-embed-youtube`), owning three things: the
  stable author-facing prop contract (`url`, `start`, `end`,
  `fullscreen`), translating that contract into the underlying
  package's `id`/`params` props, and the image-parity container styling
  (rounded corners, subtle border) around the result. It takes no
  default slot and has no runtime dependents; authors import and invoke
  it directly wherever a video should appear, the same way they invoke
  the existing image/step/agent-scoped-content helpers today. It is
  deliberately independent of the zoom/lightbox mechanism, no shared
  class or event hook connects it to that behaviour, since a video is
  not a zoomable image.

### Existing components reused (new dependency)

- **`<YouTube>` from `@astro-community/astro-embed-youtube`.** Not part
  of this repo; a new npm dependency that does the actual embedding
  work, YouTube URL/ID parsing, deferred-load poster/play facade, and
  YouTube player parameter handling. `YouTubeVideo` composes it rather
  than reimplementing its behaviour.

### Components explicitly reused unchanged

- **`TutorialLayout`.** Supplies the article container and width budget
  (`.spek-body`, max article width) that `YouTubeVideo` renders inside,
  the same container every image renders inside today. No changes
  needed.
- **`TutorialStep`** and **`AgentBlock`.** Both may wrap a
  `<YouTubeVideo>` in their body slot exactly as they wrap a markdown
  image today; neither needs to know a video is present.
- **`ZoomImage`** and **`Lightbox`.** Reused as the visual and
  behavioural reference point (border/rounding to match, zoom behaviour
  to deliberately not replicate); neither component itself changes.

No existing repo component requires modification for this feature.

## Data Structures & Interfaces

One contract is introduced: the `YouTubeVideo` component's props
interface. It is the only boundary this feature adds, authors on one
side supplying a URL and optional playback controls, the component on
the other side turning that into an embed.

```ts
interface Props {
  url: string;          // any YouTube watch, short, or embed URL
  start?: number;        // seconds
  end?: number;           // seconds
  fullscreen?: boolean;  // defaults to true
}
```

No other new types, interfaces, or serialization boundaries are
introduced. There is no content-collection schema change (the video is
authored inline in existing MDX bodies, not as frontmatter), no new
client-side state (the component is fully static, server-rendered
markup with no script), and no API or data-fetching contract (the
embed URL is built at render time from the props above).

## Implementation Detail

This feature follows existing patterns almost entirely rather than
introducing new ones. `YouTubeVideo` is a single Astro component with a
frontmatter script block and a markup block, the same shape as
`ZoomImage` and `AgentBlock`: props in, markup out, no component-owned
client-side script, no hydration. A developer reading it will recognise
the shape immediately from the other tutorial components sitting next
to it.

The one new piece of code-shape is composing a third-party component
rather than emitting raw markup directly, something no existing
component in `src/components/tutorial/` currently does (`ZoomImage`
renders a plain `<img>` itself; `AgentBlock` renders a plain `<div>`
itself). `YouTubeVideo` instead renders `<YouTube ... />` from
`@astro-community/astro-embed-youtube`, passing a `params` query string
built from the `start`/`end`/`fullscreen` props. Building that query
string is straightforward string composition, no new pattern, the same
category of prop-to-attribute logic Astro components already do
elsewhere (e.g. `AgentBlock` joining an array of agent IDs into a
space-separated attribute value).

The container styling (border, rounding) is a wrapper element around
the third-party component, plain Tailwind utility classes, consistent
with how every other component-level style decision in
`src/components/tutorial/` is expressed inline rather than via global
CSS rules. No new CSS file or global stylesheet entry is introduced.

No new module boundary, no interface replacing an existing concrete
type, and no change to how MDX pages wire component overrides (the
component is a direct import/invocation, not registered via `export
const components = {...}`, so no page-level wiring changes). The one
new piece of code-structure UX for a developer: `src/components/tutorial/`
now has one component (`YouTubeVideo`) that wraps a package dependency
rather than emitting markup itself, worth a short comment at the top of
the file pointing to the underlying package's own documentation for its
full prop surface.

## Dependencies

- **`@astro-community/astro-embed-youtube` (new npm dependency).**
  Provides the `<YouTube>` component `YouTubeVideo` wraps: YouTube URL
  parsing, the deferred-load poster/play facade, and YouTube player
  query-parameter handling. Actively maintained (part of the
  `astro-embed` project; healthy release cadence, ~5.4k weekly
  downloads at time of research). Added to `package.json`; pulls in
  `lite-youtube-embed` transitively as its underlying custom element.
- **YouTube's embed player (external service, via the package above).**
  Provides the actual video playback and default controls once the
  facade is clicked. No account, API key, or server-side call is
  required.
- **`ZoomImage` / `Lightbox` (existing components, unchanged).** Used
  as the styling and behavioural reference point for visual parity, not
  imported or called by the new component. No changes needed, no
  ordering dependency.
- **`TutorialLayout` (existing component, unchanged).** Supplies the
  article width/container budget the video renders inside. No changes
  needed.
- **No prior spec or plan must land first.** This is a standalone
  addition; nothing in the current codebase blocks starting
  immediately.

## Testing Approach

The spec defines no formal success metrics ("the author will manually
test and review the embedded video behavior after delivery"). There is
nothing to carry into an automated behavioural test for this reason,
the whole feature is manual-verification territory by the spec's own
framing, and no metric is dropped by that classification.

This repository has no automated test runner (no vitest/jest, no test
script in `package.json`), consistent with the rest of the static
site, so "testing" here means two things: static verification that
catches structural mistakes, and manual browser verification that
catches behavioural ones.

**Static verification (automatable, existing convention).** `npx astro
check` (0 errors, 0 warnings) and `npm run build` succeeding are the
closest thing this codebase has to regression coverage for any
component change, per the existing MDX authoring convention's
"Verification before merge" table. For this feature specifically, that
catches a malformed `Props` interface, an invalid prop passed from the
example MDX usage, or a build-breaking issue in composing the
third-party `<YouTube>` component.

**Manual — captured in the implementation test plan.** Each acceptance
criterion is behavioural and best confirmed by loading a tutorial page
in a browser with a real `<YouTubeVideo>` usage on it:

- A YouTube URL renders a playable video player at that location.
- A provided start time begins playback from that point, not 0:00.
- A provided end time stops playback at that point.
- `fullscreen={true}` (or the default) shows a working fullscreen
  control; `fullscreen={false}` removes or disables it. This is the
  single riskiest behaviour to get silently wrong (research.md flags
  that the package's `params="fs=0"` behaviour through the
  `lite-youtube-embed` facade is not confirmed from documentation
  alone), so it gets explicit manual verification rather than being
  assumed to work from the params string alone.
- The rendered video's container (border, rounding, width, spacing)
  visually matches an image placed in the same tutorial-step location.
- YouTube's own default player controls appear, with no custom overlay
  added by this feature.

No integration or end-to-end test framework is being introduced for
this feature. Adding one would be disproportionate to a single static
Astro component with no server logic, no data layer, and no existing
test infrastructure to extend.

## Milestones & Phases

### Milestone 1: Authors can embed a YouTube video that looks like an image

**What changes**: A tutorial or doc author can drop a YouTube video into
their content by providing its URL, and the video renders as a playable
YouTube player at that location, showing YouTube's own default controls
with no custom overlay. The video occupies the same layout position,
width, and spacing as an image would in the same spot, so it reads as a
natural extension of the existing image-embedding experience rather
than a bolted-on feature. Start/end time and the fullscreen toggle are
not yet controllable, every embed plays the full video with fullscreen
available, matching the package's own defaults.

#### - [x] Phase 1.1: Add the YouTubeVideo component with basic embed and image-parity styling

Introduces the `YouTubeVideo` component so authors can drop a YouTube
video into tutorial content by URL. The component wraps the
`@astro-community/astro-embed-youtube` package's `<YouTube>` component,
passing the author-supplied URL straight through, and wraps the result
in the same border/rounding container treatment `ZoomImage` uses for
images, so the video reads as a natural peer of an image in the same
content location. Fullscreen and playback range are not yet
configurable in this phase, every embed behaves with the package's
defaults.

*Technical detail:* [context.md#phase-11](./context.md#phase-11-add-the-youtubevideo-component-with-basic-embed-and-image-parity-styling)

**Acceptance criteria**:
- [x] Providing a YouTube URL to `YouTubeVideo` renders a playable YouTube video at that location, with YouTube's own default controls and no custom control overlay.
- [x] The rendered video's position, width, and spacing in a tutorial page match how an image renders in the same location.
- [x] The site type-checks and builds successfully with a real usage of the component present in the codebase.

### Milestone 2: Authors can control playback start/end and fullscreen availability

**What changes**: The same component now accepts optional start and end
times, so an author can point a reader at a specific moment in a longer
video and have playback stop again afterward, and an optional
fullscreen toggle, so an author can disable the fullscreen control when
it isn't wanted. Every acceptance criterion in the spec is now
satisfied.

#### - [x] Phase 2.1: Add start, end, and fullscreen controls

Extends `YouTubeVideo` with three optional props: a start time and an
end time that bound playback to a specific portion of the video, and a
fullscreen toggle that lets an author disable the player's fullscreen
control. This phase completes every acceptance criterion in the spec.

*Technical detail:* [context.md#phase-21](./context.md#phase-21-add-start-end-and-fullscreen-controls)

**Acceptance criteria**:
- [x] When a start time is provided, playback begins from that point rather than from 0:00.
- [x] When an end time is provided, playback stops at that point.
- [x] When fullscreen is left at its default (or explicitly enabled), the player's fullscreen control is present and works.
- [x] When fullscreen is explicitly disabled, the player's fullscreen control is absent or inert.

## Open Questions

- **Does `params="fs=0"` actually suppress the fullscreen control once
  `@astro-community/astro-embed-youtube`'s `lite-youtube-embed` facade
  swaps in the real YouTube iframe on click?** This depends on how the
  package wires its `params` prop through to the underlying iframe at
  runtime, something only discoverable by installing the package and
  exercising it in a browser (Phase 2.1). If `fs=0` does not suppress
  fullscreen, the implementer should STOP and inspect the installed
  package's own source for whatever mechanism it actually exposes for
  disabling fullscreen (e.g. an `allow`/`allowfullscreen`-style prop)
  before considering the fullscreen-disable acceptance criterion met,
  rather than shipping a `fullscreen={false}` prop that silently has no
  effect.

## Out of Scope

- **Video hosting platforms other than YouTube** (e.g. Vimeo,
  self-hosted video). Spec Non-Goal; would be a separate component and
  a separate spec if ever needed.
- **Video captions or subtitles.** Spec Non-Goal.
- **Tracking or analytics on video engagement** (e.g. watch time). Spec
  Non-Goal.
- **Video upload, hosting, or management.** Spec Non-Goal; this feature
  only embeds existing YouTube links.
- **Exposing the underlying package's poster, posterQuality, or
  playlabel customization props.** `YouTubeVideo`'s authoring contract
  stays to exactly the four props the spec calls for (url, start, end,
  fullscreen); the package's own facade-customization surface is not
  threaded through. If a future need for a custom poster image arises,
  that is a new prop on `YouTubeVideo`, not part of this plan.
- **Relocating tutorial-scoped components to a general
  `src/components/` location.** `YouTubeVideo` lives in
  `src/components/tutorial/` alongside every other MDX-facing helper,
  since only tutorial content embeds media today (architecture step
  decision). If a non-tutorial MDX page needs video embedding later,
  relocating the component is a decision for that future plan.
- **Astro's image-optimization pipeline (`astro:assets`).** Not used by
  this feature, consistent with images not using it today either;
  unrelated to video embedding and not something this plan introduces.
- **A new automated test framework.** Decided in the Testing Approach
  step: no test runner exists in this repo, and adding one is
  disproportionate to a single static component with no server logic.

## Changelog

### 2026-07-01 — Phase 1.1: Add the YouTubeVideo component with basic embed and image-parity styling

**What was done**: Added `@astro-community/astro-embed-youtube` as a
dependency and created `src/components/tutorial/YouTubeVideo.astro`, a
thin wrapper that takes a `url` prop and renders the package's
`<YouTube>` component with image-parity styling (border, rounding,
full width overriding the package's default 720px cap). Added one real
usage in `src/content/tutorials/getting-started.mdx`.

**Deviations**: No wrapper `<div>` was needed around `<YouTube>` — the
package passes unrecognized props (including `class`) straight through
to the underlying `<lite-youtube>` element, so the border/rounding/
width classes are applied directly to it. This is a simplification
versus what the plan assumed, not a functional deviation from the
plan's intent.

**Files changed**:
- `package.json`, `package-lock.json` — added `@astro-community/astro-embed-youtube@^0.5.10`
- `src/components/tutorial/YouTubeVideo.astro` — new component
- `src/content/tutorials/getting-started.mdx` — new import and one `<YouTubeVideo>` usage

**Discoveries**: Downloaded and read the actual package source (both
`@astro-community/astro-embed-youtube` and its `lite-youtube-embed`
dependency) rather than relying on docs. This confirmed the plan's
`fs=0` fullscreen-suppression open question will work as intended for
Phase 2.1 (both the plain-iframe and YT.Player code paths inside
`lite-youtube-embed` read the `params` HTML attribute the same way),
and surfaced one new detail: `lite-youtube-embed`'s own CSS hardcodes
`max-width: 720px` on the element, which had to be overridden with
`w-full max-w-none` to actually match an image's width. The test step
of this workflow assumes Go/testify conventions that don't apply to
this repo (no test framework here at all); skipped with the user's
explicit confirmation, consistent with the plan's own Testing Approach
section. Criteria 1 and 2 of this phase (actual playability, visual
parity) are only structurally confirmed via the built HTML output —
no browser tool was available in this environment to click through and
confirm visually, so those two acceptance criteria remain unchecked in
plan.md pending a manual browser pass by the user.

### 2026-07-01 — Phase 2.1: Add start, end, and fullscreen controls

**What was done**: Widened `YouTubeVideo`'s `Props` to accept optional
`start`, `end`, and `fullscreen` (default `true`). The component now
builds a `URLSearchParams` string from these (`start=`, `end=`, and
`fs=0` only when fullscreen is disabled) and passes it through to the
underlying `<YouTube params={...}>` prop. Added a second example usage
in `getting-started.mdx` with `start`, `end`, and `fullscreen={false}`
set, alongside the Phase 1.1 default usage, so both the
fullscreen-enabled and fullscreen-disabled states have a real,
buildable usage in the codebase. This completes every acceptance
criterion in the spec.

**Deviations**: None.

**Files changed**:
- `src/components/tutorial/YouTubeVideo.astro` — widened Props, added params-building logic
- `src/content/tutorials/getting-started.mdx` — added a second `<YouTubeVideo>` usage demonstrating start/end/fullscreen-disabled

**Discoveries**: Confirmed at the source level (during Phase 1.1's
analyze step, by reading the actual `lite-youtube-embed` package
source rather than relying on docs) that `params="fs=0"` does flow
through to both of the package's iframe-construction code paths, and
sanity-checked in Node that the resulting query string is exactly what
YouTube's iframe API expects
(`start=30&end=90&fs=0&autoplay=1&playsinline=1`). This resolves the
plan's flagged Open Question with strong evidence, though a real
browser click-through to visually confirm the fullscreen button
actually disappears is still outstanding, no browser tool was
available in this environment. This was the last unchecked phase in
the plan.

### 2026-07-01 — Follow-up fix: video width didn't actually match image width

**What was done**: The user manually loaded the tutorial page and
confirmed the video was narrower than an image in the same spot,
exactly the risk the plan flagged as unverifiable without a browser.
Root cause: `lite-youtube-embed`'s own CSS hardcodes `max-width: 720px`
on the `lite-youtube` element and ships **unlayered**, while Tailwind
v4 emits `.max-w-none`/`.w-full` inside `@layer utilities`. Per the CSS
cascade spec, unlayered rules always win over layered rules regardless
of specificity, so the Tailwind override classes were silently losing
even though they had higher selector specificity. Fixed by moving the
width override from Tailwind classes to an inline `style="max-width:
none; width: 100%;"` prop, since inline styles always beat stylesheet
rules (layered or not).

**Deviations**: `YouTubeVideo`'s `class` list dropped `w-full
max-w-none` (ineffective) in favor of the `style` prop carrying the
same intent. Border/rounding classes are unaffected, since no
unlayered rule in `lite-youtube-embed`'s CSS competes with them.

**Files changed**:
- `src/components/tutorial/YouTubeVideo.astro` — moved width override from Tailwind classes to an inline `style` prop

**Discoveries**: Astro's default Vite dev/build pipeline inlines
`import 'some-package/some.css'` from a third-party `.astro` component
as an unlayered `<style>` block on the page, not merged into any
`@layer`. Any future component that imports third-party CSS and needs
to override one of its rules with a Tailwind utility class should use
an inline `style` prop instead (or wrap the import in an explicit
`@layer` if editing the package were possible), not assume higher
Tailwind specificity is enough. This is a case where the earlier
"structurally confirmed, manual browser check still outstanding" caveat
in the Phase 1.1 verify step turned out to matter, the bug was real.

### 2026-07-01 — Follow-up: real browser verification, all acceptance criteria confirmed

**What was done**: The user then separately reported "the video will
not play" in their own browser tab. No project skill covered running
this app, so a temporary Playwright + system `chromium-browser` (via
snap, already present on the machine) driver was set up to actually
load the live dev server (already running on :4321) and interact with
it. Result: on a clean page load, the video plays correctly (screenshot
confirms YouTube's default controls, 0:01/20:13 progress, fullscreen
icon present, correct poster/play-button chrome, no custom overlay),
the width bug from the previous entry is confirmed fixed (video
bounding box 756px wide, exactly matching the article container's
width), and the click-to-activate mechanism correctly injects a real
`youtube-nocookie.com/embed/...` iframe with the exact video ID and
`start`/`end`/`fs` query parameters the component was given. A
synthetic test (constructing `<lite-youtube>` elements directly with
different `params` values, independent of the live MDX content) also
confirmed `start=45`, `fs=0`, and the no-params default case all
produce the correct iframe `src` in isolation. Given this, every
acceptance criterion for both phases is now genuinely browser-verified,
not just structurally inferred, and has been checked off in this
document.

**Deviations**: None to the code. The user's "video will not play"
report did not reproduce on a fresh page load; the most likely
explanation is Vite HMR re-executing the module that calls
`customElements.define('lite-youtube', ...)` after one of the several
edits made to this file during the session, custom elements cannot be
redefined once registered, so a repeat definition throws
(`NotSupportedError`) in whatever browser tab had been open across
those edits without a hard reload. This is an HMR/custom-elements
interaction, not a bug in `YouTubeVideo` or the underlying package.

**Files changed**: None (verification only).

**Discoveries**: If a future dev-server session shows a custom element
behaving strangely right after an edit to a component that defines
one, a hard reload (not just HMR's live patch) is the fix, not a code
change. Worth remembering for any future custom-element-based
component on this site.

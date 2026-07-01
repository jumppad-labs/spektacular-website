# Test Plan: 000007_video-element

The spec defines no formal success metrics, and the plan's Testing Approach
confirms there are none to verify automatically. Every acceptance criterion
is behavioural and requires a manual browser pass, since no automated test
framework exists in this repository. This document is that manual procedure,
grounded in the real implementation shipped by this plan.

## Setup

1. From the repo root, run `npm run build` then `npm run preview` (or
   `npm run dev` for a live-reloading server), and open
   `/tutorials/getting-started/` in a browser.
2. Scroll to just above the "What is Spektacular" heading. Two
   `<YouTubeVideo>` embeds are there, both using the placeholder URL
   `https://www.youtube.com/watch?v=dQw4w9WgXcQ`:
   - The first is the plain, default usage (no start/end/fullscreen props).
   - The second sets `start={30} end={90} fullscreen={false}`.
3. For visual comparison, scroll further to the "Initialise your project"
   step, which has real `ZoomImage`-rendered screenshots for reference.

## Procedures

### 1. A YouTube URL renders a playable video player

Load the page and confirm both video embeds show a YouTube poster
thumbnail with a play button in place of a broken image or blank space.
**Pass**: both embeds are visibly present and not broken/blank.

### 2. Default player controls, no custom overlay

Click the first (plain) embed's play button. **Pass**: the real YouTube
player loads inside the same spot and shows YouTube's own controls (play/
pause, volume, progress bar, settings, fullscreen) with no additional
custom control bar or overlay added by this feature.

### 3. Start time begins playback from that point

Click the second embed's play button. **Pass**: playback begins at
0:30 rather than 0:00 (the progress bar's initial position should read
around 30 seconds in, not the start of the video).

### 4. End time stops playback at that point

Let the second embed's video keep playing (or scrub near the end).
**Pass**: playback stops automatically at 1:30 (90 seconds), rather than
continuing to the end of the full video.

### 5. Fullscreen disabled when `fullscreen={false}`

With the second embed's player loaded, look at the player's control bar.
**Pass**: the fullscreen control is either absent from the control bar
or present but inert (clicking it does nothing). Compare against the
first (plain, default) embed, where the fullscreen control must be
present and functional, confirming the toggle only affects the embed
where it's explicitly set.

### 6. Video layout matches image layout

Compare either video embed against a `ZoomImage`-rendered screenshot
elsewhere on the same page (e.g. under "Initialise your project").
**Pass**: the video renders at the same width as the surrounding
images, with the same rounded corners and border, and the same vertical
spacing above/below it as an image would have in the same spot.

## Who / when

The person merging this change should run this procedure once against a
local preview build before publishing the tutorial page, since the spec
calls for manual author review rather than an automated gate. No CI step
enforces this, consistent with the plan's Testing Approach.

# Feature: 000002_static-site-generation

<!--
  OVERVIEW
  A concise 2-3 sentence summary of the feature. Answer three questions:
    1. What is being built?
    2. What problem does it solve?
    3. Who benefits and why does it matter?
  Avoid implementation details — this should be readable by any stakeholder.
-->
## Overview

The Spektacular website is currently built and styled by hand, which makes
even small changes slow and adding new pages tedious and error-prone. This
work moves the site onto a structured authoring approach so contributors can
add pages and update content quickly, with consistent styling applied
automatically. Developers maintaining the site benefit from a faster,
lower-friction workflow.

<!--
  REQUIREMENTS
  Specific, testable behaviours the feature must deliver.
  Format: bold title on the checkbox line, detail indented below.
  Rules:
    - Use active voice: "Users can...", "The system must..."
    - Each requirement should be independently verifiable
    - Focus on WHAT, not HOW — avoid prescribing implementation
    - Keep each item atomic — one behaviour per line
-->
## Requirements

- [ ] **Contributors can add a new page by creating a single content file**
  Adding a page does not require copying layout markup or boilerplate from
  an existing page.

- [ ] **Styling is applied from a shared, standardized styling system**
  Pages receive consistent styling automatically, with no per-page
  hand-written CSS.

- [ ] **The migrated site preserves the current visual design**
  Pages look equivalent to the existing site after migration.

- [ ] **All existing pages and content are carried over**
  Nothing is lost or changed in meaning during the migration.

- [ ] **Shared elements are defined once and reused across all pages**
  Navigation, header, and footer are authored in one place and applied to
  every page.

- [ ] **The site builds into static output deployable on the current hosting**
  The build produces static assets that deploy on the existing GitHub-based
  hosting with no change to where or how the site is served.

<!--
  CONSTRAINTS
  Hard boundaries the solution must operate within. These are non-negotiable.
  Examples:
    - Must integrate with the existing authentication system
    - Cannot introduce breaking changes to the public API
    - Must support the current minimum supported runtime versions
  Leave blank if there are no constraints.
-->
## Constraints

- The site must remain deployable on the current GitHub-based hosting; the
  build output must stay compatible with that publishing setup.

- The current custom domain must keep working; existing URLs must not break.

- The site must remain a fully static site with no server-side runtime.

<!--
  ACCEPTANCE CRITERIA
  The specific, binary conditions that define "done".
  Format: bold title on the checkbox line, verifiable detail indented below.
  Each criterion must be:
    - Independently verifiable (pass/fail, not subjective)
    - Traceable back to a requirement above
    - Testable by someone who didn't write the code
-->
## Acceptance Criteria

- [ ] **A new page can be added with one content file**
  Creating a single new content file and rebuilding produces a published
  page with the site's standard layout, navigation, header, and footer,
  with no other files edited.

- [ ] **No per-page hand-written CSS remains**
  The migrated source contains no page-specific stylesheet or inline style
  blocks, and all pages render styled correctly using only the shared
  styling system.

- [ ] **Migrated pages match the current design**
  Each migrated page, viewed in a browser, is visually equivalent to the
  same page on the current site in layout, colours, typography, and
  spacing.

- [ ] **Every current page exists after migration**
  Every page present on the current site is present on the migrated site
  with the same content.

- [ ] **Shared elements update everywhere from one edit**
  Editing the navigation, header, or footer in its single source location
  changes it on every page after a rebuild.

- [ ] **The build produces deployable static output**
  Running the build generates a folder of static files that, when
  published, serves the working site on the existing GitHub-based hosting
  with no server runtime.

<!--
  TECHNICAL APPROACH
  High-level technical direction to guide the planning agent. Include:
    - Key architectural decisions already made
    - Preferred patterns or technologies if known
    - Integration points with existing systems
    - Known risks or areas of uncertainty
  Leave blank if you want the planner to propose the approach.
-->
## Technical Approach

- Build the site with the Hugo static site generator.

- Style the site with the Tailwind CSS framework, replacing all hand-written
  CSS. Shared layout, navigation, header, and footer are defined as Hugo
  templates/partials.

- Author page content in Markdown, with Hugo turning content files into
  rendered pages using the shared templates.

- Continue publishing through the existing GitHub-based hosting; the Hugo
  build output is the deployed artifact.

- Pixel-for-pixel visual parity with the current site is not required — the
  migrated site should be visually equivalent in look and feel, but small
  styling differences are acceptable.

- Known risk: preserving existing page URLs so inbound links and the custom
  domain keep working; Hugo's content and permalink layout should be set up
  to match the current URL structure.

<!--
  SUCCESS METRICS
  How you will know the feature is working well after delivery. Be specific:
    - Quantitative: "p99 latency < 200ms", "error rate < 0.1%"
    - Behavioural: "users complete the flow without support intervention"
  Leave blank if not applicable.
-->
## Success Metrics

- Adding a new page requires only creating one Markdown content file, with
  no template or CSS changes — confirmed by the next page actually added.

- Routine content updates take noticeably less time and effort than they
  did on the hand-built site.

- No hand-written CSS is added going forward; new pages rely entirely on
  the shared styling system.

<!--
  NON-GOALS
  Explicitly state what this spec does NOT cover. This is as important as
  the requirements — it prevents scope creep and sets clear expectations.
  Examples:
    - "Mobile support is out of scope (tracked in #456)"
    - "Internationalisation will be addressed in a follow-up spec"
  Leave blank if there are no explicit exclusions to call out.
-->
## Non-Goals

- A visual redesign is out of scope; the migration preserves the current
  look and feel rather than restyling the site.

- Adding new content or new pages is out of scope; only existing pages are
  migrated.

- Changing the hosting or domain setup is out of scope; GitHub-based
  hosting and the custom domain stay as-is.

- Pixel-for-pixel visual parity with the current site is not a goal.

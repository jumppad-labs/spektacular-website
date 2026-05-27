# Feature: 000004_astro-migration

## Overview

The Spektacular website becomes single-file-per-page to edit. Anyone
who wants to change a sentence, swap a structural block, or fix a typo
opens one file, makes the change, and sees it live in the local
preview. This removes the current friction where a copy change means
editing template code in a separate place from the content.

## Requirements

- [ ] **A page is one file**
  Editing any page means opening exactly one file.

- [ ] **Page bodies read as content, not code**
  Prose uses standard formatting; structural blocks are named
  references, not hand-built markup inside the body.

- [ ] **The site looks and reads identically to today**
  Visual language, URLs, navigation order, and page text are unchanged
  after the migration.

- [ ] **Edits land live in the local preview**
  Saving a change to a page file updates the rendered page without
  manually reloading or restarting the preview.

## Constraints

- [ ] **`spektacular.dev` keeps serving the site**
  The custom domain and DNS arrangement do not change.

- [ ] **Existing URLs keep resolving**
  `/`, `/how-it-works/`, `/install/`, `/configuration/`, `/plugins/`,
  and `/extending/` continue to address the same pages.

- [ ] **No paid services or new secrets introduced**
  The build and deploy continue on the existing free hosting target,
  using only secrets the repo already has.

## Acceptance Criteria

- [ ] **One file per page**
  Listing the site's content directory shows exactly one source file
  per published URL.

- [ ] **No HTML in page bodies**
  Scanning any page's source file shows no `<div>`, `<section>`, or
  other layout-level HTML in the body — only prose and named
  references to structural blocks.

- [ ] **Visual and content parity with production**
  Side-by-side comparison of the migrated site against the current
  `spektacular.dev` rendering shows no differences in look, nav order,
  URLs, or page text.

- [ ] **Live reload during edits**
  With the local preview running, saving an edit to a page file
  updates the browser without manual reload or restart.

## Technical Approach

The site is rebuilt on **Astro with MDX**. Astro is chosen over the
jumppad reference (Next.js) because the site is content-first and
stays content-first; Astro ships zero JS by default and stays close to
the existing "build static HTML, deploy a directory" model. The
JSX-style component-in-markdown authoring shape is the same in both
frameworks.

The existing **Tailwind v4 theme tokens** carry over verbatim — no
redesign, no new tokens.

Everything else — component shapes, page-by-page migration order,
deploy-workflow changes — lives in the plan generated from this spec.

## Success Metrics

- [ ] **Content changes touch only a page file**
  In the weeks following the migration, every prose-change PR's diff
  is confined to one page file (plus the site config if a global
  value changes). Edits leaking back into template or component code
  are a regression.

- [ ] **A first-time contributor finds the file to edit on first try**
  Someone unfamiliar with the repo who wants to fix a typo can locate
  the right file by inspecting the pages directory alone — no grep,
  no asking, no reading template code.

## Non-Goals

- [ ] **No visual redesign**
  Look matches today; refreshing the visual language is a separate
  spec.

- [ ] **No content rewriting**
  Page copy from the recent content-correctness work ports across
  verbatim.

- [ ] **No new site features**
  Search, dark/light toggle, hamburger menu, analytics, OpenGraph
  cards, sitemaps, RSS — all out of scope.

- [ ] **No URL or IA changes**
  Existing routes carry over unchanged; no new pages, no path
  renames.

# Feature: 000005_tutorial-section

## Overview

The site needs a Tutorials section where readers can follow long-form guides
on Spektacular and related practices. The first tutorial walks through
getting started with Spektacular itself. Because Spektacular runs across
multiple AI coding agents, every step in a tutorial must let readers see the
right instructions and screenshots for the agent they are using. Both
newcomers and experienced developers benefit from a single, consistently
styled source of truth for learning the workflow.

## Requirements

- [ ] **Readers can browse a list of available tutorials**
  A dedicated tutorials index lets readers see every published tutorial and
  pick one to read.

- [ ] **Readers can read a tutorial as a single long-form article**
  Each tutorial renders as one continuous page sharing a consistent visual
  style with every other tutorial.

- [ ] **Authors can publish a new tutorial by writing only its content**
  Authoring uses a fixed set of building blocks for steps, callouts, code,
  and screenshots — no layout markup or custom styling required.

- [ ] **Each tutorial step can present agent-specific instructions**
  When a step's guidance differs by agent, the reader sees only the
  instructions for their currently selected agent.

- [ ] **Each tutorial step can present agent-specific screenshots**
  When a step's screenshots differ by agent, the reader sees only the
  screenshots for their currently selected agent.

- [ ] **Readers can switch which agent they are following at any point**
  Changing the agent updates every agent-scoped block on the page in place,
  without a full page reload.

- [ ] **A reader's agent choice persists across navigation**
  The chosen agent is remembered as the reader moves between tutorial pages
  and across visits, so they do not need to re-pick.

- [ ] **The "How to use Spektacular" tutorial is publishable**
  The first tutorial can be authored and shipped using only the new
  tutorial section's authoring building blocks.

- [ ] **The reader's agent choices match the site's declared list**
  The set of agents a reader can choose from matches the site's declared
  supported-agents list.

- [ ] **First-time readers see content for Bob by default**
  When a reader has not yet picked an agent, all agent-scoped content
  displays Bob's variant.

- [ ] **Authors can include images in tutorial content**
  Authors can add new image files to the project in a documented location
  and reference them from any tutorial, including as agent-scoped
  screenshots.

## Constraints

- The site must remain a fully static build — no server runtime required at
  request time.

- No existing pages outside the new tutorials area may change URL or
  content as a result of this work.

## Acceptance Criteria

- [ ] **Tutorials index is browsable**
  Navigating to the tutorials index shows every published tutorial as a
  clickable entry with a title and short summary.

- [ ] **Tutorials render with consistent chrome and styling**
  Any two published tutorials opened side-by-side share identical site
  chrome, typography, spacing, and section styling.

- [ ] **A new tutorial can be added without code changes elsewhere**
  Adding a new tutorial by creating a single content file using only the
  documented building blocks makes it appear in the tutorials index and
  render end-to-end with no changes to styles, components, or routes.

- [ ] **Per-agent instructions show only the selected agent's content**
  A step containing instructions for multiple agents displays only the
  current agent's instructions; switching agents updates the visible
  instructions without a page reload.

- [ ] **Per-agent screenshots show only the selected agent's images**
  A step containing screenshots for multiple agents displays only the
  current agent's screenshots; switching agents updates the visible
  screenshots without a page reload.

- [ ] **Agent selector is present and live on every tutorial page**
  Every tutorial page exposes an agent selector; changing it updates every
  agent-scoped block on the page at once.

- [ ] **Agent choice persists across navigation**
  After selecting an agent on one tutorial page and navigating to a
  different tutorial, the same agent remains selected on arrival.

- [ ] **"How to use Spektacular" is reachable and complete**
  The first tutorial is reachable from the tutorials index and renders all
  of its steps using only the tutorial section's authoring building blocks.

- [ ] **Selector reflects site-declared supported agents**
  The agents the reader can choose from match the site's declared
  supported-agents list — adding or removing one in that list changes the
  available options.

- [ ] **First-visit default is Bob**
  On a reader's first visit to any tutorial (no stored agent choice), every
  agent-scoped block displays Bob's content.

- [ ] **Newly added images render without configuration**
  Placing a new image in the documented image location and referencing it
  from a tutorial causes the image to render in the published page with no
  additional configuration.

## Technical Approach

1. **Content shape.** Tutorials live as MDX files in a new Astro content
   collection. Each tutorial renders as a single page through a shared
   tutorial layout that supplies the consistent chrome and styling.

2. **Agent identity.** The supported-agents list — and the default agent
   (Bob) — is hardcoded in site config. The selector, per-agent
   components, and default-rendering behavior all read from this single
   source. Agent identifiers are never hardcoded inside individual
   components or tutorial files.

3. **Per-agent gating.** A small set of new tutorial section components,
   authored following the project's existing slots-over-strings,
   blank-line-around-slots, and CodeBlock conventions, lets authors mark
   regions of a step as scoped to one or more agents. The server-rendered
   baseline shows the default agent (Bob); a client-side selector swaps
   visible content based on the reader's selection.

4. **Persistence.** The reader's selected agent persists client-side (e.g.
   localStorage) — no server-side state.

5. **Tutorials index.** The tutorials index page is generated from the
   content collection, so adding a tutorial MDX file makes it appear with
   no code changes elsewhere.

6. **Navigation.** A single "Tutorials" entry is added to the existing
   top-level navigation, pointing at the tutorials index. No dropdown, no
   side rail, no per-tutorial sub-nav in this version.

7. **Image storage.** Tutorial images live colocated with the tutorial
   content and are served through the existing site image pipeline.
   Authors reference them by relative path; no manual asset registration
   step.

## Success Metrics

No quantitative success metrics defined. Delivery is verified manually
against the acceptance criteria above.

## Non-Goals

- **Multi-page or chaptered tutorials.** Single long-form only for this
  version.

- **Per-tutorial side rail, dropdown sub-nav, or other in-tutorial
  cross-discovery.** Discovery happens at the index page.

- **User progress tracking, comments, or feedback widgets.**

- **Search within or across tutorials.**

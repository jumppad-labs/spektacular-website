# Feature: 000003_update-content

## Overview

The Spektacular website is being refreshed so its content accurately
describes the current features and workflow of the tool. This solves the
problem of out-of-date documentation that misrepresents what Spektacular
does today, which benefits developers evaluating or adopting the tool by
giving them an accurate, complete picture they can act on.

## Requirements

- [ ] **All content reflects the current state of Spektacular**
  No claims, examples, or instructions on the site contradict the actual
  behaviour of the tool.

- [ ] **The site explains Spektacular's pluggable architecture**
  A visitor can understand that Spektacular is designed around pluggable
  integrations rather than a fixed set of bundled tools.

- [ ] **The site documents that knowledge storage is pluggable**
  Visitors learn that they can connect their existing knowledge base
  rather than being locked into a specific store, with concrete examples
  such as Obsidian or Notion.

- [ ] **The site documents that specification storage is pluggable**
  Visitors learn that specifications can live in their existing system
  via a plugin, with concrete examples such as Jira.

- [ ] **Every Spektacular feature has discoverable content on the site**
  No feature of the tool is absent from the website. Pluggable context
  is one example currently missing.

- [ ] **The site documents available plugins**
  A visitor can find a list of the plugins that ship with or are
  supported by Spektacular.

- [ ] **The site documents how to configure Spektacular**
  A visitor can find configuration documentation describing the options
  available and how to set them.

- [ ] **The site describes the plugin interface**
  A developer can find a brief description of the interface a plugin
  must implement, sufficient to understand the shape of a plugin.

- [ ] **The site's existing visual style and design language are preserved**
  Any new or updated pages match the look and feel of the current site.

## Constraints

- [ ] **Must remain a static site on the current hosting setup**
  No introduction of server-side runtime dependencies.

## Acceptance Criteria

- [ ] **Site content matches current Spektacular behaviour**
  A reviewer comparing the live site against the current Spektacular CLI
  finds no statements, examples, or instructions that contradict actual
  behaviour.

- [ ] **Pluggable architecture is explained on the site**
  A visitor can navigate to a page that describes Spektacular's
  pluggable design without leaving the site.

- [ ] **Pluggable knowledge storage is documented**
  A page on the site explicitly states that users can store knowledge in
  their own system and names at least one concrete example.

- [ ] **Pluggable specification storage is documented**
  A page on the site explicitly states that specifications can be stored
  via plugins and names at least one concrete example.

- [ ] **All current features are discoverable on the site**
  Every feature listed in the Spektacular source has a corresponding
  page, section, or entry on the site. Pluggable context appears as
  documented content.

- [ ] **Plugins are listed on the site**
  A page on the site lists the available plugins.

- [ ] **Configuration is documented on the site**
  A page on the site documents Spektacular's configuration options.

- [ ] **Plugin interface is described on the site**
  A page on the site describes the plugin interface at a level
  sufficient for a developer to understand what a plugin must implement.

- [ ] **Visual style is consistent**
  New and updated pages use the same layouts, colours, typography, and
  component patterns as the existing site, and unchanged pages show no
  visual regressions.

## Technical Approach

- The `../spektacular` source code is the authoritative source for what
  features exist and how they behave; content should be checked against
  it rather than against existing site copy.

- New pages are added as Hugo content and styled with Tailwind,
  consistent with the current site stack.

- Information architecture (navigation, sectioning, page layout) may be
  restructured freely if it serves the content better.

- No known technical risks have been flagged at spec time.

## Success Metrics

- [ ] **Manual verification confirms accuracy and clarity**
  A reviewer walking through the site can confirm that content reflects
  current Spektacular features, the pluggable architecture is clearly
  explained, and a new developer could follow the instructions to
  install and use the tool.

## Non-Goals

- [ ] **Visual redesign**
  The current visual style is preserved; no rebrand or redesign.

- [ ] **Building plugin implementations**
  Implementing plugins themselves (for Obsidian, Notion, Jira, etc.)
  lives in the Spektacular tool, not in this website work.

- [ ] **Detailed plugin-building tutorial**
  A brief interface description is in scope; a step-by-step tutorial for
  building a plugin is deferred to future work.

- [ ] **Translation and internationalisation**
  Content remains in its existing language.

- [ ] **SEO, analytics, or marketing copywriting beyond accuracy**
  Improvements beyond making the content correct and complete are out of
  scope.

- [ ] **Maintaining backwards-compatible URLs**
  URL changes are permitted; no need to preserve historical paths or
  configure redirects.

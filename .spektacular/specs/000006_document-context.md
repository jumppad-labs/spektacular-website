# Feature: 000006_document-context

## Overview

A new documentation page on the Spektacular website that explains the
knowledge base subsystem to developers who use Spektacular. It covers what the
knowledge base is, the kinds of knowledge it holds (architecture, gotchas,
learnings, decisions, glossary, and conventions), how entries are created,
searched, and kept up to date, how the subsystem is configured, and the
reasoning behind why it works the way it does.

This solves the problem that developers currently have no single place to
understand how Spektacular captures and reuses project knowledge, helping them
trust the tool and use it effectively. The audience is developers who use
Spektacular on their own projects. Source material can be drawn in part from
the existing tutorial.

## Requirements

- [ ] **Explains what the knowledge base is and why it exists**
  The page describes the purpose of the knowledge base and the problem it
  solves, so a developer understands why Spektacular captures project knowledge
  at all.

- [ ] **Describes each category of knowledge**
  The page covers every knowledge category (architecture, gotchas, learnings,
  decisions, glossary, conventions), explaining what belongs in each and when to
  use it.

- [ ] **Explains how knowledge entries are created, searched, and updated**
  A developer can learn the lifecycle of an entry — how it gets added, how it is
  found later, and how it is kept current.

- [ ] **Explains how the knowledge base is configured**
  The page covers the configuration available to developers, so a developer
  knows what they can configure and how to locate and change it.

- [ ] **Explains the rationale behind the design**
  The page conveys why the subsystem works the way it does, not just the
  mechanics.

- [ ] **Discoverable as a page on the website**
  The content is published as a navigable documentation page on the Spektacular
  website, reachable through the site's normal navigation.

## Constraints

- The page must fit the existing site's documentation structure and authoring
  conventions, and must build and render within the existing website.

- The documentation must accurately reflect how the knowledge subsystem behaves
  today, not aspirational or planned behaviour. The main Spektacular application
  source is the authoritative reference for the subsystem's behaviour,
  categories, and configuration.

- This is a documentation-only change: it must not modify the knowledge
  subsystem itself.

## Acceptance Criteria

- [ ] **Purpose is covered**
  The published page contains a section stating what the knowledge base is and
  the problem it solves.

- [ ] **All six categories are documented**
  A reader can find, on the page, a description of each category — architecture,
  gotchas, learnings, decisions, glossary, and conventions — with guidance on
  what goes in each.

- [ ] **Lifecycle is covered**
  The page describes how an entry is created, how it is searched/retrieved, and
  how it is updated.

- [ ] **Configuration is covered**
  The page describes how the knowledge base is configured and where that
  configuration lives.

- [ ] **Rationale is covered**
  The page includes an explanation of why the subsystem is designed the way it
  is.

- [ ] **Page is reachable**
  The page is published on the Spektacular website and can be reached by
  following the site's navigation; the build succeeds with the new page
  included.

## Technical Approach

Source the documentation's content from two places: the existing tutorial on
the site, and the main Spektacular application source (the `../spektacular`
repository). The tutorial provides developer-facing framing and examples that
can be reused. (The application source being the authoritative reference for
behaviour, categories, and configuration is captured as a constraint.)

The page should follow the existing site's documentation page format. The
detailed page structure and content organisation are left for the plan
workflow to propose.

## Success Metrics

No formal success metrics have been defined. The author will manually review
the published page to confirm it accurately and clearly explains the knowledge
base subsystem.

## Non-Goals

- Documenting other Spektacular subsystems (the spec, plan, and implement
  workflows) is out of scope; this page covers only the knowledge base.

- A hands-on tutorial or step-by-step walkthrough is out of scope; this is
  reference and explanatory documentation, and the existing tutorial stays
  separate.

- Reworking the site's navigation or documentation information architecture
  beyond adding this one page is out of scope.

---
created_date: "2026-07-30"
status: completed
closed_date: "2026-07-30"
---

# Feature: 000009_document-artifact-metadata-and-historical-artifacts

## Overview

The Spektacular docs site needs to be updated to reflect two recent product
changes that shipped upstream but aren't yet documented for readers. First,
specs and plans are now automatically treated by coding agents as historical
records of past intent rather than descriptions of current system behavior,
so readers should understand why an agent won't ground "how does this work
today" answers in old specs. Second, every spec, plan, and changelog document
now carries lifecycle metadata (when it was created, its status, when it
closed), and a new command lets you query and list artifacts across the whole
project by that metadata, giving readers of the docs a way to find and
filter their own project history. Documenting both closes the gap between
what the tool actually does and what the public site tells prospective and
existing users.

## Requirements

- [x] **Docs explain that specs and plans are historical records**
  The docs describe that once a spec or plan is written, coding agents treat
  it as a record of past intent rather than as documentation of current
  system behavior, and that agents ground "how does this work now" answers
  in code instead.

- [x] **Docs explain the historical-record exception for genuine "why" questions**
  The docs describe that a coding agent will still open and cite a spec or
  plan when the user is asking about past intent or decisions, rather than
  current behavior.

- [x] **Docs explain that artifacts carry lifecycle metadata**
  The docs describe that every spec, plan, and changelog record now tracks
  when it was created, its current lifecycle status, and when it was closed.

- [x] **Docs describe how to query artifacts by their lifecycle metadata**
  The docs describe how a user can list or filter their project's specs,
  plans, and changelog records by creation date, status, or closed date,
  including a way to query across all artifact types at once.

## Constraints

- Must be documented within existing docs pages (e.g. `how-it-works.mdx`,
  `configuration.mdx`) — no new top-level docs page may be created for this
  work.

## Acceptance Criteria

- [x] **Historical-treatment explanation is published**
  A docs page states in plain prose that specs and plans, once written, are
  treated as records of past intent, and that current-behavior questions are
  answered from code rather than from these documents.

- [x] **"Why" exception is published**
  The same docs page states that a coding agent will still open and
  reference a spec or plan when asked about the reasoning or history behind
  a past decision.

- [x] **Metadata explanation is published**
  A docs page states that specs, plans, and changelog records carry a
  creation date, a lifecycle status, and, once closed, a closed date.

- [x] **Query/list instructions are published**
  A docs page shows at least one example command a reader can run to list or
  filter their project's artifacts by creation date, status, or closed date,
  and at least one example that queries across all artifact types at once.

## Technical Approach

- The historical-treatment content (the "why" exception included) reads
  naturally near wherever the docs already narrate how specs and plans are
  used and referenced.
- The lifecycle-metadata and query/list content reads naturally alongside
  wherever the docs already document where specs, plans, and changelog
  records are stored and configured.
- Prefer short, example-driven prose consistent with the existing site voice
  over an exhaustive flag-by-flag reference.

## Success Metrics

No additional success metrics beyond the Acceptance Criteria above — this is
a small, self-contained docs update, and the acceptance criteria already
define what "done" looks like.

## Non-Goals

- Documenting every other unreleased or older changelog entry — this spec
  covers only the two most recent items (artifact metadata, historical
  artifacts).
- A full CLI flag-by-flag reference for every Spektacular command — only the
  flags introduced by these two changes are covered.
- Any change to this repo's own `AGENTS.md` historical-artifacts policy
  section — that's agent behavior configuration, already in place, and out
  of scope for this public docs update.

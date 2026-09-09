---
created_date: "2026-09-04"
status: in-progress
project: spektacular
spec: 000047_repo-scoped-knowledge-addressing
plan: 000047_repo-scoped-knowledge-addressing
---

# Documentation for tier-and-store knowledge addressing

The site now explains how Spektacular's knowledge base is addressed: the two tiers a store can belong
to, what belongs in each, how a store gets its name, how a write states its destination, and how a
search or a knowledge load is narrowed to chosen stores. Every example that showed the previous
configuration shape has been corrected, so nothing on the site instructs a reader to write a file the
tool now rejects. The site's own layout conventions and the reasoning behind its text width are now
recorded in this repository's knowledge base, so they travel with it.

> Derived from project spektacular (git@github.com:jumppad-labs/spektacular.git), spec/plan
> 000047_repo-scoped-knowledge-addressing. See the project-level record for the full feature.

## What changed in this repo

**`src/pages/knowledge-base.mdx`.** The Configuration section was rewritten to explain the addressing
model in order: the two tiers, a repository declaring one store, the project declaring its shared
stores by name, addressing a store on a write, and narrowing what a request covers. The lifecycle
section's create example became a fully addressed write, its searching paragraph now notes that every
hit carries what a read needs, and the "Sources are layered, most-specific first" bullet was replaced
by one explaining that the two tiers answer different questions rather than overriding one another.
The page also states explicitly that a category's *retrieval* tier (when its entries load) is a
different axis from a store's tier (which knowledge it holds).

**`src/pages/configuration.mdx`.** Both YAML examples and both `knowledge` key descriptions
corrected: the repository key is now a single store with no name, the project key a named list, and
the repository key's default is a file store at `knowledge`.

**`src/pages/projects.mdx`**, **`src/pages/index.mdx`**, **`src/pages/extending.mdx`** and
**`src/content/tutorials/getting-started.mdx`.** The repository configuration example collapsed to the
single block; the landing page's feature card now says results are tagged by tier and store; the
extending guide's `Hit` listing carries tier and name, and its store contract now says a store leaves
attribution empty for the caller to stamp. The tutorial's multi-source section was rewritten and
retitled, resolving a contradiction where it showed a repository's own store declared in the
project's configuration file.

**`.spektacular/knowledge/`.** Two entries added, recorded through the Spektacular CLI rather than by
editing files: `conventions/site-layout.md`, the five rules of the site's layout system (one frame,
one flow width, one heading scale, one body rhythm, one component per job, with the actual values),
and `decisions/frame-width-flow.md`, why body text is not capped at a reading measure and what would
change that decision.

The site builds and typechecks with no errors and no warnings, unchanged from before this work.

## Why

The site documented a knowledge model the tool no longer implements, including a precedence order
between stores that was never implemented at all. Left alone, its configuration examples would have
told readers to write files that now fail to load. The two knowledge entries are here rather than in
the command repository because they describe *this* repository's code, and recording them through the
CLI was the delivery's own proof: naming which repository's store an entry belongs in is exactly what
was impossible before this change.

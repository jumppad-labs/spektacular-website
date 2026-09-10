---
created_date: "2026-09-10"
status: in-progress
project: spektacular
spec: 000050_knowledge-entry-tags
plan: 000050_knowledge-entry-tags
---

# Document knowledge search ranking and entry tags

The knowledge base documentation now explains how search actually ranks results,
and covers the tags an entry can declare. Two new sections on the knowledge base
page give the scoring formula in full with a worked example, and set out the
frontmatter block, its rules, and how to narrow a search by tag. The reference
page for writing a storage backend was brought in line with the interface as it
now stands, and a result type that had drifted from the code independently of this
work was corrected at the same time.

> Derived from project spektacular (repo `spektacular`), spec/plan
> 000050_knowledge-entry-tags. See the project-level record for the full feature.

## What changed in this repo

**`src/pages/knowledge-base.mdx`** gained two bands, "How a search is ranked" and
"Tagging an entry", placed after the lifecycle section:

- how a query becomes terms, and that there is no stemming or synonym handling;
- the two kinds of per-term evidence, a tag match and body occurrences;
- the scoring formula as a fenced block with the shipped constants, plus a worked
  two-entry comparison a reader can follow through to a number;
- prefix partial credit with its table and both deliberate limits;
- the relative cutoff, its constant, and that it is applied after every store has
  been searched;
- the frontmatter block in both YAML list forms, and the rules governing it,
  including that an entry without one is perfectly valid and needs no migration.

Edited in place on the same page: the stale sentence saying results are scored by
how often the query terms appear; the note that there is no required frontmatter,
which now points at the optional tags block; the `knowledge write` description,
since the skill now proposes tags with everything else; and the narrowing section,
which gained `--tag`, the asymmetry that repeating it narrows while `--filter`
widens, and the refusal for an unknown tag. The de-duplication section was scoped
so its argument for exact matching is not read as an argument against inexact
ranking.

**`src/pages/extending.mdx`** now publishes the `Store` contract as it actually
is: the new `Search(terms []string, opts SearchOptions)` signature, the
`SearchOptions` type, and the `Hit` struct regrouped into what a backend fills in
and what the knowledge layer stamps. New contract notes explain why a backend
never computes its own score, that matching is a ranked OR, and that a backend
unable to report per-term occurrence counts cannot take part in the ranking.

The published `Hit` was already wrong before this work, showing a single
`Excerpt` string where the code has a list and omitting `Title`, `Category` and
`Checksum` entirely. That is fixed here rather than left as a second wrong
version.

## Why this repo got the change

This site is where users of the tool learn what the knowledge base does. The old
page described behaviour that stops being true the moment this ships, and there
was nowhere else for a reader to discover that tags exist or that they can search
by them. The backend reference matters for a different audience: it is the
contract anyone writing their own storage backend builds against, and this work
changes both what a backend receives and what it is responsible for.

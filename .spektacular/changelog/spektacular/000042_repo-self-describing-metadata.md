---
created_date: "2026-08-13"
status: in-progress
project: spektacular
spec: 000042_repo-self-describing-metadata
plan: 000042_repo-self-describing-metadata
---

# Repository Self-Describing Metadata

> Derived from project spektacular, spec/plan 000042_repo-self-describing-metadata.

## What changed in this repo

The Configuration reference page's description of a registered repository
entry now lists only membership fields — name, address or local path,
provider, and dependencies — with a note that a repository's description,
role, tags, and deployment now live in the repository's own configuration
file instead, and a link to a new Repository Configuration reference page.

That new page documents a repository's own `.spektacular/config.yaml` in
full: description, role, tags, and deployment as newly-introduced
`ConfigKey` fields, alongside cross-references to the existing Knowledge
Base and Configuration pages for the knowledge and changelog sections it
also carries (unchanged, so not duplicated on the new page). A
"Repository Configuration" entry was added to the site's Resources
navigation dropdown, immediately after "Configuration".

## Why it matters

This keeps the documentation aligned with a code-side change: a
repository's descriptive metadata moved out of the project's registry
and into the repository's own configuration, so each config-reference
page now describes exactly one file's real, current contents rather than
mixing fields from two different files under one heading.

## Deviations from the plan

None for this repo's changes. One drafting correction was made during
authoring: a planned cross-link to `/configuration/#changelog` was
changed to a plain page link, since this site's `ConfigKey`/
`ConfigurationKeys` components render no `id` attributes, so a
`#fragment` anchor into a config-reference page would have been a dead
link.

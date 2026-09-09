---
created_date: "2026-09-07"
status: in-progress
project: spektacular
spec: 000049_guided-repo-add
plan: 000049_guided-repo-add
---

# Registering a repository is documented as a guided flow

The multi-repo projects page no longer describes adding a repository as a command whose arguments
you supply. It now describes the short conversation that actually happens: you are asked which
repository you want to add, and everything else is proposed for you from what the repository says
about itself. The page shows that exchange as a worked dialogue, and keeps the single-command
form documented as the path for scripts and for callers that already know every detail.

> Derived from project spektacular (file), spec/plan 000049_guided-repo-add. See the
> project-level record for the full feature.

## What changed in this repo

- `src/pages/projects.mdx`, the "Registering a repository" section, rewritten. It opens by saying
  registration is a conversation in which only the first question is asked cold, shows a worked
  agent-and-you dialogue in the same voice the site already uses for the specification interview,
  explains what the flow settles quietly and that nothing is written before you confirm, notes
  that an add can run alongside a specification or plan already in progress, and then retains the
  existing single-command examples reframed as the non-interactive path.
- The instruction to pass a name, description, role and tags as command arguments during an
  interactive add is gone. Those examples now appear only as the scripted alternative.
- The neighbouring explanation of how configuration is split is unchanged, and the new copy
  points at it as the reason the flow asks for a description, role and tags at all.

No component, layout or styling changed, and the section's background shading is unchanged and
still the opposite of the section before it.

## Why

The published documentation described a flow that no longer exists. A reader following it would
have been told to supply, as command arguments, exactly the values the tool now proposes for them
from their own repository. Keeping the single-command form documented matters too: it is still
the right path for scripts, and it is unchanged by this work.

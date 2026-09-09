---
created_date: "2026-09-02"
status: in-progress
project: spektacular
spec: 000046_relocatable-repo-footprint
plan: 000046_relocatable-repo-footprint
---

# Relocatable repo footprint

The documentation now explains that a repository's Spektacular files can live inside its code or in a folder of their own that points at the code. The configuration reference documents the registry's `location` key (with the older `local` alias and the removal of `address`) and the repository-level `source` key in both its file and git forms, and distinguishes it from the project-level `source` used for changelog provenance. The multi-repo projects page shows the colocated layout and the separate layout with a file source and with a git source, each as a directory tree with the matching registration command.

> Derived from project spektacular (git@github.com:jumppad-labs/spektacular.git), spec/plan 000046_relocatable-repo-footprint. See the project-level record for the full feature.

## What changed in this repo

- `src/pages/configuration.mdx`: the page description and hero mention where a repository's code lives; the environment-variable note covers `repo.yaml`; the `config.yaml` example registers repos with `location`; the `repos` key is rewritten around `name` and `location` with the `local` alias and the removed `address`; the repository example and key reference gain `source` with both forms and the contrast with the project-level `source`; the section count says nine.
- `src/pages/projects.mdx`: the `repo list` sample shows `location` and `root`; the registration example carries `location` and `source`; the configuration-split section explains the two layouts and gains a `source` key; a new "Colocated or separate" section shows three directory trees and both registration commands; the cloning section describes a git `source`.

## Why

The feature is only usable if readers can see the two layouts and the two keys that drive them; the site is the full reference the README and the repo-management skill link to.

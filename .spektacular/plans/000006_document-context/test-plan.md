# Test Plan: 000006_document-context

This is a documentation-only change (a new Knowledge Base page on the Spektacular
website). The plan's Testing Approach defines **no quantitative success metrics** —
the spec's only success criterion is a manual author review confirming the page
accurately and clearly explains the knowledge-base subsystem. The automated gates
(production build, `astro check`, and the MDX grep guards) are covered by the test
suite / CI and are **not** repeated here. What remains is the manual content-
accuracy review, which the plan deferred to this artifact.

## Automated coverage (for reference — not part of this manual plan)

Run from the repository root; all must pass:

- `npm run build` — exits 0 and emits `dist/knowledge-base/index.html`.
- `npx astro check` — 0 errors, 0 warnings (3 pre-existing `execCommand` ts(6387)
  hints in `Shell.astro`/`main.min.js` are expected).
- `grep -nE "<div|<section|class=" src/pages/knowledge-base.mdx` — no matches.
- `grep -nE "<CodeBlock|code=\{|code=\"|export const components" src/pages/knowledge-base.mdx`
  — no matches.

## Manual content-accuracy review

**Who / when:** the author (or a reviewer), once before the page is published, and
again if the Spektacular application source (`../spektacular`) changes before the
page ships. The page must reflect the subsystem's *current* behaviour, not
aspiration.

**How:** open the built `/knowledge-base/` page (or read
`src/pages/knowledge-base.mdx`) and check each item below against the cited
authoritative source. Pass condition: every item is accurate and reads clearly.

1. **Purpose ("What it is" section).**
   - Measure: the page states what the knowledge base is and the problem it
     solves, and frames it as a planning-time input where the plan is the
     contract.
   - Source: `../spektacular/docs/knowledge-base.md` lines 1–9.
   - Pass: the framing matches the doc; no claim that the implement workflow
     re-reads the knowledge base.

2. **The six categories ("The six categories" section).**
   - Measure: all six categories (conventions, glossary, architecture, gotchas,
     learnings, decisions) appear, each with guidance on what goes in it and what
     belongs elsewhere; the always-applied vs looked-up tiers are explained and
     correctly mapped (always-applied = conventions, glossary; looked-up =
     architecture, gotchas, learnings, decisions).
   - Source: `../spektacular/internal/knowledge/category.go` (each category's
     `Purpose`/`Boundary`/`Tier`; `AlwaysApplied()`).
   - Pass: each category's purpose, boundary, and tier match the registry.

3. **Lifecycle ("The lifecycle of an entry" section).**
   - Measure: the page describes creating an entry (`knowledge write`, scope +
     path, raw-markdown storage at `<location>/<category>/<name>.md`, category
     from the first path segment), searching/retrieving (`knowledge search`
     keyword ranking and excerpts, the conventions/glossary search exclusion,
     `knowledge read`), and updating (re-writing the same scope/path).
   - Source: `../spektacular/cmd/knowledge.go`,
     `../spektacular/internal/knowledge/set.go` (`Set.Write`, `Set.Search`,
     `categoryOf`, the always-applied exclusion), and
     `../spektacular/internal/store/search.go` (excerpt caps).
   - Pass: every command, argument, and behaviour matches the source.

4. **Configuration ("Configuration" section).**
   - Measure: the page describes `.spektacular/config.yaml`'s `knowledge.sources[]`
     (each `{scope, provider: file, config.location}`), the default single
     `project` source at `.spektacular/knowledge`, and the multi-source/scope
     model; the two YAML examples are valid and schema-consistent.
   - Source: `../spektacular/internal/config/config.go` (`KnowledgeConfig`,
     `SourceConfig`, `FileKnowledgeConfig`, `NewDefault`, `WithDefaults`, and the
     `ProviderFile` / `DefaultKnowledgeScope` / `DefaultKnowledgeLocation`
     constants).
   - Pass: schema and defaults match; YAML parses.

5. **Rationale ("Why it works this way" section).**
   - Measure: the page explains the design reasoning — planning-time input /
     plan-is-the-contract, the single category registry as source of truth, two
     retrieval tiers with self-consistent re-tiering, exact-byte de-duplication
     (vs fuzzy), and layered most-specific-wins source precedence.
   - Source: `../spektacular/docs/knowledge-base.md` lines 1–9, 37–51, 53–76,
     120–141, 143–158.
   - Pass: each rationale matches the design doc.

6. **Discoverability and CTA.**
   - Measure: a "Knowledge Base" link appears in the top nav immediately after
     "How it works" and opens the page; the page closes with a call-to-action
     pointing the reader onward.
   - Source: the live site (nav) and the page footer.
   - Pass: link present and in the right position; CTA present and links onward.

**Result to record:** the page is approved for publication when all six items
pass. This single review is the spec's only success metric.

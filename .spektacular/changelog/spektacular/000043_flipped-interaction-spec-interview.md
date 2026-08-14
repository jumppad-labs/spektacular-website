---
created_date: "2026-08-14"
status: in-progress
project: spektacular
spec: 000043_flipped-interaction-spec-interview
plan: 000043_flipped-interaction-spec-interview
---

# Flipped Interaction spec interview — documentation

> Derived from project spektacular (git@github.com:jumppad-labs/spektacular.git), spec/plan 000043_flipped-interaction-spec-interview.

## What was built

The "How Spektacular Works" page's Stage 1 ("Specification") description was rewritten to describe the new interview-first spec-creation workflow: an opening line naming the Flipped Interaction pattern and attributing it to prior prompt-engineering research, a worked example exchange showing the interview asking adaptive questions, a sentence on the interview's stopping condition, and a second worked example showing the interview asking a cross-repo question in a multi-repo project. The Quick-start section's spec-creation step and the pipeline node's label text were both updated to reflect the interview happening before section drafting.

The homepage's features grid gained a new card, "Flipped Interaction interview", describing the behavior as a distinguishing capability rather than only documenting it on the deeper how-it-works page.

## Why it matters

The interview behavior is a genuine differentiator for Spektacular over a plainer spec-authoring tool, and needed to be visible to a prospective user early rather than buried in implementation detail on a reference page — someone landing on the homepage or the how-it-works page should come away understanding that Spektacular interviews them before drafting anything, not just that it produces markdown specs.

## Deviations from the plan

The documentation content used plain fenced code blocks for both worked examples, embedded directly in the existing page body, rather than a new `slot="example"` component fragment as originally assumed — `PipelineStage.astro` (the component backing this section of the page) only supports a default slot and `slot="body"`, with no `slot="example"` support (that exists only on the unrelated `SpecFormat` component used elsewhere on the same page). Extending the Astro component was judged out of scope for a content-only documentation change, so both examples were written as fenced blocks within the existing body prose instead.

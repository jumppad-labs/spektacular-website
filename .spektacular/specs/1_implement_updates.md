# Feature: 1 Implement Updates

## Overview
The website documentation currently only covers the planning half of the
Spektacular workflow. Users need to see the full picture — from idea, through
spec and plan, to working code. This update adds the implementation step
across the main page and the how it works page.

## Requirements
- [ ] **Refactor the "From idea to plan" section on the main page**
  Relabel to "From idea to code" and add the implement step. Should not
  duplicate detail from the how it works page.

- [ ] **Update Quick Start to include the implement command**
  Add `spektacular implement` as a step and change the tagline to
  "zero to code in under 5 minutes".

- [ ] **Refactor the Pipeline section into three subsections**
  Create the Specification → Generate the Plan (input: spec.md, output:
  plan.md) → Implement the Plan (input: plan.md, output: code).

- [ ] **Update the spec format documentation**
  Include the additional information from the comments in the default spec
  in the main spektacular repo.

## Constraints

## Acceptance Criteria
- [ ] **Main page section is titled "From idea to code"**
  Shows the implement step without duplicating detail from the how it
  works page.

- [ ] **Quick Start references "zero to code in under 5 minutes"**
  `spektacular implement` appears as a step with correct syntax.

- [ ] **Pipeline has three clearly labelled subsections**
  Each subsection shows the input/output flow through the stage.

- [ ] **Spec format reflects the full set of fields from the default template**

## Technical Approach
The spect template can be found in the main spektacular repo at internal/
defaults/files/spec-template.md.

## Success Metrics

## Non-Goals

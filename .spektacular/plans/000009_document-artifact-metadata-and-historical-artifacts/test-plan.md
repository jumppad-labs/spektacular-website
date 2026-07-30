---
created_date: "2026-07-30"
status: completed
closed_date: "2026-07-30"
---

# Test Plan: 000009_document-artifact-metadata-and-historical-artifacts

All four of the spec's Acceptance Criteria were classified in the plan's
`## Testing Approach` as manual checks (no mechanical way to assert that
MDX prose "states" a fact in plain language). The automated behavioural
check, build/type-check cleanliness, already passed (`npm run build`: 11
pages built, no errors; `npx astro check`: 0 errors, 0 warnings on both
edited files). The four procedures below verify the remaining, non-automatable
criteria against the actual published content.

## 1. Historical-treatment explanation is published

**What to check**: `src/pages/how-it-works.mdx`, inside the "Implement the
Plan" pipeline stage, states in plain prose that specs and plans are
treated as historical records of past intent once written, and that
current-behavior questions are answered from code.

**How**: Run `npm run dev` and open `http://localhost:4321/how-it-works`
(or read the source directly). Scroll to the third pipeline stage,
"Implement the Plan."

**Expected result**: The stage's body text includes the paragraph
beginning "Once written, the spec and plan become a historical,
archaeological record, not a live description of current behavior," and
states that an agent asked how the system works today reads the code, not
the spec.

**Who / when**: A docs reviewer, once per release that touches
`how-it-works.mdx`; can be done as part of this plan's own PR review.

## 2. "Why" exception is published

**What to check**: The same paragraph also states that a coding agent
still opens and cites a spec, plan, or changelog record when asked about
the reasoning behind a past decision.

**How**: Same page/location as check 1 above; read to the end of the
appended paragraph.

**Expected result**: The paragraph's final sentence states that asking
*why* something was built a particular way causes the agent to open and
cite the relevant spec, plan, or changelog record to explain the original
reasoning.

**Who / when**: Same reviewer, same pass as check 1.

## 3. Metadata explanation is published

**What to check**: `src/pages/configuration.mdx` states, for each of the
`spec`, `plan`, and `changelog` sections, that records of that type carry
a created date, a lifecycle status, and a closed date.

**How**: Run `npm run dev` and open `http://localhost:4321/configuration`
(or read the source directly). Locate the `spec`, `plan`, and `changelog`
entries under "Top-level keys."

**Expected result**: Each of the three sections ends with a sentence
stating the record type carries lifecycle metadata: a created date, a
status, and, once resolved, a closed date.

**Who / when**: A docs reviewer, once per release that touches
`configuration.mdx`; can be done as part of this plan's own PR review.

## 4. Query/list instructions are published

**What to check**: `src/pages/configuration.mdx` shows at least one
example command filtering a single artifact type's records by metadata,
and at least one example querying across all artifact types at once, with
flag names and syntax matching the real upstream CLI.

**How**: On the same page, locate the new "Querying artifacts by lifecycle
metadata" section, placed between "Top-level keys" and "Example." Read the
two fenced `bash` code blocks. Separately, against a real project with the
`spektacular` CLI installed, run:

```bash
spektacular spec file list --status completed --created-after 2026-01-01
spektacular artifacts list --kind spec,plan.plan,changelog --status completed
```

**Expected result**: The page shows the single-artifact-type example
(`spektacular spec file list` / `spektacular changelog file list` with
`--status`, `--created-after`, `--created-before`, `--closed-after`,
`--closed-before`) and the cross-artifact-type example (`spektacular
artifacts list --kind ... --status ...`). Both commands, run against a real
project, exit 0 and return a (possibly empty) JSON/list result rather than
an "unknown flag" or "unknown command" error, confirming the documented
flags and command forms are real and current.

**Who / when**: A docs reviewer with access to a Spektacular project and
the `spektacular` CLI, once per release that touches `configuration.mdx`'s
CLI examples; can be done as part of this plan's own PR review, or
whenever the upstream CLI's flag surface changes.

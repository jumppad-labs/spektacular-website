# Implement Updates — Research Notes

## Specification Analysis

### Original Requirements
1. Refactor "From idea to plan" → "From idea to code" on main page,
   add implement step
2. Update Quick Start to include `spektacular implement`, change
   tagline to "zero to code in under 5 minutes"
3. Refactor Pipeline into three subsections: Specification → Generate
   the Plan → Implement the Plan
4. Update spec format documentation with fields from the default
   template

### Implicit Requirements
- Meta descriptions and hero subtitles should be updated to reflect
  the full workflow (plan + implement)
- The new implement stage needs description text consistent with
  existing writing style
- Responsive design must be preserved for all changes

### Constraints Identified
- Pure static HTML site — no build step, no templating
- Must reuse existing CSS patterns where possible
- Main page pipeline should not duplicate detail from how-it-works

## Research Process

### Sub-agents Spawned
1. **Codebase Explorer** — Full directory structure, framework
   identification, page inventory
2. **Main Page Analyst** — Read index.html, identified all sections
3. **How-it-Works Analyst** — Read how-it-works.html, mapped all
   sections with line numbers
4. **Spec Template Researcher** — Found and read the default spec
   template from the main spektacular repo

### Files Examined

| File | Lines | Purpose |
|---|---|---|
| `index.html` | 216 | Main landing page — hero, pipeline diagram, features grid, CTA |
| `how-it-works.html` | 351 | Documentation — quick start, spec format, pipeline, config, roadmap |
| `assets/css/style.css` | 900 | Complete design system — tokens, components, responsive breakpoints |
| `assets/js/main.js` | 46 | Copy-to-clipboard, smooth scroll (no changes needed) |
| `.spektacular/specs/1_implement_updates.md` | — | The spec driving this plan |
| `spektacular/internal/defaults/files/spec-template.md` | 87 | Default spec template with all fields and guidance comments |

### Patterns Discovered

**Pipeline diagram pattern** (`index.html:96-126`, `how-it-works.html:189-218`):
- Uses flex layout with `.pipeline-diagram` wrapper
- File/output nodes: `.pipeline-node--file` / `.pipeline-node--output`
  (dashed border, code-bg)
- Step nodes: `.pipeline-node--step` (purple accent border)
- Connectors: `.pipeline-connector` with `→` text
- Mobile: flex-direction:column, connectors rotate 90°

**Quick Start steps pattern** (`how-it-works.html:56-106`):
- Grid layout: `.step` with `.step__number` (numbered circle) +
  `.step__content` (h3 + p + code-block)
- Numbered circles: purple accent subtle background, 2.5rem diameter

**Spec annotation pattern** (`how-it-works.html:151-176`):
- Two-column grid: code block left, annotations right
- `.spec-annotation` cards with left purple border accent
- `.spec-annotation__section` for the `## Section` label
- Paragraph for the description

## Key Findings

### Architecture Insights
- The site is entirely static HTML — no build pipeline, no
  components to compose. All changes are direct HTML edits.
- CSS design tokens are well-structured, making style consistency
  straightforward.
- The pipeline diagram CSS handles responsive layout already —
  new nodes will automatically flow into the column layout on
  mobile.

### Spec Template Gaps
The website spec format is missing two sections from the default
template:

| Section | In template? | On website? | Has annotation? |
|---|---|---|---|
| Overview | ✅ | ✅ | ✅ |
| Requirements | ✅ | ✅ | ✅ |
| Constraints | ✅ | ✅ | ✅ |
| Acceptance Criteria | ✅ | ✅ | ✅ |
| Technical Approach | ✅ | ✅ (in code) | ❌ |
| Success Metrics | ✅ | ❌ | ❌ |
| Non-Goals | ✅ | ✅ | ✅ |

The template also has significantly richer guidance in its HTML
comments compared to the website's annotation text.

### Existing Pipeline Descriptions
The current Analyse and Plan descriptions on the how-it-works page
are well-written and should be preserved verbatim in the "Generate
the Plan" subsection. New description text is needed only for the
Specification and Implement stages.

## Design Decisions

### Decision: Reuse existing CSS classes for new pipeline nodes
**Options Considered**:
1. New CSS classes for implement-specific styling
2. Reuse existing `.pipeline-node--step` and `.pipeline-node--output`
**Rationale**: The existing classes already provide the correct visual
treatment. A new "implement" step is semantically the same as
"analyse" and "plan" — a processing step in the pipeline.
**Trade-offs**: No visual differentiation between implement and plan
steps, but this is consistent and expected.

### Decision: Three separate pipeline diagrams (not one long one)
**Options Considered**:
1. One long pipeline: idea → Write → spec → Analyse → Plan →
   plan.md → Implement → code
2. Three separate mini-diagrams, one per stage
**Rationale**: The spec explicitly asks for "three subsections" with
input/output flow shown per stage. One long diagram would be too
wide and wouldn't clearly separate the stages. Three diagrams make
the input/output of each stage explicit.
**Trade-offs**: Some repetition (spec.md appears as output of stage 1
and input of stage 2), but this makes each stage self-contained.

### Decision: Numbered stage titles matching Quick Start style
**Options Considered**:
1. Plain h3 headings
2. Numbered circles matching step pattern
**Rationale**: Visual consistency with the Quick Start section (which
also uses numbered circles). Creates a sense of progression.

## Open Questions
None — all requirements are clear and all template fields have been
identified.

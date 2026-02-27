# Implement Updates — Implementation Plan

## Overview
- **Specification**: `.spektacular/specs/1_implement_updates.md`
- **Complexity**: Medium
- **Estimated Effort**: ~2 hours
- **Dependencies**: Spec template from main spektacular repo
  (`internal/defaults/files/spec-template.md`)

## Current State Analysis

The website is a two-page static HTML site (`index.html` and
`how-it-works.html`) with a single CSS file (`assets/css/style.css`) and
minimal JS. It currently documents only the **spec → plan** half of the
Spektacular workflow. The implementation step (`spektacular implement`) is
not mentioned anywhere.

### What exists
| Area | File | Lines | Current state |
|---|---|---|---|
| Main page pipeline | `index.html` | 88–136 | "From idea to plan" — 4-node diagram: spec → Analyse → Plan → plan.md |
| Quick Start | `how-it-works.html` | 49–108 | 4 steps ending at `spektacular plan`; tagline "zero to your first plan" |
| Pipeline detail | `how-it-works.html` | 182–229 | Single pipeline diagram + two annotation paragraphs (Analyse, Plan) |
| Spec format | `how-it-works.html` | 111–179 | 5 annotations; missing Success Metrics and Technical Approach annotations |
| Stylesheet | `assets/css/style.css` | 440–518 | Pipeline diagram flex layout + node/connector styles |

### What's missing
- Any mention of `spektacular implement`
- The "Implement" stage in both pipeline diagrams
- "Success Metrics" section in the spec format documentation
- "Technical Approach" annotation in the spec format documentation
- Richer guidance text drawn from the template's HTML comments
- CSS for the three-subsection pipeline layout on the how-it-works page

## Implementation Strategy

Four focused changes across three files. No new pages, no framework changes,
no JS modifications. Each phase can be verified visually in a browser.

---

## Phase 1 — Main Page: "From idea to code"

**File**: `index.html` lines 88–136

### 1.1 Change the section heading and subtitle

**Current** (line 92–93):
```html
<h2>From idea to plan</h2>
<p>Write a spec. Spektacular scores complexity, routes to the right
model, and runs an interactive planning agent in your terminal.</p>
```

**Proposed**:
```html
<h2>From idea to code</h2>
<p>Write a spec. Spektacular plans, then implements — routing each
stage to the right model and running interactively in your
terminal.</p>
```

**Rationale**: Reflects the full workflow. Keeps it short — detail
lives on the how-it-works page.

### 1.2 Add the Implement node and Code output to the pipeline

Insert after the current `plan.md` output node (line 125), before the
closing `</div>` of `.pipeline-diagram`:

```html
        <div class="pipeline-connector">→</div>

        <div class="pipeline-node pipeline-node--step">
          <div class="pipeline-node__name">Implement</div>
          <div class="pipeline-node__sub">executes plan via<br>coding agent</div>
          <div class="pipeline-node__detail">validates against<br>acceptance criteria</div>
        </div>

        <div class="pipeline-connector">→</div>

        <div class="pipeline-node pipeline-node--output">
          <div class="pipeline-node__icon">✅</div>
          <div class="pipeline-node__label">code</div>
          <div class="pipeline-node__sub">working implementation<br>verified by criteria</div>
        </div>
```

**Rationale**: Reuses existing CSS classes — no new styles needed for
the main page diagram. The `pipeline-node--output` class already handles
the dashed-border file node style.

### 1.3 Update the annotation paragraph

**Current** (lines 128–133):
```html
<p>
  The analyse phase uses a cheap model to score spec complexity.
  The planning agent uses that score to select a model tier —
  so simple tasks stay cheap and complex ones get the power they need.
</p>
```

**Proposed**:
```html
<p>
  Analyse scores complexity. Plan generates a detailed implementation
  plan scaled to the task. Implement executes the plan via a coding
  agent and validates the result against your acceptance criteria.
</p>
```

**Rationale**: Covers all three stages in one concise paragraph.
Doesn't duplicate the deep-dive that lives on how-it-works.

### Success Criteria
- [ ] Section heading reads "From idea to code"
- [ ] Pipeline diagram shows 6 nodes: spec → Analyse → Plan →
      plan.md → Implement → code
- [ ] Annotation paragraph mentions all three stages
- [ ] Page renders correctly at desktop, tablet, and mobile widths

---

## Phase 2 — Quick Start: add `spektacular implement`

**File**: `how-it-works.html` lines 49–108

### 2.1 Update the tagline

**Current** (line 53):
```html
<p>Get from zero to your first plan in under five minutes.</p>
```

**Proposed**:
```html
<p>Zero to code in under 5 minutes.</p>
```

**Rationale**: Matches spec requirement exactly.

### 2.2 Add Step 5

Insert after the closing `</div>` of step 4 (after line 105), before the
closing `</div>` of `.steps`:

```html
        <div class="step">
          <div class="step__number">5</div>
          <div class="step__content">
            <h3>Implement the plan</h3>
            <p>Hand the plan to a coding agent. Spektacular executes
            each task, then validates the result against your acceptance
            criteria.</p>
            <div class="code-block">
              <pre><code>spektacular implement .spektacular/plans/auth-feature/plan.md</code></pre>
            </div>
          </div>
        </div>
```

**Rationale**: Follows the existing step pattern (numbered circle +
content + code block). Uses the same example feature name
(`auth-feature`) for continuity with steps 3 and 4.

### Success Criteria
- [ ] Tagline reads "Zero to code in under 5 minutes."
- [ ] Step 5 appears with correct numbering, title, description, and
      code block
- [ ] `spektacular implement` command is syntactically correct

---

## Phase 3 — Pipeline: three subsections

**File**: `how-it-works.html` lines 182–229
**File**: `assets/css/style.css` (new styles)

### 3.1 Replace the existing pipeline section

Replace the entire `<!-- ── The Pipeline -->` section
(lines 182–230) with three clearly labelled subsections. Each
subsection has its own heading, mini pipeline diagram showing
input → process → output, and an annotation paragraph.

**Proposed HTML**:

```html
  <!-- ── The Pipeline ────────────────────────────────────── -->
  <section class="section" id="pipeline">
    <div class="container">
      <div class="section__header">
        <h2>The pipeline</h2>
        <p>Three stages: write the spec, generate a plan scaled to
        complexity, then implement and validate.</p>
      </div>

      <!-- ── Stage 1: Specification ──────────────────────── -->
      <div class="pipeline-stage">
        <h3 class="pipeline-stage__title">
          <span class="pipeline-stage__number">1</span>
          Specification
        </h3>

        <div class="pipeline-diagram">
          <div class="pipeline-node pipeline-node--file">
            <div class="pipeline-node__icon">💡</div>
            <div class="pipeline-node__label">idea</div>
            <div class="pipeline-node__sub">requirements,<br>constraints &amp; criteria</div>
          </div>

          <div class="pipeline-connector">→</div>

          <div class="pipeline-node pipeline-node--step">
            <div class="pipeline-node__name">Write</div>
            <div class="pipeline-node__sub">structured markdown<br>spec template</div>
          </div>

          <div class="pipeline-connector">→</div>

          <div class="pipeline-node pipeline-node--output">
            <div class="pipeline-node__icon">📄</div>
            <div class="pipeline-node__label">spec.md</div>
            <div class="pipeline-node__sub">your requirements<br>in a standard format</div>
          </div>
        </div>

        <div class="pipeline-annotations" style="margin-top: 1.5rem;">
          <p style="max-width: 70ch; text-align: left;">
            Run <code>spektacular new</code> to scaffold a spec from the
            template, then fill in your requirements, constraints, and
            acceptance criteria. The spec is plain markdown — no special
            syntax, just structured sections.
          </p>
        </div>
      </div>

      <!-- ── Stage 2: Generate the Plan ──────────────────── -->
      <div class="pipeline-stage">
        <h3 class="pipeline-stage__title">
          <span class="pipeline-stage__number">2</span>
          Generate the Plan
        </h3>

        <div class="pipeline-diagram">
          <div class="pipeline-node pipeline-node--file">
            <div class="pipeline-node__icon">📄</div>
            <div class="pipeline-node__label">spec.md</div>
            <div class="pipeline-node__sub">your requirements</div>
          </div>

          <div class="pipeline-connector">→</div>

          <div class="pipeline-node pipeline-node--step">
            <div class="pipeline-node__name">Analyse</div>
            <div class="pipeline-node__sub">complexity score<br>0.0 – 1.0</div>
            <div class="pipeline-node__detail">cheap model<br>(fast &amp; low cost)</div>
          </div>

          <div class="pipeline-connector">→</div>

          <div class="pipeline-node pipeline-node--step">
            <div class="pipeline-node__name">Plan</div>
            <div class="pipeline-node__sub">explores codebase,<br>asks questions</div>
            <div class="pipeline-node__detail">Haiku · Sonnet · Opus<br>scaled by score</div>
          </div>

          <div class="pipeline-connector">→</div>

          <div class="pipeline-node pipeline-node--output">
            <div class="pipeline-node__icon">📋</div>
            <div class="pipeline-node__label">plan.md</div>
            <div class="pipeline-node__sub">+ research.md<br>+ context.md</div>
          </div>
        </div>

        <div class="pipeline-annotations" style="margin-top: 1.5rem;">
          <p style="max-width: 70ch; text-align: left;">
            <strong style="color: var(--text-primary);">Analyse</strong>
            uses a cheap, fast model to score the spec on a 0.0–1.0
            complexity scale — examining requirement count, constraint
            density, technical keywords, and spec length. The score is
            returned in under a second.
          </p>
          <p style="max-width: 70ch; text-align: left; margin-top: 1rem;">
            <strong style="color: var(--text-primary);">Plan</strong>
            uses that score to select a model tier. It loads your project
            knowledge base, explores the codebase, and runs interactively
            in the TUI — streaming markdown output and surfacing
            clarifying questions you answer by pressing a key. The result
            is written to <code>.spektacular/plans/</code>.
          </p>
        </div>
      </div>

      <!-- ── Stage 3: Implement the Plan ─────────────────── -->
      <div class="pipeline-stage">
        <h3 class="pipeline-stage__title">
          <span class="pipeline-stage__number">3</span>
          Implement the Plan
        </h3>

        <div class="pipeline-diagram">
          <div class="pipeline-node pipeline-node--file">
            <div class="pipeline-node__icon">📋</div>
            <div class="pipeline-node__label">plan.md</div>
            <div class="pipeline-node__sub">implementation plan<br>+ research + context</div>
          </div>

          <div class="pipeline-connector">→</div>

          <div class="pipeline-node pipeline-node--step">
            <div class="pipeline-node__name">Implement</div>
            <div class="pipeline-node__sub">executes plan via<br>coding agent</div>
            <div class="pipeline-node__detail">validates against<br>acceptance criteria</div>
          </div>

          <div class="pipeline-connector">→</div>

          <div class="pipeline-node pipeline-node--output">
            <div class="pipeline-node__icon">✅</div>
            <div class="pipeline-node__label">code</div>
            <div class="pipeline-node__sub">working implementation<br>verified by criteria</div>
          </div>
        </div>

        <div class="pipeline-annotations" style="margin-top: 1.5rem;">
          <p style="max-width: 70ch; text-align: left;">
            <strong style="color: var(--text-primary);">Implement</strong>
            hands the plan to a coding agent as a subprocess. The agent
            executes each task from the plan, and a validation step
            verifies the output against your acceptance criteria — so you
            know the implementation matches the spec.
          </p>
        </div>
      </div>

    </div>
  </section>
```

### 3.2 Add CSS for pipeline-stage layout

**File**: `assets/css/style.css`

Add the following after the existing `.pipeline-annotations` rules
(after line 518):

```css
/* ── Pipeline Stages (three-subsection layout) ───────────── */
.pipeline-stage {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-subtle);
}

.pipeline-stage:first-of-type {
  margin-top: var(--space-md);
  padding-top: 0;
  border-top: none;
}

.pipeline-stage__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.pipeline-stage__number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--accent-subtle);
  border: 1px solid var(--accent-primary);
  color: var(--accent-light);
  font-weight: 700;
  font-size: 0.8125rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

**Rationale**: Reuses the existing numbered-circle pattern from the
Quick Start steps. Each stage gets a top border separator except the
first. The pipeline-diagram inside each stage uses existing styles
unchanged.

### Success Criteria
- [ ] Pipeline section has three visually distinct subsections
- [ ] Each subsection has a numbered title: "1 Specification",
      "2 Generate the Plan", "3 Implement the Plan"
- [ ] Each subsection shows a pipeline diagram with correct
      input → process → output flow
- [ ] Annotation text is preserved for Analyse/Plan and new text
      added for Implement
- [ ] Layout works at all responsive breakpoints

---

## Phase 4 — Spec Format: full template fields

**File**: `how-it-works.html` lines 111–179

### 4.1 Add Technical Approach and Success Metrics to the code example

**Current code block** (lines 120–148) is missing `Success Metrics` and
has a minimal `Technical Approach` with no annotation.

**Proposed code block** — replace the entire `<pre><code>` content:

```html
          <pre><code># Feature: User Authentication

## Overview
Add OAuth2 login with Google and GitHub
providers to the existing Express app.

## Requirements
- [ ] Users can sign in with Google OAuth2
- [ ] Users can sign in with GitHub OAuth2
- [ ] Session persists across browser refreshes
- [ ] Logout clears session and redirects

## Constraints
- Must use existing Express backend
- No new dependencies over 50KB gzipped
- Cannot change the /api/users schema

## Acceptance Criteria
- [ ] Login redirects to provider, returns
      with valid session
- [ ] Session cookie is httpOnly, secure,
      sameSite=strict
- [ ] Logout flow works end-to-end

## Technical Approach
Use passport.js for OAuth2 strategy.
Integrate with existing session middleware.

## Success Metrics
- OAuth2 login completes in under 2 seconds
- Zero increase in /api/users error rate

## Non-Goals
Social login with Apple or Microsoft.</code></pre>
```

### 4.2 Add Technical Approach and Success Metrics annotations

Insert after the Acceptance Criteria annotation and before the
Non-Goals annotation (between lines 170 and 172):

```html
          <div class="spec-annotation">
            <div class="spec-annotation__section">## Technical Approach</div>
            <p>High-level technical direction — key architectural decisions,
            preferred patterns, integration points, and known risks. Leave
            blank to let the planner propose an approach.</p>
          </div>

          <div class="spec-annotation">
            <div class="spec-annotation__section">## Success Metrics</div>
            <p>How you'll know it works well after delivery. Quantitative
            ("p99 latency &lt; 200ms") or behavioural ("users complete the
            flow without support"). Leave blank if not applicable.</p>
          </div>
```

### 4.3 Enrich existing annotations with template guidance

Update the annotation text to incorporate the richer descriptions from
the spec template comments:

**Overview** — change to:
> "A concise 2–3 sentence summary answering: what is being built, what
> problem does it solve, and who benefits? Grounds the agent before it
> reads anything else."

**Requirements** — change to:
> "A checklist of discrete behaviours. Use active voice ("Users
> can…"). Each item should be independently verifiable and focus on
> what, not how."

**Constraints** — change to:
> "Non-negotiable boundaries — existing APIs, dependency limits,
> performance budgets. Violations are plan failures. Leave blank if
> none."

**Acceptance Criteria** — change to:
> "Binary pass/fail conditions, each traceable to a requirement and
> testable by someone who didn't write the code. These become the
> verification steps in the output plan."

**Non-Goals** — change to:
> "Explicitly out of scope — prevents scope creep and over-engineering.
> Leave blank if there are no exclusions to call out."

### Success Criteria
- [ ] Code example includes all 7 sections: Overview, Requirements,
      Constraints, Acceptance Criteria, Technical Approach, Success
      Metrics, Non-Goals
- [ ] All 7 sections have corresponding annotations
- [ ] Annotation text matches guidance from the default spec template
- [ ] Two-column layout still renders correctly

---

## Phase 5 — Update hero & meta descriptions

Small follow-on tweaks to align messaging across the site.

### 5.1 Update hero subtitle (index.html line 52–55)

**Current**:
```
Spektacular takes a markdown specification and uses AI coding agents to
produce a detailed, actionable implementation plan.
```

**Proposed**:
```
Spektacular takes a markdown specification and uses AI coding agents to
plan and implement your features. Agent-agnostic. Complexity-aware.
Interactive TUI.
```

### 5.2 Update meta description (index.html line 7)

**Current**:
```
...produce a detailed, actionable implementation plan...
```

**Proposed**:
```
Spektacular takes a markdown specification and uses AI coding agents to
plan and implement your features. Agent-agnostic. Complexity-aware.
```

### 5.3 Update how-it-works page hero subtitle (how-it-works.html line 42–43)

**Current**:
```
A deep dive into spec-driven development — from writing your first spec
to reviewing a complete implementation plan.
```

**Proposed**:
```
A deep dive into spec-driven development — from writing your first
spec to shipping working code.
```

### Success Criteria
- [ ] Hero subtitle mentions implementation
- [ ] Meta description reflects the full workflow
- [ ] How-it-works hero references shipping code

---

## File Change Summary

| File | Nature of change |
|---|---|
| `index.html` | Heading rename, pipeline nodes added, subtitle/meta updates |
| `how-it-works.html` | Quick Start step 5, pipeline three-subsection rewrite, spec format additions, hero subtitle |
| `assets/css/style.css` | New `.pipeline-stage` rules (~25 lines) |

No new files. No JS changes. No image changes.

## Verification

### Visual (open in browser)
- [ ] `index.html` — 6-node pipeline renders at desktop/tablet/mobile
- [ ] `how-it-works.html` — Quick Start shows 5 steps
- [ ] `how-it-works.html` — Pipeline shows 3 numbered subsections
- [ ] `how-it-works.html` — Spec format shows 7 annotated sections
- [ ] Both pages have no broken layout or overflow at 640px, 900px,
      and 1200px widths

### Content
- [ ] No mention of "From idea to plan" remains on the main page
- [ ] `spektacular implement` appears with correct syntax
- [ ] Every pipeline subsection clearly shows input → output
- [ ] Spec format matches all fields from the default template

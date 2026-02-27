# Implement Updates — Context

## Quick Summary
Add the implementation step to the Spektacular website documentation,
updating the main page pipeline diagram, Quick Start, pipeline detail
section (three subsections), and spec format to reflect the full
spec → plan → implement workflow.

## Key Files & Locations
- **Main page**: `index.html` (216 lines)
- **How-it-works page**: `how-it-works.html` (351 lines)
- **Stylesheet**: `assets/css/style.css` (900 lines)
- **Spec template source**: `../spektacular/internal/defaults/files/spec-template.md`

## Section Line References

### index.html
| Section | Lines | Change |
|---|---|---|
| Meta description | 7 | Update text |
| Hero subtitle | 52–55 | Update text |
| Pipeline heading | 92 | "From idea to plan" → "From idea to code" |
| Pipeline subtitle | 93 | Update text |
| Pipeline diagram | 96–126 | Add Implement + code nodes |
| Pipeline annotation | 128–133 | Rewrite for three stages |

### how-it-works.html
| Section | Lines | Change |
|---|---|---|
| Page hero subtitle | 42–43 | Update text |
| Quick Start tagline | 53 | "zero to code in under 5 minutes" |
| Quick Start steps | 56–106 | Add step 5 |
| Spec format code | 120–148 | Add Technical Approach detail + Success Metrics |
| Spec annotations | 151–176 | Add Technical Approach + Success Metrics annotations, enrich text |
| Pipeline section | 182–229 | Replace with three-subsection layout |

### assets/css/style.css
| Location | Lines | Change |
|---|---|---|
| After pipeline-annotations | ~518 | Add `.pipeline-stage` rules |

## Dependencies
- **Code Dependencies**: None (static HTML)
- **External Dependencies**: None
- **Database Changes**: None

## Environment Requirements
- None — static HTML served by GitHub Pages

## Integration Points
- **Deployment**: Auto-deploys via `.github/workflows/deploy.yml` on
  push to main
- **Domain**: spektacular.sh (CNAME file)

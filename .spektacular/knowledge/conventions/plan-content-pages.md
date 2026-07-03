# Plans must sketch content structure, not just summarize it

When a plan (via `/spek-plan`) requires a new content page or a
substantial content change — a documentation page, marketing copy, a
new section of prose — the phase describing that change must include a
concrete content skeleton, not only a prose summary of what the content
should cover.

The skeleton is:

- **Headings/sections** the page or change will use, in order.
- **An illustrative example** for each section: sample prose, a sample
  code block, or a short mock excerpt showing its shape. The wording is
  illustrative, not final copy the implementer must reproduce verbatim —
  but the structure and any technical facts embedded in the example
  (exact config keys, field names, sample values) are fixed by whatever
  the plan's research already verified, not left for the implementer to
  invent.

Label these blocks `**Content outline**` (for a new page) or `**Content
example**` (for a smaller copy change), placed inside the relevant phase
in `plan.md`, alongside its summary and acceptance criteria.

This exists so an implementer has a concrete shape to write against
instead of re-deriving page structure from a one-paragraph phase
summary. A summary like "documents how to enable X and what to expect"
is enough to say a page is needed, but not enough to say what it looks
like — two implementers reading only the summary could reasonably
produce very differently organized pages.

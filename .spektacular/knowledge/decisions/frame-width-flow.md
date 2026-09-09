# Why body text is not capped at a reading measure

The site runs body text the full width of the 1100px frame instead of capping it
at a typographic measure. This is deliberate and worth recording, because capping
it is the more conventional choice and will look like an obvious improvement to
anyone who meets the site cold.

A reading measure only works when something boxes the column in. Documentation
sites that cap body text pair it with a left navigation rail and a right table of
contents, and the measure sits between them as the middle column of a
three-column grid. This site has neither. With nothing on either side, a capped
column leaves a dead margin down the whole right of every page.

It also breaks alignment. Several bands are full-width by nature: the
code-and-keys grid in the spec format section of `/how-it-works/` is the clearest
case. A capped paragraph directly above a full-width grid reads as misaligned,
because the eye picks up two different left-to-right extents in the same column
of content.

So the rule is: flowed text runs the frame, and only *centred* text gets a cap,
because centred lines have ragged edges on both sides and genuinely need one.
That cap is `--spek-centered-measure: 52ch`, applied through `.spek-centered`,
and it is the only measure in the stylesheet.

**What would change this.** If the site ever grows a left nav and a right table
of contents, revisit the decision: at that point the boxing exists and a measure
becomes the better choice. Until then, adding one reintroduces both problems
above.

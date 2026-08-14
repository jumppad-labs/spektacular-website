# Label before filename in file-scoped reference headings

When a reference page documents more than one underlying file (or other
file-scoped content), lead each top-level `Section`/`ConfigurationKeys`
heading with the plain-language label before naming the file — e.g.
`"Project configuration: config.yaml"`, not `"config.yaml: overview and
example"`. A bare filename-first heading doesn't tell an unfamiliar reader
what the section is for until they already know what the file is.

When merging multiple file-scoped reference pages into one page, keep each
file's overview, example, and key-reference grouped together as consecutive
sections — an overview+example `Section`, then its `ConfigurationKeys`
block — rather than interleaving one file's content with another's. There is
no wrapping/container component for section groups on this site, so the
repeated file-prefixed heading across consecutive sections is what visually
signals the grouping; breaking that adjacency loses the grouping entirely.

## 000004_astro-migration

The Spektacular website has moved off Hugo onto Astro 5 with MDX and
Tailwind CSS v4. Each page now lives in a single `.mdx` file that
composes named blocks (`<Hero>`, `<Pipeline>`, `<FeaturesGrid>`,
`<CtaBanner>`, etc.) and carries its own prose, so changing a sentence
or a section no longer means editing both a markdown content file and
a separate layout template. The visual design, every URL, hosting on
GitHub Pages, and the `spektacular.dev` custom domain are preserved
unchanged; contributors get a faster dev loop (Vite HMR), typed
component props, and a single file to open per page.

## 000003_update-content

The Spektacular website now matches what the tool actually does today.
Inaccurate claims about a Bubble Tea TUI, complexity-driven model
routing, and Aider/Cursor agent support have been removed from the
homepage and how-it-works page. Three new top-level pages — Configuration,
Plugins, and Extending — document the real `.spektacular/config.yaml`
schema, the pluggable Store and Agent architecture, the three shipping
agents (Claude, Bob, Codex), and the Go interfaces a developer
implements to add their own backend. The install page's broken apt
channel has been replaced with a `go install` block, and the GitHub
Releases artifact names match the current release scheme.

## 000002_static-site-generation

The Spektacular website has moved off hand-built HTML onto the Hugo
static site generator with Tailwind CSS v4. The three pages (homepage,
how-it-works, install) now share a single source of truth for
navigation, header, and footer — editing them in one place updates
every page. Hosting and the `spektacular.dev` custom domain are
unchanged; URLs adopt Hugo's defaults (`/install/` instead of
`/install.html`). Contributors can now add or update pages by editing
Markdown content and Hugo layouts instead of copy-pasting full HTML
documents.

## 1_install_instructions

Added a dedicated Install page to the Spektacular website with tabbed
instructions for Homebrew, Debian/Ubuntu, and GitHub Releases — making it
easy for new users to get Spektacular running regardless of their platform.
The Install page is now linked from the top navigation on every page, and
the homepage hero has been updated to show the Homebrew install command as
the recommended path.

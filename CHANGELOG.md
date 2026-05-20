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

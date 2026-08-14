## 000043_flipped-interaction-spec-interview

The "How Spektacular Works" page now describes the adaptive interview that opens every new spec, names it as the Flipped Interaction pattern with attribution to the prompt-engineering research it draws from, and walks through a worked example exchange along with a second example showing the interview asking about impact on another registered repo in a multi-repo project. The homepage's features grid now features this interview as one of its cards, so the capability is visible to a first-time visitor rather than only described on the deeper reference page.

## 000042_repo-self-describing-metadata

The Configuration page's registered-repository entry now documents only membership fields — name, address or local path, provider, and dependencies — since a repository's description, role, tags, and deployment moved to the repository's own configuration file. A new Repository Configuration reference page, linked from the Configuration page and added to the site's Resources navigation, documents that repository-level file in full, including its descriptive metadata alongside its existing knowledge and changelog settings.

## 000009_document-artifact-metadata-and-historical-artifacts

The "How Spektacular Works" page now explains that once a spec or plan is
written, coding agents treat it as a historical record of past intent
rather than a live description of current behavior, answering "how does
this work today" from the code itself, while still opening and citing the
original spec, plan, or changelog entry when asked why something was built
a certain way. The Configuration page now notes that every spec, plan, and
changelog record automatically tracks a creation date, a status, and a
closed date, and adds a new section with example commands for listing and
filtering a project's own records by that metadata, including one command
that queries across specs, plans, and changelog entries at once.

## 000008_debugging-docs

Spektacular's debug logging is now correctly documented and easy to find.
A new Debugging page walks through turning it on, where the resulting log
file lives, and what one logged entry looks like, replacing the
Configuration page's old, inaccurate claim that debug mode prints to the
console. The top navigation gains a "Resources" menu that groups Plugins,
Extending, and the new Debugging page together, so all three are
reachable without already knowing their URLs, and without adding a new
top-level nav item.

## 000007_video-element

Tutorials and documentation pages can now embed a YouTube video directly
alongside the written content. Authors provide a video's URL and get a
playable YouTube player rendered in the same spot, sized, and styled
consistently with how an image appears in the same location. Authors can
optionally set a start time and an end time so playback covers just the
relevant portion of a longer video, and can turn off the player's fullscreen
control when it isn't wanted. Playback itself uses YouTube's own default
controls, with no custom player UI.

## 000006_document-context

The Spektacular website has a new Knowledge Base page, reachable from the top
navigation right after "How it works". It explains what the knowledge base is
and the problem it solves, walks through the six categories of knowledge and the
two ways they are retrieved, shows how an entry is created, searched, and kept up
to date, and covers how the knowledge base is configured and where that
configuration lives, including pointing at more than one source. A closing
section explains why the subsystem is designed the way it is, so readers come
away understanding not just how to use it but why to trust it.

## 000005_tutorial-section

The Spektacular website now has a Tutorials section reachable from
the top nav. Each tutorial is a single MDX file in a new content
collection, and the index page lists every published tutorial as a
clickable card. Every tutorial page carries an agent selector
(default Bob, plus Claude and Codex) at the top that swaps per-step
instructions and screenshots between the supported coding agents
without a page reload; the choice is persisted across visits. The
first tutorial, "How to use Spektacular", walks a reader through
the end-to-end workflow from install to implement. Per-agent
screenshots ship as labelled placeholders pending real captures.

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

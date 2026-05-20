# Feature: 1_install_instructions

<!--
  OVERVIEW
  A concise 2-3 sentence summary of the feature. Answer three questions:
    1. What is being built?
    2. What problem does it solve?
    3. Who benefits and why does it matter?
  Avoid implementation details — this should be readable by any stakeholder.
-->
## Overview

The Spektacular website needs a new install instructions section that shows
visitors how to get the software onto their machine. It will guide users to
install via a package manager or by downloading from GitHub Releases, removing
friction for new users trying to get started.


<!--
  REQUIREMENTS
  Specific, testable behaviours the feature must deliver.
  Format: bold title on the checkbox line, detail indented below.
  Rules:
    - Use active voice: "Users can...", "The system must..."
    - Each requirement should be independently verifiable
    - Focus on WHAT, not HOW — avoid prescribing implementation
    - Keep each item atomic — one behaviour per line
-->
## Requirements

- [ ] **Dedicated install page**
  A standalone page exists for install instructions, separate from the
  homepage.

- [ ] **Top navigation link**
  The install page is reachable via a link in the top navigation menu on
  every page of the site.

- [ ] **Homebrew install instructions**
  Users can see the commands needed to install Spektacular using Homebrew.

- [ ] **Debian install instructions**
  Users can see the commands needed to install Spektacular on
  Debian/Ubuntu-based systems using apt.

- [ ] **Fedora install instructions**
  Users can see the commands needed to install Spektacular on Fedora-based
  systems using dnf.

- [ ] **GitHub Releases install instructions**
  Users can see how to download and install Spektacular directly from
  GitHub Releases as an alternative to package managers.


<!--
  CONSTRAINTS
  Hard boundaries the solution must operate within. These are non-negotiable.
  Examples:
    - Must integrate with the existing authentication system
    - Cannot introduce breaking changes to the public API
    - Must support the current minimum supported runtime versions
  Leave blank if there are no constraints.
-->
## Constraints

- The install page must match the existing visual style of the site.

<!--
  ACCEPTANCE CRITERIA
  The specific, binary conditions that define "done".
  Format: bold title on the checkbox line, verifiable detail indented below.
  Each criterion must be:
    - Independently verifiable (pass/fail, not subjective)
    - Traceable back to a requirement above
    - Testable by someone who didn't write the code
-->
## Acceptance Criteria

- [ ] **Top nav link is present on every page**
  Visiting any page on the site shows a link to the install page in the
  top navigation menu.

- [ ] **Install page loads**
  Clicking the nav link navigates to a dedicated install page.

- [ ] **Homebrew instructions are present**
  The install page displays Homebrew install commands.

- [ ] **Debian instructions are present**
  The install page displays apt install commands for Debian/Ubuntu.

- [ ] **Fedora instructions are present**
  The install page displays dnf install commands for Fedora.

- [ ] **GitHub Releases instructions are present**
  The install page displays instructions for downloading directly from
  GitHub Releases.


<!--
  TECHNICAL APPROACH
  High-level technical direction to guide the planning agent. Include:
    - Key architectural decisions already made
    - Preferred patterns or technologies if known
    - Integration points with existing systems
    - Known risks or areas of uncertainty
  Leave blank if you want the planner to propose the approach.
-->
## Technical Approach


<!--
  SUCCESS METRICS
  How you will know the feature is working well after delivery. Be specific:
    - Quantitative: "p99 latency < 200ms", "error rate < 0.1%"
    - Behavioural: "users complete the flow without support intervention"
  Leave blank if not applicable.
-->
## Success Metrics


<!--
  NON-GOALS
  Explicitly state what this spec does NOT cover. This is as important as
  the requirements — it prevents scope creep and sets clear expectations.
  Examples:
    - "Mobile support is out of scope (tracked in #456)"
    - "Internationalisation will be addressed in a follow-up spec"
  Leave blank if there are no explicit exclusions to call out.
-->
## Non-Goals

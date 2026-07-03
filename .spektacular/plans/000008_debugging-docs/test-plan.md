# Test Plan: 000008_debugging-docs

No quantitative success metrics were defined for this spec (the user
elected to manually test against the acceptance criteria). The plan's
`## Testing Approach` names four manual checks that have no automated
equivalent. Procedures for each, grounded in the actual shipped
implementation:

## 1. Nav dropdown reachability and active state

**What to check**: the "Resources" grouping entry in the top nav opens
on hover and on keyboard focus, reveals links to Plugins, Extending, and
Debugging, all three navigate correctly, no new top-level nav item
exists, and the "Resources" entry shows active state on all three child
pages.

**How**:
1. Run `npm run dev` and open the site in a browser.
2. Count the top-level nav items: How it works, Knowledge Base,
   Tutorials, Install, Configuration, Resources (6 total, same count as
   before this change since Plugins/Extending were folded into
   Resources).
3. Hover over "Resources" with a mouse — confirm a dropdown appears
   showing Plugins, Extending, Debugging.
4. Move the mouse away — confirm the dropdown closes.
5. Tab through the nav with the keyboard until "Resources" is focused —
   confirm the dropdown opens the same way (via `:focus-within`).
6. Click each of the three links in turn and confirm each lands on
   `/plugins/`, `/extending/`, and `/debugging/` respectively.
7. Visit each of those three pages directly and confirm "Resources" is
   styled as active (matches the active-state color used by other nav
   items) on all three.

**Expected result**: all of the above hold true; no top-level nav item
count increase from before this plan.

**Who / when**: the user, manually, before merging this change — this
could not be automated in the implementation environment (no headless
browser with working system libraries was available to drive a real
hover/focus interaction; see plan.md's Changelog entry for Phase 3.1).

## 2. Nav dropdown on mobile/touch

**What to check**: the dropdown remains usable at small viewport widths,
where hover is not meaningful and tap-to-focus is the fallback.

**How**: using a browser's device emulation (or a real touch device),
load the site at a narrow viewport (for example 375px wide), tap the
"Resources" nav item, and confirm the dropdown opens and its three links
are tappable.

**Expected result**: tapping "Resources" opens the dropdown via
`:focus-within` (no JavaScript is involved), and all three child links
are reachable and functional.

**Who / when**: the user, manually, on a real or emulated touch device,
before merging.

## 3. Debugging page content accuracy and completeness

**What to check**: the rendered `/debugging/` page actually states the
exact config change needed (`debug.enabled: true` in
`.spektacular/config.yaml`) and the exact expected output (log file
path, append-only behavior, and a real sample log line), in prose a
reader can follow without prior knowledge.

**How**: read the rendered `/debugging/` page top to bottom as a first-
time reader would, and confirm:
- The "Enabling debug logging" section shows the literal YAML edit.
- The "What gets logged" section names the exact file path
  (`.spektacular/debug/session-log.jsonl`) and shows a real sample JSON
  line with each field explained.
- The "Before you enable it" section flags the `.gitignore` gap as a
  reader tip, not a claim that it's already handled.

**Expected result**: a reader with no prior context could follow the
page and successfully enable and observe debug logging.

**Who / when**: the user, manually, as a proofread pass before merging.

## 4. Content accuracy against the real Spektacular binary

**What to check**: the page's claims still match what the installed
`spektacular` binary actually does (no console output, only the JSONL
file; the field schema listed is complete and correct).

**How**: this was already ground-truthed during the plan's discovery
phase against the installed `spektacular` v0.7.0 binary (see
`research.md#chosen-approach--evidence` — flag flags checked, env vars
checked, config schema verified, actual log output captured from a
scratch project). This check is a proofread confirming the shipped
page's final wording did not drift from that verified truth during
authoring, not a re-verification against the binary.

**Expected result**: the shipped copy's technical claims (config key,
file path, field names, `session_id` value forms) match the verified
facts recorded in context.md's Current State Analysis section, word for
word on the technical details.

**Who / when**: the user, manually, as part of the same proofread pass
as check 3, before merging.

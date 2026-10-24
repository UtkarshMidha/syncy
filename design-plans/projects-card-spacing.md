# Tighten project cards on mobile

Written against: `f8abbcd041cb16a94fc335d7a288e13d60067f54`

## Evidence chain

- Surface: `prototype/index.html`, Projects tab at the mobile viewport shown in the supplied screenshot.
- Problem: The user reports that project-card padding is too large. Project cards inherit 14px from `.card`, while contact cards in the same app use 12px; the screenshot shows the project list and its inner content.
- Design evidence: Explicit user feedback and a direct within-surface spacing difference. UI/UX Pro Max guidance supports consistent mobile spacing and preserving touch-target separation. No governing `DESIGN.md` or design-system document was found.
- Owner: `prototype/index.html` styles `.card`, `.person`, `.proj-card`, and renders the project list in `SCREENS.projects()`.
- Scope and affected surfaces: Project display cards on the Projects tab, including imported Notion projects. The Notion import card, add-project form, and edit form are not project display cards and should keep their current padding.
- Uncertainty: Check the result against the supplied screenshot after implementation; no numeric padding target was specified by the user.

## Design decision

Use the existing 12px inset from `.person` for read-only project display cards. Keep the interactive Notion, add, and edit cards at their current inset so their forms and controls retain room.

## Reuse

- Reuse the existing 12px value in `.person`; no new token or primitive is needed.
- Exemplar: `prototype/index.html` `.person { ... padding: 12px; }`.

## Changes

1. `prototype/index.html`
   - Change: Add a display-only class to the read-only project card rendered by `SCREENS.projects()` and set that variant to 12px padding, matching `.person`; leave the import, add, and edit cards at the existing 14px `.card` padding.
   - Preserve: Project descriptions, contact chips, edit/delete controls, project import, and current card colors, radius, and shadow.
   - Verify: At the screenshot's phone width, project name, edit/delete controls, description, and contact chips have a tighter but readable inset; longer project names/descriptions wrap without overlap.

## Scope

- Inherit: Locally created and Notion-imported read-only project cards.
- Verify: Empty descriptions, long names, multiple contact chips, and edit mode.
- Exclude: Changes to typography, card color, shadows, import panel, add form, or project behavior.

## Validation

- Product: Open Projects with both local and imported projects and confirm all project details remain visible.
- Interface: Compare at 330px (provided screenshot), 375px, and 430px; inspect long text and edit/delete control spacing.
- System: Confirm the project display variant alone gets the tighter inset and form-bearing cards retain their existing padding.
- Repository: `git diff --check` → no whitespace errors; visually inspect the Projects tab at mobile widths.

## Stop conditions

- Stop if the user's intended padding issue concerns card width, outer gutters, or vertical spacing instead of the inner content inset; clarify the target before changing other spacing.

## Design documentation

- After acceptance and validation: none; this is a local spacing adjustment using an existing value.


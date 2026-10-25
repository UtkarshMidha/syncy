# Premium earthy workspace refresh

Status: Implemented in this worktree. Inline JavaScript and stylesheet structure checks pass; browser viewport review is pending because no browser is available in this environment.

Written against: `b35a36d401a0870ed19ad755129bb1027351750e`

## Evidence chain

- Surface: `prototype/index.html` capture and contact workflow, `prototype/dashboard.html` contact management, with `prototype/login.html` and `prototype/notion-callback.html` as theme consumers.
- Problem: A user-provided desktop screenshot shows the main product presented as a narrow, fixed phone mockup inside a wide browser. The current `.phone` rule remains 390px wide above the 820px mobile breakpoint. The supplied projects/dashboard screens also show repeated raised surfaces; `.card` gives every card a border, white surface, and shadow. The dashboard palette still assigns blue and purple to non-brand status/avatar accents.
- Design evidence: The user's explicit direction is “earthy only” and “premium product”; the earlier UI audit instruction says to avoid card-heavy layouts. The PRD's core product task remains event → scan → note → AI review → save/manage. Current CSS already defines a warm parchment, espresso, terracotta, and ochre palette. No governing `DESIGN.md` exists.
- Owner: `prototype/index.html` owns the main app shell, tab navigation, and shared app tokens; `prototype/dashboard.html` owns the desktop table, dashboard shell, and a duplicate token set. The two auth pages own their small standalone surfaces.
- Scope and affected surfaces: Presentation of the main app and dashboard across desktop, tablet, and mobile; palette consistency on login and Notion callback. Preserve current routes, navigation destinations, data, and actions.
- Uncertainty: The repository screenshots are marked as prototype/demo captures and predate the current commit. Recheck the live current UI in a browser before finalizing visual values.

## Design decision

Use a restrained **earthy editorial workspace**: parchment and oat surfaces, espresso text, terracotta primary actions, and olive/bark/ochre semantic accents. Give the authenticated app a true responsive workspace at desktop widths instead of a device bezel; retain the current bottom navigation on phones. Preserve dashboard information density and use borders, alignment, and separators before adding another raised card. Keep the existing mobile navigation and project-card-spacing decisions from the earlier plans.

Motion should clarify state changes only. Do not pin, scrub, or stagger contact/project data while users scroll; this is a working sales workspace, not a scroll narrative. Keep short opacity/transform transitions and honor the existing reduced-motion rules. No GSAP dependency is needed for the current interface.

## Reuse

- Reuse the existing CSS variables in `prototype/index.html` (`--bg`, `--phone`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-2`, `--accent-soft`) and synchronize their values/roles with `prototype/dashboard.html`, `prototype/login.html`, and `prototype/notion-callback.html`.
- Reuse the existing outline SVG icon style in the app and dashboard tab bars; retain emoji supplied as project data.
- Preserve the already implemented navigation behavior in `design-plans/mobile-navigation.md` and the 12px read-only project-card inset in `design-plans/projects-card-spacing.md`.
- Exemplar: `prototype/index.html` `@media (max-width: 820px)` and `.tabbar`; `prototype/dashboard.html` `.row`, `.mobile-nav`, and responsive table layout.

## Changes

1. `prototype/index.html`
   - Change: Above 820px, remove the fixed 390px device frame and let the app workspace use the available width; move the existing tab bar to the top of the workspace. Above 1200px, retain the 300px contextual workflow panel beside the workspace. From 821px through 1200px, hide that explanatory panel and let the workspace fill the viewport. Cap screen content at 1040px. At 820px and below, retain the full-height surface and bottom tabs with safe-area padding.
   - Preserve: Today, Contacts, Projects, Dashboard destinations; browser history/state restoration; all capture, recording, transcription, review, save, and edit behavior; existing mobile layout and tab labels.
   - Verify: The app reads as a responsive web workspace at 1440px, 1280px, and 1024px; at 768px and 390px it remains a full-screen touch interface with bottom navigation and no horizontal overflow.
2. `prototype/index.html` and `prototype/dashboard.html`
   - Change: Reduce repeated elevation. Keep distinct decision surfaces such as event selection, AI recommendation, import, and contact detail visually grouped; use quiet dividers/list rows for secondary repeated content. Align card radius, border, shadow, spacing, heading, body, and metadata roles across both pages. Preserve the dashboard's dense table and responsive row layout.
   - Preserve: Project display cards and their existing tighter inset; project/contact chips, edit/delete controls, filters, sort, stage colors' meaning, and mobile bottom navigation.
   - Verify: Contact lists, project lists, event lists, dashboard metrics, and the import panel have a clear surface hierarchy without nested borders or competing shadows.
3. `prototype/index.html`, `prototype/dashboard.html`, `prototype/login.html`, and `prototype/notion-callback.html`
   - Change: Keep all product UI accents within the existing earthy token family. Map status and avatar colors to the existing olive (`--ok`), bark (`--accent-ink`/`--muted`), ochre (`--accent-2`), and clay (`--accent`) roles; remove blue/purple from non-brand UI. Set foreground text for contrast against each token. Keep third-party LinkedIn/Xing marks in their recognizable brand colors. Replace decorative control emojis with the existing outline SVG style where one is needed; retain user-provided project emoji.
   - Preserve: Status labels and their meaning, source identity, contrast, AI recommendation content, and all form/callback copy and behavior.
   - Verify: Every route uses the same warm palette; non-brand controls have no blue/purple theme accents; status remains understandable without color alone.

## Scope

- Inherit: All screens rendered by `prototype/index.html`; all dashboard table, filter, drawer, loading, and error states; auth and callback theme.
- Verify: Long project names/descriptions, no projects, no contacts, overdue/complete statuses, import connected/expired states, narrow viewport, keyboard focus, and reduced motion.
- Exclude: Business logic, API/data changes, navigation destinations/history, localization, new marketing pages, new font assets, new dependencies, scroll hijacking, and edits to the already implemented navigation/project-spacing plans.

## Validation

- Product: With a real signed-in account, enter an event, capture a contact, add a note or transcript, process, edit/assign, save, and revisit the contact in the dashboard. Confirm Notion-imported projects retain their labels and descriptions.
- Interface: Inspect `prototype/index.html` at 1440px, 1280px, 1024px, 768px, 390px, and 330px; inspect `prototype/dashboard.html` at the same widths. Check event picker, scan, note/voice, processing, review, saved, contacts/projects, import, empty, loading, error, and contact drawer states. Check login and callback at 390px and 1440px.
- Motion/accessibility: Verify keyboard navigation and visible focus, 44px touch targets, readable contrast, zoom/reflow, and `prefers-reduced-motion`. Confirm all content is visible without scroll-triggered animation and no pinned/scrubbed scrolling is introduced.
- System: Confirm the existing CSS token owners remain authoritative and no second competing color/icon/radius system is added. Keep real-data-only behavior and do not reintroduce sample/demo launch paths.
- Repository: `git diff --check` → no whitespace errors; run `node --check` on extracted inline scripts → no syntax errors; perform browser visual checks at the listed widths.

## Stop conditions

- Stop if the desktop shell requires changing tab destinations, screen order, or the established mobile navigation behavior.
- Stop if current live rendering contradicts the supplied screenshot evidence; update the plan to match the current page before implementation.
- Stop if an earthy replacement for a status accent makes its text/background contrast fail; choose an accessible earth-tone token rather than reintroducing a decorative hue.

## Design documentation

- After acceptance and validation: record the shared palette, surface hierarchy, and desktop/mobile shell rules in a new `DESIGN.md` only if the team wants a governing design source; none exists today.

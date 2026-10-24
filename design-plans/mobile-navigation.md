# Predictable mobile navigation across Syncy

Written against: `f8abbcd041cb16a94fc335d7a288e13d60067f54`

## Evidence chain

- Surface: `prototype/index.html` on mobile, including Today, Contacts, Projects, capture/detail screens, and `prototype/dashboard.html`.
- Problem: The user reports that Back leaves the app for the previous URL instead of returning to the last app view, and the dashboard has no bottom navigation. The supplied mobile screenshot shows the phone app shell and bottom-tab context; source confirms dashboard is a separate document.
- Design evidence: Explicit user request and reported behavior; UI/UX Pro Max navigation guidance calls for predictable back behavior, state preservation, and consistent navigation. No governing `DESIGN.md` or design-system document was found.
- Owner: `prototype/index.html` owns `go()` and the phone app tab bar; `prototype/dashboard.html` owns the dashboard document and hides `.side` below 900px.
- Scope and affected surfaces: Mobile navigation between phone app screens, dashboard, and login redirects. Desktop dashboard sidebar remains in place.
- Uncertainty: None for the requested behavior: keep Dashboard as its existing contacts-management destination and expose it as the fourth mobile navigation item.

## Design decision

Make browser Back follow the user's in-app path and keep the primary destinations reachable through a consistent mobile bottom bar on both the phone app and dashboard. Preserve direct links, authentication redirects, current screen/tab selection, and useful in-progress state when navigating backward.

## Reuse

- Reuse the existing bottom navigation markup and active state in `prototype/index.html`; reuse existing destinations and dashboard layout in `prototype/dashboard.html`.
- Exemplar: `prototype/index.html` `go()` and `render()`; `prototype/dashboard.html` responsive block at `@media (max-width: 900px)`.
- UI/UX Pro Max focused search: mobile back-stack, bottom tabs, and state preservation.

## Changes

1. `prototype/index.html`
   - Change: Record app-owned screen and tab transitions in browser history, restore the corresponding view on `popstate`, and retain the tab's previous screen/scroll state when opening a detail or capture flow.
   - Preserve: Existing deep-link query handling for Notion return, login redirects, async capture/processing states, and explicit close/back controls.
   - Verify: Switch tabs, open a contact, enter a capture flow, then use browser Back/Forward; each returns to the expected prior view without leaving Syncy or losing the prior list position.
2. `prototype/index.html` and `prototype/dashboard.html`
   - Change: Provide the same mobile bottom-navigation destinations and active-state treatment on both surfaces, with the four destinations Today, Contacts, Projects, and Dashboard, and an active state for the current destination; keep the dashboard's desktop sidebar above the existing mobile breakpoint.
   - Preserve: Dashboard filtering, sorting, contact drawer, and desktop navigation.
   - Verify: From either document at a phone viewport, move among Today, Contacts, Projects, and Dashboard; the current destination is visibly active and Back returns to the previous app location.

## Scope

- Inherit: All navigation links that enter or leave the phone app and dashboard.
- Verify: Login return URLs, Notion OAuth callback return, browser Back/Forward, tab state, deep-linked entry, and dashboard desktop sidebar.
- Exclude: Authentication behavior, database/API behavior, dashboard redesign beyond mobile navigation, and unrelated content changes.

## Validation

- Product: Navigate across the four destinations, open/close contact detail and capture flow, and verify Back returns to the actual prior app location.
- Interface: Verify at 375px and 430px widths, including bottom safe-area space and long scrollable lists; verify desktop sidebar remains available.
- System: Confirm navigation labels, destination URLs, and active states agree between `index.html` and `dashboard.html`; confirm no navigation loop after OAuth/login redirects.
- Repository: `git diff --check` → no whitespace errors; manually exercise browser Back/Forward in the running app.

## Stop conditions

- Stop if the app must preserve arbitrary form contents through reloads; this plan preserves navigation state within the active session only.

## Design documentation

- After acceptance and validation: record the shared mobile navigation destinations and history behavior in a current `DESIGN.md` only if the project adopts one; otherwise none.


## Problem Statement

The user wants a simple checklist for personal use. They need to record things they intend to do, see what is still unfinished, and keep one list in a database they control, including when they move from local development to a hosted deployment.

## Solution

Provide a Korean, responsive, single-page checklist with a clean light appearance. The user can add a titled 할 일, mark it complete or undo that state, and delete it after confirmation. Show the number of 남은 할 일 clearly. Keep the existing screen and store the list in one shared database: a local Turso/libSQL database during development and a remote Turso database when deployed. Do not require a separate app account; protect the hosted app with the owner's Vercel Authentication access.

## User Stories

1. As a person using the app alone, I want to use the checklist without creating a separate app account, so that I can start using it once I have access to the protected deployment.
2. As a Korean-speaking user, I want the app's instructions and controls to be in Korean, so that I can understand them easily.
3. As a user on a phone, I want the checklist to fit a small screen, so that I can manage 할 일 away from my computer.
4. As a user on a computer, I want the checklist to use the available screen space comfortably, so that the list is easy to scan.
5. As a user with a new installation, I want to start with an empty list and a helpful prompt, so that I know how to add my first 할 일.
6. As a user, I want to enter a title and press the add button, so that I can record a new 할 일.
7. As a user, I want to press Enter to add the title, so that I can add an item without moving my hands to the mouse.
8. As a user, I want leading and trailing spaces removed from a title, so that the list stays tidy.
9. As a user, I want an empty or spaces-only title rejected with a clear message, so that I can correct the input before adding it.
10. As a user, I want the input cleared after a successful addition, so that I can enter another 할 일 easily.
11. As a user, I want to add two 할 일 with the same title, so that separate occasions can be tracked independently.
12. As a user, I want long titles to remain readable without an arbitrary character limit, so that I can describe what I need to do.
13. As a user, I want unfinished 할 일 shown before completed ones, so that the work I still need to do is prominent.
14. As a user, I want newer 할 일 shown before older ones within each group, so that recent additions are easy to find.
15. As a user, I want to mark an 할 일 complete, so that I can distinguish finished work from unfinished work.
16. As a user, I want completed 할 일 to remain visible, so that I can review what I have done.
17. As a user, I want to undo a completion mark, so that I can return an item to the unfinished group if needed.
18. As a user, I want the 남은 할 일 count to include only items not marked complete, so that it reflects the work I still need to do.
19. As a user, I want that count to update immediately after adding, completing, undoing, or deleting an item, so that it stays accurate.
20. As a user, I want the count to show zero when everything is complete or the list is empty, so that I can tell there is nothing left to do.
21. As a user, I want a confirmation dialog before deleting an 할 일, so that an accidental click does not immediately remove it.
22. As a user, I want canceling the deletion dialog to leave the 할 일 unchanged, so that I can back out safely.
23. As a user, I want confirming deletion to remove the selected 할 일 permanently, so that I can keep the list relevant.
24. As a user, I want the list to remain after refreshing or reopening the app, so that I do not have to re-enter my 할 일.
25. As a user, I want to see the same list from another browser where I have access to the app, so that my list is not tied to one browser profile.
26. As a user, I want a clear message when the database cannot be reached or a change cannot be saved, so that I know why my changes are unavailable.
27. As a user, I want the app to retain its current visible state when a database operation fails, so that an error does not look like a successful change or an empty list.
28. As a user, I want to retry loading after a database read failure, so that I can recover when the database becomes available again.
29. As a user, I want to know that an internet connection is required, so that I understand the checklist does not work offline.
30. As a user with old browser-stored 할 일, I want them copied once into an empty database, so that I can continue using them without entering them again.
31. As a user, I want existing database contents to win over old browser data, so that an import never merges, overwrites, or duplicates the shared list.
32. As a user, I want an imported or previously used database not to import old browser data again after I delete items, so that deleted 할 일 do not unexpectedly return.

## Implementation Decisions

- Use the existing Next.js App Router application with TypeScript.
- Treat the app as one personal checklist and one shared list. Do not add a separate in-app account or multi-user features; protect the hosted app through Vercel Authentication for all deployments.
- A 할 일 has a title, a completion state, a stable identity, and creation order. The title is the only user-entered field.
- Allow duplicate titles. Trim titles and reject blank input; impose no arbitrary title length limit.
- Do not add title editing in this version.
- Keep unfinished and completed items in separate visible groups, with newer items first within each group. Completing an item moves it to the completed group; undoing completion moves it back.
- Count only unfinished items as 남은 할 일.
- Ask for confirmation in an in-app dialog before permanent deletion. Cancel leaves the item intact.
- Start with an empty list and use Korean interface text. Provide a responsive light layout and allow adding through both a button and Enter.
- Store data in Turso/libSQL using `@libsql/client` from a server-only database module, accessed by the UI through Next.js Route Handlers. Keep database credentials on the server.
- Select the database with `TURSO_DATABASE_URL`. Use `file:local.db` for local development; use a remote Turso URL for the hosted deployment. `TURSO_AUTH_TOKEN` is required for remote access and is not needed for the local file database.
- Create the required database schema automatically on first access. Do not add offline persistence or silently fall back to browser storage.
- Import existing browser `localStorage` data at most once, only when the database is empty. If the database already contains data, it wins; do not merge or overwrite it. Keep the legacy browser data untouched and record that migration has been handled so deleted items cannot later be resurrected.
- Update visible state only after the database confirms a successful operation. Prevent duplicate actions while a request is pending, and report read/write failures without presenting them as success or an empty list.
- Prepare a one-time command and beginner-friendly instructions to copy `local.db` into the remote Turso database for deployment. Changing the database URL alone does not copy data.
- Configure Vercel Authentication with the `All Deployments` scope so production is protected as well as previews. Explain that this platform setting must be enabled in Vercel.
- Do not add a new test framework.

## Testing Decisions

- Use one browser-level seam through the rendered checklist. Tests should assert what a user sees and can do, not internal component, route, or database-helper details.
- Exercise adding by button and Enter, title trimming and blank rejection, duplicate titles, completion and undo, grouping and count updates, deletion cancel/confirm, and persistence after reload.
- Verify that the same list is shown after loading from the database, that a failed request is communicated without a success-shaped state change, and that pending requests prevent duplicate actions.
- Verify one-time legacy import behavior: import into an empty database, skip import when the database already has data, and do not resurrect imported items after deletion.
- Cover the checklist screen and its persistence boundary through the user-facing flow; do not create separate unit-test seams for implementation details.
- There are no existing test files or test runner in the repository. Keep validation to the agreed browser-level checks plus the existing lint and production-build commands; do not add test tooling for this work.

## Out of Scope

- A separate in-app account system, multiple users or lists, and offline access or browser-based fallback.
- Ongoing synchronization or merging of browser-local data after the one-time legacy import.
- Notes, descriptions, due dates, categories, recurring items, or priority levels.
- Editing an existing title, bulk deletion, undo after confirmed deletion, filters, or drag-and-drop ordering.
- Sample data, multiple languages, or dark mode.

## Further Notes

- Local development uses `file:local.db`; hosted data is a separate remote database and must be copied explicitly before cutover.
- The hosted Vercel project must have Vercel Authentication enabled for `All Deployments`; this is not configured by application code.
- The existing checklist UI is retained; this change replaces its browser-local persistence with the database-backed behavior described above.

## Problem Statement

The user wants a simple checklist for personal use. They need to record things they intend to do, see what is still unfinished, and keep the list when they return to the same browser.

## Solution

Provide a Korean, responsive, single-page checklist with a clean light appearance. The user can add a titled 할 일, mark it complete or undo that state, and delete it after confirmation. Show the number of 남은 할 일 clearly. Save the list in the current browser so it survives a reload, without requiring an account or a server-side database.

## User Stories

1. As a person using the app alone, I want to open the checklist without creating an account, so that I can start using it immediately.
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
24. As a user, I want the list to remain after refreshing or reopening the same browser profile, so that I do not have to re-enter my 할 일.
25. As a user, I want to know that the list is stored only in this browser, so that I understand it is not synchronized to another device.
26. As a user, I want a clear message if the browser cannot read or save the list, so that I know why my changes are unavailable.
27. As a user, I want the app to avoid silently replacing unreadable saved data with an empty list, so that a storage problem does not appear to erase my work.
28. As a user, I want to retry loading after a read failure, so that I can recover if the browser storage becomes available again.

## Implementation Decisions

- Use the existing Next.js App Router application with TypeScript.
- Treat the app as a single-user checklist; do not add login, accounts, or server synchronization.
- A 할 일 has a title, a completion state, a stable identity, and creation order. The title is the only user-entered field.
- Allow duplicate titles. Trim titles and reject blank input; impose no arbitrary title length limit.
- Do not add title editing in this version.
- Keep unfinished and completed items in separate visible groups, with newer items first within each group. Completing an item moves it to the completed group; undoing completion moves it back.
- Count only unfinished items as 남은 할 일.
- Ask for confirmation in an in-app dialog before permanent deletion. Cancel leaves the item intact.
- Start with an empty list and use Korean interface text. Provide a responsive light layout and allow adding through both a button and Enter.
- Store data in browser `localStorage`. Keep all storage access and the operations that update stored items behind one replaceable storage boundary; the screen must not access browser storage directly.
- Keep browser-only storage access out of server rendering. Report storage read/write failures to the user and retain the current UI state when a write fails.
- Do not add a database or a new test framework as part of this scope.

## Testing Decisions

- Use one browser-level seam through the rendered checklist. Tests should assert what a user sees and can do, not internal component or storage-helper details.
- Exercise adding by button and Enter, title trimming and blank rejection, duplicate titles, completion and undo, grouping and count updates, deletion cancel/confirm, and persistence after reload.
- Verify that a storage failure is communicated rather than presented as an empty successful list.
- Cover the checklist screen and its storage boundary through the user-facing flow; do not create separate unit-test seams for implementation details.
- There are no existing test files or test runner in the repository. Keep validation to the agreed browser-level checks plus the existing lint and production-build commands; do not add test tooling for this work.

## Out of Scope

- Accounts, authentication, cloud storage, and synchronization across browsers or devices.
- A database implementation.
- Notes, descriptions, due dates, categories, recurring items, or priority levels.
- Editing an existing title, bulk deletion, undo after confirmed deletion, filters, or drag-and-drop ordering.
- Sample data, multiple languages, or dark mode.

## Further Notes

- Browser site-data clearing removes the saved list.
- A first implementation already exists in the repository. The companion ready-for-agent ticket is to verify it against this spec and address any gaps, not to duplicate behavior that already works.

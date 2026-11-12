Status: ready-for-agent

# Verify the personal todo list

A first implementation of the personal checklist already exists. Verify it against [the spec](../spec.md) through the user-facing browser flow and fix any gaps. Preserve behavior that already matches the spec; do not duplicate it.

## Acceptance criteria

- The user can add a non-empty title with the button or Enter; titles are trimmed and duplicates are allowed.
- The user can mark an item complete, undo completion, and see unfinished items before completed items.
- The remaining count reflects only unfinished items and updates after each change.
- Deletion requires in-app confirmation; cancel keeps the item and confirm removes it.
- The saved list survives a reload in the same browser profile.
- Storage failures are presented clearly and do not masquerade as an empty saved list.
- Existing lint and production-build commands pass.

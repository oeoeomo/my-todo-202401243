---
status: accepted
---

# Store the personal checklist in Turso behind a server boundary

The checklist is moving from browser-local storage to one shared Turso/libSQL database so the same personal list is available locally and from the hosted app. Use a server-only `@libsql/client` module behind Next.js Route Handlers, select the local `file:local.db` or remote database with `TURSO_DATABASE_URL`, and keep remote credentials in the server-side `TURSO_AUTH_TOKEN`; do not add an offline browser cache. This keeps secrets out of the browser and allows the database target to change without changing the screen.

Create the schema automatically and allow a one-time import of legacy browser data only when the database is empty; existing database data wins, and a migration marker prevents deleted items from reappearing. Prepare an explicit one-time local-to-remote copy command because changing the URL does not migrate data. Protect the hosted app with Vercel Authentication for `All Deployments`, including production.

## Consequences

- Database reads and writes are asynchronous and require connectivity. The screen updates only after a successful server response and reports failures without silently falling back to browser storage.
- The Vercel Authentication setting and remote Turso database credentials must be configured outside the application code.
- The previous browser-local decision in ADR-0001 is superseded.

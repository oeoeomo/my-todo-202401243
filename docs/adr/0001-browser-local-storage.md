---
status: 폐기(새 ADR로 대체됨)
---

# Keep checklist persistence browser-local behind a replaceable boundary

이 결정은 [ADR-0002](./0002-turso-server-side-persistence.md)로 대체되었습니다.

Because this checklist is for one person and does not need accounts or cross-device synchronization, persist its data in the current browser's `localStorage` and keep persistence operations behind one module. This avoids introducing a backend for the first version while preserving data across reloads; the trade-off is that data is limited to that browser profile and is removed if its site data is cleared. If a database or synchronization becomes necessary, replace the persistence implementation at that boundary.

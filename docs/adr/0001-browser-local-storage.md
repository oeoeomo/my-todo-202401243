# Keep checklist persistence browser-local behind a replaceable boundary

Because this checklist is for one person and does not need accounts or cross-device synchronization, persist its data in the current browser's `localStorage` and keep persistence operations behind one module. This avoids introducing a backend for the first version while preserving data across reloads; the trade-off is that data is limited to that browser profile and is removed if its site data is cleared. If a database or synchronization becomes necessary, replace the persistence implementation at that boundary.

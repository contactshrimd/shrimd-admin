# Tasks: Audit Logs Screen

**Input**: `specs/04-screens/audit-logs.md`, `specs/09-api-client-contract.md`

## Phase 1: API Hooks

- [x] T001 Create `src/api/hooks/useAuditLogs.ts` — React Query hook for `GET /admin/audit-logs?patientId=`; optional patientId filter param; staleTime 30s
- [x] T002 Create `src/api/hooks/useAuditExport.ts` — mutation that fetches `GET /admin/audit-logs/export` with auth token, converts response to a Blob, and triggers a browser file download; no caching

## Phase 2: Audit Logs Screen

**Goal**: Filterable audit log table for admin/clinical_ops; export button for admin only.

**Independent Test**: Sign in as admin → navigate to Audit Logs → see table with actor, action, result columns → enter a patientId filter → results narrow → click Export → file download triggered.

- [x] T003 [US1] Create `src/screens/AuditLogsScreen.tsx` — optional patientId filter input (debounced 400ms), results table (timestamp, actorRole, actorId, action, patientId, result, correlationId), `metadataKeys` shown as pill list; loading skeleton; empty and error states; Export button visible only when role is `admin`, disabled while export is in-flight, shows success/error feedback
- [x] T004 [US1] Update `src/App.tsx` — render `<AuditLogsScreen>` when active route id is `audit-logs`; pass `role` as prop

## Phase 3: Polish

- [x] T005 Add audit log styles to `src/styles.css` — filter bar, metadata key pills, export button, monospace correlation ID
- [x] T006 Run `npm run build` — fix any type errors

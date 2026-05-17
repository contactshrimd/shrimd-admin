# Tasks: Workflow Commands Screen

**Input**: `specs/04-screens/workflow-commands.md`, `specs/09-api-client-contract.md`

## Phase 1: API Hook

- [x] T001 Create `src/api/hooks/useWorkflowCommands.ts` — React Query hook for `GET /admin/workflow-commands` with optional `status`, `patientId`, `type` query params; staleTime 30s

## Phase 2: Workflow Commands Screen

**Goal**: Filter controls + redacted command table for admin/clinical_ops.

**Independent Test**: Sign in → navigate to Workflow Commands → see table (commandId, type, status, attempts, error, timestamps, payloadKeys as pills) → apply a status filter → results narrow → raw payload is never visible.

- [x] T002 [US1] Create `src/screens/WorkflowCommandsScreen.tsx` — three filter inputs (status select, patientId text, type text) with 400ms debounce on text fields; results table showing all `WorkflowCommandSummary` fields; `payloadKeys` as pills (never raw payload); loading skeleton; empty and error states
- [x] T003 [US1] Update `src/App.tsx` — render `<WorkflowCommandsScreen>` when active route id is `workflow-commands`

## Phase 3: Polish

- [x] T004 Add workflow command styles to `src/styles.css` — filter row layout, status select, attempt count badge
- [x] T005 Run `npm run build` — fix any type errors

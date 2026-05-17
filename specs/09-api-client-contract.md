# API Client Contract

## Purpose

Define how the admin portal talks to `shrimd-backend`.

The backend OpenAPI document remains the source of truth for route availability. This file defines the frontend conventions that must be followed when implementing the admin API client.

---

## Base URL

The admin app must read the backend base URL from environment configuration.

Recommended variable:

- `VITE_API_BASE_URL`

---

## Auth

Every admin API request must include a Firebase ID token:

```text
Authorization: Bearer <firebase_id_token>
```

The UI may read Firebase custom claims for route hiding, but backend role validation is authoritative.

If the backend returns `401`, the client should refresh Firebase auth state or require sign-in.

If the backend returns `403`, the client should show an access-denied state and must not retry with alternate role assumptions.

---

## Response Envelope

Successful responses:

```json
{
  "status": "success",
  "data": {},
  "error": null
}
```

Error responses:

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "This role cannot inspect audit logs.",
    "correlationId": "req_123"
  }
}
```

Client behavior:

- Read business payloads only from `data`.
- Display user-safe messages from `error.message`.
- Include `error.correlationId` in support/debug surfaces when available.
- Do not parse backend stack traces or internal metadata.

---

## Implemented Admin Data Shapes

### Patient Search

Route: `GET /admin/patients/search?q=`

Expected payload:

```ts
type AdminPatientSummary = {
  patientId: string;
  displayName?: string;
  state?: string;
  lifecycleState: string;
  reviewStatus?: string;
  subscriptionStatus?: string;
  updatedAt?: string;
};
```

Envelope data:

```ts
{ patients: AdminPatientSummary[] }
```

### Patient Detail

Route: `GET /admin/patients/{patientId}`

Expected payload:

```ts
type AdminPatientDetail = AdminPatientSummary & {
  email?: string;
  refillStatus?: string;
  prescriptionStatus?: string;
  fulfillmentStatus?: string;
};
```

Role scoping may omit optional fields. The UI must render missing optional fields as unavailable, not as failed loads.

### Audit Logs

Route: `GET /admin/audit-logs`

Expected payload:

```ts
type AuditLogSummary = {
  auditLogId: string;
  timestamp?: string;
  actorType?: string;
  actorId?: string;
  actorRole?: string;
  action?: string;
  patientId?: string;
  result?: string;
  correlationId?: string;
  metadataKeys: string[];
};
```

Envelope data:

```ts
{ auditLogs: AuditLogSummary[] }
```

### Audit Export

Route: `GET /admin/audit-logs/export`

Expected payload includes audit metadata and is restricted to `admin`.

The UI must treat export as privileged and avoid caching export data in local browser storage.

### Workflow Commands

Route: `GET /admin/workflow-commands`

Optional filters:

- `status`
- `patientId`
- `type`

Expected payload:

```ts
type WorkflowCommandSummary = {
  commandId: string;
  type?: string;
  status?: string;
  patientId?: string;
  sourceId?: string;
  attemptCount?: number;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  errorCode?: string;
  createdAt?: string;
  updatedAt?: string;
  payloadKeys: string[];
};
```

Envelope data:

```ts
{ workflowCommands: WorkflowCommandSummary[] }
```

The UI must never display or request raw workflow command payloads.

### Resend Notification

Route: `POST /admin/actions/resend-notification`

Request:

```ts
{
  patientId: string;
  notificationType: string;
}
```

Expected result:

```ts
{
  action: string;
  patientId: string;
  status: "queued";
  queuedAt: string;
}
```

---

## Persistence Rules

- Do not store patient data, audit records, workflow command data, or exports in local storage.
- React Query cache must be memory-only and should use conservative stale/cache times for PHI-bearing data.
- Store only non-PHI UI preferences when needed.
- On sign-out, clear all query/cache state.

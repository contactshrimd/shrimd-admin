export type AdminPatientSummary = {
  patientId: string;
  displayName?: string;
  email?: string;
  state?: string;
  lifecycleState: string;
  reviewStatus?: string;
  subscriptionStatus?: string;
  updatedAt?: string;
};

export type AdminPatientDetail = AdminPatientSummary & {
  refillStatus?: string;
  prescriptionStatus?: string;
  fulfillmentStatus?: string;
  currentIntakeId?: string;
};

export type AuditLogSummary = {
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

export type WorkflowCommandSummary = {
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
